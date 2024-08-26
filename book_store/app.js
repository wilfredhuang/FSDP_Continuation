// 1. Load Environment Variables
import * as dotenv from "dotenv";
dotenv.config();

// 2. Import Core Modules
import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import https from "https";

// 3. Import Middleware
import session from "express-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import { engine } from "express-handlebars";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import Handlebars from "handlebars";

// 4. Import Authentication & Security Modules
import passport from "passport";
import MySQLStore from "express-mysql-session";
import flash from "connect-flash";
import FlashMessenger from "flash-messenger";

// 5. Import Email & Utility Libraries
import nodemailer from "nodemailer";
import openssl from "openssl-nodejs";
import moment from "moment";

// 6. Import Helpers and Config
import setUpDB from "./config/db_connection.js";
import localStrategy from "./config/passport.js";
import helper from "./helpers/hbs.js";
import carthelper from "./helpers/cartHelper.js";
import when from "./helpers/for_loop.js";
import { logRed, logGreen, logBlue, logYellow, logMagenta, logCyan } from "./helpers/loggerHelper.js";

// 7. Import Routes
import { router as mainRoute } from "./routes/mainRoutes.js";
import { router as userRoute } from "./routes/userRoutes.js";
import { router as productRoute } from "./routes/productRoutes.js";
import { router as deliveryRoute } from "./routes/cartRoutes.js";
import { router as adminRoute } from "./routes/adminRoutes.js";

// 8. Initialize Express App
const app = express();

// 9. Setup Database Connection
setUpDB(false); // Establishes a connection to the database

// 10. Setup Handlebars View Engine
app.engine('handlebars', engine({
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
}));
app.set('view engine', 'handlebars');

// 11. Setup Middleware for Parsing and Static Files
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "public")));

// 12. Method Override Middleware
app.use(methodOverride("_method"));

// 13. Cookie Parser Middleware
app.use(cookieParser());

// 14. Session Management with MySQLStore
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

const MySQLStoreInit = MySQLStore(session);
const sessionStore = new MySQLStoreInit(dbOptions);

app.use(session({
  key: "vidjot_session",
  secret: "tojiv",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true,
  },
}));

// 15. Passport Authentication Middleware
app.use(passport.initialize());
app.use(passport.session());
localStrategy(passport);

// 16. Flash Messaging Middleware
app.use(flash());
app.use(FlashMessenger.middleware);

// 17. Global Variables for Views
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
  res.locals.cart_coupon_savings = req.session.cart_coupon_savings;
  res.locals.cart_shipping_fee = req.session.cart_shipping_fee;
  res.locals.cart_grandtotal = req.session.cart_grandtotal;
  next();
});

// 18. Initialize Important Session Variables
import Coupon from "./models/Coupon.js";
app.use(async (req, res, next) => {
  try {

    logCyan(`[app.js] Initialize Session Var. Middleware`)

    if (!req.session.userCart) {
      logYellow("[app.js] No user cart session var. found! Creating..")
      req.session.userCart = {};
      req.session.coupon_object = null;
      req.session.coupon_type = null;
      req.session.cart_subtotal_initial = 0;
      req.session.cart_subtotal_final = 0;
      req.session.cart_discount_savings = 0;
      req.session.cart_coupon_savings = 0;
      req.session.cart_shipping_fee = 0;
      req.session.cart_grandtotal = 0;
    }

    if (!req.session.public_coupon) {
      logYellow(`[app.js] No coupon value found in session var, searching...`)
      const coupon_object = await Coupon.findOne({ where: { public: 1 } });
      req.session.public_coupon = coupon_object;
      req.session.save();
    } else {
      try {
        logYellow("[app.js] Existing coupon value found in session, validating...");
        const coupon_object = await Coupon.findOne({ where: { public: 1 } });

        if (coupon_object) {
          logGreen("[app.js] Public Coupon " + coupon_object.code + " found");

          // Handle Coupon Expiry
          if (moment().isAfter(coupon_object.expiry)) {
            await coupon_object.destroy();
            logRed(`[app.js] Coupon ${coupon_object.code} expired and destroyed.`);
            req.session.public_coupon = null;
            req.session.save();
          }
        } else {
          req.session.public_coupon = null;
          req.session.save();
        }
      } catch (error) {
        logRed("[app.js] Error validating public coupon:", error);
      }
    }
  } catch (error) {
    logRed("[app.js] Error initializing session variables:", error);
  }
  next();
});

// 19. Use Routes
app.use("/", mainRoute);
app.use("/user", userRoute);
app.use("/product", productRoute);
app.use("/delivery", deliveryRoute);
app.use("/admin", adminRoute);

// 20. Error Handling
app.use(function (req, res, next) {
  res.status(404).render("404");
});

app.use(function (req, res, next) {
  res.status(500).render("500");
});

// 21. Start HTTPS Server
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.crt"),
};

const port = 5000;
https.createServer(options, app).listen(port);

// NOTE: Use https://localhost:5000/ to access the server.
