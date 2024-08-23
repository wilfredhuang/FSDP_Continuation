import Sequelize from "sequelize";
import db from "../config/db_config.js";

const Order = db.define("order", {
	fullName: { type: Sequelize.STRING },
	phoneNumber: { type: Sequelize.STRING },
	address: { type: Sequelize.STRING },
	address1: { type: Sequelize.STRING },
	city: { type: Sequelize.STRING },
	country: { type: Sequelize.STRING },
	postalCode: { type: Sequelize.STRING },
	//add subtotal here
	deliverFee: { type: Sequelize.DECIMAL(10, 2) },
	subtotalPrice: { type: Sequelize.DECIMAL(10, 2) },
	totalPrice: { type: Sequelize.DECIMAL(10, 2) },
	shippingId: { type: Sequelize.STRING },
	addressId: { type: Sequelize.STRING },
	trackingId: { type: Sequelize.STRING },
	trackingCode: { type: Sequelize.STRING },
	dateStart: { type: Sequelize.DATE }, //rename this to order date
	dateEnd: { type: Sequelize.DATE }, //remove this
	deliveryStatus: { type: Sequelize.STRING },
});



// const Order = db.define("order", {
// 	full_name: { type: Sequelize.STRING },
// 	phone_number: { type: Sequelize.STRING },
// 	address_line_one: { type: Sequelize.STRING },
// 	address_line_two: { type: Sequelize.STRING },
// 	city: { type: Sequelize.STRING },
// 	country: { type: Sequelize.STRING },
// 	postal_code: { type: Sequelize.STRING },
// 	//add subtotal here
// 	shipping_fee: { type: Sequelize.DECIMAL(10, 2) },
// 	subtotal_price: { type: Sequelize.DECIMAL(10, 2) },
// 	grand_total_price: { type: Sequelize.DECIMAL(10, 2) },
// 	shipment_id: { type: Sequelize.STRING },
// 	address_id: { type: Sequelize.STRING },
// 	tracker_id: { type: Sequelize.STRING },
// 	tracker_code: { type: Sequelize.STRING },
// 	order_date: { type: Sequelize.DATE }, //rename this to order date
// 	dateEnd: { type: Sequelize.DATE }, //remove this
// 	delivery_status: { type: Sequelize.STRING },
// });

export default Order;
