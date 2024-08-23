import mySQLDB from "./db_config.js";
import User from "../models/User.js";
import Order from "../models/Order.js";
import OrderItem from "../models/OrderItem.js";
import PendingOrder from "../models/PendingOrder.js";
import PendingOrderItem from "../models/PendingOrderItem.js";
// import ProductAdmin from "../models/ProductAdmin.js";
// import Discount from "../models/Discount.js";

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
	mySQLDB
		.authenticate()
		.then(() => {
			console.log("Bookshop database connected");
		})
		.then(() => {
			/* Define the database model/table relationship associations */

			// User has a one to many relationship with Order(s)
			User.hasMany(Order);
			Order.belongsTo(User);
			// Order has a one to many relationship with OrderItem(s)
			Order.hasMany(OrderItem);
			OrderItem.belongsTo(Order);
			// User has a one to many relationship with PendingOrder(s)
			User.hasMany(PendingOrder);
			PendingOrder.belongsTo(User);
			// PendingOrder has a one to many relationship with PendingOrderItem(s)
			PendingOrder.hasMany(PendingOrderItem);
			PendingOrderItem.belongsTo(PendingOrder);
			
			mySQLDB
				.sync({
					// Creates table if none exists
					force: drop,
				})
				.then(() => {
					console.log("Create tables if none exists");
				})
				.catch((err) => console.log(err));
		})
		.catch((err) => console.log("Error: " + err));
};

export default setUpDB;
