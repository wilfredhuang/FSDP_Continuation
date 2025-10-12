// ------------------------------------------------------------
// cartRoutes.ts (TypeScript version)
// ------------------------------------------------------------
import express, { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import axios from "axios";
import EasyPost from "@easypost/api";
import QRCode from "qrcode";
import nodemailer from "nodemailer";
import Client from "twilio";

import alertMessage from "../helpers/messenger.js";
import order_ from "../models/Order.js";
import orderItem from "../models/OrderItem.js";
import ensureAuthenticated from "../middleware/userAuth.js";
import ensureAdminAuthenticated from "../middleware/adminAuth.js";
import twilio from "twilio";

dotenv.config();

const router = express.Router();

// ------------------------------------------------------------
// 3. Setup external services
// ------------------------------------------------------------
const apiKey = process.env.EASYPOST_API_KEY ?? "EZTKe61fa8e438e34413acce28f504e9d8ee9lUMxw7QLbFHvI2SZgpUqg";
const api = new EasyPost(apiKey);

const accountSid = process.env.TWILIO_ACCOUNT_SID ?? "";
const authToken = process.env.TWILIO_ACCOUNT_AUTHTOKEN ?? "";
//const client = new Client(accountSid, authToken);
const client = twilio(accountSid, authToken);


const secretKey = process.env.GOOGLE_RECAPTCHA_SECRET_KEY ?? "";

// ------------------------------------------------------------
// 4. View order details (user)
// ------------------------------------------------------------
router.get("/view-order-details/:id", ensureAuthenticated, async (req: Request, res: Response) => {
  const title = "Order Details";
  try {
    const order = await order_.findOne({
      where: { userId: (req.user as any).id, id: req.params.id },
      include: [{ model: orderItem }],
    });

    const { shippingId } = order as any;
    const shipment = await api.Shipment.retrieve(shippingId);
    const { status: deliveryStatus, public_url: trackingURL } = shipment.tracker;

    const statusMapping: Record<string, any> = {
      pre_transit: { progressPercentage: 25, progressColour: "bg-info", progressColourText: "text-info", deliveryStatusResult: "Pre-transit" },
      in_transit: { progressPercentage: 50, progressColour: "bg-info", progressColourText: "text-info", deliveryStatusResult: "In-transit" },
      out_for_delivery: { progressPercentage: 75, progressColour: "bg-info", progressColourText: "text-info", deliveryStatusResult: "Out for delivery" },
      delivered: { progressPercentage: 100, progressColour: "bg-success", progressColourText: "text-success", deliveryStatusResult: "Delivered" },
      return_to_sender: { progressPercentage: 0, progressColour: "bg-info", progressColourText: "text-info", deliveryStatusResult: "Return to sender" },
      failure: { progressPercentage: 100, progressColour: "bg-danger", progressColourText: "text-danger", deliveryStatusResult: "Failure" },
      default: { progressPercentage: 0, progressColour: "bg-dark", progressColourText: "text-dark", deliveryStatusResult: "Unknown" },
    };

    const { progressPercentage, progressColour, progressColourText, deliveryStatusResult } =
      statusMapping[deliveryStatus] || statusMapping.default;

    res.render("user/view-order-details", {
      order,
      orderitems: (order as any).orderitems,
      title,
      deliveryStatusResult,
      trackingURL,
      progressPercentage,
      progressColour,
      progressColourText,
    });
  } catch (error) {
    console.error(error);
    res.status(500).send(`Internal Server Error ${error}`);
  }
});

// ------------------------------------------------------------
// 5. View order details (admin)
// ------------------------------------------------------------
router.get(
  "/view-order-details-admin/:id",
  ensureAuthenticated,
  ensureAdminAuthenticated,
  async (req: Request, res: Response) => {
    const title = "Order Details - Admin";
    try {
      const order = await order_.findOne({
        where: { id: req.params.id },
        include: [{ model: orderItem }],
      });

      const { shippingId } = order as any;
      const shipment = await api.Shipment.retrieve(shippingId);
      const { status: deliveryStatus, public_url: trackingURL } = shipment.tracker;

      const statusMapping: Record<string, any> = {
        pre_transit: { progressPercentage: 25, progressColour: "bg-info", progressColourText: "text-info", deliveryStatusResult: "Pre-transit" },
        in_transit: { progressPercentage: 50, progressColour: "bg-info", progressColourText: "text-info", deliveryStatusResult: "In-transit" },
        out_for_delivery: { progressPercentage: 75, progressColour: "bg-info", progressColourText: "text-info", deliveryStatusResult: "Out for delivery" },
        delivered: { progressPercentage: 100, progressColour: "bg-success", progressColourText: "text-success", deliveryStatusResult: "Delivered" },
        return_to_sender: { progressPercentage: 0, progressColour: "bg-info", progressColourText: "text-info", deliveryStatusResult: "Return to sender" },
        failure: { progressPercentage: 100, progressColour: "bg-danger", progressColourText: "text-danger", deliveryStatusResult: "Failure" },
        default: { progressPercentage: 0, progressColour: "bg-dark", progressColourText: "text-dark", deliveryStatusResult: "Unknown" },
      };

      const { progressPercentage, progressColour, progressColourText, deliveryStatusResult } =
        statusMapping[deliveryStatus] || statusMapping.default;

      res.render("user/view-order-details-admin", {
        order,
        orderitems: (order as any).orderitems,
        title,
        deliveryStatusResult,
        trackingURL,
        progressPercentage,
        progressColour,
        progressColourText,
      });
    } catch (error) {
      console.error(error);
      res.status(500).send(`Internal Server Error ${error}`);
    }
  }
);

// ------------------------------------------------------------
// 6. Display label URL
// ------------------------------------------------------------
router.get(
  "/displayLabelUrl/:id",
  ensureAuthenticated,
  ensureAdminAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const shippingId = req.params.id;
      const s = await api.Shipment.retrieve(shippingId);
      const sr = await s.convertLabelFormat("PDF");
      res.redirect(sr.postage_label.label_pdf_url);
    } catch (err) {
      console.error(err);
      res.status(500).send("Error retrieving shipping label.");
    }
  }
);

// ------------------------------------------------------------
// 7. Print Label PDF
// ------------------------------------------------------------
router.get(
  "/printLabelPDF/:id",
  ensureAuthenticated,
  ensureAdminAuthenticated,
  async (req: Request, res: Response) => {
    try {
      const shippingId = req.params.id;
      const shipment = await api.Shipment.retrieve(shippingId);
      const shipmentResponse = await shipment.convertLabelFormat("PDF");
      const postageLabelUrlPDF = shipmentResponse.postage_label.label_pdf_url;

      const options = {
        method: "POST",
        url: "https://api.printnode.com/printjobs",
        headers: {
          Authorization: "Basic REdqckZpUFVnUndGckdxbFNFSmpHbnRpUmotREhqb3FPeFhlUlg3UlYtbw==",
        },
        data: {
          printerId: "69642287",
          title: "Order Label",
          contentType: "pdf_uri",
          content: postageLabelUrlPDF,
          source: "Comes from EasyPost API",
        },
      };

      const response = await axios(options);
      alertMessage(res, "success", "PrintNode ID: " + response.data, "fas fa-exclamation-circle", true);
      res.redirect("/user/orderHistoryAdmin");
    } catch (err) {
      console.error(err);
      res.status(500).send("Error while printing label.");
    }
  }
);

// ------------------------------------------------------------
// 8. Delivery status check
// ------------------------------------------------------------
router.get("/check-delivery", (_req: Request, res: Response) => {
  res.render("delivery/check-delivery", { title: "Shipping Tracking" });
});

router.post("/checkingDelivery", async (req: Request, res: Response) => {
  const title = "Shipping Tracking";
  const trackingId = req.body.trackingIdInput;
  const captcha = req.body["g-recaptcha-response"];

  if (!captcha) return res.json({ success: false, msg: "Please select captcha" });

  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
  try {
    const { data: body } = await axios.get(verifyURL);
    if (!body.success) {
      alertMessage(res, "danger", "Please re-enter the recaptcha", "fas fa-exclamation-circle", true);
      return res.redirect("/delivery/check-delivery");
    }

    const s = await api.Tracker.retrieve(trackingId);
    const { status: deliveryStatus, public_url: URL, status_detail, carrier, created_at, updated_at } = s;

    const carrierService = s.carrier_detail?.service ?? "";
    const mapping: Record<string, any> = {
      pre_transit: [25, "bg-info", "text-info", "Pre-transit"],
      in_transit: [50, "bg-info", "text-info", "In-transit"],
      out_for_delivery: [75, "bg-info", "text-info", "Out for delivery"],
      delivered: [100, "bg-success", "text-success", "Delivered"],
      return_to_sender: [0, "bg-info", "text-info", "Return to sender"],
      failure: [100, "bg-danger", "text-danger", "Failure"],
    };
    const [progressPercentage, progressColour, progressColourText, deliveryStatusResult] =
      mapping[deliveryStatus] ?? [0, "bg-dark", "text-dark", "Unknown"];

    const showQRCODE = await QRCode.toDataURL(URL);
    res.render("delivery/delivery-status-page", {
      title,
      deliveryStatusResult,
      statusDetail: status_detail,
      URL,
      carrierType: carrier,
      carrierService,
      createdAt: created_at,
      updatedAt: updated_at,
      trackingId,
      showQRCODE,
      progressPercentage,
      progressColour,
      progressColourText,
    });
  } catch (e: any) {
    if (e.response?.data?.error?.code === "TRACKER.NOT_FOUND") {
      alertMessage(res, "danger", "Please enter a valid tracking number", "fas fa-exclamation-circle", true);
      return res.redirect("check-delivery");
    }
    res.status(500).send("An error occurred while checking delivery status.");
  }
});

export { router };
