/**
 * ============================================================
 * 📘 ACACIA BOOKSTORE SERVER (TypeScript Edition)
 * ------------------------------------------------------------
 * This file bootstraps the Express web app, configures sessions,
 * authentication, view engine, and routes.
 *
 * New Dev Quickstart:
 *  1. Configure .env (see README)
 *  2. Run `npm run dev`
 *  3. Visit https://localhost:5000
 * ============================================================
 */

import dotenv from "dotenv";
import path from "path";
import fs from "fs";
import https from "https";
import express, { Request, Response, NextFunction } from "express";
import moment from "moment";

/* ============================================================
   🔧 0. Ambient Typings & Session Extensions
   ------------------------------------------------------------
   These extend Express.Session to include our custom fields
   (cart totals, coupon info, shipping, etc.)
   ============================================================ */
import "express-session";
declare module "express-session" {
  interface SessionData {
    userCart?: Record<string, any>;
    coupon_object?: any;
    coupon_type?: string | null;
    cart_subtotal_initial?: number;
    cart_subtotal_final?: number;
    cart_discount_savings?: number;
    cart_coupon_savings?: number;
    cart_shipping_fee?: number;
    cart_grandtotal?: number;
    shipment_lineone?: string;
    shipment_country?: string;
    public_coupon?: any;
  }
}

/* ============================================================
   🌍 1. Load Environment Variables
   ============================================================ */
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "./.env") });

/* ============================================================
   ⚙️ 2. Core Modules
   ============================================================ */
import session, { SessionOptions } from "express-session";
import connectMySQL, {
  Options as MySQLStoreOptions,
} from "express-mysql-session";
import cookieParser from "cookie-parser";
import bodyParser from "body-parser";
import methodOverride from "method-override";
import { engine } from "express-handlebars";
import { allowInsecurePrototypeAccess } from "@handlebars/allow-prototype-access";
import Handlebars from "handlebars";

/* ============================================================
   🔐 3. Authentication & Security
   ============================================================ */
import passport from "passport";
import "./config/passport.ts"; // Registers strategy definitions
import flash from "connect-flash";
import FlashMessenger from "flash-messenger";

/* ============================================================
   ✉️ 4. Email & Utility Libraries
   ============================================================ */
import nodemailer from "nodemailer"; // For password reset / order emails

/* ============================================================
   🧱 5. Database & Helper Imports
   ============================================================ */
import setUpDB from "./config/setUpDB.js";
import sequelize from "./config/db_connection.js";
import helper from "./helpers/hbs.js";
import carthelper from "./helpers/cartHelper.js";
import when from "./helpers/for_loop.js";
import {
  logRed,
  logGreen,
  logYellow,
  logCyan,
} from "./helpers/loggerHelper.js";

/* ============================================================
   🚦 6. Express App Initialization
   ============================================================ */
const app = express();

/* ============================================================
   🗄️ 7. Database Connection
   ============================================================ */
setUpDB(false); // Establishes Sequelize + MySQL connection , do true to drop and re-sync tables, false to just sync

/* ============================================================
   🖼️ 8. Handlebars View Engine Setup
   ============================================================ */
app.engine(
  "handlebars",
  engine({
    defaultLayout: "main",
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    helpers: {
      // Core display helpers
      convertUpper: helper.convertUpper,
      adminCheck: helper.adminCheck,
      formatDate: helper.formatDate,
      formatDeliveryStatus: helper.formatDeliveryStatus,

      // Pagination / conditionals
      when: when.when,
      loopNTimes: helper.loopNTimes,
      checkPage: helper.checkPage,

      // Cart helpers
      checkEmptyCart: carthelper.checkEmptyCart,
      countCartQty: carthelper.countCartQty,
      checkShipmentCountrySingapore: carthelper.checkShipmentCountrySingapore,
      checkPromo: carthelper.checkPromo,
      convertDiscount: carthelper.convertDiscount,
      displayCouponType: carthelper.displayCouponType,
      checkProductPriceDiscounted: carthelper.checkProductPriceDiscounted,
    },
  }),
);
app.set("view engine", "handlebars");

/* ============================================================
   🧩 9. Core Middleware Stack
   ============================================================ */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(methodOverride("_method"));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

/* ============================================================
   💾 10. Session Management (MySQL Store)
   ============================================================ */
const MySQLStore = connectMySQL(session as any);
const dbOptions: MySQLStoreOptions = {
  host: process.env.DB_HOST,
  port: 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  clearExpired: true,
  checkExpirationInterval: 900_000,
  expiration: 900_000,
};
const sessionStore = new MySQLStore(dbOptions);
const sessionConfig: SessionOptions & { key: string } = {
  key: "vidjot_session",
  secret: "tojiv",
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: true, // Ensure HTTPS
  },
};
app.use(session(sessionConfig));

/* ============================================================
   🧍 11. Passport Authentication
   ============================================================ */
app.use(passport.initialize());
app.use(passport.session());

/* ============================================================
   💬 12. Flash Messages
   ============================================================ */
app.use(flash());
app.use(FlashMessenger.middleware);

/* ============================================================
   🧠 13. Global Template Variables (accessible in all views)
   ============================================================ */
app.use((req: Request, res: Response, next: NextFunction) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = (req as any).user || null;

  // Cart + shipment data
  Object.assign(res.locals, {
    billingAddress: req.session.shipment_lineone,
    countryShipment: req.session.shipment_country,
    UC: req.session.userCart,
    public_coupon: req.session.public_coupon,
    cart_subtotal_initial: req.session.cart_subtotal_initial,
    cart_subtotal_final: req.session.cart_subtotal_final,
    cart_discount_savings: req.session.cart_discount_savings,
    cart_coupon_savings: req.session.cart_coupon_savings,
    cart_shipping_fee: req.session.cart_shipping_fee,
    cart_grandtotal: req.session.cart_grandtotal,
  });

  next();
});

/* ============================================================
   🛒 14. Initialize Session Defaults (Coupon + Cart)
   ============================================================ */
import Coupon from "./models/Coupon.js";

app.use(async (req: Request, res: Response, next: NextFunction) => {
  try {
    logCyan(`[Session Init] Checking session variables...`);

    // Ensure cart-related session vars exist
    if (!req.session.userCart) {
      logYellow("🛍️ Initializing empty cart...");
      Object.assign(req.session, {
        userCart: {},
        coupon_object: null,
        coupon_type: null,
        cart_subtotal_initial: 0,
        cart_subtotal_final: 0,
        cart_discount_savings: 0,
        cart_coupon_savings: 0,
        cart_shipping_fee: 0,
        cart_grandtotal: 0,
      });
    }

    // Handle public coupon
    const existingCoupon = await (Coupon as any).findOne({
      where: { public: 1 },
    });
    if (!existingCoupon) {
      req.session.public_coupon = null;
    } else if (moment().isAfter(existingCoupon.expiry)) {
      await existingCoupon.destroy();
      logRed(`🚫 Expired coupon ${existingCoupon.code} removed.`);
      req.session.public_coupon = null;
    } else {
      req.session.public_coupon = existingCoupon;
      logGreen(`✅ Public coupon ${existingCoupon.code} active.`);
    }

    req.session.save(() => {});
  } catch (error) {
    logRed(
      "❌ Error initializing session variables:",
      (error as Error).message,
    );
  }
  next();
});

/* ============================================================
   🚏 15. Route Mounting
   ============================================================ */
import { router as mainRoute } from "./routes/mainRoutes.js";
import { router as userRoute } from "./routes/userRoutes.js";
import { router as productRoute } from "./routes/productRoutes.js";
import { router as deliveryRoute } from "./routes/cartRoutes.js";
import { router as adminRoute } from "./routes/adminRoutes.js";

app.use("/", mainRoute);
app.use("/user", userRoute);
app.use("/product", productRoute);
app.use("/delivery", deliveryRoute);
app.use("/admin", adminRoute);

/* ============================================================
   🧯 16. Error Handling
   ============================================================ */
app.use((req: Request, res: Response) => res.status(404).render("404"));
app.use((err: Error, req: Request, res: Response, _next: NextFunction) => {
  console.error(err.stack);
  res.status(500).render("500");
});

/* ============================================================
   🚀 17. HTTPS Server Launch
   ============================================================ */
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.crt"),
};
const port = 5000;
https.createServer(options, app).listen(port, () => {
  logGreen(`🚀 Server running at https://localhost:${port}`);
});

export default app;
