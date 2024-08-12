import express from "express";
const router = express.Router();
import alertMessage from "../helpers/messenger.js";

//Models
import Order from "../models/Order.js";
import orderItem from "../models/OrderItem.js";

//Authentication
import ensureAuthenticated from "../helpers/auth.js";
import ensureAdminAuthenticated from "../helpers/adminauth.js";

// Axios
import axios from "axios";

// Add DotEnv dependency, we need this to load up the environment variables in the .env file of the root of project and from windows environment  - 260223
import dotenv from "dotenv"; // see https://github.com/motdotla/dotenv#how-do-i-use-dotenv-with-import
dotenv.config();

//EasyPost API
import EasyPost from "@easypost/api";
const apiKey = process.env.EASY_POST_APIKEY;
const api = new EasyPost(apiKey);

//Twilio API
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTHTOKEN;

import Client from "twilio";
const client = new Client(accountSid, authToken);

//Google Recaptcha Secret Key
const secretKey = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;

//QR Code
import QRCode from "qrcode";

//NodeMailer
import nodemailer from "nodemailer";

//view More Details of Order
router.get("/viewMoreOrder/:id", ensureAuthenticated, (req, res) => {
	const title = "Order Details";
	console.log("helllo");
	console.log(req.params.id);
	Order.findOne({
		where: {
			userId: req.user.id,
			id: req.params.id,
		},
		include: [{ model: orderItem }],
	}).then((order) => {
		console.log("===========");
		const shippingId = order.shippingId;
		console.log(shippingId);
		api.Shipment.retrieve(shippingId).then((s) => {
			console.log(s.tracker.created_at);
			console.log(s.tracker.updated_at);
			const deliveryStatus = s.tracker.status;
			const trackingURL = s.tracker.public_url;
			if (deliveryStatus == "pre_transit") {
				let progressPercentage = 25;
				let progressColour = "bg-info";
				let progressColourText = "text-info";
				let deliveryStatusResult = "Pre-transit";
				res.render("user/viewMoreOrder", {
					order: order,
					orderitems: order.orderitems,
					title,
					deliveryStatusResult,
					trackingURL,
					progressPercentage,
					progressColour,
					progressColourText,
				});
			} else if (deliveryStatus == "in_transit") {
				let progressPercentage = 50;
				let progressColour = "bg-info";
				let progressColourText = "text-info";
				let deliveryStatusResult = "In-transit";
				res.render("user/viewMoreOrder", {
					order: order,
					orderitems: order.orderitems,
					title,
					deliveryStatusResult,
					trackingURL,
					progressPercentage,
					progressColour,
					progressColourText,
				});
			} else if (deliveryStatus == "out_for_delivery") {
				let progressPercentage = 75;
				let progressColour = "bg-info";
				let progressColourText = "text-info";
				let deliveryStatusResult = "Out for delivery";
				res.render("user/viewMoreOrder", {
					order: order,
					orderitems: order.orderitems,
					title,
					deliveryStatusResult,
					trackingURL,
					progressPercentage,
					progressColour,
					progressColourText,
				});
			} else if (deliveryStatus == "delivered") {
				let progressPercentage = 100;
				let progressColour = "bg-success";
				let progressColourText = "text-success";
				let deliveryStatusResult = "Delivered";
				res.render("user/viewMoreOrder", {
					order: order,
					orderitems: order.orderitems,
					title,
					deliveryStatusResult,
					trackingURL,
					progressPercentage,
					progressColour,
					progressColourText,
				});
			} else if (deliveryStatus == "return_to_sender") {
				let progressPercentage = 0;
				let progressColour = "bg-info";
				let progressColourText = "text-info";
				let deliveryStatusResult = "Return to sender";
				res.render("user/viewMoreOrder", {
					order: order,
					orderitems: order.orderitems,
					title,
					deliveryStatusResult,
					trackingURL,
					progressPercentage,
					progressColour,
					progressColourText,
				});
			} else if (deliveryStatus == "failure") {
				let progressPercentage = 100;
				let progressColour = "bg-danger";
				let progressColourText = "text-danger";
				let deliveryStatusResult = "Failure";
				res.render("user/viewMoreOrder", {
					order: order,
					orderitems: order.orderitems,
					title,
					deliveryStatusResult,
					trackingURL,
					progressPercentage,
					progressColour,
					progressColourText,
				});
			} else {
				let progressPercentage = 0;
				let progressColour = "bg-dark";
				let progressColourText = "text-dark";
				let deliveryStatusResult = "Unknown";
				res.render("user/viewMoreOrder", {
					order: order,
					orderitems: order.orderitems,
					title,
					deliveryStatusResult,
					trackingURL,
					progressPercentage,
					progressColour,
					progressColourText,
				});
			}
		});
	});
});

router.get(
	"/viewMoreOrderAdmin/:id",
	ensureAuthenticated,
	ensureAdminAuthenticated,
	(req, res) => {
		const title = "Order Details - Admin";
		Order.findOne({
			where: {
				userId: req.user.id,
				id: req.params.id,
			},
			include: [{ model: orderItem }],
		}).then((order) => {
			console.log("===========");
			const shippingId = order.shippingId;
			console.log(shippingId);
			api.Shipment.retrieve(shippingId).then((s) => {
				console.log(s.tracker.created_at);
				console.log(s.tracker.updated_at);
				const deliveryStatus = s.tracker.status;
				const trackingURL = s.tracker.public_url;
				if (deliveryStatus == "pre_transit") {
					let progressPercentage = 25;
					let progressColour = "bg-info";
					let progressColourText = "text-info";
					let deliveryStatusResult = "Pre-transit";
					res.render("user/viewMoreOrderAdmin", {
						order: order,
						orderitems: order.orderitems,
						title,
						deliveryStatusResult,
						trackingURL,
						progressPercentage,
						progressColour,
						progressColourText,
					});
				} else if (deliveryStatus == "in_transit") {
					let progressPercentage = 50;
					let progressColour = "bg-info";
					let progressColourText = "text-info";
					let deliveryStatusResult = "In-transit";
					res.render("user/viewMoreOrderAdmin", {
						order: order,
						orderitems: order.orderitems,
						title,
						deliveryStatusResult,
						trackingURL,
						progressPercentage,
						progressColour,
						progressColourText,
					});
				} else if (deliveryStatus == "out_for_delivery") {
					let progressPercentage = 75;
					let progressColour = "bg-info";
					let progressColourText = "text-info";
					let deliveryStatusResult = "Out for delivery";
					res.render("user/viewMoreOrderAdmin", {
						order: order,
						orderitems: order.orderitems,
						title,
						deliveryStatusResult,
						trackingURL,
						progressPercentage,
						progressColour,
						progressColourText,
					});
				} else if (deliveryStatus == "delivered") {
					let progressPercentage = 100;
					let progressColour = "bg-success";
					let progressColourText = "text-success";
					let deliveryStatusResult = "Delivered";
					res.render("user/viewMoreOrderAdmin", {
						order: order,
						orderitems: order.orderitems,
						title,
						deliveryStatusResult,
						trackingURL,
						progressPercentage,
						progressColour,
						progressColourText,
					});
				} else if (deliveryStatus == "return_to_sender") {
					let progressPercentage = 0;
					let progressColour = "bg-info";
					let progressColourText = "text-info";
					let deliveryStatusResult = "Return to sender";
					res.render("user/viewMoreOrderAdmin", {
						order: order,
						orderitems: order.orderitems,
						title,
						deliveryStatusResult,
						trackingURL,
						progressPercentage,
						progressColour,
						progressColourText,
					});
				} else if (deliveryStatus == "failure") {
					let progressPercentage = 100;
					let progressColour = "bg-danger";
					let progressColourText = "text-danger";
					let deliveryStatusResult = "Failure";
					res.render("user/viewMoreOrderAdmin", {
						order: order,
						orderitems: order.orderitems,
						title,
						deliveryStatusResult,
						trackingURL,
						progressPercentage,
						progressColour,
						progressColourText,
					});
				} else {
					let progressPercentage = 0;
					let progressColour = "bg-dark";
					let progressColourText = "text-dark";
					let deliveryStatusResult = "Unknown";
					res.render("user/viewMoreOrderAdmin", {
						order: order,
						orderitems: order.orderitems,
						title,
						deliveryStatusResult,
						trackingURL,
						progressPercentage,
						progressColour,
						progressColourText,
					});
				}
			});
		});
	}
);

router.get(
	"/displayLabelUrl/:id",
	ensureAuthenticated,
	ensureAdminAuthenticated,
	(req, res) => {
		console.log(req.params.id);
		let shippingId = req.params.id;
		api.Shipment.retrieve(shippingId).then((s) => {
			s.convertLabelFormat("PDF").then((sr) => {
				let postageLabelUrlPNG = sr.postage_label.label_url;
				let postageLabelUrlPDF = sr.postage_label.label_pdf_url;
				console.log(postageLabelUrlPNG);
				console.log(postageLabelUrlPDF);
				res.redirect(postageLabelUrlPDF);
			});
		});
	}
);

router.get(
    "/printLabelPDF/:id",
    ensureAuthenticated,
    ensureAdminAuthenticated,
    async (req, res) => {
        try {
            console.log(req.params.id);
            let shippingId = req.params.id;
            
            // Assuming `api.Shipment.retrieve` and `s.convertLabelFormat` are part of some SDK you're using.
            let shipment = await api.Shipment.retrieve(shippingId);
            let shipmentResponse = await shipment.convertLabelFormat("PDF");
            let postageLabelUrlPDF = shipmentResponse.postage_label.label_pdf_url;
            
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

            let response = await axios(options);
            console.log("statusCode:", response.status); // Print the response status code
            console.log("body:", response.data);

            alertMessage(
                res,
                "success",
                "PrintNode ID: " + response.data,
                "fas fa-exclamation-circle",
                true
            );
            res.redirect("/user/orderHistoryAdmin");
        } catch (err) {
            console.error("Error:", err);
            res.status(500).send("An error occurred while processing the request.");
        }
    }
);

// Replace request with axios - might need to reuse this as havent test
// router.get(
// 	"/printLabelPDF/:id",
// 	ensureAuthenticated,
// 	ensureAdminAuthenticated,
// 	(req, res) => {
// 		console.log(req.params.id);
// 		let shippingId = req.params.id;
// 		api.Shipment.retrieve(shippingId).then((s) => {
// 			s.convertLabelFormat("PDF").then((sr) => {
// 				let postageLabelUrlPDF = sr.postage_label.label_pdf_url;
// 				const options = {
// 					url: "https://api.printnode.com/printjobs",
// 					json: true,
// 					headers: {
// 						Authorization:
// 							"Basic REdqckZpUFVnUndGckdxbFNFSmpHbnRpUmotREhqb3FPeFhlUlg3UlYtbw==",
// 					},
// 					method: "POST",
// 					body: {
// 						printerId: "69642287",
// 						title: "Order Label",
// 						contentType: "pdf_uri",
// 						content: postageLabelUrlPDF,
// 						source: "Comes from EasyPost API",
// 					},
// 				};
// 				request(options, (err, response, body) => {
// 					console.error("error:", err); // Print the error if one occurred
// 					console.log("statusCode:", response && response.statusCode); // Print the response status code if a response was received
// 					console.log("body:", body);
// 					alertMessage(
// 						res,
// 						"success",
// 						"PrintNode ID: " + body,
// 						"fas faexclamation-circle",
// 						true
// 					);
// 					res.redirect("/user/orderHistoryAdmin");
// 				});
// 			});
// 		});
// 	}
// );

router.get("/checkDelivery", (req, res) => {
	const title = "Shipping Tracking";
	res.render("delivery/checkDelivery", {
		title,
	});
});


router.post("/checkingDelivery", async (req, res) => {
    const title = "Shipping Tracking";
    let trackingId = req.body.trackingIdInput;
    let captcha = req.body["g-recaptcha-response"]; // get user token value

    // checks if captcha response is valid
    if (!captcha) {
        return res.json({ success: false, msg: "Please select captcha" });
    }

    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;
    console.log(verifyURL); // this is a URL that needs to be verified

    try {
        const { data: body } = await axios.get(verifyURL);
        console.log(body); // retrieves response from Google and returns its JSON info

        if (body.success === undefined || !body.success) {
            alertMessage(
                res,
                "danger",
                "Please re-enter the recaptcha",
                "fas fa-exclamation-circle",
                true
            );
            return res.redirect("/delivery/checkDelivery");
        }

        // Assuming `api.Tracker.retrieve` is an asynchronous function
        const s = await api.Tracker.retrieve(trackingId);
        console.log(s);

        let deliveryStatus = s.status;
        let URL = s.public_url;
        let statusDetail = s.status_detail;
        let carrierType = s.carrier;
        let createdAt = s.created_at;
        let updatedAt = s.updated_at;
        let carrierService = s.carrier_detail.service;

        let progressPercentage, progressColour, progressColourText, deliveryStatusResult;

        switch (deliveryStatus) {
            case "pre_transit":
                progressPercentage = 25;
                progressColour = "bg-info";
                progressColourText = "text-info";
                deliveryStatusResult = "Pre-transit";
                break;
            case "in_transit":
                progressPercentage = 50;
                progressColour = "bg-info";
                progressColourText = "text-info";
                deliveryStatusResult = "In-transit";
                break;
            case "out_for_delivery":
                progressPercentage = 75;
                progressColour = "bg-info";
                progressColourText = "text-info";
                deliveryStatusResult = "Out for delivery";
                break;
            case "delivered":
                progressPercentage = 100;
                progressColour = "bg-success";
                progressColourText = "text-success";
                deliveryStatusResult = "Delivered";
                break;
            case "return_to_sender":
                progressPercentage = 0;
                progressColour = "bg-info";
                progressColourText = "text-info";
                deliveryStatusResult = "Return to sender";
                break;
            case "failure":
                progressPercentage = 100;
                progressColour = "bg-danger";
                progressColourText = "text-danger";
                deliveryStatusResult = "Failure";
                break;
            default:
                progressPercentage = 0;
                progressColour = "bg-dark";
                progressColourText = "text-dark";
                deliveryStatusResult = "Unknown";
                break;
        }

        const showQRCODE = await QRCode.toDataURL(URL);
        res.render("delivery/deliveryStatusPage", {
            title,
            deliveryStatusResult,
            statusDetail,
            URL,
            carrierType,
            carrierService,
            createdAt,
            updatedAt,
            trackingId,
            showQRCODE,
            progressPercentage,
            progressColour,
            progressColourText,
        });
    } catch (e) {
        console.log(e);

        // Handle errors from the tracker
        if (e.response && e.response.data.error && e.response.data.error.code === "TRACKER.NOT_FOUND") {
            alertMessage(
                res,
                "danger",
                "Please enter a valid tracking number",
                "fas fa-exclamation-circle",
                true
            );
            return res.redirect("checkDelivery");
        }

        // Handle other potential errors
        res.status(500).send("An error occurred while checking delivery status.");
    }
});

// might need to reuse this as havent test
// router.post("/checkingDelivery", (req, res) => {
// 	const title = "Shipping Tracking";
// 	let trackingId = req.body.trackingIdInput;
// 	//trk_f10a3961f7c4419184aca1dabc09e4f8
// 	let siteUrl =
// 		"https://www.google.com/recaptcha/api/siteverify?secret=your_secret&response=response_string&remoteip=user_ip_address";
// 	let captcha = req.body["g-recaptcha-response"]; //get user token value

// 	//checks if captcha response is valid
// 	if (captcha === undefined || captcha === "" || captcha === null) {
// 		return res.json({ success: false, msg: "Please select captcha" });
// 	}

// 	const verifyURL =
// 		"https://www.google.com/recaptcha/api/siteverify?secret=" +
// 		secretKey +
// 		"&response=" +
// 		captcha;
// 	console.log(verifyURL); //this is a url that needs to be verified

// 	request(verifyURL, (err, response, body) => {
// 		body = JSON.parse(body);
// 		console.log(body); //retrieves response from google and return its json info

// 		if (body.success !== undefined && !body.success) {
// 			alertMessage(
// 				res,
// 				"danger",
// 				"Please re-enter the recaptcha",
// 				"fas faexclamation-circle",
// 				true
// 			);
// 			res.redirect("/delivery/checkDelivery");
// 		} else {
// 			api.Tracker.retrieve(trackingId)
// 				.then((s) => {
// 					console.log(s);
// 					let deliveryStatus = s.status;
// 					let URL = s.public_url;
// 					let statusDetail = s.status_detail;
// 					let carrierType = s.carrier;
// 					let createdAt = s.created_at;
// 					let updatedAt = s.updated_at;
// 					let carrierService = s.carrier_detail.service;
// 					if (deliveryStatus == "pre_transit") {
// 						let progressPercentage = 25;
// 						let progressColour = "bg-info";
// 						let progressColourText = "text-info";
// 						let deliveryStatusResult = "Pre-transit";
// 						QRCode.toDataURL(URL, function (err, url) {
// 							let showQRCODE = url;
// 							res.render("delivery/deliveryStatusPage", {
// 								title,
// 								deliveryStatusResult,
// 								statusDetail,
// 								URL,
// 								carrierType,
// 								carrierService,
// 								createdAt,
// 								updatedAt,
// 								trackingId,
// 								showQRCODE,
// 								progressPercentage,
// 								progressColour,
// 								progressColourText,
// 							});
// 						});
// 					} else if (deliveryStatus == "in_transit") {
// 						let progressPercentage = 50;
// 						let progressColour = "bg-info";
// 						let progressColourText = "text-info";
// 						let deliveryStatusResult = "In-transit";
// 						QRCode.toDataURL(URL, function (err, url) {
// 							let showQRCODE = url;
// 							res.render("delivery/deliveryStatusPage", {
// 								title,
// 								deliveryStatusResult,
// 								statusDetail,
// 								URL,
// 								carrierType,
// 								carrierService,
// 								createdAt,
// 								updatedAt,
// 								trackingId,
// 								showQRCODE,
// 								progressPercentage,
// 								progressColour,
// 								progressColourText,
// 							});
// 						});
// 					} else if (deliveryStatus == "out_for_delivery") {
// 						let progressPercentage = 75;
// 						let progressColour = "bg-info";
// 						let progressColourText = "text-info";
// 						let deliveryStatusResult = "Out for delivery";
// 						QRCode.toDataURL(URL, function (err, url) {
// 							let showQRCODE = url;
// 							res.render("delivery/deliveryStatusPage", {
// 								title,
// 								deliveryStatusResult,
// 								statusDetail,
// 								URL,
// 								carrierType,
// 								carrierService,
// 								createdAt,
// 								updatedAt,
// 								trackingId,
// 								showQRCODE,
// 								progressPercentage,
// 								progressColour,
// 								progressColourText,
// 							});
// 						});
// 					} else if (deliveryStatus == "delivered") {
// 						let progressPercentage = 100;
// 						let progressColour = "bg-success";
// 						let progressColourText = "text-success";
// 						let deliveryStatusResult = "Delivered";
// 						QRCode.toDataURL(URL, function (err, url) {
// 							let showQRCODE = url;
// 							res.render("delivery/deliveryStatusPage", {
// 								title,
// 								deliveryStatusResult,
// 								statusDetail,
// 								URL,
// 								carrierType,
// 								carrierService,
// 								createdAt,
// 								updatedAt,
// 								trackingId,
// 								showQRCODE,
// 								progressPercentage,
// 								progressColour,
// 								progressColourText,
// 							});
// 						});
// 					} else if (deliveryStatus == "return_to_sender") {
// 						let progressPercentage = 0;
// 						let progressColour = "bg-info";
// 						let progressColourText = "text-info";
// 						let deliveryStatusResult = "Return to sender";
// 						QRCode.toDataURL(URL, function (err, url) {
// 							let showQRCODE = url;
// 							res.render("delivery/deliveryStatusPage", {
// 								title,
// 								deliveryStatusResult,
// 								statusDetail,
// 								URL,
// 								carrierType,
// 								carrierService,
// 								createdAt,
// 								updatedAt,
// 								trackingId,
// 								showQRCODE,
// 								progressPercentage,
// 								progressColour,
// 								progressColourText,
// 							});
// 						});
// 					} else if (deliveryStatus == "failure") {
// 						let progressPercentage = 100;
// 						let progressColour = "bg-danger";
// 						let progressColourText = "text-danger";
// 						let deliveryStatusResult = "Failure";
// 						QRCode.toDataURL(URL, function (err, url) {
// 							let showQRCODE = url;
// 							res.render("delivery/deliveryStatusPage", {
// 								title,
// 								deliveryStatusResult,
// 								statusDetail,
// 								URL,
// 								carrierType,
// 								carrierService,
// 								createdAt,
// 								updatedAt,
// 								trackingId,
// 								showQRCODE,
// 								progressPercentage,
// 								progressColour,
// 								progressColourText,
// 							});
// 						});
// 					} else {
// 						let progressPercentage = 0;
// 						let progressColour = "bg-dark";
// 						let progressColourText = "text-dark";
// 						let deliveryStatusResult = "Unknown";
// 						QRCode.toDataURL(URL, function (err, url) {
// 							let showQRCODE = url;
// 							res.render("delivery/deliveryStatusPage", {
// 								title,
// 								deliveryStatusResult,
// 								statusDetail,
// 								URL,
// 								carrierType,
// 								carrierService,
// 								createdAt,
// 								updatedAt,
// 								trackingId,
// 								showQRCODE,
// 								progressPercentage,
// 								progressColour,
// 								progressColourText,
// 							});
// 						});
// 					}
// 					console.log("correct btw");
// 				})
// 				// catch any errors
// 				.catch((e) => {
// 					console.log(e);
// 					let errorCode = e.error.error.code;
// 					if (errorCode == "TRACKER.NOT_FOUND") {
// 						//check if tracking code not found
// 						alertMessage(
// 							res,
// 							"danger",
// 							"Please enter a valid tracking number",
// 							"fas faexclamation-circle",
// 							true
// 						);
// 						res.redirect("checkDelivery");
// 					}
// 				});
// 		}
// 	});
// });

export { router };
