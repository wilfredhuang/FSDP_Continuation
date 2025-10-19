import express from "express";
import productadmin from "../models/ProductAdmin.js";
import { logGreen, logYellow, } from "../helpers/loggerHelper.js";
const router = express.Router();
router.get("/", async (req, res, next) => {
    const title = "Bookstore Home Page";
    const navStatusHome = "active";
    if (req.user)
        logGreen(`[GET /] LOGGED IN as ${req.user.email}`);
    else
        logYellow("[GET /] NOT LOGGED IN");
    try {
        const pa = await productadmin.findAll({ order: [["rating", "DESC"]] });
        res.render("index", { title, navStatusHome, productadmin: pa });
    }
    catch (error) {
        console.error("Error rendering index page:", error);
        next(error);
    }
});
router.get("/index", async (req, res, next) => {
    const title = "Bookstore Home Page";
    const navStatusHome = "active";
    if (req.user)
        logGreen(`[GET /index] LOGGED IN as ${req.user.email}`);
    else
        logYellow("[GET /index] NOT LOGGED IN");
    try {
        const pa = await productadmin.findAll({ order: [["rating", "DESC"]] });
        res.render("index", { title, navStatusHome, productadmin: pa });
    }
    catch (error) {
        console.error("Error rendering index page:", error);
        next(error);
    }
});
router.get("/about", (req, res) => {
    res.render("about", { title: "About Us", navStatusAbout: "active" });
});
router.get("/faq", (req, res) => {
    res.render("faq", { title: "FAQs", navStatusFAQ: "active" });
});
router.get("/privacy-policy", (req, res) => {
    res.render("privacy-policy", { title: "Privacy Policy" });
});
router.get("/terms-conditions", (req, res) => {
    res.render("terms-conditions", { title: "Terms and Conditions" });
});
router.get("/shipping", (req, res) => {
    res.render("shipping", { title: "Shipping" });
});
router.get("/login", (req, res) => {
    res.render("user/login", { title: "Login Page", navStatusLogin: "active" });
});
router.get("/register", (req, res) => {
    res.render("user/register", {
        title: "Registration Page",
        navStatusRegister: "active",
    });
});
export { router };
//# sourceMappingURL=mainRoutes.js.map