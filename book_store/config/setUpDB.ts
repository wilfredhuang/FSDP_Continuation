// config/setUpDB.ts
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, "../.env") });
import sequelize from "./db_connection.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import PendingOrder from "../models/PendingOrder.js";
import PendingOrderItem from "../models/PendingOrderItem.js";
// import ProductAdmin from "../models/ProductAdmin";
// import Discount from "../models/Discount";
import {
  logGreen,
  logRed,
  logBlue,
} from "../helpers/loggerHelper.js";

const setUpDB = async (drop: boolean) => {
  try {
    await sequelize.authenticate();
    logGreen("✅ Database connection successful");

    // Define associations (do this once)
    User.hasMany(Order, { foreignKey: "userId" });
    Order.belongsTo(User, { foreignKey: "userId" });

    Order.hasMany(OrderItem, { foreignKey: "orderId" });
    OrderItem.belongsTo(Order, { foreignKey: "orderId" });

    User.hasMany(PendingOrder, { foreignKey: "userId" });
    PendingOrder.belongsTo(User, { foreignKey: "userId" });

    PendingOrder.hasMany(PendingOrderItem, { foreignKey: "pendingOrderId" });
    PendingOrderItem.belongsTo(PendingOrder, { foreignKey: "pendingOrderId" });

    // await sequelize.sync({ alter: !drop, force: drop }); // alter keeps data; force wipes it
    // logBlue("✅ All models synchronized, Database Connected.");
    await User.sync({ force: drop });
await Order.sync({ force: drop });
await OrderItem.sync({ force: drop });
await PendingOrder.sync({ force: drop });
await PendingOrderItem.sync({ force: drop });

logBlue("✅ All models synchronized successfully (ordered).");
  } catch (err) {
    logRed("❌ Database setup failed:");
    console.error(err);
  }
};

export default setUpDB;
