import express from "express";
const router = express.Router();
import moment from "moment";
import alertMessage from "../helpers/messenger.js";
import chalk from "chalk";

//Models
import product from "../models/Product.js";
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

//EasyPost API
import EasyPost from "@easypost/api";

console.log(chalk.red(process.env.EASYPOST_API_TEST_KEY));
console.log(chalk.red(process.env.STRIPE_SECRET_KEY));
//const apiKey = process.env.EASYPOST_API_TEST_KEY;
const apiKey = "EZTKe61fa8e438e34413acce28f504e9d8ee9lUMxw7QLbFHvI2SZgpUqg";
const api = new EasyPost(apiKey);

// Stripe Payment
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2020-03-02",
});

// PayNow
import paynow from "paynow-generator";
import QRCode from "qrcode";

// twilo API - Send SMS
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTHTOKEN;

import Client from "twilio";
const client = new Client(accountSid, authToken);

// Authentications
import ensureAuthenticated from "../middleware/userAuth.js";
import ensureAdminAuthenticated from "../middleware/adminAuth.js";
import { checkCart } from "../middleware/cartAuth.js";

// Import Helpers
import carthelper from "../helpers/cartHelper.js";
import helper from "../helpers/hbs.js";
import {
  logRed,
  logGreen,
  logBlue,
  logYellow,
  logMagenta,
  logCyan,
} from "../helpers/loggerHelper.js";

/*
  // How the Pricing works?
	// Example A: quantity 3, price: 5.00, discountRate: 0.20, minQty:2

	specialOffers = Math.floor(quantity / minQty); //  1
	originalSubtotalPrice = quantity * price // 15.00 (Original subtotal price if no discount applied)
	discountedHalf = (specialOffers * minQty * price) * (1 - discountRate) // 8.00 , the discount applies to EACH item's price for every TWO item
	regularHalf = (quantity - (specialoffers * minQty)) * price // 5.00 , since we have a total 3 of item, only 2 will get discounted pricing, the last one will have original price
	discountedSubtotalPrice = discountedHalf + regularHalf // 13.00



	// Example B: quantity: 4, price:5.00 discountRate: 0.20, minQty: 2

	
	specialOffers = Math.floor(quantity / minQty); //  2
	originalSubtotalPrice = quantity * price // 20.00 (Original subtotal price if no discount applied)
	discountedHalf = (specialOffers * minQty * price) * (1 - discountRate) // 16.00 , the discount applies to EACH item's price for every TWO item
	regularHalf = (quantity - (specialoffers * minQty)) * price // 0.00 , since we have a total 4 of item, none of them are original price thanks to the discount
	discountedSubtotalPrice = discountedHalf + regularHalf // 16.00


	// Example C: quantity: 1, price:5.00 discountRate: 0.20, minQty: 2

	
	specialOffers = Math.floor(quantity / minQty); //  0
	originalSubtotalPrice = quantity * price // 5.00 (Original subtotal price if no discount applied)
	discountedHalf = (specialOffers * minQty * price) * (1 - discountRate) // (0 * 2 * 5.00) * (1-0.2) = 0  the discount applies to EACH item's price for every TWO item
	regularHalf = (quantity - (specialoffers * minQty)) * price // 5.00 
	discountedSubtotalPrice = discountedHalf + regularHalf // 5.00

*/

// Page that displays all the products
router.get("/product-list", async (req, res) => {
  try {
    const title = "Product Listing";
    const navStatusProduct = "active";

    // Fetch all products, ordered by product name (ascending)
    const products = await productadmin.findAll({
      order: [["product_name", "ASC"]],
    });

    // Render the product list page
    res.render("products/product-list", {
      productadmin: products,
      navStatusProduct,
      title,
    });
  } catch (error) {
    console.error("Error fetching product list:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Page that display a single product details
router.get("/individual-product/:id", async (req, res) => {
  try {
    const title = "Product Information";
    const { id } = req.params;

    // Fetch the discount
    const disc = await Discount.findOne({ where: { target_id: id } });

    // Fetch the product
    const product = await productadmin.findOne({ where: { id } });

    // Render the page with the product and discount information
    res.render("products/individual-product", {
      product,
      title,
      disc,
    });
  } catch (error) {
    console.error("Error fetching product or discount:", error);
    res.status(500).send("Internal Server Error");
  }
});

// Admin-only page that displays all the current products in the web store
router.get(
  "/product-list-admin",
  ensureAdminAuthenticated,
  async (req, res) => {
    try {
      const title = "Product Admin List";

      // Fetch all products, ordered by ID (ascending), and return raw data
      const product_details = await productadmin.findAll({
        order: [["id", "ASC"]],
        raw: true,
      });

      // Render the admin product list page
      res.render("products/product-list-admin", {
        productadmin: product_details,
        title,
      });
    } catch (error) {
      console.error("Error fetching admin product list:", error);
      res.status(500).send("Internal Server Error");
    }
  },
);

// Admin-only page that displays detail about a single product in the web store
router.get(
  "/product-details-admin/:id",
  ensureAdminAuthenticated,
  async (req, res) => {
    try {
      const title = "Product Details";
      const { id } = req.params;

      // Fetch the product by ID
      const product = await productadmin.findOne({
        where: { id },
      });

      // Render the product details page
      res.render("products/product-details", {
        product,
        title,
      });
    } catch (error) {
      console.error("Error fetching product details:", error);
      res.status(500).send("Internal Server Error");
    }
  },
);

// Admin-only page that displays the form to create a product entry in the web store
router.get("/create-product", (req, res) => {
  const title = "Create Product";
  res.render("products/create-product", {
    title,
  });
});

// Admin-only request that creates a new product entry in the web store
router.post("/create-product-admin", ensureAdminAuthenticated, (req, res) => {
  let product_name = req.body.product_name;
  console.log(product_name);
  let author = req.body.author;
  let publisher = req.body.publisher;
  let genre = req.body.genre;
  let price = req.body.price;
  let stock = req.body.stock;
  let details = req.body.details;
  let rating = req.body.rating;
  let weight = req.body.weight;
  let product_image = req.body.product_image;
  productadmin
    .create({
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
    })
    .then((product) => {
      alertMessage(
        res,
        "success",
        ` ${product_name} was added into the shop.`,
        "fas fa-sign-in-alt",
        true,
      );
      res.redirect("/product/product-list-admin");
    })
    .catch((err) => console.log(err));
});

// Admin-only page that displays the form to update a product entry details in the web store
router.get(
  "/product-update-admin/:id",
  ensureAdminAuthenticated,
  (req, res) => {
    const title = "Update Product";
    productadmin
      .findOne({
        where: {
          id: req.params.id,
        },
      })
      .then((product) => {
        res.render("products/product-update-admin", {
          product,
          title,
        });
      });
  },
);

// Admin-only request that updates product entry details in the web store
router.put(
  "/product-update-admin/:id",
  ensureAdminAuthenticated,
  (req, res) => {
    let product_name = req.body.product_name;
    let author = req.body.author;
    let publisher = req.body.publisher;
    let genre = req.body.genre;
    let price = req.body.price;
    let stock = req.body.stock;
    let details = req.body.details;
    let weight = req.body.weight;
    let rating = req.body.rating;
    let product_image = req.body.product_image;
    productadmin
      .update(
        {
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
        },
        {
          where: {
            id: req.params.id,
          },
        },
      )
      .then(() => {
        alertMessage(
          res,
          "success",
          ` ${product_name} was updated.`,
          "fas fa-sign-in-alt",
          true,
        );
        res.redirect("/product/product-list-admin");
      })
      .catch((err) => console.log(err));
  },
);

// Admin-only request that deletes a new product entry in the web store
router.get("/delete/:id", ensureAdminAuthenticated, (req, res) => {
  productadmin
    .findOne({
      where: {
        id: req.params.id,
      },
    })
    .then((productadmin) => {
      productadmin
        .destroy({
          where: {
            id: req.params.id,
          },
        })
        .then((productadmin) => {
          res.redirect("/product/product-list-admin");
        });
    });
});

// Here is the start of Cart and Payment Features

router.get("/product-list/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const discount = await carthelper.getProductDiscount(productId); // Get Discount Obj from DB
    const product = await productadmin.findOne({ where: { id: productId } }); // Get Product Obj from DB
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    carthelper.processCart(req, req.session.userCart, product, discount, 1); // Determine whether cart item already exist hence need to update merely qty or add new item

    // Get quantity of cart items to display in the UI with ajax and use of cookie
    const cartQty = Object.values(req.session.userCart).reduce(
      (acc, item) => acc + item.Quantity,
      0,
    );
    res.cookie("cartQty", cartQty, {
      expires: new Date(Date.now() + 900000),
      httpOnly: false,
    });

    // Set a flashmessage to display client side
    const flashMessage_clientside = `${product.product_name} added to cart!`;

    // Respond with JSON for AJAX request
    res.json({
      success: true,
      flashMessage: [flashMessage_clientside],
    });

    logMagenta(
      `[GET /product-list/:id] Current User Cart Contents After Adding item: ${JSON.stringify(req.session.userCart, null, 2)}`,
    );
    logMagenta(
      `[GET /product-list/:id] Current Session Variables Contents After Adding Item: ${JSON.stringify(req.session, null, 2)}`,
    );
  } catch (err) {
    console.error(err);
    res.json({
      success: false,
    });
  }
});

router.post("/individual-product/:id", async (req, res) => {
  try {
    const productId = req.params.id;
    const discount = await carthelper.getProductDiscount(productId);
    const product = await productadmin.findOne({ where: { id: productId } });
    if (!product) {
      return res.json({ success: false, message: "Product not found" });
    }
    carthelper.processCart(req, req.session.userCart, product, discount, 1);

    // Get quantity of cart items to display in the UI with ajax and use of cookie
    // Set cookie, our frontend will retrieve this later
    const cartQty = Object.values(req.session.userCart).reduce(
      (acc, item) => acc + item.Quantity,
      0,
    );
    res.cookie("cartQty", cartQty, {
      expires: new Date(Date.now() + 900000),
      httpOnly: false,
    });

    // Set a flashmessage to display client side
    const flashMessage_clientside = `${product.product_name} added to cart!`;

    // Respond with JSON for AJAX request
    res.json({
      success: true,
      flashMessage: [flashMessage_clientside],
    });

    logMagenta(
      `[POST /individual-product/:id] Current User Cart Contents After Adding item: ${JSON.stringify(req.session.userCart, null, 2)}`,
    );
    logMagenta(
      `[POST /individual-product/:id] Current Session Variables Contents After Adding Item: ${JSON.stringify(req.session, null, 2)}`,
    );
  } catch (error) {
    res.json({
      success: false,
      message: "An error occurred while adding the product to the cart",
    });
    console.error(error);
  }
});

// Update Cart / Or go to Checkout Page
router.post("/cart", async (req, res) => {
  try {
    if (req.body.checkoutButton === "Update") {
      for (let productId in req.session.userCart) {
        let item = req.session.userCart[productId];
        let query = parseInt(req.body[`Q${productId}`]);
        logMagenta(
          `[POST /cart/] Querying: ${item.Name} Current Quantity: ${item.Quantity}, New Quantity: ${query}`,
        );

        // Modify qty of product according to changes
        if (query > 0) {
          item.Quantity = query;
        }

        const discount = await carthelper.getProductDiscount(productId);
        const product = await productadmin.findOne({
          where: { id: productId },
        });

        if (!product) {
          return res.json({ success: false, message: "Product not found" });
        }

        carthelper.processCart(
          req,
          req.session.userCart,
          product,
          discount,
          false,
        );

        // Remember to update coupon savings after quantity update
        if (req.session.coupon_object) {
          await carthelper.calculate_cart_total_coupon_savings(
            req,
            req.session.coupon_object.code,
          );
        } else {
          req.session.cart_coupon_savings = 0;
        }
      }

      logMagenta(
        `[POST /cart/] Current User Cart Contents: ${JSON.stringify(req.session.userCart, null, 2)}`,
      );
      logMagenta(
        `[POST /cart/] Current Session Variables Contents: ${JSON.stringify(req.session, null, 2)} `,
      );
      // Save session and wait for it to complete before proceeding
      // Ensures data  displayed is as updated as possible
      await helper.manualSessionSave(req);
      res.redirect(`/product/cart?page=1`);
    } else {
      res.redirect("checkout");
    }
  } catch (err) {
    console.error("Error occurred:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Delete Item in Cart
router.get("/delete-cart-item/:id", async (req, res) => {
  try {
    const cartItem = req.session.userCart[req.params.id];
    console.log(`Deleting ${cartItem.Name}`);
    delete req.session.userCart[req.params.id];
    await helper.manualSessionSaveNoCaching(req, res);
    alertMessage(
      res,
      "success",
      "An item has been removed from the cart",
      "fas fa-sign-in-alt",
      true,
    );
    // Redirect with cache busting query so the page loaded on redirect wont have the deleted item
    const timestamp = Date.now();
    res.redirect(307, `/product/cart?page=1&cacheBust=${timestamp}`);
    // we may have deleted the item from userCart, but other session variables like cart_coupon_savings, cart_discount_savings and cart_subtotal_final, cart_subtotal_initial, cart_grandtotal are unchanged.
  } catch (err) {
    console.error("Error deleting item:", err);
    res.status(500).send("Internal Server Error");
  }
});

// Retrieve Cart
// Make sure to use POST request to handle updated cart info or you need to double refresh

router.get("/cart", async (req, res) => {
  let title = "Shopping Cart";
  const page = req.query.page || 1; // Default to page 1 if not provided

  await carthelper.refreshCartCalculations(req, req.session.userCart);
  logMagenta(
    `[GET /cart/] CART PAGE REQ initialSubtotal = ${req.session.cart_subtotal_initial}`,
  );
  logMagenta(
    `[GET /cart/] CART PAGE REQ discountedSubtotal = ${req.session.cart_subtotal_final}`,
  );
  logMagenta(
    `[GET /cart/] CART PAGE REQ discountSavingsTotal = ${req.session.cart_discount_savings}`,
  );
  logMagenta(
    `[GET /cart/] CART PAGE REQ couponSavingsTotal = ${req.session.cart_coupon_savings}`,
  );
  logMagenta(
    `[GET /cart/] CART PAGE REQ grandTotal = ${req.session.cart_grandtotal}`,
  );
  res.locals.cart_subtotal_initial =
    req.session.cart_subtotal_initial.toFixed(2);
  res.locals.cart_subtotal_final = req.session.cart_subtotal_final.toFixed(2);
  res.locals.cart_discount_savings =
    req.session.cart_discount_savings.toFixed(2);
  res.locals.cart_coupon_savings = req.session.cart_coupon_savings.toFixed(2);
  res.locals.cart_shipping_fee = req.session.cart_shipping_fee.toFixed(2);
  res.locals.cart_grandtotal = req.session.cart_grandtotal.toFixed(2);

  logMagenta("[GET /cart/] === Show Session Variables ===");
  logMagenta(`[GET /cart/] ${JSON.stringify(req.session, null, 2)}`);
  res.render("checkout/cart", {
    title,
    results: {
      pages: Number(page), // Set correctly based on your pagination logic
      results: Object.keys(req.session.userCart).map((key) => ({
        [key]: req.session.userCart[key],
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
        if (
          req.session.public_coupon &&
          coupon.code === req.session.public_coupon.code
        ) {
          logRed("[POST /applyCoupon/] Setting session var to NULL");
          req.session.public_coupon = null;
        }

        logRed("Destroying Coupon Code " + coupon.code);
        await coupon.destroy(); // Ensure the coupon is destroyed
        await req.session.save(); // Ensure the session is saved after coupon destruction
        logYellow(
          "[POST /applyCoupon/] Public Coupon is now " +
            req.session.public_coupon +
            " should be NULL",
        );
      } else {
        logMagenta(
          `[POST /applyCoupon/] Current Time: ${currentTime.format("DD/MM/YYYY, hh:mm:ss a")}`,
        );
        logMagenta(
          `[POST /applyCoupon/] Expiry Time: ${expiryTime.format("DD/MM/YYYY, hh:mm:ss a")}`,
        );
      }
    }

    const couponSavings = await carthelper.calculate_cart_total_coupon_savings(
      req,
      req.body.coupon,
    );

    logMagenta(`Coupon Savings: ${couponSavings}`);

    // Redirect with cache busting query so the page loaded on redirect wont have the deleted item
    const timestamp = Date.now();
    res.redirect(`/product/cart?page=1&cacheBust=${timestamp}`);
  } catch (err) {
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
  } else {
    res.redirect("/");
  }
});

router.post("/checkout", checkCart, async (req, res) => {
  // Check Inputs
  logMagenta(req.body.fullName);
  logMagenta(req.body.phoneNumber);
  logMagenta(req.body.address);
  logMagenta(req.body.address1);
  logMagenta(req.body.city);
  logMagenta(req.body.country);
  logMagenta(req.body.postalCode);
  // Add to session variables
  req.session.shipment_recipient_name = req.body.fullName;
  req.session.shipment_recipient_phonenum = req.body.phoneNumber;
  req.session.shipment_lineone = req.body.address;
  req.session.shipment_linetwo = req.body.address1;
  req.session.shipment_city = req.body.city;
  req.session.shipment_country = req.body.country;
  req.session.shipment_postal_code = req.body.postalCode;
  // Log Ssn variables
  logMagenta("=== New Ssn Variables ===");
  logMagenta(req.session.shipment_recipient_name);
  logMagenta(req.session.shipment_recipient_phonenum);
  logMagenta(req.session.shipment_lineone);
  logMagenta(req.session.shipment_linetwo);
  logMagenta(req.session.shipment_city);
  logMagenta(req.session.shipment_country);
  logMagenta(req.session.shipment_postal_code);
  await helper.saveSession(req);

  res.redirect("select-payment");
});

// After checkout form filled, select payment page
router.get("/select-payment", checkCart, (req, res) => {
  const title = "Select Payment";
  res.render("checkout/select-payment", {
    title,
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
  let payNowString = paynow.paynowGenerator(
    "mobile",
    "87558054",
    "no",
    req.session.cart_grandtotal,
    "Test Merchant Name",
    "Testing paynow",
  );
  let qr = QRCode.toDataURL(payNowString)
    .then((url) => {
      res.render("checkout/paynow", {
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
  // Function below will take in customer's stripeID (if it exists)
  console.log("USER STRIPE ID IS " + req.user.stripeID);
  console.log("USER ISADMIN IS " + req.user.isadmin);
  if (req.user.stripeID != null) {
    stripe.customers.retrieve(req.user.stripeID, function (err, customer) {
      // asynchronously called
      console.log(err);
      console.log("CUSTOMER IS " + customer);
    });
  } else {
    // Create a stripe customer
    const customer = await stripe.customers.create({
      name: req.user.name,
      email: req.user.email,
      phone: req.user.PhoneNo,
      shipping: {
        address: {
          line1: req.user.address,
          line2: req.user.address1,
          city: req.user.city,
          country: req.user.country,
          postal_code: req.user.postalCode,
        },
        name: req.user.name,
        phone: req.user.PhoneNo,
      },
    });
    console.log("CUST ID IS + " + customer.id);
    console.log(req.user.stripeID);
    console.log(req.user.random);
    const current_user = await User.findOne({ where: { id: req.user.id } });
    console.log(current_user);
    current_user.stripeID = customer.id;
    current_user.save();
  }

  var title = "Stripe Payment";
  console.log("Full total price is " + req.session.cart_grandtotal);
  const paymentIntent = stripe.paymentIntents
    .create({
      amount: Math.ceil(req.session.cart_grandtotal * 100),
      currency: "sgd",
      payment_method_types: ["card"],
      receipt_email: "whjw1536@gmail.com",
      setup_future_usage: "on_session",
      description: `Order worth $${req.session.cart_grandtotal} by ${req.user.name}`,
    })
    .then((paymentIntent) => {
      console.log(paymentIntent);
      console.log("Client secret is " + paymentIntent.client_secret);
      res.render("checkout/stripe", {
        client_secret: paymentIntent.client_secret,
        title,
      });
    });
});

router.post("/paynow", async (req, res) => {
  let the_date = moment().format("D MMM YYYY");
  let dateStart = the_date.toString();
  console.log("dateStart is " + dateStart);

  // Create a unconfirmed order
  const new_pending_order = await PendingOrder.create({
    fullName: req.session.recipientName,
    phoneNumber: req.session.recipientPhoneNo,
    address: req.session.address,
    address1: req.session.address1,
    city: req.session.city,
    country: req.session.countryShipment,
    postalCode: req.session.postalCode,
    deliverFee: 0,
    subtotalPrice: parseFloat(req.session.cart_subtotal_final).toFixed(2),
    totalPrice: parseFloat(req.session.cart_grandtotal).toFixed(2),
    dateStart: dateStart,
    userId: req.user.id,
  }).catch((err) => {
    console.log("Cannot create pending order");
    console.log(err);
  });

  // Store unconfirmed order's order items
  for (var i in req.session.userCart) {
    let product_name = req.session.userCart[i].Name;
    let author = req.session.userCart[i].Author;
    let publisher = req.session.userCart[i].Publisher;
    let genre = req.session.userCart[i].Genre;
    let price = req.session.userCart[i].SubtotalPrice;
    let stock = req.session.userCart[i].Quantity;
    let details = "";
    let weight = req.session.userCart[i].SubtotalWeight;
    let product_image = req.session.userCart[i].Image;
    let PorderId = new_pending_order.id;
    const new_pi = await PendingOrderItem.create({
      product_name,
      author,
      publisher,
      genre,
      price,
      stock,
      details,
      weight,
      product_image,
      pendingOrderId: PorderId,
    }).catch((err) => {
      console.log("Cannot create pending order item");
      console.log(err);
    });
  }

  // This block of code below will send a message
  client.messages
    .create({
      body: "You made an order with BookStore via payNow/payLah!, you will be notified again when your order is confirmed",
      from: process.env.TWILIO_ACCOUNT_PHONENO,
      to: process.env.DEV_PHONENO,
    })
    .then((message) => console.log(message.sid));

  // Empty the cart
  req.session.userCart = {};
  console.log(chalk.red(req.session));
  alertMessage(
    res,
    "success",
    "Order placed, the administrator will shortly confirm your payment",
    "fas fa-exclamation-circle",
    true,
  );
  res.redirect("paynow-txn-end");
});

router.post("/stripe-payment", async (req, res) => {
  try {
    // 1. Create and verify the address
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

    // 2. Create the parcel with valid dimensions
    const parcel = await api.Parcel.create({
      length: 10,
      width: 8,
      height: 4,
      weight: 15.7, // weight in ounces
    });

    // 3. Create the shipment
    const shipment = await api.Shipment.create({
      to_address: toAddress,
      from_address: fromAddress,
      parcel: parcel,
      // carrier_accounts: ['ca_dhl_account_id'], // Optional: Specify your DHL carrier account ID if needed
    });

    // 4. Log available rates to debug the issue
    logCyan(JSON.stringify(shipment, null, 2));
    console.log("Available rates:", shipment.rates);

    // Check if any rates are returned
    if (shipment.rates.length === 0) {
      throw new Error("No rates found for this shipment.");
    }

    // 5. Buy the shipment
    const boughtShipment = await api.Shipment.buy(
      shipment.id,
      shipment.lowestRate(["USPS"]),
    );
    console.log("Bought Shipment:", boughtShipment);

    logMagenta("=== Test SSN variable ===");
    logMagenta(req.session.shipment_recipient_name);
    logMagenta(req.session.shipment_recipient_phonenum);
    logMagenta(req.session.shipment_lineone);
    logMagenta(req.session.shipment_linetwo);
    logMagenta(req.session.shipment_city);
    logMagenta(req.session.shipment_country);
    logMagenta(req.session.shipment_postal_code);

    // 6. Create Order
    // Assuming `req.session` has the necessary order details
    // Details gotten from checkout form earlier
    let full_name = req.session.shipment_recipient_name;
    let phone_number = req.session.shipment_recipient_phonenum;
    let address = req.session.shipment_lineone;
    let address1 = req.session.shipment_linetwo;
    let city = req.session.shipment_city;
    let country = req.session.shipment_country;
    let postal_code = req.session.shipment_postal_code;
    //
    let delivery_fee = 0;
    let subtotal_price = req.session.cart_subtotal_final;
    let grand_total = req.session.cart_grandtotal;
    //
    let shipping_id = boughtShipment.id;
    let address_id = toAddress.id; // Use the address ID from the created address
    let tracking_id = boughtShipment.tracker?.id || "";
    let tracking_code = boughtShipment.tracker?.tracking_code || "";
    let date_start = boughtShipment.created_at;
    let date_end = boughtShipment.tracker?.est_delivery_date || "";
    let delivery_status = boughtShipment.tracker?.status || "";
    let user_id = req.user.id;
    // logRed(shipping_id);
    // logRed(address_id);
    // logRed(tracking_id);
    // logRed(tracking_code);
    // logRed(date_start);
    // logRed(date_end);
    // logRed(delivery_status);
    // logRed(user_id);

    // Create Order entry into DB
    const newOrder = await order.create({
      full_name,
      phone_number,
      address,
      address1,
      city,
      country,
      postal_code,
      delivery_fee,
      subtotal_price,
      grand_total,
      shipping_id,
      address_id,
      tracking_id,
      tracking_code,
      date_start,
      date_end,
      delivery_status,
    });

    // Create individual OrderItem entry into DB
    for (var i in req.session.userCart) {
      let product_name = req.session.userCart[i].Name;
      let author = req.session.userCart[i].Author;
      let publisher = req.session.userCart[i].Publisher;
      let genre = req.session.userCart[i].Genre;
      let price = req.session.userCart[i].SubtotalPrice;
      let stock = req.session.userCart[i].Quantity;
      let details = "placeholder details";
      let weight = req.session.userCart[i].SubtotalWeight;
      let product_image = req.session.userCart[i].Image;
      let orderId = order.id;
    //   let total_weight_oz = (
    //     parseFloat(total_weight_oz) + parseFloat(weight)
    // ).toFixed(2);

    await order_item.create({
      product_name,
      author,
      publisher,
      genre,
      price,
      stock,
      details,
      weight,
      product_image,
      orderId,
    });
  }



    // 7. Send the tracking URL via SMS
    let trackingUrl = boughtShipment.tracker?.public_url;
    logMagenta(`tracking url is ${trackingUrl}`)
    // Twilio MSG
    //             await client.messages.create({
    //                 body: `Thank you for your purchase from the Book Store. Your tracking code is ${trackingCode} and you can check your delivery here: ${trackingURL}`,
    //                 from: process.env.TWILIO_ACCOUNT_PHONENO,
    //                 to: process.env.DEV_PHONENO,
    //             }).then((message) => console.log(message.sid));

    // 8. Empty the cart
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

    res.redirect("/product/stripe-txn-end");
  } catch (error) {
    console.error(`Error Code ${error.code} :`, error.message);
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

router.get(
  "/view-pending-orders",
  ensureAdminAuthenticated,
  async (req, res) => {
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
  },
),
  router.get(
    "/confirm-pending-order/:id",
    ensureAdminAuthenticated,
    async (req, res) => {
      const PO = await PendingOrder.findOne({ where: { id: req.params.id } });
      const Pi = await PendingOrderItem.findAll({
        where: { pendingOrderId: PO.id },
      });

      const parcel = new api.Parcel({
        predefined_package: "Parcel",
        weight: 10, //change number according to weight of total books
      });

      parcel.save();

      const fromAddress = new api.Address({
        //default address of company
        name: "Bookstore",
        street1: "118 2nd Street",
        street2: "4th Floor",
        city: "San Francisco",
        state: "CA",
        country: "US",
        zip: "94105",
        phone: "415-123-4567",
        email: "example@example.com",
      });

      const toAddress = new api.Address({
        verify: ["delivery"],
        name: "George Costanza",
        company: "Vandelay Industries",
        street1: "1 E 161st St.",
        phone: PO.phoneNumber,
        city: "Bronx",
        state: "NY",
        zip: "12412352551",
      });
      toAddress
        .save()
        .then((addr) => {
          let checkAddress = addr.verifications.delivery.success;
          if (checkAddress == true) {
            const shipment = new api.Shipment({
              to_address: toAddress,
              from_address: fromAddress,
              parcel: parcel,
            });
            shipment.save().then((s) => {
              s.buy(shipment.lowestRate(["USPS"], ["First"])).then((t) => {
                console.log("=============");
                console.log(t.id);
                let fullName = PO.id;
                let phoneNumber = PO.phoneNumber;
                let address = PO.address;
                let address1 = PO.address1;
                let city = PO.city;
                let country = PO.country;
                let postalCode = PO.postalCode;
                let deliverFee = PO.deliverFee;
                let subtotalPrice = PO.subtotalPrice;
                let totalPrice = PO.totalPrice;
                let shippingId = t.id;
                let addressId = t.to_address.id;
                let trackingId = t.tracker.id;
                let trackingCode = t.tracker.tracking_code;
                let dateStart = t.created_at;
                let dateEnd = t.tracker.est_delivery_date;
                let deliveryStatus = t.tracker.status;
                let userId = PO.userId;
                order
                  .create({
                    fullName,
                    phoneNumber,
                    address,
                    address1,
                    city,
                    country,
                    postalCode,
                    deliverFee,
                    subtotalPrice,
                    totalPrice,
                    shippingId,
                    addressId,
                    trackingId,
                    trackingCode,
                    dateStart,
                    dateEnd,
                    deliveryStatus,
                    userId,
                  })

                  .then((order) => {
                    for (var i in Pi) {
                      let product_name = Pi[i].product_name;
                      let author = Pi[i].author;
                      let publisher = Pi[i].publisher;
                      let genre = Pi[i].genre;
                      let price = Pi[i].price;
                      let stock = Pi[i].stock;
                      let details = "";
                      let weight = Pi[i].weight;
                      let product_image = Pi[i].product_image;
                      let orderId = order.id;
                      order_item.create({
                        product_name,
                        author,
                        publisher,
                        genre,
                        price,
                        stock,
                        details,
                        weight,
                        product_image,
                        orderId,
                      });
                    }
                    console.log(order);
                    PO.destroy();
                    for (i in Pi) {
                      console.log(`Deleting Product ${i}`);
                      Pi[i].destroy();
                    }
                    alertMessage(
                      res,
                      "success",
                      `Confirmed Order ${order.id} which belongs to user of id ${order.userId}`,
                      "fas fa-exclamation-circle",
                      true,
                    );
                    res.redirect("/product/view-pending-orders");
                    let trackingCode = order.dataValues.trackingCode;
                    api.Tracker.retrieve(trackingCode).then((t) => {
                      console.log(t.public_url);
                      let trackingURL = t.public_url;
                      client.messages
                        .create({
                          body:
                            "Your order has been confirmed!" +
                            "Thank you for your purchase from the Book Store. Your tracking code is " +
                            trackingCode +
                            " and check your delivery here!\n" +
                            trackingURL,
                          from: process.env.TWILIO_ACCOUNT_PHONENO,
                          to: order.phoneNumber,
                        })
                        .then((message) => console.log(message.sid));
                    });
                  });
              });
            });

            console.log("its true");
          } else {
            console.log("its false");
            alertMessage(
              res,
              "danger",
              "Please enter a valid address",
              "fas faexclamation-circle",
              true,
            );
            res.redirect("/product/view-pending-orders");
          }
        })
        .catch((e) => {
          console.log(e); //check errors
        });
    },
  );

router.get(
  "/delete-pending-order/:id",
  ensureAdminAuthenticated,
  async (req, res) => {
    // Code commented out below does work... but doesn't remove pending order items associated with it when a PO is deleted
    // Pending_Order.findOne({where: {id: req.params.id}, include:[{model:Pending_OrderItem}]})
    // .then((po)=> {
    //     po.destroy();
    // })

    const PO = await PendingOrder.findOne({ where: { id: req.params.id } });
    const Pi = await PendingOrderItem.findAll({
      where: { pendingOrderId: PO.id },
    });
    client.messages
      .create({
        body: "From BookStore: We are sorry to inform you that your order has cancelled by the administrator due to lack of payment",
        from: process.env.TWILIO_ACCOUNT_PHONENO,
        to: PO.phoneNumber,
      })
      .then((message) => console.log(message.sid));
    alertMessage(
      res,
      "success",
      `Pending Order with ID ${PO.id} Deleted`,
      "fas fa-exclamation-circle",
      true,
    );
    PO.destroy();
    for (i in Pi) {
      console.log(`Deleting Product ${i}`);
      Pi[i].destroy();
    }
    res.redirect("/product/view-pending-orders");
  },
);

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

router.post("/create-coupon", ensureAdminAuthenticated, (req, res) => {
  // Retrieve the inputs from the create coupon form
  let coupon_code = req.body.coupon_code;
  let coupon_type = req.body.coupon_type;
  let coupon_discount = req.body.coupon_discount;
  let coupon_limit = req.body.coupon_limit;
  let coupon_public = req.body.coupon_public;
  let coupon_msg = req.body.coupon_msg;
  // let coupon_expire_date = req.body.coupon_expire_date;
  // let coupon_expire_time = req.body.coupon_expire_time;
  let full_time =
    req.body.coupon_expire_date + " " + req.body.coupon_expire_time;

  // Note that the date/time stored in mySQL will be GMT althought date/time is based on our server(SGT)
  // E.g Coupon expiry date and time is SGT (GMT+8) 09/08/2020, 06:00 -> GMT 08/08/2020, 22:00
  let expiry_date_time = moment(full_time, "DD/MM/YYYY, hh:mm:ss a");

  let current_time = moment();
  let et = moment(expiry_date_time); // format into the same way as current_time (in ms)

  // Set BOOLEAN value of 'public' column
  if (coupon_public == "YES") {
    coupon_public = 1;
  } else {
    coupon_public = 0;
  }

  Coupon.findOne({
    where: { code: coupon_code },
  }).then((c) => {
    // Duplicate case
    if (c) {
      console.log("Coupon of the same code already exist");
      alertMessage(
        res,
        "danger",
        `Code ${c.code} already exists!`,
        "fas fa-exclamation-circle",
        true,
      );
      res.redirect("create-coupon");
    }

    // Invalid/Expired time case
    if (et.isBefore(current_time)) {
      // prevent user from inputting a date/time that has already passed
      alertMessage(
        res,
        "danger",
        `Date or Time entered invalid!`,
        "fas fa-exclamation-circle",
        true,
      );
      res.redirect("create-coupon");
    }

    // No problem, create
    else {
      Coupon.create({
        code: coupon_code,
        type: coupon_type,
        discount: coupon_discount,
        limit: coupon_limit,
        public: coupon_public,
        message: coupon_msg,
        expiry: expiry_date_time,
      })
        .then((coupon_object) => {
          // If new coupon is public and there are existing public coupon, override it
          if (coupon_object.public == 1 && req.session.public_coupon != null) {
            let oc = req.session.public_coupon;
            console.log(oc.code);
            req.session.public_coupon = coupon_object;
            Coupon.destroy({
              where: { id: oc.id },
            });
            // oc.destroy(); -> doesnt work 'oc doesnt have function 'destroy'
          }

          req.session.save();
          alertMessage(
            res,
            "success",
            `Coupon Code ${coupon_object.code} Created, it expires on ${coupon_object.expiry}`,
            "fas fa-exclamation-circle",
            true,
          );
          res.redirect("/product/create-coupon");
        })
        .catch(() => {
          console.log("Something went wrong with creating the coupon");
        });
    }
  });
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
  // Retrieve the inputs from the create discount form
  let target_id = req.body.target_id;
  let product_discount = req.body.product_discount;
  let min_qty = req.body.min_qty;
  let discount_msg = req.body.discount_msg;
  let discount_expire_date = req.body.discount_expire_date;
  let discount_expire_time = req.body.discount_expire_time;
  let stackable = 0;
  let full_time =
    req.body.discount_expire_date + " " + req.body.discount_expire_time;

  // Note that the date/time stored in mySQL will be GMT althought date/time is based on our server(SGT)
  // E.g Coupon expiry date and time is SGT (GMT+8) 09/08/2020, 06:00 -> GMT 08/08/2020, 22:00
  let expiry_date_time = moment(full_time, "DD/MM/YYYY, hh:mm:ss a");

  let current_time = moment();
  let et = moment(expiry_date_time); // format into the same way as current_time (in ms)

  let d = await Discount.findOne({ where: { target_id: target_id } });

  // Duplicate case
  if (d != null) {
    console.log("Discount of the same code already exist");
    alertMessage(
      res,
      "danger",
      `Discount for ID: ${d.target_id} already exists!`,
      "fas fa-exclamation-circle",
      true,
    );
    // res.redirect('create-discount')
  }

  // Invalid/Expired time case
  else if (et.isBefore(current_time)) {
    // prevent user from inputting a date/time that has already passed
    alertMessage(
      res,
      "danger",
      `Date or Time entered invalid!`,
      "fas fa-exclamation-circle",
      true,
    );
    // res.redirect('create-discount')
  }

  // No problem, create
  else if (d == null) {
    let new_d = await Discount.create({
      discount_rate: product_discount,
      min_qty: min_qty,
      expiry: expiry_date_time,
      stackable: stackable,
      message: discount_msg,
      target_id: target_id,
    });

    alertMessage(
      res,
      "success",
      `Discount for Product ID: ${new_d.target_id} Created, it expires on ${new_d.expiry}`,
      "fas fa-exclamation-circle",
      true,
    );
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

router.get(
  "/deleteDiscount/:id",
  ensureAdminAuthenticated,
  async (req, res) => {
    let target_id = req.params.id;
    let url = "/product/view-discount";
    Discount.findOne({
      where: { target_id: target_id },
    })
      .then((disc_object) => {
        if (disc_object != null) {
          disc_object.destroy();
          alertMessage(
            res,
            "success",
            "Discount for Product " + target_id + " is successfully deleted",
            "fas fa-sign-in-alt",
            true,
          );
        } else {
          url = "/";
          console.log("Invalid ID provided, not deleting anything");
        }
      })
      .catch((err) => {
        console.log(err);
      });

    res.redirect(url);
  },
);

router.get("/deleteCoupon/:id", ensureAdminAuthenticated, async (req, res) => {
  let id = req.params.id;
  let url = "/product/view-discount";
  Coupon.findOne({
    where: { id: id },
  })
    .then((c) => {
      if (c != null) {
        c.destroy();
        alertMessage(
          res,
          "success",
          "Coupon " + id + " is successfully deleted",
          "fas fa-sign-in-alt",
          true,
        );
      } else {
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
  let title = "Testing 123";
  var obj2 = { 0: { num: 1 }, 1: { num: 2 }, 2: { num: 3 }, 3: { num: 4 } };

  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  // page - 1 because index start on 0
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // we want to let user know if there is a page after or before
  const results = {};

  // Retrieve next page data
  if (endIndex < Object.keys(obj2).length) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  // Retrieve previous page data
  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  var obj = { 0: "zero", 1: "one", 2: "two", 3: "three", 4: "four" };
  // results.results = Object.keys(cart_items).slice(startIndex,endIndex).map(key => ({[key]:cart_items[key]}));
  results.results = Object.keys(obj2)
    .slice(startIndex, endIndex)
    .map((key) => ({ [key]: obj2[key] }));

  // test that it works with this
  // https://localhost:5000/product/getjson?page=2&limit=5

  console.log(results);

  res.render("checkout/testing123", {
    title,
    results,
  });
  // res.json(results)
  // https://localhost:5000/product/testing?page=1&limit=5
});

router.get("/testing2", (req, res) => {
  title = "Pagination";
  const cart_items = req.session.userCart;
  // user cart is an object that stores product ids as key containing all value (product object) e.g
  // {1:{Name:cab}, 2:{Name: abc}}
  // the inputs
  const page = parseInt(req.query.page);
  const limit = 3;
  // const limit = parseInt(req.query.limit)

  // page - 1 because index start on 0
  // e.g page 1 start index (0* 5 = 0 , end index = 1 * 5 = 5)
  // page 2 start: (2-1) * 5 = 5 , end: 2*5 = 10
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // we want to let user know if there is a page after or before
  const results = {};

  // Retrieve next page data
  // if statement to check if there should be a 'next', when the end index is lesser than the length of object
  if (endIndex < Object.keys(cart_items).length) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  // Retrieve previous page data
  // works similary for the next
  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  results.pages = Math.ceil(Object.keys(cart_items).length / limit);
  console.log("");
  // console.log("=== PAGES ===", results.pages)
  // console.log("=== PREVIOUS === ", results.previous.page)
  // The line with the magic happening
  // Object.keys(cart_items) will return an array of the product ids in the cart
  // Then we slice it based on the input for the page & limit,
  // finally we apply map() on it to retrieve the cart_items with the segmented product ids
  results.results = Object.keys(cart_items)
    .slice(startIndex, endIndex)
    .map((key) => ({ [key]: cart_items[key] }));

  console.log(results.results);
  res.render("checkout/testing1234", {
    title,
    results,
  });
  // https://localhost:5000/product/testing2?page=1&limit=5
});

// Testing new stuff 18 Aug

router.get("/getjson", (req, res) => {
  // const myusers = await User.findAll({})
  // res.json(myusers)
  const cart_items = req.session.userCart;
  const page = parseInt(req.query.page);
  const limit = parseInt(req.query.limit);

  // page - 1 because index start on 0
  const startIndex = (page - 1) * limit;
  const endIndex = page * limit;

  // we want to let user know if there is a page after or before
  const results = {};

  // Retrieve next page data
  if (endIndex < Object.keys(cart_items).length) {
    results.next = {
      page: page + 1,
      limit: limit,
    };
  }

  // Retrieve previous page data
  if (startIndex > 0) {
    results.previous = {
      page: page - 1,
      limit: limit,
    };
  }

  var obj = { 0: "zero", 1: "one", 2: "two", 3: "three", 4: "four" };
  var obj2 = { 0: { num: 1 }, 1: { num: 2 }, 2: { num: 3 }, 3: { num: 4 } };
  results.results = Object.keys(cart_items)
    .slice(startIndex, endIndex)
    .map((key) => ({ [key]: cart_items[key] }));

  // test that it works with this
  // https://localhost:5000/product/getjson?page=2&limit=5

  // Object.keys() returns array of an object's internal properties
  // var result = Object.keys(obj).slice(0,2).map(key => ({[key]:obj[key]}));
  // console.log(result);
  console.log(results.results);
  res.json(results);
  // res.render('checkout/json')
});

router.get("/event", (req, res) => {
  var title = "Event Emitter Test";
  // We import the EMT class from EMT.js, create a new object with it
  // the object inherits the EventEmitter methods like 'on' and 'emit'
  // 'on' is an alias for 'addEventListener'
  // Note that the 'on' method has to placed before the method tahht calls the event.
  new_emt_obj = new EMT();
  // DONT PUT RES AND REQ IN THE PARAMETERS, WILL MAKE THEM UNDEFINED
  new_emt_obj.on("notify_user", () => {
    console.log("Notify User");
    req.session.userCart = {
      3: {
        ID: 3,
        Name: "Eloquent JavaScript",
        Author: "Marijn Haverbeke",
        Publisher: "No Starch Press",
        Genre: "COMPUTERS",
        Price: "20.00",
        Stock: "30",
        Weight: "1008",
        Image:
          "http://books.google.com/books/content?id=9U5I_tskq9MC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
        Quantity: 1,
        SubtotalPrice: "69.00",
        SubtotalWeight: "1008",
      },
    };
    alertMessage(
      res,
      "success",
      `You are at the event emitter page!`,
      "fas fa-sign-in-alt",
      true,
    );
  });

  new_emt_obj.notify_user();

  res.render("checkout/event");
});

export { router };
