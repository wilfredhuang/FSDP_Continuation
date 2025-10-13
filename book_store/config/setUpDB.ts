// config/setUpDB.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./db_connection.js";

// 🧭 Path fix for .env in ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// 🧩 Import all models to register with Sequelize
import User from "../models/User.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import PendingOrder from "../models/PendingOrder.js";
import PendingOrderItem from "../models/PendingOrderItem.js";
import ProductAdmin from "../models/ProductAdmin.js";
import Coupon from "../models/Coupon.js";
// import Discount from "../models/Discount.js"; // optional, if used

// 🧰 Logger
import { logGreen, logRed, logBlue } from "../helpers/loggerHelper.js";

const setUpDB = async (drop: boolean) => {
  try {
    await sequelize.authenticate();
    logGreen("✅ Database connection successful");

    // Define associations once
    User.hasMany(Order, { foreignKey: "userId" });
    Order.belongsTo(User, { foreignKey: "userId" });

    Order.hasMany(OrderItem, { foreignKey: "orderId" });
    OrderItem.belongsTo(Order, { foreignKey: "orderId" });

    User.hasMany(PendingOrder, { foreignKey: "userId" });
    PendingOrder.belongsTo(User, { foreignKey: "userId" });

    PendingOrder.hasMany(PendingOrderItem, { foreignKey: "pendingOrderId" });
    PendingOrderItem.belongsTo(PendingOrder, { foreignKey: "pendingOrderId" });

    // 🧠 Sync everything that’s imported (auto includes ProductAdmin, Coupon)
    await sequelize.sync({ alter: !drop, force: drop });

    logBlue("✅ All models synchronized successfully (ordered).");
  } catch (err) {
    logRed("❌ Database setup failed:");
    console.error(err);
  }
};

export default setUpDB;
