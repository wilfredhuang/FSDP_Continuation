import express from "express";
const router = express.Router();

import alertMessage from "../helpers/messenger.js";
import bcrypt from "bcryptjs"; // Provides Hashing
import passport from "passport"; // Handle authentication for requests

import pkg from "uuid"; // Create universally unique identifier
const { v1: uuidv1 } = pkg;
import request from "request";

const secretKey = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;

//Authentication Middleware Function
import ensureAuthenticated from "../helpers/auth.js";
import ensureAdminAuthenticated from "../helpers/adminauth.js";

//Models
import User from "../models/User.js";
import order from "../models/Order.js";
import orderItem from "../models/OrderItem.js";

//NodeMailer
import nodemailer from "nodemailer"; // Send emails service
import jwt from "jsonwebtoken"; // Tokens used for Authorization / Information Exchange purposes, consists of 'Header', 'Payload' and 'Signature'
import { reservationsUrl } from "twilio/lib/jwt/taskrouter/util.js";

// Validator
import validator from "validator";

const SECRET = process.env.NODEMAILER_SECRET_KEY;
const SECRET_2 = process.env.NODEMAILER_SECRET_KEY2;

//nodemailer
let transporter = nodemailer.createTransport({
	host: "smtp.zoho.com",
	port: 465,
	secure: true, // true for 465, false for other ports
	auth: {
		user: "bellavistabookstore@zohomail.com",
		pass: "B00kstore123A#",
	},
	tls: {
		// do not fail on invalid certs
		rejectUnauthorized: false,
	},
});

// verify connection configuration
transporter.verify(function (error, success) {
	if (error) {
		console.log(`NODEMAILER ${error}`);
	} else {
		console.log(`NODEMAILER Server is ready to take our messages`);
	}
});

//Contact Us Form at Footer (working)
//BTW this is a testing ground for email notifications
router.post("/contactUs", (req, res) => {
	let name = req.body.name;
	let email = req.body.email;
	console.log(`Old Text: ${req.body.message}`);

	// TODO Sanitize input of any html tags
	let emailMessage = `<p>Thank You for contacting us! We will respond back to you shortly.  ${req.body.message} </p>`;
	let subject = req.body.subject;

	let message = {
		from: "BellaVista Bookstore Admin <bellavistabookstore@zohomail.com>",
		to: `${name} <${email}>`,
		subject: `Re: BellaVista Bookstore ${subject}`,
		html: `${emailMessage}`,
	};

	transporter.sendMail(message, (err, info) => {
		if (err) {
			console.log("Error occurred. " + err.message);
			return process.exit(1);
		}

		console.log("Message sent: %s", info.messageId);
		// Preview only available when sending through an Ethereal account
		console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
	});
	alertMessage(
		res,
		"success",
		"Thank You for contacting us!",
		"fas faexclamation-circle",
		true
	);
	res.redirect("/");
});

router.get("/jwt", (req, res) => {
	// Create the token

	const token = jwt.sign({ name: "user1337" }, "secretkey1337", {
		expiresIn: "1d",
	});

	// Create Cookies
	res.cookie("cookie1", "cookie1value");
	res.cookie("jwttoken", token, {
		maxAge: 3600,
		httpOnly: true,
		secure: true,
	});
	console.log(`Token value is ${token}`);

	res.render("user/jwt");
});

router.post("/jwt", (req, res) => {
	var username = req.username;
	var password = req.password;

	//console.log(`Cookie Value is ${req.cookies.jwttoken}`);
	if (req.cookies.cookie1) {
		console.log(`Cookie Value is ${req.cookies.jwttoken}`);
		console.log(`Cookie1 Value is ${req.cookies.cookie1}`);
		console.log("Cookie Exist");
		console.log(`Signed Cookies: ${JSON.stringify(req.signedCookies)}`);
	} else {
		console.log("Cookie dont exist");
	}

	const verify = jwt.verify(req.cookies.jwttoken, "secretkey1337");

	console.log(`Verify: ${JSON.stringify(verify)}`);

	if (username != "user" && password != "password") {
		// Read all the cookies in the browser
		console.log(`Data is ${JSON.stringify(req.cookies)}`);

		console.log("wrong");
	} else {
		res.redirect("/user/successfuljwt");
	}
});

router.get("/successfuljwt", (req, res) => {
	res.render("user/successfuljwt");
});

router.get("/resetpassword", (req, res) => {
	res.render("user/changePassword");
});

router.post("/resetpassword/", async (req, res) => {
	if (req.body.password != req.body.password2) {
		errors.push("paswords not the same");
		res.redirect("/user/changepassword");
	}
	User.findOne({ where: { id: req.user.id } }).then((user) => {
		bcrypt.genSalt(10, function (err, salt) {
			bcrypt.hash(req.body.password, salt, function (err, hash) {
				if (err) return next(err);
				thepassword = hash;
				user.update({ password: thepassword });
			});
		});
		alertMessage(
			res,
			"success",
			"password changed",
			"fas fa-sign-in-alt",
			true
		);
		res.redirect("/user/logout");
	});
});

router.get("/changepassword/:token", async (req, res) => {
	const token = jwt.verify(req.params.token, SECRET_2);
	User.findOne({ where: { id: token.user } }).then((user) => {
		req.login(user, function (err) {
			if (err) {
				return next(err);
			}
			return res.redirect("/user/resetpassword");
		});
	});
});

router.get("/forgetpassword", (req, res) => {
	res.render("user/forgetPassword", {
		recaptcha_site_key: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
	});
});

router.post("/forgetpassword", (req, res) => {
	let captcha = req.body["g-recaptcha-response"]; //get user token value
	console.log(captcha);
	//checks if captcha response is valid
	if (captcha === undefined || captcha === "" || captcha === null) {
		return res.json({ success: false, msg: "Please select captcha" });
	}
	const verifyURL =
		"https://www.google.com/recaptcha/api/siteverify?secret=" +
		secretKey +
		"&response=" +
		captcha;
	console.log(verifyURL); //this is a url that needs to be verified

	request(verifyURL, (err, response, body) => {
		body = JSON.parse(body);
		console.log(body); //retrieves response from google and return its json info

		if (body.success !== undefined && !body.success) {
			alertMessage(
				res,
				"danger",
				"Please re-enter the recaptcha",
				"fas faexclamation-circle",
				true
			);
			res.redirect("/user/forgetpassword");
		} else {
			let email = req.body.email;
			console.log(email);
			User.findOne({ where: { email: email } }).then((user) => {
				if (!user) {
					res.redirect("/user/login");
				} else {
					theid = user.id;
					console.log(theid);
					jwt.sign(
						{
							user: theid,
						},
						SECRET_2,
						{
							expiresIn: "1d",
						},
						(err, passwordToken) => {
							const url = `https://localhost:5000/user/changepassword/${passwordToken}`;
							console.log(url);
							transporter.sendMail({
								to: req.body.email,
								subject: "Password Reset ",
								html: `Please click this link to change you password: <a href="${url}">${url}</a>`,
							});
						}
					);
					alertMessage(
						res,
						"success",
						"please check your email",
						"fas fa-sign-in-alt",
						true
					);
					res.redirect("/user/login");
				}
			});
		}
	});
});

router.post("/forgetpassword", (req, res) => {
	let captcha = req.body["g-recaptcha-response"]; //get user token value
	console.log(captcha);
	//checks if captcha response is valid
	if (captcha === undefined || captcha === "" || captcha === null) {
		return res.json({ success: false, msg: "Please select captcha" });
	}
	const verifyURL =
		"https://www.google.com/recaptcha/api/siteverify?secret=" +
		secretKey +
		"&response=" +
		captcha;
	console.log(verifyURL); //this is a url that needs to be verified

	request(verifyURL, (err, response, body) => {
		body = JSON.parse(body);
		console.log(body); //retrieves response from google and return its json info

		if (body.success !== undefined && !body.success) {
			alertMessage(
				res,
				"danger",
				"Please re-enter the recaptcha",
				"fas faexclamation-circle",
				true
			);
			res.redirect("/user/forgetpassword");
		} else {
			let email = req.body.email;
			console.log(email);
			User.findOne({ where: { email: email } }).then((user) => {
				if (!user) {
					res.redirect("/user/login");
				} else {
					theid = user.id;
					console.log(theid);
					jwt.sign(
						{
							user: theid,
						},
						SECRET_2,
						{
							expiresIn: "1d",
						},
						(err, passwordToken) => {
							const url = `https://localhost:5000/user/changepassword/${passwordToken}`;
							console.log(url);
							transporter.sendMail({
								to: req.body.email,
								subject: "Password Reset ",
								html: `Please click this link to change you password: <a href="${url}">${url}</a>`,
							});
						}
					);
					alertMessage(
						res,
						"success",
						"please check your email",
						"fas fa-sign-in-alt",
						true
					);
					res.redirect("/user/login");
				}
			});
		}
	});
});

router.get("/confirmation/:token", async (req, res) => {
	const token = jwt.verify(req.params.token, "HARDCODEDSECRET123");
	User.findOne({ where: { id: token.user } }).then((user) => {
		user.update({ confirmed: true });
		console.log("email verified");
	});
	alertMessage(res, "success", "account confirmed", "fas fa-sign-in-alt", true);
	res.redirect("https://localhost:5000/user/login");
});

router.get(
	"/auth/facebook",
	passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
	"/auth/facebook/callback",
	passport.authenticate("facebook", {
		successRedirect: "/",
		failureRedirect: "/login",
	})
);

router.get("/userPage", ensureAuthenticated, (req, res) => {
	const title = "User Information";
	if (req.user.facebookId != null) {
		res.render("user/facebookuserpage", {
			title,
		});
	} else {
		res.render("user/userpage", {
			title,
		});
	}
});

router.get(
	"/orderHistoryAdmin",
	ensureAuthenticated,
	ensureAdminAuthenticated,
	(req, res) => {
		const title = "Order History - Admin";
		order
			.findAll({
				// where: {
				//   userId: req.user.id, //finds all because user is admin
				// },
				include: [{ model: orderItem }],
			})
			.then((order) => {
				res.render("user/orderHistoryPageAdmin", {
					order: order,
					orderitems: order.orderitems,
					title,
				});
			});
	}
);

router.get("/orderHistory", ensureAuthenticated, (req, res) => {
	const title = "Order History";
	order
		.findAll({
			where: {
				userId: req.user.id,
			},
			include: [{ model: orderItem }],
		})
		.then((order) => {
			console.log(order);
			res.render("user/orderHistoryPageUser", {
				order: order,
				orderitems: order.orderitems,
				title,
			});
		})
		.catch((err) => console.log(err));
});

router.get("/login", (req, res) => {
	const title = "Login";
	res.render("user/login", {
		title,
	});
});

router.post("/login", function (req, res, next) {
	passport.authenticate("local", function (err, user, info) {
		if (err) {
			console.log("Authenticate failed");
			console.log(err);
			return next(err);
		}
		if (!user) {
			console.log("Authenticate failed, not user??");
			console.log(err);
			return res.redirect("/login");
		}
		req.logIn(user, function (err) {
			if (err) {
				console.log("User..???");
				return next(err);
			} else if (user.isadmin == true) {
				console.log("Admin..???");
				return res.redirect("/user/admin");
			}
			return res.redirect("/");
		});
	})(req, res, next);
});

router.get("/admin", ensureAdminAuthenticated, (req, res) => {
	const title = "Admin Page";
	res.render("user/adminmenu", {
		title,
	});
});

router.get("/register", (req, res) => {
	const title = "Register";
	res.render("user/register", {
		title,
	});
});

router.post("/register", async (req, res) => {
	let errors = [];
	let { email, name, password, password2 } = req.body;
	if (password !== password2) {
		errors.push({ text: "Passwords do not match" });
	}
	if (password.length < 4) {
		errors.push({ text: "Password must be at least 4 characters" });
	}
	if (errors.length > 0) {
		res.render("user/register", {
			errors,
			name,
			email,
			password,
			password2,
		});
	} else {
		const searchUserPromise = await User.findOne({
			where: { email: req.body.email },
		});
		if (searchUserPromise) {
			res.render("user/register", {
				errors: user.email + " already registered",
				name,
				email,
				password,
				password2,
			});
		} else {
			bcrypt.genSalt(10, (err, salt) => {
				if (err) return next(err);
				bcrypt.hash(password, salt, async function (err, hash) {
					if (err) return next(err);
					password = hash;
					var theid = uuidv1();
					var createUserPromise = await User.create({
						id: theid,
						name,
						email,
						password,
						isadmin: false,
						confirmed: false,
					});

					alertMessage(
						res,
						"success",
						createUserPromise.name + " added.Please Verify you account",
						"fas fa-sign-in-alt",
						true
					);
					// replace SECRET with a hardcoded for testing
					jwt.sign(
						{
							user: theid,
						},
						"HARDCODEDSECRET123",
						{
							expiresIn: "1d",
						},
						(err, emailToken) => {
							const url = `https://localhost:5000/user/confirmation/${emailToken}`;
							console.log(url);
							transporter.sendMail({
								from: "BellaVista Bookstore Admin <bellavistabookstore@zohomail.com>",
								to: `${name} <${req.body.email}>`,
								subject: "Confirm Email",
								html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
							});
						}
					);
					res.redirect("/user/login");
				});
			});
		}
	}
});

// Back up copy for register
// router.post("/register", (req, res) => {
// 	let errors = [];
// 	let { email, name, password, password2 } = req.body;
// 	if (password !== password2) {
// 		errors.push({ text: "Passwords do not match" });
// 	}
// 	if (password.length < 4) {
// 		errors.push({ text: "Password must be at least 4 characters" });
// 	}
// 	if (errors.length > 0) {
// 		res.render("user/register", {
// 			errors,
// 			name,
// 			email,
// 			password,
// 			password2,
// 		});
// 	} else {
// 		User.findOne({ where: { email: req.body.email } }).then((user) => {
// 			if (user) {
// 				res.render("user/register", {
// 					errors: user.email + " already registered",
// 					name,
// 					email,
// 					password,
// 					password2,
// 				});
// 			} else {
// 				bcrypt.genSalt(10, function (err, salt) {
// 					if (err) return next(err);
// 					bcrypt.hash(password, salt, function (err, hash) {
// 						if (err) return next(err);
// 						password = hash;
// 						var theid = uuidv1();
// 						User.create({
// 							id: theid,
// 							name,
// 							email,
// 							password,
// 							isadmin: false,
// 							confirmed: false,
// 						}).then((user) => {
// 							alertMessage(
// 								res,
// 								"success",
// 								user.name + " added.Please Verify you account",
// 								"fas fa-sign-in-alt",
// 								true
// 							);
// 							jwt.sign(
// 								{
// 									user: theid,
// 								},
// 								SECRET,
// 								{
// 									expiresIn: "1d",
// 								},
// 								(err, emailToken) => {
// 									const url = `https://localhost:5000/user/confirmation/${emailToken}`;
// 									console.log(url);
// 									transporter.sendMail({
// 										from: "BellaVista Bookstore Admin <bellavistabookstore@zohomail.com>",
// 										to: `${name} <${req.body.email}>`,
// 										subject: "Confirm Email",
// 										html: `Please click this email to confirm your email: <a href="${url}">${url}</a>`,
// 									});
// 								}
// 							);
// 							res.redirect("/user/login");
// 						});
// 					});
// 				});
// 			}
// 		});
// 	}
// });

router.get("/logout", function (req, res) {
	// Empty the cart
	req.session.userCart = {};
	req.session.coupon_type = null;
	req.session.discount = 0;
	req.session.discount_limit = 0;
	req.session.discounted_price = (0).toFixed(2);
	req.session.shipping_discount = 0;
	req.session.shipping_discount_limit = 0;
	req.session.shipping_discounted_price = 0;
	req.session.sub_discount = 0;
	req.session.sub_discount_limit = 0;
	req.session.sub_discounted_price = 0;
	req.session.full_subtotal_price = 0;
	req.session.full_total_price = 0;
	req.session.deducted = 0;

	// Problem: Error: req#logout requires a callback function, Solution: Edited the code to become asynchronous
	// https://stackoverflow.com/questions/72336177/error-reqlogout-requires-a-callback-function
	req.logout(function (err) {
		// TODO: https://stackoverflow.com/questions/22033174/deleting-expired-sessions-from-mysql
		req.session.destroy();
		if (err) {
			return next(err);
		}
		res.redirect("/");
	});
});

router.get("/userPage", ensureAuthenticated, (req, res) => {
	res.render("user/userPage");
});

router.post("/userPage/changeinfo", ensureAuthenticated, (req, res) => {
	let errors = [];
	let { name, email, password2 } = req.body;
	console.log(req.body);

	bcrypt.compare(req.body.password, req.user.password, function (err, done) {
		if (done) {
			User.findOne({ where: { id: req.user.id } }).then((user) => {
				if (name != "") {
					user.update({ name: req.body.name });
				}
				if (email != "") {
					user.update({ email: req.body.email });
				}
				if (password2 != "") {
					bcrypt.genSalt(10, function (err, salt) {
						bcrypt.hash(req.user.password2, salt, function (err, hash) {
							// Store hash in your password DB.
							user.update({ password: hash });
						});
					});
				}
			});
			alertMessage(
				res,
				"success",
				"information has been updated",
				"fas fa-sign-in-alt",
				true
			);
			res.redirect("/user/userpage/");
		}
		if (err) {
			console.log(err);
			alertMessage(res, "error", "error", "fas fa-sign-in-alt", true);
			res.redirect("/user/userpage");
		}
	});
});

router.get("/userPage/changeinfo", ensureAuthenticated, function (req, res) {
	const title = "Change Information";
	res.render("user/changeinfo", {
		title,
	});
});

router.get("/userPage/changeaddress", ensureAuthenticated, function (req, res) {
	const title = "Change Address";
	res.render("user/changeaddress", {
		title,
	});
});

router.post("/userPage/changeaddress", ensureAuthenticated, (req, res) => {
	let errors = [];
	let { PhoneNo, address, address1, city, country, postalCode } = req.body;
	console.log(req.body);
	User.findOne({ where: { id: req.user.id } }).then((user) => {
		if (PhoneNo != "") {
			user.update({ PhoneNo: req.body.PhoneNo });
		}
		if (address != "") {
			user.update({ address: req.body.address });
		}
		if (address1 != "") {
			user.update({ address1: req.body.address1 });
		}
		if (city != "") {
			user.update({ city: req.body.city });
		}
		if (country != "") {
			user.update({ country: req.body.country });
		}
		if (postalCode != "") {
			user.update({ postalCode: req.body.postalCode });
		}
		alertMessage(
			res,
			"success",
			"information has been updated",
			"fas fa-sign-in-alt",
			true
		);
		res.redirect("/user/userpage");
	});
});

export { router };
