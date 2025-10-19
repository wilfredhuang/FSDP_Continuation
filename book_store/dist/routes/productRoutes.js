import express from "express";
const router = express.Router();
import moment from "moment";
import alertMessage from "../helpers/messenger.js";
import chalk from "chalk";
import productadmin from "../models/ProductAdmin.js";
import order from "../models/Order.js";
import order_item from "../models/OrderItem.js";
import User from "../models/User.js";
import PendingOrder from "../models/PendingOrder.js";
import PendingOrderItem from "../models/PendingOrderItem.js";
import ProductAdmin from "../models/ProductAdmin.js";
import Coupon from "../models/Coupon.js";
import Discount from "../models/Discount.js";
import * as dotenv from "dotenv";
dotenv.config();
// EasyPost API
import EasyPost from "@easypost/api";
// ✅ Non-null assertion to tell TS that env vars are set
const apiKey = process.env.EASYPOST_API_TEST_KEY;
const api = new EasyPost(apiKey);
// Stripe Payment
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2024-06-20",
});
// PayNow
import paynow from "paynow-generator"; // Custom module (no type defs)
import QRCode from "qrcode";
// Twilio API - Send SMS
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTHTOKEN;
// ✅ Correct Twilio import (Client → Twilio)
import twilio from "twilio";
const client = twilio(accountSid, authToken);
import ensureAdminAuthenticated from "../middleware/adminAuth.js";
import { checkCart } from "../middleware/cartAuth.js";
// Helpers
import carthelper from "../helpers/cartHelper.js";
import helper from "../helpers/hbs.js";
import { logRed, logYellow, logMagenta, } from "../helpers/loggerHelper.js";
// Page that displays all the products
router.get("/product-list", async (req, res) => {
    try {
        const title = "Product Listing";
        const navStatusProduct = "active";
        const products = await productadmin.findAll({
            order: [["product_name", "ASC"]],
        });
        const plainProducts = products.map((p) => p.get({ plain: true }));
        res.render("products/product-list", {
            productadmin: plainProducts,
            navStatusProduct,
            title,
        });
    }
    catch (error) {
        console.error("Error fetching product list:", error);
        res.status(500).send("Internal Server Error");
    }
});
// Page that displays a single product's details
router.get("/individual-product/:id", async (req, res) => {
    try {
        const title = "Product Information";
        const { id } = req.params;
        const disc = await Discount.findOne({ where: { target_id: id } });
        const product = await productadmin.findOne({ where: { id } });
        if (!product) {
            console.warn(`Product with ID ${id} not found`);
            return res.status(404).render("404", { title: "Product Not Found" });
        }
        res.render("products/individual-product", {
            title,
            product: product.get({ plain: true }),
            disc: disc ? disc.get({ plain: true }) : null,
        });
    }
    catch (error) {
        console.error("Error fetching product or discount:", error);
        res.status(500).send("Internal Server Error");
    }
});
// Admin-only page that displays all current products
router.get("/product-list-admin", ensureAdminAuthenticated, async (req, res) => {
    try {
        const title = "Product Admin List";
        const product_details = await productadmin.findAll({
            order: [["id", "ASC"]],
            raw: true,
        });
        res.render("products/product-list-admin", {
            productadmin: product_details,
            title,
        });
    }
    catch (error) {
        console.error("Error fetching admin product list:", error);
        res.status(500).send("Internal Server Error");
    }
});
// Admin-only product detail page
router.get("/product-details-admin/:id", ensureAdminAuthenticated, async (req, res) => {
    try {
        const title = "Product Details";
        const { id } = req.params;
        const product = await productadmin.findOne({ where: { id } });
        res.render("products/product-details", {
            product,
            title,
        });
    }
    catch (error) {
        console.error("Error fetching product details:", error);
        res.status(500).send("Internal Server Error");
    }
});
// Admin-only page: form to create a product
router.get("/create-product", (req, res) => {
    const title = "Create Product";
    res.render("products/create-product", { title });
});
// Admin-only request: create a new product
router.post("/create-product-admin", ensureAdminAuthenticated, async (req, res) => {
    try {
        const { product_name, author, publisher, genre, price, stock, details, rating, weight, product_image, } = req.body;
        await productadmin.create({
            product_name,
            author,
            publisher,
            genre,
            price,
            stock,
            details,
            weight,
            product_image,
            rating,
        });
        alertMessage(res, "success", `${product_name} was added into the shop.`, "fas fa-sign-in-alt", true);
        res.redirect("/product/product-list-admin");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
// Admin-only page: form to update a product
router.get("/product-update-admin/:id", ensureAdminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const title = "Update Product";
        const product = await productadmin.findOne({ where: { id } });
        res.render("products/product-update-admin", { product, title });
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
// Admin-only request: update product
router.put("/product-update-admin/:id", ensureAdminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const { product_name, author, publisher, genre, price, stock, details, rating, weight, product_image, } = req.body;
        await productadmin.update({
            product_name,
            author,
            publisher,
            genre,
            price,
            stock,
            details,
            weight,
            product_image,
            rating,
        }, { where: { id } });
        alertMessage(res, "success", `${product_name} was updated.`, "fas fa-sign-in-alt", true);
        res.redirect("/product/product-list-admin");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
// Admin-only request: delete a product
router.get("/delete/:id", ensureAdminAuthenticated, async (req, res) => {
    try {
        const { id } = req.params;
        const product = await productadmin.findOne({ where: { id } });
        if (!product)
            return res.redirect("/product/product-list-admin");
        await product.destroy(); // destroy on the instance
        res.redirect("/product/product-list-admin");
    }
    catch (err) {
        console.error(err);
        res.status(500).send("Internal Server Error");
    }
});
router.get("/product-list/:id", async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const discount = await carthelper.getProductDiscount(productId);
        const product = await productadmin.findOne({ where: { id: productId }, raw: true });
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        // 🧠 Ensure the session cart always exists
        const userCart = (req.session.userCart ??= {});
        // 🧠 Ensure we pass a plain object with valid id
        const productPlain = product.id ? product : { ...product, id: productId };
        carthelper.processCart(req, userCart, productPlain, discount, true);
        // Get quantity of cart items
        const cartQty = Object.values(userCart).reduce((acc, item) => acc + item.Quantity, 0);
        res.cookie("cartQty", cartQty, {
            expires: new Date(Date.now() + 900000),
            httpOnly: false,
        });
        const flashMessage_clientside = `${product.product_name} added to cart!`;
        res.json({ success: true, flashMessage: [flashMessage_clientside] });
        logMagenta(`[GET /product-list/:id] ${JSON.stringify(req.session.userCart, null, 2)}`);
    }
    catch (err) {
        console.error(err);
        res.json({ success: false });
    }
});
router.post("/individual-product/:id", async (req, res) => {
    try {
        const productId = Number(req.params.id);
        const discount = await carthelper.getProductDiscount(productId);
        const product = await productadmin.findOne({ where: { id: productId }, raw: true });
        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }
        const userCart = (req.session.userCart ??= {});
        const productPlain = product.id ? product : { ...product, id: productId };
        carthelper.processCart(req, userCart, productPlain, discount, true);
        const cartQty = Object.values(userCart).reduce((acc, item) => acc + item.Quantity, 0);
        res.cookie("cartQty", cartQty, {
            expires: new Date(Date.now() + 900000),
            httpOnly: false,
        });
        const flashMessage_clientside = `${product.product_name} added to cart!`;
        res.json({ success: true, flashMessage: [flashMessage_clientside] });
        logMagenta(`[POST /individual-product/:id] ${JSON.stringify(req.session.userCart, null, 2)}`);
    }
    catch (error) {
        console.error(error);
        res.json({
            success: false,
            message: "An error occurred while adding the product to the cart",
        });
    }
});
// Update Cart / Or go to Checkout Page
router.post("/cart", async (req, res) => {
    try {
        if (req.body.checkoutButton === "Update") {
            const cart = req.session.userCart || {};
            // sanitize ghosts just in case
            for (const key in cart) {
                if (!cart[key]?.id)
                    delete cart[key];
            }
            for (const key in cart) {
                const item = cart[key];
                const productId = Number(item.id);
                // read updated qty from form: name="Q{{id}}"
                const query = Number(req.body[`Q${productId}`]);
                if (!Number.isFinite(query) || query <= 0)
                    continue;
                // 1) update qty
                item.Quantity = query;
                // 2) ALWAYS recompute line subtotal now (no-discount case)
                item.SubtotalPrice = (Number(item.Price) * Number(item.Quantity)).toFixed(2);
                // 3) if a product/discount exists, let helper refine (e.g., bulk discount)
                const product = await productadmin.findOne({ where: { id: productId } });
                if (!product)
                    continue;
                const discount = await carthelper.getProductDiscount(productId);
                // increment=false because we’re setting an explicit qty
                carthelper.processCart(req, cart, product, discount, false);
            }
            // recalc coupon after quantities changed
            if (req.session.coupon_object) {
                await carthelper.calculate_cart_total_coupon_savings(req, req.session.coupon_object.code);
            }
            else {
                req.session.cart_coupon_savings = 0;
            }
            await helper.manualSessionSave(req);
            return res.redirect(`/product/cart?page=1`);
        }
        else {
            return res.redirect("checkout");
        }
    }
    catch (err) {
        console.error("Error occurred:", err);
        return res.status(500).send("Internal Server Error");
    }
});
// Delete Item in Cart
router.get("/delete-cart-item/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        // 🧱 Validate ID and cart
        if (Number.isNaN(id) || !req.session.userCart) {
            console.warn("[DELETE /delete-cart-item] Invalid ID or empty cart:", req.params.id);
            return res.redirect("/product/cart?page=1");
        }
        const cartItem = req.session.userCart[id];
        if (!cartItem) {
            console.warn("[DELETE /delete-cart-item] No such cart item found for id:", id);
            alertMessage(res, "error", "Item not found in cart", "fas fa-sign-in-alt", true);
            return res.redirect("/product/cart?page=1");
        }
        console.log(`Deleting ${cartItem.Name}`);
        // ✅ Delete the item
        delete req.session.userCart[id];
        // ✅ Recalculate all totals after deletion
        await carthelper.refreshCartCalculations(req, req.session.userCart);
        // ✅ Save the session without caching
        await helper.manualSessionSaveNoCaching(req, res);
        alertMessage(res, "success", "An item has been removed from the cart", "fas fa-sign-in-alt", true);
        // ✅ Redirect with cache busting query
        const timestamp = Date.now();
        res.redirect(307, `/product/cart?page=1&cacheBust=${timestamp}`);
    }
    catch (err) {
        console.error("Error deleting item:", err);
        res.status(500).send("Internal Server Error");
    }
});
// Retrieve Cart
// Make sure to use POST request to handle updated cart info or you need to double refresh
router.get("/cart", async (req, res) => {
    const title = "Shopping Cart";
    const page = Number(req.query.page) || 1;
    // 🧠 Ensure session cart always exists
    const userCart = (req.session.userCart ??= {});
    // Clean up ghost / invalid cart items before recalculation
    for (const key in userCart) {
        if (!userCart[key]?.id) {
            console.warn(`[GET /cart] Removing invalid cart entry:`, userCart[key]);
            delete userCart[key];
        }
    }
    await carthelper.refreshCartCalculations(req, userCart);
    logMagenta(`[GET /cart/] initialSubtotal = ${req.session.cart_subtotal_initial}`);
    logMagenta(`[GET /cart/] discountedSubtotal = ${req.session.cart_subtotal_final}`);
    logMagenta(`[GET /cart/] discountSavingsTotal = ${req.session.cart_discount_savings}`);
    logMagenta(`[GET /cart/] couponSavingsTotal = ${req.session.cart_coupon_savings}`);
    logMagenta(`[GET /cart/] grandTotal = ${req.session.cart_grandtotal}`);
    // 🧠 Guard against undefined numeric values
    const subInit = Number(req.session.cart_subtotal_initial ?? 0);
    const subFinal = Number(req.session.cart_subtotal_final ?? 0);
    const discSave = Number(req.session.cart_discount_savings ?? 0);
    const coupSave = Number(req.session.cart_coupon_savings ?? 0);
    const shipFee = Number(req.session.cart_shipping_fee ?? 0);
    const grandTotal = Number(req.session.cart_grandtotal ?? 0);
    res.locals.cart_subtotal_initial = subInit.toFixed(2);
    res.locals.cart_subtotal_final = subFinal.toFixed(2);
    res.locals.cart_discount_savings = discSave.toFixed(2);
    res.locals.cart_coupon_savings = coupSave.toFixed(2);
    res.locals.cart_shipping_fee = shipFee.toFixed(2);
    res.locals.cart_grandtotal = grandTotal.toFixed(2);
    logMagenta("[GET /cart/] === Show Session Variables ===");
    logMagenta(`[GET /cart/] ${JSON.stringify(req.session, null, 2)}`);
    res.render("checkout/cart", {
        title,
        results: {
            pages: page,
            results: Object.keys(userCart).map((key) => ({
                [key]: userCart[key],
            })),
        },
    });
});
// Cart Coupon
router.post("/applyCoupon", async (req, res) => {
    try {
        // Retrieve all coupons from the database
        const coupons = await Coupon.findAll();
        // For loop block to check which coupons have expired
        for (const coupon of coupons) {
            const expiryTime = moment(coupon.expiry);
            const currentTime = moment();
            // Check if the coupon is expired
            if (currentTime.isAfter(expiryTime)) {
                // Check if the expired coupon is the current public coupon in the session
                if (req.session.public_coupon &&
                    coupon.code === req.session.public_coupon.code) {
                    logRed("[POST /applyCoupon/] Setting session var to NULL");
                    req.session.public_coupon = null;
                }
                logRed("Destroying Coupon Code " + coupon.code);
                await coupon.destroy(); // Ensure the coupon is destroyed
                await req.session.save(); // Ensure the session is saved after coupon destruction
                logYellow("[POST /applyCoupon/] Public Coupon is now " +
                    req.session.public_coupon +
                    " should be NULL");
            }
            else {
                logMagenta(`[POST /applyCoupon/] Current Time: ${currentTime.format("DD/MM/YYYY, hh:mm:ss a")}`);
                logMagenta(`[POST /applyCoupon/] Expiry Time: ${expiryTime.format("DD/MM/YYYY, hh:mm:ss a")}`);
            }
        }
        const couponSavings = await carthelper.calculate_cart_total_coupon_savings(req, req.body.coupon);
        logMagenta(`Coupon Savings: ${couponSavings}`);
        // Redirect with cache busting query so the page loaded on redirect wont have the deleted item
        const timestamp = Date.now();
        res.redirect(`/product/cart?page=1&cacheBust=${timestamp}`);
    }
    catch (err) {
        console.error(err);
    }
});
// Checkout Form
router.get("/checkout", checkCart, (req, res) => {
    var title = "Checkout";
    if (req.user) {
        let user_name = req.user.name;
        let user_phone = req.user.PhoneNo;
        let user_address = req.user.address;
        let user_address1 = req.user.address1;
        let user_city = req.user.city;
        let user_country = req.user.country;
        let user_postalCode = req.user.postalCode;
        res.render("checkout/checkout", {
            user_name,
            user_phone,
            user_address,
            user_address1,
            user_city,
            user_country,
            user_postalCode,
            title,
        });
    }
    else {
        res.redirect("/");
    }
});
router.post("/checkout", checkCart, async (req, res) => {
    // Destructure form fields from the body
    const { fullName, phoneNumber, address, address1, city, country, postalCode, } = req.body;
    // Debug logging
    logMagenta(fullName);
    logMagenta(phoneNumber);
    logMagenta(address);
    logMagenta(address1);
    logMagenta(city);
    logMagenta(country);
    logMagenta(postalCode);
    // 🧠 Assign to session variables safely
    req.session.shipment_recipient_name = fullName;
    req.session.shipment_recipient_phonenum = phoneNumber;
    req.session.shipment_lineone = address;
    req.session.shipment_linetwo = address1 ?? "";
    req.session.shipment_city = city;
    req.session.shipment_country = country;
    req.session.shipment_postal_code = postalCode;
    // Log session values
    logMagenta("=== New Session Variables ===");
    logMagenta(req.session.shipment_recipient_name);
    logMagenta(req.session.shipment_recipient_phonenum);
    logMagenta(req.session.shipment_lineone);
    logMagenta(req.session.shipment_linetwo);
    logMagenta(req.session.shipment_city);
    logMagenta(req.session.shipment_country);
    logMagenta(req.session.shipment_postal_code);
    // 🧠 Fix: use assignment (=), not comparison (==)
    res.locals.countryShipment = country;
    // Save session asynchronously
    await helper.saveSession(req);
    res.redirect("select-payment");
});
// After checkout form filled, select payment page
router.get("/select-payment", checkCart, (req, res) => {
    const title = "Select Payment";
    //const shipment_country = req.session.shipment_country;
    res.render("checkout/select-payment", {
        title
    });
});
router.post("/select-paynow-payment", checkCart, (req, res) => {
    res.redirect("paynow");
});
router.post("/select-stripe-payment", checkCart, (req, res) => {
    res.redirect("stripe-payment");
});
router.get("/paynow", checkCart, (req, res) => {
    var title = "PayNow Payment";
    // let payNowString = paynow('proxyType','proxyValue','edit',price,'merchantName','additionalComments')
    let payNowString = paynow.paynowGenerator("mobile", "87558054", "no", req.session.cart_grandtotal, "Test Merchant Name", "Testing paynow");
    let qr = QRCode.toDataURL(payNowString)
        .then((url) => {
        res.render("checkout/paynow", {
            title,
            payNowString,
            qr,
            url,
        });
    })
        .catch((err) => {
        console.error(err);
    });
});
router.get("/stripe-payment", checkCart, async (req, res) => {
    const user = req.user;
    if (!user) {
        console.error("User not authenticated");
        return res.status(401).send("Not authenticated");
    }
    console.log("USER STRIPE ID IS", user.stripeID);
    console.log("USER ISADMIN IS", user.isadmin);
    try {
        // ✅ Retrieve or create Stripe customer
        if (user.stripeID) {
            const customer = await stripe.customers.retrieve(user.stripeID);
            console.log("Retrieved customer:", customer);
        }
        else {
            const customer = await stripe.customers.create({
                name: user.name ?? undefined,
                email: user.email ?? undefined,
                phone: user.PhoneNo ?? undefined,
                shipping: {
                    name: user.name ?? undefined,
                    phone: user.PhoneNo ?? undefined,
                    address: {
                        line1: user.address ?? undefined,
                        line2: user.address1 ?? undefined,
                        city: user.city ?? undefined,
                        country: user.country ?? undefined,
                        postal_code: user.postalCode ?? undefined,
                    },
                },
            } // 👈 cast fixes the overload issue
            );
            console.log("Created Stripe customer:", customer.id);
            const current_user = await User.findOne({ where: { id: user.id } });
            if (current_user) {
                current_user.stripeID = customer.id;
                await current_user.save();
            }
        }
        // ✅ Create payment intent
        const total = Number(req.session.cart_grandtotal ?? 0);
        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.ceil(total * 100),
            currency: "sgd",
            payment_method_types: ["card"],
            receipt_email: user.email ?? "default@example.com",
            setup_future_usage: "on_session",
            description: `Order worth $${total.toFixed(2)} by ${user.name ?? "Guest"}`,
        } // 👈 cast avoids same issue here
        );
        console.log("Created payment intent:", paymentIntent.id);
        res.render("checkout/stripe", {
            client_secret: paymentIntent.client_secret,
            title: "Stripe Payment",
        });
    }
    catch (err) {
        console.error("Stripe payment error:", err.message ?? err);
        res.status(500).send("Payment processing error");
    }
});
router.post("/paynow", async (req, res) => {
    try {
        const the_date = moment().format("D MMM YYYY");
        const dateStart = the_date.toString();
        // ✅ subtotal / total must be numeric, not string
        const subtotal = Number(req.session.cart_subtotal_final ?? 0);
        const total = Number(req.session.cart_grandtotal ?? 0);
        // ✅ Sequelize expects numbers, not strings — use numeric types directly
        const new_pending_order = await PendingOrder.create({
            fullName: req.session.shipment_recipient_name ?? "Unknown",
            phoneNumber: req.session.shipment_recipient_phonenum ?? "",
            address: req.session.shipment_lineone ?? "",
            address1: req.session.shipment_linetwo ?? "",
            city: req.session.shipment_city ?? "",
            country: req.session.shipment_country ?? "",
            postalCode: req.session.shipment_postal_code ?? "",
            deliverFee: 0,
            subtotalPrice: subtotal,
            totalPrice: total,
            dateStart,
            userId: req.user ? Number(req.user.id) : null, // ✅ fix here
        });
        // ✅ Order items
        const userCart = req.session.userCart ?? {};
        for (const key in userCart) {
            const item = userCart[key];
            if (!item)
                continue;
            await PendingOrderItem.create({
                product_name: item.Name,
                author: item.Author,
                publisher: item.Publisher,
                genre: item.Genre,
                price: item.SubtotalPrice,
                stock: item.Quantity,
                details: "placeholder details",
                weight: item.SubtotalWeight,
                product_image: item.Image,
                // ✅ Fix: match actual foreign key field name in your model
                pendingOrder_id: new_pending_order.id, // check model: might be `pendingOrder_id` or `pending_order_id`
            }); // 👈 if the model typing differs, use a cast
        }
        // ✅ Twilio requires both 'to' and 'from' to be non-undefined strings
        const fromNum = process.env.TWILIO_ACCOUNT_PHONENO ?? "";
        const toNum = process.env.DEV_PHONENO ?? "";
        if (!fromNum || !toNum) {
            console.warn("⚠️ Missing Twilio phone numbers in environment variables");
        }
        else {
            await client.messages.create({
                body: "You made an order with BookStore via PayNow/PayLah!, you will be notified again when your order is confirmed.",
                from: fromNum,
                to: toNum,
            });
        }
        // ✅ Clear cart safely
        req.session.userCart = {};
        console.log(chalk.red(JSON.stringify(req.session, null, 2)));
        alertMessage(res, "success", "Order placed! The administrator will shortly confirm your payment.", "fas fa-exclamation-circle", true);
        res.redirect("paynow-txn-end");
    }
    catch (err) {
        console.error("PayNow error:", err.message ?? err);
        res.status(500).send("Error while processing PayNow payment");
    }
});
router.post("/stripe-payment", async (req, res) => {
    try {
        // ✅ Ensure the user is authenticated
        if (!req.user) {
            return res.status(401).send("User not authenticated");
        }
        const userId = Number(req.user.id); // TS-safe number conversion
        // ✅ Helper to normalize undefined → null
        const nullify = (v) => (v === undefined ? null : v);
        // 1️⃣ Create and verify addresses
        const toAddress = await api.Address.createAndVerify({
            name: "John Doe",
            street1: "123 Main St",
            city: "San Francisco",
            state: "CA",
            zip: "94105",
            country: "US",
            phone: "4155555555",
        });
        const fromAddress = await api.Address.createAndVerify({
            name: "EasyPost",
            street1: "118 2nd Street",
            street2: "4th Floor",
            city: "San Francisco",
            state: "CA",
            zip: "94105",
            country: "US",
            phone: "2125555555",
        });
        // 2️⃣ Create the parcel
        const parcel = await api.Parcel.create({
            length: 10,
            width: 8,
            height: 4,
            weight: 15.7,
        });
        // 3️⃣ Create the shipment
        const shipment = await api.Shipment.create({
            to_address: toAddress,
            from_address: fromAddress,
            parcel,
        });
        if (shipment.rates.length === 0) {
            throw new Error("No rates found for this shipment.");
        }
        // 4️⃣ Buy the shipment
        const boughtShipment = await api.Shipment.buy(shipment.id, shipment.lowestRate(["USPS"]));
        // Debug logs
        console.log("=== Bought Shipment ===");
        console.log(JSON.stringify(boughtShipment, null, 2));
        // 5️⃣ Extract session info (shipping details)
        const fullName = req.session.shipment_recipient_name;
        const phoneNumber = req.session.shipment_recipient_phonenum;
        const address = req.session.shipment_lineone;
        const address1 = req.session.shipment_linetwo;
        const city = req.session.shipment_city;
        const country = req.session.shipment_country;
        const postalCode = req.session.shipment_postal_code;
        const deliverFee = 0;
        const subtotalPrice = req.session.cart_subtotal_final;
        const totalPrice = req.session.cart_grandtotal;
        const shippingId = boughtShipment.id;
        const addressId = toAddress.id;
        const trackingId = boughtShipment.tracker?.id || "";
        const trackingCode = boughtShipment.tracker?.tracking_code || "";
        const dateStart = boughtShipment.created_at;
        const dateEnd = boughtShipment.tracker?.est_delivery_date || null;
        const deliveryStatus = boughtShipment.tracker?.status || "";
        // 6️⃣ Create the order (fixes undefined → null)
        const newOrder = await order.create({
            fullName: nullify(fullName),
            phoneNumber: nullify(phoneNumber),
            address: nullify(address),
            address1: nullify(address1),
            city: nullify(city),
            country: nullify(country),
            postalCode: nullify(postalCode),
            deliverFee,
            subtotalPrice: nullify(subtotalPrice),
            totalPrice: nullify(totalPrice),
            shippingId: nullify(shippingId),
            addressId: nullify(addressId),
            trackingId: nullify(trackingId),
            trackingCode: nullify(trackingCode),
            dateStart: nullify(dateStart),
            dateEnd: nullify(dateEnd),
            deliveryStatus: nullify(deliveryStatus),
            userId,
        });
        console.log("=== Order Created ===");
        console.log(JSON.stringify(newOrder, null, 2));
        const orderId = newOrder.id ?? null; // TS-safe number | null
        // 7️⃣ Create individual order items
        for (const key in req.session.userCart) {
            const item = req.session.userCart[key];
            await order_item.create({
                product_name: item.Name,
                author: item.Author,
                publisher: item.Publisher,
                genre: item.Genre,
                price: item.SubtotalPrice,
                stock: item.Quantity,
                details: "placeholder details",
                weight: item.SubtotalWeight,
                product_image: item.Image,
                orderId, // ✅ matches number | null type
            });
        }
        // 8️⃣ Optional: tracking URL (Twilio send disabled)
        const trackingUrl = boughtShipment.tracker?.public_url;
        console.log(`Tracking URL: ${trackingUrl}`);
        // 9️⃣ Empty the cart + reset totals
        req.session.userCart = {};
        req.session.coupon_object = null;
        req.session.coupon_type = null;
        req.session.cart_subtotal_initial = 0;
        req.session.cart_subtotal_final = 0;
        req.session.cart_discount_savings = 0;
        req.session.cart_coupon_savings = 0;
        req.session.cart_shipping_fee = 0;
        req.session.cart_grandtotal = 0;
        await helper.saveSession(req);
        // ✅ Redirect after successful payment
        res.redirect("/product/stripe-txn-end");
    }
    catch (error) {
        console.error(`Error Code ${error.code ?? "?"}:`, error.message);
        res.status(500).send("An error occurred while processing your request.");
    }
});
router.get("/stripe-txn-end", (req, res) => {
    var title = "Thank you!";
    res.render("checkout/thank-you-stripe", {
        title,
    });
});
router.get("/paynow-txn-end", (req, res) => {
    var title = "Thank you!";
    res.render("checkout/thank-you-paynow", {
        title,
    });
});
// Admin Side
router.get("/discount-menu", ensureAdminAuthenticated, (req, res) => {
    var title = "Discount & Coupon Menu";
    res.render("checkout/discount-menu", {
        title,
    });
});
router.get("/view-pending-orders", ensureAdminAuthenticated, async (req, res) => {
    const title = "View Pending Orders";
    PendingOrder.findAll({
        where: {},
        include: [{ model: PendingOrderItem }],
    }).then((pending_order) => {
        res.render("checkout/view-pending-orders", {
            PendingOrders: pending_order,
            title,
        });
    });
}),
    router.get("/delete-pending-order/:id", ensureAdminAuthenticated, async (req, res) => {
        try {
            const PO = await PendingOrder.findOne({ where: { id: req.params.id } });
            if (!PO) {
                alertMessage(res, "danger", "Pending Order not found", "fas fa-exclamation-circle", true);
                return res.redirect("/product/view-pending-orders");
            }
            const Pi = await PendingOrderItem.findAll({
                where: { pendingOrderId: PO.id },
            });
            // Sending a message using Twilio
            await client.messages.create({
                body: "From BookStore: We are sorry to inform you that your order has been cancelled by the administrator due to lack of payment.",
                from: process.env.TWILIO_ACCOUNT_PHONENO,
                to: `+65${PO.phoneNumber}`,
            });
            alertMessage(res, "success", `Pending Order with ID ${PO.id} Deleted`, "fas fa-exclamation-circle", true);
            // Destroy the order
            await PO.destroy();
            // Destroy each pending order item
            for (const item of Pi) {
                console.log(`Deleting Product ${item.id}`);
                await item.destroy();
            }
            res.redirect("/product/view-pending-orders");
        }
        catch (err) {
            console.error(err);
            alertMessage(res, "danger", "An error occurred while deleting the order", "fas fa-exclamation-circle", true);
            res.redirect("/product/view-pending-orders");
        }
    });
router.get("/create-coupon", ensureAdminAuthenticated, (req, res) => {
    // if (!req.session.public_coupon) {
    //     req.session.public_coupon = "NULL";
    // }
    const title = "Create Coupon";
    let currentDate = moment(req.body.currentDate, "DD/MM/YYYY");
    // Get current time of server
    // hh or HH = 24 hr format, h / H = 12 hr format, a = PM/AM
    let currentTime = moment().format("HH:mm");
    let errors;
    res.render("checkout/create-coupon", {
        title,
        currentTime,
        errors,
    });
});
router.post("/create-coupon", ensureAdminAuthenticated, async (req, res) => {
    const { coupon_code, coupon_type, coupon_discount, coupon_limit, coupon_public: publicInput, coupon_msg, coupon_expire_date, coupon_expire_time, } = req.body;
    const coupon_public = publicInput === "YES"; // boolean
    const expiry_date_time = moment(`${coupon_expire_date} ${coupon_expire_time}`, "DD/MM/YYYY, hh:mm:ss a");
    const current_time = moment();
    const existing = await Coupon.findOne({ where: { code: coupon_code } });
    if (existing) {
        alertMessage(res, "danger", `Code ${existing.code} already exists!`, "fas fa-exclamation-circle", true);
        return res.redirect("create-coupon");
    }
    if (expiry_date_time.isBefore(current_time)) {
        alertMessage(res, "danger", `Date or Time entered invalid!`, "fas fa-exclamation-circle", true);
        return res.redirect("create-coupon");
    }
    const coupon_object = await Coupon.create({
        code: coupon_code,
        type: coupon_type,
        discount: coupon_discount,
        limit: coupon_limit,
        public: coupon_public,
        message: coupon_msg,
        expiry: expiry_date_time.toDate(), // ← key fix
    });
    if (coupon_object.public && req.session.public_coupon) {
        const old = req.session.public_coupon;
        req.session.public_coupon = coupon_object;
        await Coupon.destroy({ where: { id: old.id } });
    }
    req.session.save();
    alertMessage(res, "success", `Coupon Code ${coupon_object.code} created, expires on ${coupon_object.expiry}`, "fas fa-check-circle", true);
    res.redirect("/product/create-coupon");
});
// Create Discount Page
router.get("/create-discount", ensureAdminAuthenticated, async (req, res) => {
    const title = "Create Discount";
    let currentDate = moment(req.body.currentDate, "DD/MM/YYYY");
    let currentTime = moment().format("HH:mm");
    let errors;
    let products = await ProductAdmin.findAll({});
    res.render("checkout/create-discount", {
        title,
        currentTime,
        errors,
        products,
    });
});
router.post("/create-discount", ensureAdminAuthenticated, async (req, res) => {
    const target_id = req.body.target_id;
    const product_discount = req.body.product_discount;
    const min_qty = req.body.min_qty;
    const discount_msg = req.body.discount_msg;
    const discount_expire_date = req.body.discount_expire_date;
    const discount_expire_time = req.body.discount_expire_time;
    // ✅ boolean, not number
    const stackable = req.body.stackable === "on" || req.body.stackable === "true";
    const full_time = `${discount_expire_date} ${discount_expire_time}`;
    const expiry_date_time = moment(full_time, "DD/MM/YYYY, hh:mm:ss a");
    const current_time = moment();
    const et = moment(expiry_date_time);
    const d = await Discount.findOne({ where: { target_id } });
    if (d) {
        alertMessage(res, "danger", `Discount for ID: ${d.target_id} already exists!`, "fas fa-exclamation-circle", true);
    }
    else if (et.isBefore(current_time)) {
        alertMessage(res, "danger", `Date or Time entered invalid!`, "fas fa-exclamation-circle", true);
    }
    else {
        const new_d = await Discount.create({
            discount_rate: product_discount,
            min_qty,
            expiry: expiry_date_time.toDate(), // ✅ cast to Date
            stackable, // ✅ boolean
            message: discount_msg,
            target_id,
        });
        alertMessage(res, "success", `Discount for Product ID: ${new_d.target_id} created, expires on ${new_d.expiry}`, "fas fa-check-circle", true);
    }
    res.redirect("/product/create-discount");
});
// Admin - View Discounts and Coupons and Delete together
router.get("/view-discount", ensureAdminAuthenticated, async (req, res) => {
    let title = "View Discount";
    let discounts = await Discount.findAll({});
    let coupons = await Coupon.findAll({});
    res.render("checkout/view-discount", {
        title,
        discounts,
        coupons,
    });
});
router.get("/deleteDiscount/:id", ensureAdminAuthenticated, async (req, res) => {
    let target_id = req.params.id;
    let url = "/product/view-discount";
    Discount.findOne({
        where: { target_id: target_id },
    })
        .then((disc_object) => {
        if (disc_object != null) {
            disc_object.destroy();
            alertMessage(res, "success", "Discount for Product " + target_id + " is successfully deleted", "fas fa-sign-in-alt", true);
        }
        else {
            url = "/";
            console.log("Invalid ID provided, not deleting anything");
        }
    })
        .catch((err) => {
        console.log(err);
    });
    res.redirect(url);
});
router.get("/deleteCoupon/:id", ensureAdminAuthenticated, async (req, res) => {
    let id = req.params.id;
    let url = "/product/view-discount";
    Coupon.findOne({
        where: { id: id },
    })
        .then((c) => {
        if (c != null) {
            c.destroy();
            alertMessage(res, "success", "Coupon " + id + " is successfully deleted", "fas fa-sign-in-alt", true);
        }
        else {
            url = "/";
            console.log("Invalid ID provided, not deleting anything");
        }
    })
        .catch((err) => {
        console.log(err);
    });
    res.redirect(url);
});
router.get("/testing", (req, res) => {
    const title = "Testing 123";
    // Explicitly type obj2 so we can index it safely later
    const obj2 = {
        0: { num: 1 },
        1: { num: 2 },
        2: { num: 3 },
        3: { num: 4 },
    };
    // ✅ Safe parse with default fallbacks
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "2", 10);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // ✅ Declare expected shape up front
    const results = {};
    const keys = Object.keys(obj2);
    if (endIndex < keys.length) {
        results.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
        results.previous = { page: page - 1, limit };
    }
    results.results = keys
        .slice(startIndex, endIndex)
        .map((key) => ({ [key]: obj2[key] })); // ✅ now legal: obj2 is Record<string, ...>
    console.log(results);
    res.render("checkout/testing123", { title, results });
});
router.get("/testing2", (req, res) => {
    const title = "Pagination";
    // Ensure userCart is always at least an empty object
    const cart_items = (req.session?.userCart || {});
    // Ensure query param is string and default to page 1
    const page = parseInt(req.query.page || "1", 10);
    const limit = 3;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // define full shape to avoid "Property does not exist" errors
    const results = {};
    const keys = Object.keys(cart_items);
    // Next page info
    if (endIndex < keys.length) {
        results.next = { page: page + 1, limit };
    }
    // Previous page info
    if (startIndex > 0) {
        results.previous = { page: page - 1, limit };
    }
    // Total number of pages
    results.pages = Math.ceil(keys.length / limit);
    // Paginated results
    results.results = keys
        .slice(startIndex, endIndex)
        .map((key) => ({ [key]: cart_items[key] }));
    console.log(results.results);
    res.render("checkout/testing1234", {
        title,
        results,
    });
});
// Testing new stuff 18 Aug
router.get("/getjson", (req, res) => {
    // session and query can be undefined → add safe fallbacks
    const cart_items = (req.session?.userCart || {});
    // query params come in as string | string[] | undefined
    const page = parseInt(req.query.page || "1", 10);
    const limit = parseInt(req.query.limit || "5", 10);
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    // declare results type to allow adding properties dynamically
    const results = {};
    const keys = Object.keys(cart_items);
    if (endIndex < keys.length) {
        results.next = { page: page + 1, limit };
    }
    if (startIndex > 0) {
        results.previous = { page: page - 1, limit };
    }
    results.results = keys
        .slice(startIndex, endIndex)
        .map((key) => ({ [key]: cart_items[key] }));
    console.log(results.results);
    res.json(results);
});
export { router };
//# sourceMappingURL=productRoutes.js.map