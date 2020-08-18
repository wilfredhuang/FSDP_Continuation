const express = require("express");
const path = require("path");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const methodOverride = require("method-override");
const Handlebars = require("handlebars");

const {
  allowInsecurePrototypeAccess,
} = require("@handlebars/allow-prototype-access");

//NodeMailer
const nodemailer = require("nodemailer");

//EasyPost API
const EasyPost = require("@easypost/api");
const apiKey = "EZTK29b55ab4ee7a437890e19551520f5dd0uaJjPiW9XsVqXYFNVI0kog";
const api = new EasyPost(apiKey);

//Twilio API
const accountSid = "AC7994551ea296710e5de3b74d7a93056c";
const authToken = "f5ac6a9439b75395ce54e9783d0f8877";
const client = require("twilio")(accountSid, authToken);

//Models
const order = require("../book_store/models/Order");

//nodemailer
let transporter = nodemailer.createTransport({
  host: "smtp.googlemail.com",
  port: 465,
  secure: true, // true for 465, false for other ports
  auth: {
    user: "superlegitemail100percent@gmail.com", // generated ethereal user
    pass: "Passw0rdyes", // generated ethereal password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

//https
const openssl = require("openssl-nodejs");
const https = require("https");
const fs = require("fs");
const options = {
  key: fs.readFileSync("key.pem"),
  cert: fs.readFileSync("cert.crt"),
};

//admin
const AdminBroExpress = require("admin-bro-expressjs");

// Stripe Payment System
// Set your secret key. Remember to switch to your live secret key in production!
const stripe = require("stripe")("sk_test_ns9DyHTray5Wihniw93C2ANH00IMJTVjKw", {
  apiVersion: "2020-03-02",
});

// Bcrypt - Encrypt password - P4A1
const bcrypt = require("bcryptjs"); // added here for debugging, but it's import only used in user.js

// Passport - Setting Authentication - P4A2
const passport = require("passport");

// const FacebookStrategy = require('passport-facebook').Strategy;

// Load routes
const mainRoute = require("./routes/main");
const userRoute = require("./routes/user");
const productRoute = require("./routes/product");
const deliveryRoute = require("./routes/cart");
const checkoutRoute = require("./routes/checkout");
const adminRoute = require("./routes/admin");

// Library to use MySQL to store session objects
const MySQLStore = require("express-mysql-session");
const db = require("./config/db"); // db.js config file

// Messaging libraries
const flash = require("connect-flash");
const FlashMessenger = require("flash-messenger");

// Bring in database connection
const vidjotDB = require("./config/DBConnection");

// Connects to MySQL database
vidjotDB.setUpDB(false); // To set up database with new tables set (true)

// Passport Config - P4A2
const authenticate = require("./config/passport");
authenticate.localStrategy(passport);

// global.userCart = {};
// Bring in Handlebars Helpers here
const {
  convertUpper,
  adminCheck,
  emptyCart,
  cartQty,
  formatDate,
  capitaliseFirstLetter,
  isSg,
  checkPromo,
  convertDiscount,
  displayCouponType,
  get_old_subtotal,
  check_subtotal,
  check_for_discount_msg,
  formatDeliveryStatus,
} = require("./helpers/hbs");
const { when } = require("./helpers/for_loop");

// creates an express server
const app = express();

// Handlebars Middleware
app.engine(
  "handlebars",
  exphbs({
    defaultLayout: "main", // Specify default template views/layout/main.handlebar
    helpers: {
      convertUpper: convertUpper,
      adminCheck: adminCheck,
      emptyCart: emptyCart,
      cartQty: cartQty,
      formatDate: formatDate,
      capitaliseFirstLetter: capitaliseFirstLetter,
      isSg: isSg,
      checkPromo: checkPromo,
      convertDiscount: convertDiscount,
      displayCouponType: displayCouponType,
      get_old_subtotal: get_old_subtotal,
      check_subtotal: check_subtotal,
      check_for_discount_msg: check_for_discount_msg,
      formatDeliveryStatus: formatDeliveryStatus,
      when: when,
    },
    handlebars: allowInsecurePrototypeAccess(Handlebars),
  })
);
app.set("view engine", "handlebars");

// Body parser middleware to parse HTTP body to read post data
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// Creates static folder for publicly accessible HTML, CSS and Javascript files
app.use(express.static(path.join(__dirname, "public")));

// Method override middleware to use other HTTP methods such as PUT and DELETE
app.use(methodOverride("_method"));

// Enables session to be stored using browser's Cookie
app.use(cookieParser());

// Express session middleware - uses MySQL to store session
app.use(
  session({
    key: "vidjot_session",
    secret: "tojiv",
    store: new MySQLStore({
      host: db.host,
      port: 3306,
      user: db.username,
      password: db.password,
      database: db.database,
      clearExpired: true,
      // How frequently expired sessions will be cleared; milliseconds:
      checkExpirationInterval: 900000,
      // The maximum age of a valid session; milliseconds:
      expiration: 900000,
    }),
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: true,
    },
  })
);

// Initilize Passport middleware - P4A2
app.use(passport.initialize());
app.use(passport.session());

// Two flash messenging libraries - Flash (connect-flash) and Flash Messenger
app.use(flash());
app.use(FlashMessenger.middleware);

// Global variables
app.use(function (req, res, next) {
	res.locals.success_msg = req.flash('success_msg');
	res.locals.error_msg = req.flash('error_msg');
	res.locals.error = req.flash('error');
	res.locals.user = req.user || null;
	res.locals.UC = req.session.userCart;
	res.locals.billingAddress = req.session.billingAddress;
	res.locals.countryShipment = req.session.countryShipment;
	res.locals.coupon_type = req.session.coupon_type;
	res.locals.discount = req.session.discount;
	res.locals.discount_limit = req.session.discount_limit;
	res.locals.discounted_price = req.session.discounted_price;
	res.locals.shipping_discount = req.session.shipping_discount;
	res.locals.shipping_discount_limit = req.session.shipping_discount_limit;
	res.locals.shipping_discounted_price = req.session.shipping_discounted_price;
	res.locals.sub_discount = req.session.sub_discount;
	res.locals.sub_discount_limit = req.session.sub_discount_limit;
	res.locals.sub_discounted_price = req.session.sub_discounted_price;
	res.locals.full_subtotal_price = req.session.full_subtotal_price;
	res.locals.full_total_price = req.session.full_total_price;
	res.locals.shipping_fee = req.session.shipping_fee;
	res.locals.public_coupon = req.session.public_coupon; 
	res.locals.deducted = req.session.deducted;
	// Fixed this 16/08/20, cause if you use SUB coupon, the subtotal would display like
	// e.g i use a coupon with 50% off and $20 limit with a $60 order on 3 identical items with a discount of buy 3 save 10%
	// it would calculate like this first, 60-6 = 54, 54-20, the subtotal would be like 34 the previous time with discount 6 and 
	// coupon 20.00
	res.locals.full_og_subtotal_price = (0).toFixed(2)
	for (i in req.session.userCart) {
		res.locals.full_og_subtotal_price = (parseFloat(res.locals.full_og_subtotal_price) + parseFloat(req.session.userCart[i].SubtotalPrice)).toFixed(2)
	}
	//  Update 16 Aug, To fix another display issue, in the case of when we have 1 item that costs $10
	// and SUB / OVERALL coupons with same rate and limit of 10% and $10 respectively
	// Have to calculate the full_og_subtotal_price differently based on coupon type to match
	// The calculated amounts
	if (req.session.coupon_type == "OVERALL") {
		res.locals.full_og_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.deducted)).toFixed(2);
	}

	else {
		res.locals.full_og_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.deducted) + parseFloat(req.session.discounted_price)).toFixed(2);
	}
	// Use when 'OVERALL' coupon applied
	// res.locals.full_og_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.deducted)).toFixed(2);
	// Use when 'SUB' coupon applied.
	// res.locals.full_og_subtotal_price = (parseFloat(req.session.full_subtotal_price) + parseFloat(req.session.deducted) + parseFloat(req.session.discounted_price)).toFixed(2);
	next();
});

//SMS Notification - in progress by Hasan
app.post("/deliveryUpdates", (req, res) => {
  let firstMessage = "Hey! This is Bookstore. ";
  objectWeb = req.body.object;
  console.log(objectWeb);
  let descriptionWeb = req.body.description;
  console.log(descriptionWeb);
  let shippingIDWeb = req.body.result.shipment_id;
  let deliveryStatusResponse = req.body.result.status;
  if (deliveryStatusResponse == null || deliveryStatusResponse == undefined || deliveryStatusResponse == ""){
	console.log(deliveryStatusResponse)
	console.log("Delivery response is invalid")
  }
  else{
	let carrier = "Your carrier is " + req.body.result.carrier;
	console.log(shippingIDWeb);
	order
	  .findOne({
		where: {
		  shippingId: shippingIDWeb,
		},
	  })
	  .then((order) => {
		//checks if event is tracker update
		if (objectWeb == "Event" && descriptionWeb == "tracker.updated") {
		  if (deliveryStatusResponse == "delivered") {
			order.update({
			  deliveryStatus: deliveryStatusResponse,
			});
			let lengthOfTrackingDetails = req.body.result.tracking_details.length;
			let state =
			  req.body.result.tracking_details[lengthOfTrackingDetails - 1]
				.tracking_location.state;
			let city =
			  req.body.result.tracking_details[lengthOfTrackingDetails - 1]
				.tracking_location.city;
			api.Shipment.retrieve(shippingIDWeb).then((s) => {
			  let toAddressWeb = s.to_address;
			  console.log(toAddressWeb);
			  console.log(s.to_address.phone);
			  let toNumberWeb = "+" + s.to_address.phone;
			  console.log(toNumberWeb);
			  let twilioMessage =
				firstMessage +
				carrier +
				"." +
				" Your package has arrived at " +
				city +
				", " +
				state +
				".";
			  console.log(twilioMessage);
			  var promise = client.messages.create({
				from: "+12059461964",
				to: "+6590251744", // a Twilio number you own
				body: twilioMessage,
			  });
			  promise.then(
				function (sms) {
				  console.log("Message success! SMS SID: " + sms.sid);
				},
				function (error) {
				  console.error("Message failed!  Reason: " + error.message);
				}
			  );
			  console.log("received delivery");
			  res.status(200).send("Acknowledged Delivered");
			});
		  } else {
			order.update({
			  deliveryStatus: deliveryStatusResponse,
			});
			let lengthOfTrackingDetails = req.body.result.tracking_details.length;
			let state =
			  req.body.result.tracking_details[lengthOfTrackingDetails - 1]
				.tracking_location.state;
			let city =
			  req.body.result.tracking_details[lengthOfTrackingDetails - 1]
				.tracking_location.city;
			api.Shipment.retrieve(shippingIDWeb).then((s) => {
			  let toAddressWeb = s.to_address;
			  console.log(toAddressWeb);
			  let toNumberWeb = "+" + s.to_address.phone;
			  console.log(toNumberWeb);
			  let twilioMessage =
				firstMessage +
				carrier +
				" Your delivery status is " +
				deliveryStatusResponse +
				" and package is currently at " +
				city +
				", " +
				state +
				".";
			  console.log(twilioMessage);
			  var promise = client.messages.create({
				from: "+12059461964",
				to: "+6590251744", // a Twilio number you own
				body: twilioMessage,
			  });
			  promise.then(
				function (sms) {
				  console.log("Message success! SMS SID: " + sms.sid);
				},
				function (error) {
				  console.error("Message failed!  Reason: " + error.message);
				}
			  );
			  console.log("this is hello");
			  res.status(200).send("Acknowledged Update");
			});
		  }
		} else {
		  console.log(
			"might put other stuff here but let's just put a sms notification only"
		  );
		  res.status(200).send("Acknowledged");
		}
	  });
  }
  // else if(objectWeb == "Event" && descriptionWeb == "tracker.created"){
  // 	trackingResult = req.body.result
  // 	console.log(trackingResult.length)
  // 	for (i = 0; i<trackingResult.length; i++){
  // 		console.log("______________________________")
  // 		console.log(i)
  // 		console.log("______________________________")

  // 	}
  // 	console.log("currently shifting sms notification to here")
  // }
});

// Use Routes
app.use("/", mainRoute); // uses main.js routing under ./routes
app.use("/user", userRoute);
app.use("/product", productRoute);
app.use("/delivery", deliveryRoute);
app.use("/checkout", checkoutRoute);
app.use("/admin", adminRoute);

//Renders 404 Page if user types in invalid URL
app.use(function (req, res, next) {
  res.status(404).render("404");
});

//Renders 500 Page if there is internal server error
app.use(function (req, res, next) {
  res.status(500).render("500");
});

const port = 5000;

/* changed to https so this is not needed
app.listen(port, () => {
	console.log(`Server started on port ${port}`);
});
*/
//remember to use https://localhost:5000/
https.createServer(options, app).listen(port);
