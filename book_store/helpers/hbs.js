//const moment = require("moment");

import moment from "moment";
export default {
	formatDate: function (date, targetFormat) {
		if (date == null) {
			return "Unavailable";
		} else {
			return moment(date).format(targetFormat);
		}
	},

	//radioCheck
	radioCheck: function (value, radioValue) {
		if (value != radioValue) {
			return "";
		}
		return "checked";
	},

	//replaceCommas note : value == string
	replaceCommas: function (value) {
		if (value == "") {
			// empty string
			return "None";
		} else {
			return value.replace(/,/g, " | ");
		}
	},

	adminCheck: function (value) {
		if (value != null && value.isadmin == true) {
			console.log("Admin Account Detected");
			return true;
		} else if (value != null) {
			console.log("User Account Detected");
			return false;
		} else {
			console.log("Not logged in");
			return false;
		}
	},

	convertUpper: function (value) {
		return value.toUpperCase();
	},

	emptyCart: function (userCart) {
		for (var ID in userCart) {
			console.log(ID);
			if (userCart.hasOwnProperty(ID)) return false;
		}
		return true;
	},
	capitaliseFirstLetter: function (string) {
		return string.charAt(0).toUpperCase() + string.slice(1);
	},

	cartQty: function (userCart) {
		let totalqty = 0;
		for (z in userCart) {
			let qty = userCart[z].Quantity;
			totalqty = parseInt(totalqty) + parseInt(qty);
		}
		return totalqty;
	},

	remove_undersocre: function (string) {
		return string.replace(/ /g, "_");
	},

	checkPromo: function (public_coupon_session_obj) {
		if (public_coupon_session_obj == null) {
			return false;
		} else {
			return true;
		}
	},

	convertDiscount: function (discount) {
		let converted_discount = discount * 100;
		return converted_discount;
	},

	displayCouponType: function (coupon_type) {
		if (coupon_type == "OVERALL") {
			return "total order";
		} else if (coupon_type == "SHIP") {
			return "shipping fee";
		} else if (coupon_type == "SUB") {
			return "subtotal (excluding shipping charge)";
		}
	},

	isSg: function (country_var) {
		console.log(`The user country is ${country_var}`);
		if (country_var == "SG") {
			return true;
		} else {
			return false;
		}
	},

	get_old_subtotal: function (qty, price, new_sub) {
		og_subtotal = (qty * price).toFixed(2);
		if (og_subtotal != new_sub) {
			return og_subtotal;
		} else {
			return;
		}
	},

	check_subtotal: function (og_subtotal, new_subtotal) {
		if (og_subtotal == new_subtotal) {
			return false;
		} else if (!isNaN(og_subtotal)) {
			return true;
		}
	},

	check_for_discount_msg: function (msg) {
		if (msg == null || undefined) {
			msg = "";
		}

		return msg;
	},

	// Pagination Helpers

	// Take in the number of pages available as input
	// Push them to the array n times for the input size n
	// We use the array to help us loop display the number of pages available
	// as well as their respective values (pg 1, 2, 3 etc)
	loop_n_times: function (pages) {
		//console.log('num pages is' + pages)
		the_array = [];
		if (pages > 0) {
			for (i = 1; i < pages + 1; i++) {
				//console.log('Adding page')
				the_array.push(i);
			}
			//console.log("ARRAY IS ", the_array)
			return the_array;
		}
	},

	// Checks whether the input exists and is greater than 0 allowing us to display 'previous' and 'next' options for the pages
	check_page: function (page_value) {
		if (page_value > 0) {
			return true;
		} else {
			return false;
		}
	},

	// Pagination end

	formatDeliveryStatus: function (deliveryStatus) {
		if (deliveryStatus == "unknown") {
			return "Unknown";
		} else if (deliveryStatus == "pre_transit") {
			return "Pre-transit";
		} else if (deliveryStatus == "in_transit") {
			return "In-transit";
		} else if (deliveryStatus == "out_for_delivery") {
			return "Out for delivery";
		} else if (deliveryStatus == "delivered") {
			return "Delivered";
		} else if (deliveryStatus == "return_to_sender") {
			return "Return to sender";
		} else if (deliveryStatus == "failure") {
			return "Failure";
		} else {
			return "Unknown";
		}
	},
};
