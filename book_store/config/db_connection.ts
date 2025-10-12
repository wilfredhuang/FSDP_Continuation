import mySQLDB from "./db_config";
import User from "../models/User";
import Order from "../models/Order";
import OrderItem from "../models/OrderItem";
import PendingOrder from "../models/PendingOrder";
import PendingOrderItem from "../models/PendingOrderItem";
import {
  logRed,
  logGreen,
  logBlue,
  logYellow,
  logMagenta,
  logCyan,
} from "../helpers/loggerHelper";

const setUpDB = async (drop: boolean): Promise<void> => {
  try {
    await mySQLDB.authenticate();
    logGreen("Bookshop database connected");

    // Define associations
    User.hasMany(Order);
    Order.belongsTo(User);

    Order.hasMany(OrderItem);
    OrderItem.belongsTo(Order);

    User.hasMany(PendingOrder);
    PendingOrder.belongsTo(User);

    PendingOrder.hasMany(PendingOrderItem);
    PendingOrderItem.belongsTo(PendingOrder);

    await mySQLDB.sync({ force: drop });
    console.log("Tables synced successfully");
  } catch (err) {
    logRed("Database connection error:", (err as Error).message);
  }
};

export default setUpDB;
