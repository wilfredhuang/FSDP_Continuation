import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import { engine } from 'express-handlebars';

import methodOverride from "method-override";
import Handlebars from "handlebars";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";

//NodeMailer
import nodemailer from "nodemailer";

// Environment variables
import * as dotenv from "dotenv";
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

//Models
import order from "../book_store/models/Order.js";

//nodemailer
let transporter = nodemailer.createTransport({
	host: "smtp.googlemail.com",
	port: 465,
	secure: true, // true for 465, false for other ports
	auth: {
		user: "superlegitemail100percent@gmail.com", // generated ethereal user
		pass: "Passw0rdyes", // generated ethereal password
	},
	tls: {
		rejectUnauthorized: false,
	},
});

//https
import openssl from "openssl-nodejs";
import https from "https";
import fs from "fs";

const options = {
	key: fs.readFileSync("key.pem"),
	cert: fs.readFileSync("cert.crt"),
};

// Stripe Payment System
// Set your secret key. Remember to switch to your live secret key in production!
import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2020-03-02",
});

// Passport - Setting Authentication - P4A2
import passport from "passport";

// Load routes
import { router as mainRoute } from "./routes/main.js";
import { router as userRoute } from "./routes/user.js";
import { router as productRoute } from "./routes/product.js";
import { router as deliveryRoute } from "./routes/cart.js";
import { router as checkoutRoute } from "./routes/checkout.js";
import { router as adminRoute } from "./routes/admin.js";

// Library to use MySQL to store session objects
import MySQLStore from "express-mysql-session";

// Messaging libraries
import flash from "connect-flash";
import FlashMessenger from "flash-messenger";

// Bring in database connection
import setUpDB from "./config/DBConnection.js";

// Connects to MySQL database
setUpDB(false); // To set up database with new tables set (true)

// Passport Config - P4A2
import localStrategy from "./config/passport.js";
localStrategy(passport);

import helper from "./helpers/hbs.js";
import carthelper from  "./helpers/cartHelper.js";
import when from "./helpers/for_loop.js";

// creates an express server
const app = express();

app.engine(
	'handlebars',
	engine({
	  defaultLayout: 'main',
	  helpers: {
		convertUpper: helper.convertUpper,
		adminCheck: helper.adminCheck,
		checkEmptyCart: carthelper.checkEmptyCart,
		formatDate: helper.formatDate,
		formatDeliveryStatus: helper.formatDeliveryStatus,
		when: when.when,
		loopNTimes: helper.loopNTimes,
		checkPage: helper.checkPage,

		// Cart Helpers
		countCartQty: carthelper.countCartQty,
		checkShipmentCountrySingapore: carthelper.checkShipmentCountrySingapore,
		checkPromo: carthelper.checkPromo,
		convertDiscount: carthelper.convertDiscount,
		displayCouponType: carthelper.displayCouponType,
		checkProductPriceDiscounted: carthelper.checkProductPriceDiscounted,
	  },
	  handlebars: allowInsecurePrototypeAccess(Handlebars), // Ensure `allowInsecurePrototypeAccess` is used correctly
	})
  );
  app.set('view engine', 'handlebars');

// Body parser middleware to parse HTTP body to read post data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files

// https://bobbyhadz.com/blog/javascript-dirname-is-not-defined-in-es-module-scope#fix-__dirname-is-not-defined-in-es-module-scope-in-js
// The "__dirname is not defined in ES module scope" error occurs when we try to use the __dirname global variable in an ES module file.
//The __dirname or __filename global variables are not available in ECMAScript module files.
const __filename = fileURLToPath(import.meta.url);
console.log(__filename);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride("_method"));

// Enables session to be stored using browser's Cookie
app.use(cookieParser());

// Example middleware function (replace with your actual middleware)
app.use((req, res, next) => {
	console.log("Start Session Store");
	next();
});

const dbOptions = {
	host: process.env.MYSQLDB_HOST,
	port: 3306,
	user: process.env.MYSQLDB_USERNAME,
	password: process.env.MYSQLDB_PASSWORD,
	database: process.env.MYSQLDB_DATABASE,
	clearExpired: true,
	checkExpirationInterval: 900000, // How frequently expired sessions will be cleared; milliseconds
	expiration: 900000, // The maximum age of a valid session; milliseconds
  };
  
// Initialize MySQLStore with session
const MySQLStoreInit = MySQLStore(session);
const sessionStore = new MySQLStoreInit(dbOptions);

// Express session middleware - uses MySQL to store session
app.use(
	session({
		key: "vidjot_session",
		secret: "tojiv",
		store: sessionStore,
		resave: false,
		saveUninitialized: false,
		cookie: {
			secure: true,
		},
	})
);

app.use((req, res, next) => {
	console.log("End Session Store");
	next();
});

// Initilize Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Two flash messenging libraries - Flash (connect-flash) and Flash Messenger
app.use(flash());
app.use(FlashMessenger.middleware);

// Global variables for view template
// make the session data available to the view templates without needing to pass them explicitly
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash("success_msg");
	res.locals.error_msg = req.flash("error_msg");
	res.locals.error = req.flash("error");
	res.locals.user = req.user || null;
	res.locals.billingAddress = req.session.billingAddress;
	res.locals.countryShipment = req.session.countryShipment;
	res.locals.UC = req.session.userCart;
	res.locals.public_coupon = req.session.public_coupon;
	res.locals.cart_subtotal_initial = req.session.cart_subtotal_initial;
	res.locals.cart_subtotal_final = req.session.cart_subtotal_final;
	res.locals.cart_discount_savings = req.session.cart_discount_savings;
	res.locals.cart_coupon_savings = req.session.cart_coupon_savings
	res.locals.cart_shipping_fee = req.session.cart_shipping_fee;
	res.locals.cart_grandtotal = req.session.cart_grandtotal
	next();

});


// Initialize important session variables like userCart
import Coupon from "./models/Coupon.js";
import moment from "moment";
app.use(async (req, res, next) => {
    try {
        if (!req.session.userCart) {
            req.session.userCart = {};
            req.session.coupon_object = null;
			req.session.coupon_type = null;
			req.session.cart_subtotal_initial = 0;
			req.session.cart_subtotal_final = 0;
			req.session.cart_discount_savings = 0;
			req.session.cart_coupon_savings = 0;
			req.session.cart_shipping_fee = 0;
			req.session.cart_grandtotal = 0;
        } else {
			// console.log("=== Checking Session Variables ===")
			// console.log(req.session)
		}

        // Check and set the public coupon in the session
        if (!req.session.public_coupon) {
            console.log("No coupon value found in session var, searching...");
            const coupon_object = await Coupon.findOne({ where: { public: 1 } });
            req.session.public_coupon = coupon_object;
            req.session.save();
        } else {
            try {
                console.log("Existing coupon value found in session, validating...");
                const coupon_object = await Coupon.findOne({ where: { public: 1 } });

                if (coupon_object) {
                    console.log("Public Coupon " + coupon_object.code + " found");

                    // Handle Coupon Expiry
                    if (moment().isAfter(coupon_object.expiry)) {
                        await coupon_object.destroy();
                        console.log(`Coupon ${coupon_object.code} expired and destroyed.`);
                        req.session.public_coupon = null;
                        req.session.save();
                    }
                } else {
                    req.session.public_coupon = null;
                    req.session.save();
                }
            } catch (error) {
                console.log("Error validating public coupon:", error);
            }
        }
    } catch (error) {
        console.error("Error initializing session variables:", error);
    }
    next();
});


// Use Routes
app.use("/", mainRoute); // uses main.js routing under ./routes
app.use("/user", userRoute);
app.use("/product", productRoute);
app.use("/delivery", deliveryRoute);
app.use("/checkout", checkoutRoute);
app.use("/admin", adminRoute);

//Renders 404 Page if user types in invalid URL
app.use(function (req, res, next) {
	res.status(404).render("404");
});

//Renders 500 Page if there is internal server error
app.use(function (req, res, next) {
	res.status(500).render("500");
});

const port = 5000;

// To actually serve requests, the listen method needs to be called on the server object.
https.createServer(options, app).listen(port);


/* changed to https so this is not needed
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
*/
//remember to use https://localhost:5000/


