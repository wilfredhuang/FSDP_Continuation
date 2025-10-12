import express, { Request, Response, NextFunction } from "express";
import productadmin from "../models/ProductAdmin.js";
import {
  logRed,
  logGreen,
  logBlue,
  logYellow,
  logMagenta,
  logCyan,
} from "../helpers/loggerHelper.js";

const router = express.Router();

router.get("/", async (req: Request, res: Response, next: NextFunction) => {
  const title = "Bookstore Home Page";
  const navStatusHome = "active";

  if (req.user) logGreen(`[GET /] LOGGED IN as ${req.user.email}`);
  else logYellow("[GET /] NOT LOGGED IN");

  try {
    const pa = await productadmin.findAll({ order: [["rating", "DESC"]] });
    res.render("index", { title, navStatusHome, productadmin: pa });
  } catch (error) {
    console.error("Error rendering index page:", error);
    next(error);
  }
});

router.get("/index", async (req: Request, res: Response, next: NextFunction) => {
  const title = "Bookstore Home Page";
  const navStatusHome = "active";

  if (req.user) logGreen(`[GET /index] LOGGED IN as ${req.user.email}`);
  else logYellow("[GET /index] NOT LOGGED IN");

  try {
    const pa = await productadmin.findAll({ order: [["rating", "DESC"]] });
    res.render("index", { title, navStatusHome, productadmin: pa });
  } catch (error) {
    console.error("Error rendering index page:", error);
    next(error);
  }
});

router.get("/about", (req: Request, res: Response) => {
  res.render("about", { title: "About Us", navStatusAbout: "active" });
});

router.get("/faq", (req: Request, res: Response) => {
  res.render("faq", { title: "FAQs", navStatusFAQ: "active" });
});

router.get("/privacy-policy", (req: Request, res: Response) => {
  res.render("privacy-policy", { title: "Privacy Policy" });
});

router.get("/terms-conditions", (req: Request, res: Response) => {
  res.render("terms-conditions", { title: "Terms and Conditions" });
});

router.get("/shipping", (req: Request, res: Response) => {
  res.render("shipping", { title: "Shipping" });
});

router.get("/login", (req: Request, res: Response) => {
  res.render("user/login", { title: "Login Page", navStatusLogin: "active" });
});

router.get("/register", (req: Request, res: Response) => {
  res.render("user/register", {
    title: "Registration Page",
    navStatusRegister: "active",
  });
});

export { router };
