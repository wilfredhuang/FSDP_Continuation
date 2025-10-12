// @ts-nocheck
import express from "express";
const router = express.Router();

import alertMessage from "../helpers/messenger.js";
import bcrypt from "bcryptjs"; // Provides Hashing
import passport from "passport"; // Handle authentication for requests
import axios from "axios"; // used in recaptcha + forgot password

import { v1 as uuidv1 } from "uuid";

const secretKey = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;

//Authentication Middleware Function
import ensureAuthenticated from "../middleware/userAuth.js";
import ensureAdminAuthenticated from "../middleware/adminAuth.js";

//Models
import User from "../models/User.js";
import order from "../models/Order.js";
import orderItem from "../models/OrderItem.js";

//NodeMailer
import nodemailer from "nodemailer"; // Send emails service
import jwt from "jsonwebtoken"; // Tokens used for Authorization / Information Exchange purposes, consists of 'Header', 'Payload' and 'Signature'

const JWT_SECRETKEY = process.env.JWT_SECRETKEY;
import { body, validationResult } from "express-validator";

// loggerHelper
import { logRed, logGreen, logBlue, logYellow, logMagenta, logCyan } from "../helpers/loggerHelper.js";

//Set up the nodemailer
let transporter = nodemailer.createTransport({
  host: "smtp.zoho.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: process.env.BOOKSTORE_EMAIL_USERNAME,
    pass: process.env.BOOKSTORE_EMAIL_PASSWORD,
  },
  tls: {
    // do not fail on invalid certs
    rejectUnauthorized: false,
  },
});

// Check if nodemailer configuration is working.
transporter.verify(function (error, success) {
  if (error) {
    logRed(`[/userRoutes/] NODEMAILER ${error}`);
  } else {
    logGreen(`[userRoutes/] NODEMAILER Server is ready to take our messages`);
  }
});

// Contact Us Form (Complete)
router.post(
  "/contactUs",
  [
    // Validation and sanitization
    body("name").trim().isLength({ min: 1 }).withMessage("Name is required").escape(),
    body("email").trim().isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("subject").trim().isLength({ min: 1 }).withMessage("Subject is required").escape(),
    body("message").trim().isLength({ min: 1 }).withMessage("Message is required").escape(),
  ],
  (req, res) => {
    // Handling errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      alertMessage(res, "danger", "Contact form is incomplete. Please try again.", "fas fa-exclamation-circle", true);
      return res.redirect("back");
      //return res.status(400).json({ errors: errors.array() });
    }

    // Process the sanitized data
    let name = req.body.name;
    let email = req.body.email;
    let subject = req.body.subject;
    let sanitizedMessage = req.body.message;

    // Example of sending an email with the sanitized inputs
    let emailMessage = `<p>Thank you for contacting us! We will respond back to you shortly. \n You wrote: ${sanitizedMessage}</p>`;
    let message = {
      from: `BellaVista Bookstore Admin <${process.env.BOOKSTORE_EMAIL_USERNAME}>`,
      to: `${name} <${email}>`,
      subject: `Re: BellaVista Bookstore ${subject}`,
      html: emailMessage,
    };

    transporter.sendMail(message, (err, info) => {
      if (err) {
        console.log("Error occurred. " + err.message);
        return res.status(500).send("An error occurred while sending the email.");
      }

      // Success feedback
      alertMessage(res, "success", "Thank You for contacting us!", "fas fa-exclamation-circle", true);
      res.redirect("/");
    });
  }
);

// JSON Web Token Testing Route
router.get("/jwt", (req, res) => {
  // Create A Normal Cookie
  res.cookie("example_cookie", "example_value");
  res.render("user/jwt");
});

router.post("/jwt", (req, res) => {
  var username = req.body.username;
  var password = req.body.password;

  // Example Cookie Check
  if (req.cookies.example_cookie) {
    console.log(`Example Cookie Value is ${req.cookies.example_cookie}`);
    console.log("Cookie Exist");
    console.log(`Signed Cookies: ${JSON.stringify(req.signedCookies)}`);
  } else {
    console.log("Cookie dont exist");
    return res.status(401).send("Example cookie not provided");
  }

  if (username != "user" && password != "password") {
    // Read all the cookies in the browser
    console.log(`Data is ${JSON.stringify(req.cookies)}`);
    console.log("wrong credentials");
    res.redirect("back");
  } else {
    res.redirect("/user/jwt2");
  }
});

router.get("/jwt2", (req, res) => {
  // Create the JsonWebToken after successful login
  const token = jwt.sign({ username: "username", isAdmin: 0, isConfirmed: 0 }, JWT_SECRETKEY, {
    expiresIn: "1d",
  });

  // Assign JWT to a HTTPONLY Cookie
  res.cookie("jwt_cookie", token, {
    maxAge: 360000000,
    httpOnly: true,
    secure: true,
  });

  res.render("user/jwt2");
});

router.post("/jwt2", (req, res) => {
  console.log(`Request body: ${JSON.stringify(req.body)}`); // Inspect Request Body
  console.log(`Cookies received: ${JSON.stringify(req.cookies)}`); // Inspect Cookies received

  // JWT Cookie Check
  if (req.cookies.jwt_cookie) {
    console.log(`JWTCookie Value is ${req.cookies.jwt_cookie}`);
    console.log("Cookie Exist");
    console.log(`Signed Cookies: ${JSON.stringify(req.signedCookies)}`);
  } else {
    console.error("JWT token not provided in cookies");
    return res.status(401).send("JWT token not provided");
  }

  // Verify the JWT provided
  try {
    // Verify the token
    jwt.verify(req.cookies.jwt_cookie, JWT_SECRETKEY, (err, decoded) => {
      if (err) {
        // If an error occurs, such as token being invalid or expired
        //return res.sendStatus(403); // Forbidden if the token is not valid
        console.log(`Error: ${err.message}`);
        console.log("Invalid");
      } else {
        console.log(`Decoded JWT Token is ${JSON.stringify(decoded)}`);
      }
    });

    const verify = jwt.verify(req.cookies.jwt_cookie, JWT_SECRETKEY);
    console.log(`Verify: ${JSON.stringify(verify)}`);
  } catch (err) {
    console.error("JWT verification failed:", err.message);
    return res.status(403).send("JWT verification failed");
  }

  //Redirect to the successful page if the credentials are correct
  res.redirect("/user/successful-jwt");
});

router.get("/successful-jwt", (req, res) => {
  res.render("user/successful-jwt");
});

// JSON Web Token Testing Route End

router.get("/resetpassword", (req, res) => {
  res.render("user/change-password");
});

router.post("/resetpassword/", async (req, res) => {
  if (req.body.password != req.body.password2) {
    errors.push("paswords not the same");
    res.redirect("/user/change-password");
  }
  User.findOne({ where: { id: req.user.id } }).then((user) => {
    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(req.body.password, salt, function (err, hash) {
        if (err) return next(err);
        thepassword = hash;
        user.update({ password: thepassword });
      });
    });
    alertMessage(res, "success", "password changed", "fas fa-sign-in-alt", true);
    res.redirect("/user/logout");
  });
});

router.get("/change-password/:token", async (req, res) => {
  const token = jwt.verify(req.params.token, JWT_SECRETKEY);
  User.findOne({ where: { id: token.user } }).then((user) => {
    req.login(user, function (err) {
      if (err) {
        return next(err);
      }
      return res.redirect("/user/resetpassword");
    });
  });
});

router.get("/forget-password", (req, res) => {
  res.render("user/forget-Password", {
    recaptcha_site_key: process.env.GOOGLE_RECAPTCHA_SITE_KEY,
  });
});

router.post("/forget-password", async (req, res) => {
  const captcha = req.body["g-recaptcha-response"];
  if (!captcha) {
    return res.json({ success: false, msg: "Please select captcha" });
  }

  const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${secretKey}&response=${captcha}`;

  try {
    const { data: body } = await axios.post(verifyURL);
    if (!body.success) {
      alertMessage(res, "danger", "Please re-enter the recaptcha", "fas fa-exclamation-circle", true);
      return res.redirect("/user/forget-password");
    }

    const user = await User.findOne({ where: { email: req.body.email } });
    if (!user) {
      return res.redirect("/user/login");
    }

    const theid = user.id;
    const passwordToken = jwt.sign({ user: theid }, JWT_SECRETKEY, {
      expiresIn: "1d",
    });
    const url = `https://localhost:5000/user/change-password/${passwordToken}`;

    await transporter.sendMail({
      from: "BellaVista Bookstore Admin <bellavistabookstore@zohomail.com>",
      to: req.body.email,
      subject: "Password Reset",
      html: `Please click this link to change your password: <a href="${url}">${url}</a>`,
    });

    alertMessage(res, "success", "Please check your email", "fas fa-sign-in-alt", true);
    res.redirect("/user/login");
  } catch (err) {
    console.error("Error: " + err.message);
    alertMessage(res, "danger", "An error occurred. Please try again later.", "fas fa-exclamation-circle", true);
    res.redirect("/user/forget-password");
  }
});

router.get("/confirmation/:token", async (req, res) => {
  const token = jwt.verify(req.params.token, JWT_SECRETKEY);
  User.findOne({ where: { id: token.user } }).then((user) => {
    user.update({ confirmed: true });
    console.log("email verified");
  });
  alertMessage(res, "success", "account confirmed", "fas fa-sign-in-alt", true);
  res.redirect("https://localhost:5000/user/login");
});

// Facebook Auth Login (Down)
router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));

router.get(
  "/auth/facebook/callback",
  passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/login",
  })
);

//

router.get("/user-page", ensureAuthenticated, (req, res) => {
  const title = "User Information";
  if (req.user.facebookId != null) {
    res.render("user/facebook-user-page", {
      title,
    });
  } else {
    res.render("user/user-page", {
      title,
    });
  }
});

router.get("/orderHistoryAdmin", ensureAuthenticated, ensureAdminAuthenticated, (req, res) => {
  const title = "Order History - Admin";
  order
    .findAll({
      // where: {
      //   userId: req.user.id, //finds all because user is admin
      // },
      include: [{ model: orderItem }],
    })
    .then((order) => {
      res.render("user/order-history-admin", {
        order: order,
        orderitems: order.orderitems,
        title,
      });
    });
});

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
      res.render("user/order-history-user", {
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
  res.render("user/admin-menu", {
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
    return res.render("user/register", {
      errors,
      name,
      email,
      password,
      password2,
    });
  }

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.render("user/register", {
        errors: [{ text: `${email} is already registered` }],
        name,
        email,
        password,
        password2,
      });
    }

    // Hash password and create user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const theid = uuidv1();
    const newUser = await User.create({
      id: theid,
      name,
      email,
      password: hashedPassword,
      isadmin: false,
      confirmed: false,
    });

    // Send confirmation email
    const emailToken = jwt.sign({ user: theid }, JWT_SECRETKEY, {
      expiresIn: "1d",
    });
    const url = `https://localhost:5000/user/confirmation/${emailToken}`;

    const mailOptions = {
      from: "BellaVista Bookstore Admin <bellavistabookstore@zohomail.com>",
      to: `${name} <${email}>`,
      subject: "Confirm Email",
      html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("Error occurred while sending email: " + error.message);
        alertMessage(
          res,
          "danger",
          "Failed to send confirmation email. Please try again later.",
          "fas fa-exclamation-circle",
          true
        );
        return res.render("user/register", {
          errors: [
            {
              text: "Failed to send confirmation email. Please try again later.",
            },
          ],
          name,
          email,
          password,
          password2,
        });
      }
      console.log("Confirmation email sent: %s", info.messageId);
      alertMessage(
        res,
        "success",
        `A confirmation email has been sent to ${email}. Please check your inbox.`,
        "fas fa-check-circle",
        true
      );
      res.redirect("/user/login");
    });
  } catch (err) {
    console.error("Error during registration process: " + err.message);
    alertMessage(
      res,
      "danger",
      "An error occurred during registration. Please try again later.",
      "fas fa-exclamation-circle",
      true
    );
    res.render("user/register", {
      errors: [
        {
          text: "An error occurred during registration. Please try again later.",
        },
      ],
      name,
      email,
      password,
      password2,
    });
  }
});

router.get("/logout", function (req, res) {
  // Empty the cart (Updated)
  req.session.userCart = {};
  req.session.coupon_object = null;
  req.session.coupon_type = null;
  req.session.cart_subtotal_initial = 0;
  req.session.cart_subtotal_final = 0;
  req.session.cart_discount_savings = 0;
  req.session.cart_coupon_savings = 0;
  req.session.cart_shipping_fee = 0;
  req.session.cart_grandtotal = 0;

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

router.get("/user-page", ensureAuthenticated, (req, res) => {
  res.render("user/user-page");
});

router.post("/user-page/change-info", ensureAuthenticated, (req, res) => {
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
      alertMessage(res, "success", "information has been updated", "fas fa-sign-in-alt", true);
      res.redirect("/user/user-page/");
    }
    if (err) {
      console.log(err);
      alertMessage(res, "error", "error", "fas fa-sign-in-alt", true);
      res.redirect("/user/user-page");
    }
  });
});

router.get("/user-page/change-info", ensureAuthenticated, function (req, res) {
  const title = "Change Information";
  res.render("user/change-info", {
    title,
  });
});

router.get("/user-page/change-address", ensureAuthenticated, function (req, res) {
  const title = "Change Address";
  res.render("user/change-address", {
    title,
  });
});

router.post("/user-page/change-address", ensureAuthenticated, (req, res) => {
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
    alertMessage(res, "success", "information has been updated", "fas fa-sign-in-alt", true);
    res.redirect("/user/user-page");
  });
});

export { router };
