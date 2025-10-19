// ------------------------------------------------------------
// routes/adminRoutes.ts (strictly typed)
// ------------------------------------------------------------
import express from "express";
import AdminJS from "adminjs";
import AdminJSExpress from "@adminjs/express";
import { Database, Resource } from "@adminjs/sequelize";
//import { sequelize } from "../config/db_connection.js";
import sequelize from "../config/db_connection.js"; // <-- default import
import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import Discount from "../models/Discount.js";
import { logCyan, logGreen } from "../helpers/loggerHelper.js";
AdminJS.registerAdapter({ Database, Resource });
const router = express.Router();
// ------------------------------------------------------------
// Initialize AdminJS
// ------------------------------------------------------------
const adminOptions = {
    databases: [sequelize],
    rootPath: "/admin",
    branding: {
        companyName: "Acacia Bookstore Admin",
        logo: false,
        softwareBrothers: false,
    },
    resources: [
        { resource: Product },
        { resource: User },
        { resource: Order },
        { resource: Coupon },
        { resource: Discount },
    ],
};
const admin = new AdminJS(adminOptions);
const adminRouter = AdminJSExpress.buildRouter(admin);
// ------------------------------------------------------------
// Mount under /admin
// ------------------------------------------------------------
router.use(admin.options.rootPath, adminRouter);
// ------------------------------------------------------------
// Middleware logging for visibility
// ------------------------------------------------------------
router.use((req, _res, next) => {
    logCyan(`[Admin] ${req.method} ${req.originalUrl}`);
    next();
});
// ------------------------------------------------------------
// Example health route (optional)
// ------------------------------------------------------------
router.get("/admin/health", (_req, res) => {
    logGreen("[Admin] Health check OK");
    res.json({ status: "ok" });
});
export { router };
//# sourceMappingURL=adminRoutes.js.map