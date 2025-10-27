// ------------------------------------------------------------
// routes/adminRoutes.ts (strictly typed)
// ------------------------------------------------------------
import express, { Request, Response, NextFunction } from "express";
import AdminJS, { ValidationError } from "adminjs";
import AdminJSExpress from "@adminjs/express";
import AdminJSSequelize from "@adminjs/sequelize";
import { Database, Resource } from "@adminjs/sequelize";
//import { sequelize } from "../config/db_connection.js";
import sequelize from "../config/db_connection.js"; // <-- default import

import Product from "../models/Product.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import Coupon from "../models/Coupon.js";
import Discount from "../models/Discount.js";
import type { ActionRequest, ActionResponse, ActionContext } from "adminjs";


import { logCyan, logGreen } from "../helpers/loggerHelper.js";

AdminJS.registerAdapter({ Database, Resource });

const router = express.Router();

// ------------------------------------------------------------
// Initialize AdminJS
// ------------------------------------------------------------
import AdminJS, { ValidationError } from "adminjs";

const adminOptions = {
  rootPath: "/admin",
  branding: {
    companyName: "Acacia Bookstore Admin",
    logo: false as const,
    softwareBrothers: false,
  },
  resources: [
    {
      resource: User,
      options: {
        actions: {
          new: {
            before: async (request: any) => {
              const { email, password } = request.payload;

              if (!email) {
                throw new ValidationError({
                  email: { message: "Email is required" },
                });
              }

              if (!password || password.length < 4) {
                throw new ValidationError({
                  password: { message: "Password must be at least 4 characters long" },
                });
              }

              return request;
            },

            after: async (response: any, request: any, context: any) => {
              console.log("✅ Created user:", context.record?.params);
              return response;
            },
          },
        },
      },
    },
  ],
};


const admin = new AdminJS(adminOptions);
const adminRouter = AdminJSExpress.buildRouter(admin);

// ------------------------------------------------------------
// Mount under /admin
// ------------------------------------------------------------
router.use("/", adminRouter);

// ------------------------------------------------------------
// Log any Sequelize or AdminJS errors (with clear details)
// ------------------------------------------------------------
router.use((err: any, req: Request, res: Response, next: NextFunction) => {
  if (err) {
    // Sequelize model-level validation (e.g., NOT NULL, unique)
    if (err.name === "SequelizeValidationError") {
      console.error("❌ Sequelize validation error:");
      err.errors.forEach((e: any) => {
        console.error(`• ${e.path}: ${e.message}`);
      });
    }
    // AdminJS validation (e.g., thrown via AdminJS.ValidationError)
    else if (err.name === "ValidationError") {
      console.error("❌ AdminJS validation error:");
      console.error(err.message || JSON.stringify(err, null, 2));
    }
    // Generic fallback
    else {
      console.error("❌ Unknown AdminJS/Express error:", err);
    }
  }

  next(err);
});


// ------------------------------------------------------------
// Middleware logging for visibility
// ------------------------------------------------------------
router.use((req: Request, _res: Response, next: NextFunction) => {
  logCyan(`[Admin] ${req.method} ${req.originalUrl}`);
  next();
});

// ------------------------------------------------------------
// Example health route (optional)
// ------------------------------------------------------------
router.get("/admin/health", (_req: Request, res: Response) => {
  logGreen("[Admin] Health check OK");
  res.json({ status: "ok" });
});

export { router };
