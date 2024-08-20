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

	// Pagination Helpers

	// Take in the number of pages available as input
	// Push them to the array n times for the input size n
	// We use the array to help us loop display the number of pages available
	// as well as their respective values (pg 1, 2, 3 etc)
	loopNTimes: function (pages) {
		//console.log('num pages is' + pages)
		var the_array = [];
		if (pages > 0) {
			for (var i = 1; i < pages + 1; i++) {
				//console.log('Adding page')
				the_array.push(i);
			}
			//console.log("ARRAY IS ", the_array)
			return the_array;
		}
	},

	// Checks whether the input exists and is greater than 0 allowing us to display 'previous' and 'next' options for the pages
	checkPage: function (page_value) {
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

	manualSessionSave: async function(req) {
		await new Promise((resolve, reject) => {
			req.session.save((err) => {
			  if (err) {
				console.error("Session save error:", err);
				return reject(err);
			  }
			  resolve();
			});
		  });
	},

	manualSessionSaveNoCaching: async function(req, res) {
		  await new Promise((resolve, reject) => {
			req.session.save((err) => {
			  if (err) {
				console.error("Session save error:", err);
				return reject(err);
			  }
			  resolve();
			});
		  });
	  
		  // Add cache-control header to prevent caching
		  res.set("Cache-Control", "no-store");
	  },


	  
	saveSession: async function(req) {
		return new Promise(function(resolve, reject) {
			req.session.save(function(err) {
				if (err) {
					console.log("Session failed to save");
					reject(err);
				} else {
					resolve("Saving session...");
				}
			});
		});
	}
	
	  
};
