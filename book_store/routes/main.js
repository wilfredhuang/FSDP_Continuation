import express from "express";
const router = express.Router();
import alertMessage from "../helpers/messenger.js";
import Coupon from "../models/Coupon.js";
import moment from "moment";
import userAuth from "../helpers/auth.js";
import productAdmin from "../models/ProductAdmin.js";

// const express = require("express");
// const router = express.Router();
// const alertMessage = require("../helpers/messenger");
// const Coupon = require("../models/coupon");
// const moment = require("moment");
// const userAuth = require("../helpers/auth");
// const productadmin = require("../models/ProductAdmin");

router.get("/", async (req, res, next) => {
	const title = "Bookstore Home Page";
	const navStatusHome = "active";

	// check if logged in or not
	if (req.user) {
		console.log("LOGGED IN");
		console.log(req.user.email);
	} else {
		console.log("NOT LOGGED IN");
	}

	// If no session cart created yet, create one
	if (!req.session.userCart) {
		// Initialise session variables on the server start-up
		req.session.userCart = {};
		req.session.coupon_type;
		req.session.discount = 0;
		req.session.discount_limit = 0;
		req.session.discounted_price = (0).toFixed(2);
		req.session.shipping_discount = 0;
		req.session.shipping_discount_limit = 0;
		req.session.shipping_discounted_price = 0;
		req.session.sub_discount = 0;
		req.session.sub_discount_limit = 0;
		req.session.sub_discounted_price = 0;
		req.session.full_total_price = 0;
		req.session.deducted = (0).toFixed(2);
		req.session.coupon_type = null;
		// ssn = req.session.userCart;
	}
	// at website startup, when no ssn var set, find if a public coupon(if exists)
	// and assign to ssn var to display promo banner
	if (req.session.public_coupon == null) {
		console.log("No coupon value found in session var, searching...");
		var coupon_object = await Coupon.findOne({
			where: { public: 1 },
		});
		console.log(`Coupon Obj is ${coupon_object}`);
		req.session.public_coupon = coupon_object;
		req.session.save();
	}

	// If ssn var is not null (default), check if the public coupon still exist in db,
	// If not, reassign ssn var to null again
	else {
		try {
			console.log("Existing coupon value found in session, validating...");
			var coupon_object = await Coupon.findOne({
				where: { public: 1 },
			});

			console.log("Public Coupon " + coupon_object.code + " found");

			// Handle Coupon Expiry
			console.log(`Today's datetime is ${moment()}`);
			console.log(`Expiry date of Coupon is ${coupon_object.expiry}`);
			if (moment().isAfter(coupon_object.expiry)) {
				coupon_object.destroy();
				console.log(
					`Coupon ${coupon_object.code} which has expired, destroyed.`
				);
				console.log(
					"Seems like public coupon has expired already, deleting it's session variable..."
				);
				req.session.public_coupon = null;
				req.session.save();
			}
		} catch {
			console.log("Something went wrong with retrieving the coupon");
		}
	}

	console.log(req.session);

	try {
		var pa = await productadmin.findAll({
			order: [["rating", "DESC"]],
		});

		res.render("index", {
			// renders views/index.handlebars
			title,
			navStatusHome,
			productadmin: pa,
		});
	} catch {
		console.log("Something went wrong with rendering the index page");
	}
});

router.get("/index", (req, res) => {
	const title = "Bookstore Home Page";
	const navStatusHome = "active";
	if (!req.session.userCart) {
		req.session.userCart = {};
		// ssn = req.session.userCart;
	}
	count = [5, 4, 3, 2, 1];
	console.log(req.session);
	productadmin
		.findAll({
			order: [["rating", "DESC"]],
		})
		.then((productadmin) => {
			res.render("index", {
				productadmin: productadmin,
				title,
				navStatusHome,
				count,
			});
		});

	//console.log(req.session)
	//res.render("index", {
	// renders views/index.handlebars
	//  title,
	//  navStatusHome
	//});
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

export default router;
