// routes/userRoutes.ts
// Clean TypeScript version (ESM). Keeps original Handlebars rendering.
import express from "express";
import bcrypt from "bcryptjs";
import passport from "passport";
import axios from "axios";
import nodemailer from "nodemailer";
import jwt from "jsonwebtoken";
import { v1 as uuidv1 } from "uuid";
import { body, validationResult } from "express-validator";
import alertMessage from "../helpers/messenger.js";
import ensureAuthenticated from "../middleware/userAuth.js";
import ensureAdminAuthenticated from "../middleware/adminAuth.js";
import User from "../models/User.js";
import order from "../models/Order.js";
import orderItem from "../models/OrderItem.js";
import { logRed, logGreen } from "../helpers/loggerHelper.js";
const router = express.Router();
// ENV
const RECAPTCHA_SECRET = process.env.GOOGLE_RECAPTCHA_SECRET_KEY;
const JWT_SECRETKEY = process.env.JWT_SECRETKEY;
// Nodemailer
const transporter = nodemailer.createTransport({
    host: "smtp.zoho.com",
    port: 465,
    secure: true,
    auth: {
        user: process.env.BOOKSTORE_EMAIL_USERNAME,
        pass: process.env.BOOKSTORE_EMAIL_PASSWORD,
    },
    tls: { rejectUnauthorized: false },
});
transporter.verify((error) => {
    if (error)
        logRed(`[/userRoutes/] NODEMAILER ${error}`);
    else
        logGreen(`[userRoutes/] NODEMAILER Server is ready to take messages`);
});
// ---------------------- Contact Us ----------------------
router.post("/contactUs", [
    body("name").trim().isLength({ min: 1 }).withMessage("Name is required").escape(),
    body("email").trim().isEmail().withMessage("Invalid email address").normalizeEmail(),
    body("subject").trim().isLength({ min: 1 }).withMessage("Subject is required").escape(),
    body("message").trim().isLength({ min: 1 }).withMessage("Message is required").escape(),
], (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        alertMessage(res, "danger", "Contact form is incomplete. Please try again.", "fas fa-exclamation-circle", true);
        res.redirect("back");
        return;
    }
    const { name, email, subject, message } = req.body;
    const mail = {
        from: `BellaVista Bookstore Admin <${process.env.BOOKSTORE_EMAIL_USERNAME}>`,
        to: `${name} <${email}>`,
        subject: `Re: BellaVista Bookstore ${subject}`,
        html: `<p>Thank you for contacting us! We will respond shortly.<br>You wrote: ${message}</p>`,
    };
    transporter.sendMail(mail, (err) => {
        if (err) {
            logRed("Error occurred. " + err.message);
            res.status(500).send("An error occurred while sending the email.");
            return;
        }
        alertMessage(res, "success", "Thank You for contacting us!", "fas fa-exclamation-circle", true);
        res.redirect("/");
    });
});
// ---------------------- JWT Demo ----------------------
router.get("/jwt", (_req, res) => {
    res.cookie("example_cookie", "example_value");
    res.render("user/jwt");
});
router.post("/jwt", (req, res) => {
    const { username, password } = req.body;
    if (req.cookies.example_cookie) {
        // ok
    }
    else {
        return res.status(401).send("Example cookie not provided");
    }
    if (username !== "user" || password !== "password") {
        return res.redirect("back");
    }
    return res.redirect("/user/jwt2");
});
router.get("/jwt2", (_req, res) => {
    const token = jwt.sign({ username: "username", isAdmin: 0, isConfirmed: 0 }, JWT_SECRETKEY, { expiresIn: "1d" });
    res.cookie("jwt_cookie", token, { maxAge: 360000000, httpOnly: true, secure: true });
    res.render("user/jwt2");
});
router.post("/jwt2", (req, res) => {
    if (!req.cookies.jwt_cookie) {
        return res.status(401).send("JWT token not provided");
    }
    try {
        const verify = jwt.verify(req.cookies.jwt_cookie, JWT_SECRETKEY);
        logGreen(`Verify: ${JSON.stringify(verify)}`);
    }
    catch (err) {
        logRed("JWT verification failed: " + err.message);
        return res.status(403).send("JWT verification failed");
    }
    return res.redirect("/user/successful-jwt");
});
router.get("/successful-jwt", (_req, res) => {
    res.render("user/successful-jwt");
});
// ---------------------- Password Reset Flow ----------------------
router.get("/resetpassword", (_req, res) => {
    res.render("user/change-password");
});
router.post("/resetpassword/", async (req, res) => {
    const { password, password2 } = req.body;
    const errs = [];
    if (password !== password2) {
        errs.push("Passwords not the same");
        return res.redirect("/user/change-password");
    }
    if (!req.user?.id)
        return res.redirect("/user/change-password");
    try {
        const user = await User.findOne({ where: { id: req.user.id } });
        if (!user)
            return res.redirect("/user/change-password");
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(password, salt);
        await user.update({ password: hash });
        alertMessage(res, "success", "password changed", "fas fa-sign-in-alt", true);
        return res.redirect("/user/logout");
    }
    catch (e) {
        logRed(e.message);
        return res.redirect("/user/change-password");
    }
});
router.get("/change-password/:token", async (req, res) => {
    try {
        const decoded = jwt.verify(req.params.token, JWT_SECRETKEY);
        if (!decoded?.user)
            return res.redirect("/user/login");
        const user = await User.findOne({ where: { id: decoded.user } });
        if (!user)
            return res.redirect("/user/login");
        req.login(user, (err) => {
            if (err)
                return res.redirect("/user/login");
            return res.redirect("/user/resetpassword");
        });
    }
    catch {
        return res.redirect("/user/login");
    }
});
router.get("/forget-password", (_req, res) => {
    res.render("user/forget-Password", { recaptcha_site_key: process.env.GOOGLE_RECAPTCHA_SITE_KEY });
});
router.post("/forget-password", async (req, res) => {
    const captcha = req.body["g-recaptcha-response"];
    if (!captcha) {
        alertMessage(res, "danger", "Please select captcha", "fas fa-exclamation-circle", true);
        return res.redirect("/user/forget-password");
    }
    const verifyURL = `https://www.google.com/recaptcha/api/siteverify?secret=${RECAPTCHA_SECRET}&response=${captcha}`;
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
        const passwordToken = jwt.sign({ user: theid }, JWT_SECRETKEY, { expiresIn: "1d" });
        const url = `https://localhost:5000/user/change-password/${passwordToken}`;
        await transporter.sendMail({
            from: "BellaVista Bookstore Admin <bellavistabookstore@zohomail.com>",
            to: req.body.email,
            subject: "Password Reset",
            html: `Please click this link to change your password: <a href="${url}">${url}</a>`,
        });
        alertMessage(res, "success", "Please check your email", "fas fa-sign-in-alt", true);
        return res.redirect("/user/login");
    }
    catch (err) {
        logRed("Error: " + err.message);
        alertMessage(res, "danger", "An error occurred. Please try again later.", "fas fa-exclamation-circle", true);
        return res.redirect("/user/forget-password");
    }
});
router.get("/confirmation/:token", async (req, res) => {
    try {
        const token = jwt.verify(req.params.token, JWT_SECRETKEY);
        if (!token?.user)
            throw new Error("Invalid token");
        const user = await User.findOne({ where: { id: token.user } });
        if (user) {
            await user.update({ confirmed: true });
            logGreen("email verified");
        }
        alertMessage(res, "success", "account confirmed", "fas fa-sign-in-alt", true);
        return res.redirect("https://localhost:5000/user/login");
    }
    catch {
        alertMessage(res, "danger", "Invalid confirmation token", "fas fa-exclamation-circle", true);
        return res.redirect("/user/login");
    }
});
// ---------------------- Facebook Auth ----------------------
router.get("/auth/facebook", passport.authenticate("facebook", { scope: ["email"] }));
router.get("/auth/facebook/callback", passport.authenticate("facebook", {
    successRedirect: "/",
    failureRedirect: "/login",
}));
// ---------------------- User Pages ----------------------
router.get("/user-page", ensureAuthenticated, (req, res) => {
    const title = "User Information";
    if (req.user?.facebookId != null) {
        res.render("user/facebook-user-page", { title });
    }
    else {
        res.render("user/user-page", { title });
    }
});
// ---------------------- Orders ----------------------
router.get("/orderHistoryAdmin", ensureAuthenticated, ensureAdminAuthenticated, async (_req, res) => {
    const title = "Order History - Admin";
    const orders = await order.findAll({ include: [{ model: orderItem }] });
    res.render("user/order-history-admin", { order: orders, title });
});
router.get("/orderHistory", ensureAuthenticated, async (req, res) => {
    const title = "Order History";
    try {
        const orders = await order.findAll({
            where: { userId: req.user?.id },
            include: [{ model: orderItem }],
        });
        res.render("user/order-history-user", { order: orders, title });
    }
    catch (err) {
        logRed(err.message);
        res.redirect("/");
    }
});
// ---------------------- Auth Screens ----------------------
router.get("/login", (_req, res) => {
    const title = "Login";
    res.render("user/login", { title });
});
router.post("/login", (req, res, next) => {
    passport.authenticate("local", (err, user, _info) => {
        if (err)
            return next(err);
        if (!user)
            return res.redirect("/login");
        req.logIn(user, (err) => {
            if (err)
                return next(err);
            if (user.isadmin === true)
                return res.redirect("/user/admin");
            return res.redirect("/");
        });
    })(req, res, next);
});
router.get("/admin", ensureAdminAuthenticated, (_req, res) => {
    const title = "Admin Page";
    res.render("user/admin-menu", { title });
});
router.get("/register", (_req, res) => {
    const title = "Register";
    res.render("user/register", { title });
});
router.post("/register", async (req, res) => {
    const { email, name, password, password2 } = req.body;
    const errs = [];
    if (password !== password2)
        errs.push({ text: "Passwords do not match" });
    if (password.length < 4)
        errs.push({ text: "Password must be at least 4 characters" });
    if (errs.length > 0) {
        return res.render("user/register", { errors: errs, name, email, password, password2 });
    }
    try {
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
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const theid = uuidv1();
        await User.create({
            id: theid,
            name,
            email,
            password: hashedPassword,
            isadmin: false,
            confirmed: false,
        });
        const emailToken = jwt.sign({ user: theid }, JWT_SECRETKEY, { expiresIn: "1d" });
        const url = `https://localhost:5000/user/confirmation/${emailToken}`;
        const mailOptions = {
            from: "BellaVista Bookstore Admin <bellavistabookstore@zohomail.com>",
            to: `${name} <${email}>`,
            subject: "Confirm Email",
            html: `Please click this link to confirm your email: <a href="${url}">${url}</a>`,
        };
        transporter.sendMail(mailOptions, (error) => {
            if (error) {
                alertMessage(res, "danger", "Failed to send confirmation email. Please try again later.", "fas fa-exclamation-circle", true);
                return res.render("user/register", {
                    errors: [{ text: "Failed to send confirmation email. Please try again later." }],
                    name,
                    email,
                    password,
                    password2,
                });
            }
            alertMessage(res, "success", `A confirmation email has been sent to ${email}. Please check your inbox.`, "fas fa-check-circle", true);
            return res.redirect("/user/login");
        });
    }
    catch (err) {
        alertMessage(res, "danger", "An error occurred during registration. Please try again later.", "fas fa-exclamation-circle", true);
        return res.render("user/register", {
            errors: [{ text: "An error occurred during registration. Please try again later." }],
            name,
            email,
            password,
            password2,
        });
    }
});
router.get("/logout", (req, res) => {
    req.session.userCart = {};
    req.session.coupon_object = null;
    req.session.coupon_type = null;
    req.session.cart_subtotal_initial = 0;
    req.session.cart_subtotal_final = 0;
    req.session.cart_discount_savings = 0;
    req.session.cart_coupon_savings = 0;
    req.session.cart_shipping_fee = 0;
    req.session.cart_grandtotal = 0;
    req.logout((err) => {
        req.session.destroy((_err) => { });
        if (err) {
            return res.redirect("/");
        }
        res.redirect("/");
    });
});
// ---------------------- User Info & Address ----------------------
router.get("/user-page", ensureAuthenticated, (_req, res) => {
    res.render("user/user-page");
});
router.post("/user-page/change-info", ensureAuthenticated, async (req, res) => {
    try {
        const { name, email, password, password2 } = req.body;
        const user = await User.findByPk(req.user?.id);
        if (!user) {
            alertMessage(res, "error", "User not found", "fas fa-sign-in-alt", true);
            return res.redirect("/user/user-page");
        }
        const match = await bcrypt.compare(password, user.password || "");
        if (!match) {
            alertMessage(res, "error", "Incorrect current password", "fas fa-sign-in-alt", true);
            return res.redirect("/user/user-page");
        }
        const updates = {};
        if (name && name.trim() !== "")
            updates.name = name.trim();
        if (email && email.trim() !== "")
            updates.email = email.trim();
        if (password2 && password2.trim() !== "") {
            const salt = await bcrypt.genSalt(10);
            updates.password = await bcrypt.hash(password2, salt);
        }
        await user.update(updates);
        alertMessage(res, "success", "Information has been updated", "fas fa-sign-in-alt", true);
        return res.redirect("/user/user-page");
    }
    catch (err) {
        alertMessage(res, "error", "Error updating information", "fas fa-sign-in-alt", true);
        return res.redirect("/user/user-page");
    }
});
router.get("/user-page/change-info", ensureAuthenticated, (_req, res) => {
    const title = "Change Information";
    res.render("user/change-info", { title });
});
router.get("/user-page/change-address", ensureAuthenticated, (_req, res) => {
    const title = "Change Address";
    res.render("user/change-address", { title });
});
router.post("/user-page/change-address", ensureAuthenticated, async (req, res) => {
    const { PhoneNo, address, address1, city, country, postalCode } = req.body;
    const user = await User.findOne({ where: { id: req.user?.id } });
    if (!user) {
        alertMessage(res, "danger", "User not found", "fas fa-sign-in-alt", true);
        return res.redirect("/user/user-page");
    }
    if (PhoneNo && PhoneNo !== "")
        await user.update({ PhoneNo });
    if (address && address !== "")
        await user.update({ address });
    if (address1 && address1 !== "")
        await user.update({ address1 });
    if (city && city !== "")
        await user.update({ city });
    if (country && country !== "")
        await user.update({ country });
    if (postalCode && postalCode !== "")
        await user.update({ postalCode });
    alertMessage(res, "success", "information has been updated", "fas fa-sign-in-alt", true);
    return res.redirect("/user/user-page");
});
export { router };
//# sourceMappingURL=userRoutes.js.map