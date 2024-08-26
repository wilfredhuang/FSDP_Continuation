import express from "express";
const router = express.Router();
import productadmin from "../models/ProductAdmin.js";
import { logRed, logGreen, logBlue, logYellow, logMagenta, logCyan } from "../helpers/loggerHelper.js";

router.get("/", async (req, res, next) => {
    const title = "Bookstore Home Page";
    const navStatusHome = "active";
    // Check if logged in or not
    if (req.user) {
        logGreen(`[GET /] LOGGED IN as ${req.user.email}`);
    } else {
        logYellow("[GET /] NOT LOGGED IN");
    }

    try {
        const pa = await productadmin.findAll({
            order: [["rating", "DESC"]],
        });

        res.render("index", {
            title,
            navStatusHome,
            productadmin: pa,
        });
    } catch (error) {
        console.error("Error rendering the index page:", error);
        next(error); // Pass the error to the default error handler
    }
});

router.get("/index", async (req, res) => {
	const title = "Bookstore Home Page";
    const navStatusHome = "active";
    // Check if logged in or not
    if (req.user) {
        logGreen(`[GET /] LOGGED IN as ${req.user.email}`);
    } else {
        logYellow("[GET /] NOT LOGGED IN");
    }

    try {
        const pa = await productadmin.findAll({
            order: [["rating", "DESC"]],
        });

        res.render("index", {
            title,
            navStatusHome,
            productadmin: pa,
        });
    } catch (error) {
        console.error("Error rendering the index page:", error);
        next(error); // Pass the error to the default error handler
    }
});

router.get("/about", (req, res) => {
	const title = "About Us";
	const navStatusAbout = "active";
	res.render("about", {
		title,
		navStatusAbout,
	});
});

router.get("/faq", (req, res) => {
	const title = "FAQs";
	const navStatusFAQ = "active";
	res.render("faq", {
		title,
		navStatusFAQ,
	});
});

router.get("/privacy-policy", (req, res) => {
	const title = "Privacy Policy";
	res.render("privacy-policy", {
		title,
	});
});

router.get("/terms-conditions", (req, res) => {
	const title = "Terms and Conditions";
	res.render("terms-conditions", {
		title,
	});
});

//Shipping Details Page
router.get("/shipping", (req, res) => {
	const title = "Shipping";
	res.render("shipping", {
		title,
	});
});

// Login Page
router.get("/login", (req, res) => {
	const title = "Login Page";
	const navStatusLogin = "active";
	res.render("user/login", {
		title,
		navStatusLogin,
	});
});

// Register Page
router.get("/register", (req, res) => {
	const title = "Registration Page";
	const navStatusRegister = "active";
	res.render("user/register", {
		title,
		navStatusRegister,
	});
});

export { router };
