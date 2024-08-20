import mySQLDB from "./db_config.js";
import user from "../models/User.js";
import order from "../models/Order.js";
import ProductAdmin from "../models/ProductAdmin.js";
import Discount from "../models/Discount.js";
import orderItem from "../models/OrderItem.js";
import pending_order from "../models/PendingOrder.js";
import pending_orderItem from "../models/PendingOrderItem.js";

// If drop is true, all existing tables are dropped and recreated
const setUpDB = (drop) => {
	mySQLDB
		.authenticate()
		.then(() => {
			console.log("Bookshop database connected");
		})
		.then(() => {
			/*               Defines the relationship where a user has many videos.               
            In this case the primary key from user will be a foreign key               
            in video.             */

			//user.hasMany
			//Priority work by Hasan 31/7/2020
			//user.hasMany(cartItem);

			user.hasMany(order);
			order.belongsTo(user);
			order.hasMany(orderItem);
			orderItem.belongsTo(order);
			user.hasMany(pending_order);
			pending_order.belongsTo(user);
			pending_order.hasMany(pending_orderItem);
			pending_orderItem.belongsTo(pending_order);

			//order.hasMany(cartItem);
			//cartItem.belongsTo(order);
			//user.hasMany(order)
			// Discount.belongsTo(ProductAdmin,{
			//     foreignKey: {
			//         name:'uid',
			//         allowNull:false
			//     }
			// });

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
