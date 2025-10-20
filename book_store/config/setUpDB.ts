// ------------------------------------------------------------
// config/setUpDB.ts
// ------------------------------------------------------------
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import sequelize from "./db_connection.js";
import { logGreen, logRed, logBlue } from "../helpers/loggerHelper.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });

// ------------------------------------------------------------
// Dynamically import all models (use .ts to avoid stale .js definitions)
// ------------------------------------------------------------
async function importAllModels() {
  await import("../models/User.js");
  await import("../models/Order.js");
  await import("../models/OrderItem.js");
  await import("../models/PendingOrder.js");
  await import("../models/PendingOrderItem.js");
  await import("../models/ProductAdmin.js");
  await import("../models/Discount.js");
  await import("../models/Coupon.js");
}

// ------------------------------------------------------------
// Set up database + associations
// ------------------------------------------------------------
const setUpDB = async (drop: boolean) => {
  try {
    await sequelize.authenticate();
    logGreen("✅ Database connection successful");

    // Ensure all models are evaluated
    await importAllModels();

    // Import model classes directly
    const { default: User } = await import("../models/User.js");
    const { default: Order } = await import("../models/Order.js");
    const { default: OrderItem } = await import("../models/OrderItem.js");
    const { default: PendingOrder } = await import("../models/PendingOrder.js");
    const { default: PendingOrderItem } = await import(
      "../models/PendingOrderItem.js"
    );
    const { default: ProductAdmin } = await import("../models/ProductAdmin.js");
    const { default: Discount } = await import("../models/Discount.js");

    // ------------------------------------------------------------
    // Relationships
    // ------------------------------------------------------------
    User.hasMany(Order, {
      foreignKey: { name: "userId", allowNull: false },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    Order.belongsTo(User, {
      foreignKey: { name: "userId", allowNull: false },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    Order.hasMany(OrderItem, {
      foreignKey: { name: "orderId", allowNull: false },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
    OrderItem.belongsTo(Order, {
      foreignKey: { name: "orderId", allowNull: false },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });

    User.hasMany(PendingOrder, { foreignKey: "userId" });
    PendingOrder.belongsTo(User, { foreignKey: "userId" });

    PendingOrder.hasMany(PendingOrderItem, { foreignKey: "pendingOrderId" });
    PendingOrderItem.belongsTo(PendingOrder, { foreignKey: "pendingOrderId" });

    Discount.belongsTo(ProductAdmin, {
      foreignKey: { name: "uid", allowNull: false },
    });

    // ------------------------------------------------------------
    // Debug output
    // ------------------------------------------------------------
    logBlue("🧩 Registered Models before sync:");
    console.table(
      Object.entries(sequelize.models).map(([key, model]) => ({
        name: key,
        tableName: (model as any).getTableName?.()?.toString?.() ?? "unknown",
      })),
    );

    // ------------------------------------------------------------
    // Sync database
    // ------------------------------------------------------------
    await sequelize.sync({ alter: !drop, force: drop });
    logBlue("✅ All models synchronized successfully.");
  } catch (err) {
    logRed("❌ Database setup failed:");
    console.error(err);
  }
};

export default setUpDB;
