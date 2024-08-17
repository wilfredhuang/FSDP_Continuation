import express from "express";
const router = express.Router();
import moment from "moment";
import alertMessage from "../helpers/messenger.js";


//Models
import product from "../models/Product.js";
import productadmin from "../models/ProductAdmin.js";
import order from "../models/Order.js";
import order_item from "../models/OrderItem.js";
import User from "../models/User.js";
import Pending_Order from "../models/Pending_Orders.js";
import Pending_OrderItem from "../models/Pending_OrderItem.js";

import ProductAdmin from "../models/ProductAdmin.js";
import Coupon from "../models/Coupon.js";
import Discount from "../models/Discount.js";


//EasyPost API
import EasyPost from "@easypost/api";

const apiKey = "EZTKe61fa8e438e34413acce28f504e9d8ee9lUMxw7QLbFHvI2SZgpUqg";
const api = new EasyPost(apiKey);

// Stripe Payment - secret key

import * as dotenv from "dotenv";
dotenv.config();

import Stripe from "stripe";
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
	apiVersion: "2020-03-02",
});

// PayNow

import paynow from "paynow-generator";
import QRCode from "qrcode";

// twilo API - Send SMS
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_ACCOUNT_AUTHTOKEN;

import Client from "twilio";
const client = new Client(accountSid, authToken);

// Authentications
import ensureAuthenticated from "../helpers/auth.js";
import ensureAdminAuthenticated from "../helpers/adminauth.js";
import {checkCart} from "../helpers/cart.js";

const calculateDiscountedPrice = (quantity, price, discountRate, minQty) => {
    const special = Math.floor(quantity / minQty);
    const discountedPart = special * minQty * price * (1 - discountRate);
    const regularPart = (quantity - special * minQty) * price;
    return {
        subtotalPrice: (discountedPart + regularPart).toFixed(2),
        discountedValue: (quantity * price - (discountedPart + regularPart)).toFixed(2),
    };
};

const updateCartItem = (cartItem, product, discount) => {
    cartItem.Quantity += 1;
    if (discount) {
        const { subtotalPrice, discountedValue } = calculateDiscountedPrice(
            cartItem.Quantity,
            cartItem.Price,
            discount.discount_rate,
            discount.min_qty
        );
        cartItem.SubtotalPrice = subtotalPrice;
        console.log("DEDUCTED VALUE IS " + discountedValue);
        console.log("AFTER SPECIAL DISCOUNT Subtotal is " + cartItem.SubtotalPrice);
    } else {
        cartItem.SubtotalPrice = (
            parseFloat(cartItem.SubtotalPrice) + parseFloat(product.price)
        ).toFixed(2);
    }
    cartItem.SubtotalWeight = (
        parseFloat(cartItem.SubtotalWeight) + parseFloat(product.weight)
    ).toFixed(2);
};

const addNewCartItem = (cart, product, discount) => {
    const price = discount ? (product.price * (1 - discount.discount_rate)).toFixed(2) : product.price;
    cart[product.id] = {
        ID: product.id,
        Name: product.product_name,
        Author: product.author,
        Publisher: product.publisher,
        Genre: product.genre,
        Price: product.price,
        Stock: product.stock,
        Weight: product.weight,
        Image: product.product_image,
        Quantity: 1,
        SubtotalPrice: price,
        SubtotalWeight: product.weight,
    };
};

const handleProductDiscount = async (productId) => {
    const discount = await Discount.findOne({ where: { target_id: productId } });
    if (discount) {
        const expiryTime = moment(discount.expiry);
        if (moment().isAfter(expiryTime)) {
            await discount.destroy();
            return null;
        }
    }
    return discount;
};

const processCart = (cart, product, discount) => {
    if (cart[product.id]) {
        updateCartItem(cart[product.id], product, discount);
    } else {
        addNewCartItem(cart, product, discount);
    }
};


// variables below for coupon feature, dont change - wilfred
// switched req.session.userCart to global variable @app.js
// const req.session.userCart = {}

router.get("/listProduct", (req, res) => {
	const title = "Product Listing";
	const navStatusProduct = "active";
	productadmin
		.findAll({
			order: [["product_name", "ASC"]],
		})
		.then((productadmin) => {
			res.render("products/listProduct", {
				productadmin: productadmin,
				navStatusProduct,
				title,
			});
		});
});

router.get("/individualProduct/:id", async (req, res) => {
	const title = "Product Information";
	const disc = await Discount.findOne({
		where: { target_id: req.params.id },
	});

	productadmin
		.findOne({
			where: {
				id: req.params.id,
			},
		})
		.then((product) => {
			res.render("products/individualProduct", {
				product,
				title,
				disc,
			});
		});
});

router.post("/addProductAdmin", (req, res) => {
	let product_name = req.body.product_name;
	console.log(product_name);
	let author = req.body.author;
	let publisher = req.body.publisher;
	let genre = req.body.genre;
	let price = req.body.price;
	let stock = req.body.stock;
	let details = req.body.details;
	let rating = req.body.rating;
	let weight = req.body.weight;
	let product_image = req.body.product_image;
	productadmin
		.create({
			product_name,
			author,
			publisher,
			genre,
			price,
			stock,
			details,
			weight,
			product_image,
			rating,
		})
		.then((product) => {
			alertMessage(
				res,
				"success",
				` ${product_name} was added into the shop.`,
				"fas fa-sign-in-alt",
				true
			);
			res.redirect("/product/listProductAdmin");
		})
		.catch((err) => console.log(err));
});

router.get("/listProductAdmin", (req, res) => {
	const title = "Product Admin List";
	productadmin
		.findAll({
			order: [["id", "ASC"]],
			raw: true,
		})
		.then((productadmin) => {
			res.render("products/listProductAdmin", {
				productadmin: productadmin,
				title,
			});
		});
});

router.get("/delete/:id", (req, res) => {
	productadmin
		.findOne({
			where: {
				id: req.params.id,
			},
		})
		.then((productadmin) => {
			productadmin
				.destroy({
					where: {
						id: req.params.id,
					},
				})
				.then((productadmin) => {
					res.redirect("/product/listProductAdmin");
				});
		});
});

router.get("/updateProductAdmin/:id", (req, res) => {
	const title = "Update Product";
	productadmin
		.findOne({
			where: {
				id: req.params.id,
			},
		})
		.then((product) => {
			res.render("products/updateProduct", {
				product,
				title,
			});
		});
});

router.get("/detailsProductAdmin/:id", (req, res) => {
	const title = "Product Details";
	productadmin
		.findOne({
			where: {
				id: req.params.id,
			},
		})
		.then((product) => {
			res.render("products/detailsProduct", {
				product,
				title,
			});
		});
});

router.put("/updateProductAdmin/:id", (req, res) => {
	let product_name = req.body.product_name;
	let author = req.body.author;
	let publisher = req.body.publisher;
	let genre = req.body.genre;
	let price = req.body.price;
	let stock = req.body.stock;
	let details = req.body.details;
	let weight = req.body.weight;
	let rating = req.body.rating;
	let product_image = req.body.product_image;
	productadmin
		.update(
			{
				product_name,
				author,
				publisher,
				genre,
				price,
				stock,
				details,
				weight,
				product_image,
				rating,
			},
			{
				where: {
					id: req.params.id,
				},
			}
		)
		.then(() => {
			alertMessage(
				res,
				"success",
				` ${product_name} was updated.`,
				"fas fa-sign-in-alt",
				true
			);
			res.redirect("/product/listProductAdmin");
		})
		.catch((err) => console.log(err));
});

// Here is the start of Cart and Payment Features - Wilfred

router.get("/listproduct/:id", async (req, res) => {
	console.log("Start request /listproduct/:id")
    const productId = req.params.id;
    const discount = await handleProductDiscount(productId);
    const product = await productadmin.findOne({ where: { id: productId } });

    processCart(req.session.userCart, product, discount);

    const cartQty = Object.values(req.session.userCart).reduce((acc, item) => acc + item.Quantity, 0);
    res.cookie('cartQty', cartQty, { expires: new Date(Date.now() + 900000), httpOnly: false });

    const flashMessage_clientside = `${product.product_name} added to cart!`;

    res.json({
        success: true,
        flashMessage: [flashMessage_clientside],
    });

    console.log(`Current User Cart Contents: ${JSON.stringify(req.session.userCart)}`);
});



router.post("/individualProduct/:id", async (req, res) => {
    const productId = req.params.id;

	console.log(`ID Taken is ${productId}`)
	console.log("Start Req")
    try {
        // Fetch the discount and product details
        const discount = await handleProductDiscount(productId);
        const product = await productadmin.findOne({ where: { id: productId } });

        if (!product) {
            return res.json({ success: false, message: "Product not found" });
        }

        // Process the cart
        processCart(req.session.userCart, product, discount);


		// Set flash message
		const flashMessage_clientside = `${product.product_name} added to cart!`;


		const cartQty = Object.values(req.session.userCart).reduce((acc, item) => acc + item.Quantity, 0);
		res.cookie('cartQty', cartQty, { expires: new Date(Date.now() + 900000), httpOnly: false });

        // Respond with JSON for AJAX request
        res.json({
            success: true,
            cartContents: req.session.userCart,
			flashMessage: [flashMessage_clientside]
        });

        console.log("Added to cart");
        console.log(req.session.userCart);
    } catch (error) {
        res.json({ success: false, message: "An error occurred while adding the product to the cart" });
        console.error(error);
    }

	console.log("End Req")
});


// Update Cart
// When a user want to change the product qty in cart page

router.post("/cart", async (req, res) => {
    if (req.body.checkoutButton === "Update") {
        for (let ID in req.session.userCart) {
            let query = parseInt(req.body[`Q${ID}`]);
            if (query > 0) {
                req.session.userCart[ID].Quantity = query;
            }
        }
        req.session.deducted = (0).toFixed(2);

        for (let z in req.session.userCart) {
            let product = await productadmin.findOne({
                where: { id: req.session.userCart[z].ID },
            });
            let disc_object = await Discount.findOne({
                where: { target_id: req.session.userCart[z].ID },
            });

            if (disc_object && disc_object.target_id === req.session.userCart[z].ID) {
                let special = Math.floor(req.session.userCart[z].Quantity / disc_object.min_qty);
                if (special > 0) {
                    // Instead of directly sending messages, you will handle it client-side via Axios
                    req.session.flash = {
                        type: 'success',
                        message: `Special Offer: Buy ${disc_object.min_qty} for ${disc_object.discount_rate * 100}% off for '${product.product_name}' applied ${special} times`,
                        icon: 'fas fa-exclamation-circle'
                    };
                }

                let first_half = special * disc_object.min_qty * req.session.userCart[z].Price * (1 - disc_object.discount_rate);
                let second_half = (req.session.userCart[z].Quantity - special * disc_object.min_qty) * req.session.userCart[z].Price;
                req.session.userCart[z].SubtotalPrice = (first_half + second_half).toFixed(2);
                let discounted_value = (req.session.userCart[z].Quantity * req.session.userCart[z].Price - (first_half + second_half)).toFixed(2);
                req.session.deducted = (parseFloat(req.session.deducted) + parseFloat(discounted_value)).toFixed(2);
                req.session.userCart[z].SubtotalWeight = (parseFloat(req.session.userCart[z].SubtotalWeight) + parseFloat(product.weight)).toFixed(2);
            } else {
                req.session.userCart[z].SubtotalPrice = (parseFloat(req.session.userCart[z].Quantity) * parseFloat(product.price)).toFixed(2);
            }
        }

        for (let z in req.session.userCart) {
            req.session.userCart[z].SubtotalWeight = req.session.userCart[z].Quantity * req.session.userCart[z].Weight;
        }

        res.redirect("cart");
    } else {
        req.session.flash = {
            type: 'danger',
            message: 'You are not logged in',
            icon: 'fas fa-exclamation-circle'
        };
        res.redirect("checkout");
    }
});

// Delete Item in Cart
// Recalculate req.session.full_subtotal_price when item is deleted
// must set req.session.full_subtotal_price = 0 otherwise it will be incremented value

router.get("/deleteCartItem/:id", async (req, res) => {
	console.log(req.session.userCart[req.params.id]);
	console.log(req.params.id);
	console.log("Before Delete" + req.session.userCart);
	delete req.session.userCart[req.params.id];
	console.log("After Delete" + req.session.userCart);

	req.session.deducted = (0).toFixed(2);
	for (var z in req.session.userCart) {
		var product = await productadmin.findOne({
			where: { id: req.session.userCart[z].ID },
		});
		var disc_object = await Discount.findOne({
			where: { target_id: req.session.userCart[z].ID },
		});
		if (
			disc_object != null &&
			disc_object.target_id == req.session.userCart[z].ID
		) {
			// special is the number of times the special offer can be applied, i.e
			// if discount is for every 3 items and i have 10 items, special will be 10 / 3 rounded down to 3
			let special = Math.floor(
				req.session.userCart[z].Quantity / disc_object.min_qty
			);
			if (special != 0) {
				console.log(`Special Value : ${special}`);
				alertMessage(
					res,
					"success",
					`Special Offer: Buy ${disc_object.min_qty} for ${
						disc_object.discount_rate * 100
					}% off for '${product.product_name}' applied ${special} times`,
					"fas fa-exclamation-circle",
					true
				);
			}
			let first_half =
				special *
				disc_object.min_qty *
				req.session.userCart[z].Price *
				(1 - disc_object.discount_rate);
			let second_half =
				(req.session.userCart[z].Quantity - special * disc_object.min_qty) *
				req.session.userCart[z].Price;
			req.session.userCart[z].SubtotalPrice = (
				first_half + second_half
			).toFixed(2);
			discounted_value = (
				req.session.userCart[z].Quantity * req.session.userCart[z].Price -
				(first_half + second_half)
			).toFixed(2);
			req.session.deducted = (
				parseFloat(req.session.deducted) + parseFloat(discounted_value)
			).toFixed(2);
			console.log("DEDUCTED VALUE IS " + discounted_value);
			console.log("DEDUCTED TOTAL IS " + req.session.deducted);
			console.log(
				"AFTER SPECIAL DISCOUNT " +
					` Subtotal is ${req.session.userCart[z].SubtotalPrice}`
			);

			req.session.userCart[z].SubtotalWeight = (
				parseFloat(req.session.userCart[z].SubtotalWeight) +
				parseFloat(product.weight)
			).toFixed(2);
		} else if (disc_object == null) {
			req.session.userCart[z].SubtotalPrice = (
				parseFloat(req.session.userCart[z].Quantity) * parseFloat(product.price)
			).toFixed(2);
		}
	}

	for (var z in req.session.userCart) {
		req.session.userCart[z].SubtotalWeight =
			req.session.userCart[z].Quantity * req.session.userCart[z].Weight;
	}

	req.session.full_subtotal_price = 0;
	if (req.session.coupon_type == "OVERALL") {
		console.log("Coupon TYPE IS OVERALL");
		for (var z in req.session.userCart) {
			req.session.full_subtotal_price = (
				parseFloat(req.session.full_subtotal_price) +
				parseFloat(req.session.userCart[z].SubtotalPrice)
			).toFixed(2);
			console.log(req.session.full_subtotal_price);
		}
		req.session.discounted_price = (
			(parseFloat(req.session.full_subtotal_price) +
				parseFloat(req.session.shipping_fee)) *
			parseFloat(req.session.discount)
		).toFixed(2);
		if (
			parseFloat(req.session.discounted_price) >
			parseFloat(req.session.discount_limit)
		) {
			req.session.discounted_price = req.session.discount_limit;
			req.session.full_total_price = (
				parseFloat(req.session.full_subtotal_price) +
				parseFloat(req.session.shipping_fee) -
				parseFloat(req.session.discount_limit)
			).toFixed(2);
		} else {
			req.session.full_total_price = (
				(parseFloat(req.session.full_subtotal_price) +
					parseFloat(req.session.shipping_fee)) *
				(1.0 - parseFloat(req.session.discount))
			).toFixed(2);
		}
	} else if (req.session.coupon_type == "SHIP") {
		console.log("Coupon TYPE IS SHIP");
		for (var z in req.session.userCart) {
			req.session.full_subtotal_price = (
				parseFloat(req.session.full_subtotal_price) +
				parseFloat(req.session.userCart[z].SubtotalPrice)
			).toFixed(2);
			console.log(req.session.full_subtotal_price);
		}
		req.session.shipping_discounted_price =
			parseFloat(req.session.shipping_fee) * req.shipping_discount;
		if (
			parseFloat(req.session.shipping_discounted_price) >
			parseFloat(req.session.shipping_discount_limit)
		) {
			req.session.discounted_price = req.session.shipping_discount_limit;
			req.session.shipping_fee = (
				parseFloat(req.session.shipping_fee) -
				parseFloat(req.session.discount_limit)
			).toFixed(2);
			req.session.full_total_price = (
				parseFloat(req.session.full_subtotal_price) +
				parseFloat(req.session.shipping_fee)
			).toFixed(2);
		} else {
			req.session.discounted_price = (
				parseFloat(req.session.shipping_fee) * parseFloat(req.shipping_discount)
			).toFixed(2);
			req.session.shipping_fee = (
				parseFloat(req.session.shipping_fee) *
				(1 - parseFloat(req.shipping_discount))
			).toFixed(2);
			req.session.full_total_price = (
				parseFloat(req.session.full_subtotal_price) +
				parseFloat(req.session.shipping_fee)
			).toFixed(2);
		}
	} else if (req.session.coupon_type == "SUB") {
		console.log("Coupon TYPE IS SUB");
		for (var z in req.session.userCart) {
			req.session.full_subtotal_price = (
				parseFloat(req.session.full_subtotal_price) +
				parseFloat(req.session.userCart[z].SubtotalPrice)
			).toFixed(2);
			console.log(req.session.full_subtotal_price);
		}
		req.session.discounted_price =
			parseFloat(req.session.full_subtotal_price) * req.session.sub_discount;
		if (
			parseFloat(req.session.discounted_price) >
			parseFloat(req.session.discount_limit)
		) {
			req.session.discounted_price = req.session.discount_limit;
			console.log(req.session.full_subtotal_price);
			req.session.full_subtotal_price = (
				parseFloat(req.session.full_subtotal_price) -
				parseFloat(req.session.discount_limit)
			).toFixed(2);
			console.log(req.session.full_subtotal_price);
			req.session.full_total_price = (
				parseFloat(req.session.full_subtotal_price) +
				parseFloat(req.session.shipping_fee)
			).toFixed(2);
		} else {
			req.session.discounted_price = (
				parseFloat(req.session.full_subtotal_price) *
				parseFloat(req.session.sub_discount)
			).toFixed(2);
			req.session.full_subtotal_price = (
				parseFloat(req.session.full_subtotal_price) *
				parseFloat(1 - req.session.sub_discount)
			).toFixed(2);
			req.session.full_total_price = (
				parseFloat(req.session.full_subtotal_price) +
				parseFloat(req.session.shipping_fee)
			).toFixed(2);
		}
	} else {
		req.session.discounted_price = 0.0;
		for (var z in req.session.userCart) {
			req.session.full_subtotal_price = (
				parseFloat(req.session.full_subtotal_price) +
				parseFloat(req.session.userCart[z].SubtotalPrice)
			).toFixed(2);
			console.log(req.session.full_subtotal_price);
		}
		req.session.full_total_price = (
			parseFloat(req.session.full_subtotal_price) +
			parseFloat(req.session.shipping_fee)
		).toFixed(2);
	}
	console.log(req.session.userCart);
	console.log(req.session.full_subtotal_price);
	alertMessage(
		res,
		"success",
		"An item has been removed from the cart",
		"fas fa-sign-in-alt",
		true
	);
	res.redirect(307, "/product/cart?page=1");
});

// Retrieve Cart
// Make sure to use POST request to handle updated cart info or you need to double refresh

router.get("/cart", async (req, res) => {
    let title = "Shopping Cart";
    for (let z in req.session.userCart) {
        req.session.userCart[z].SubtotalWeight =
            req.session.userCart[z].Quantity * req.session.userCart[z].Weight;
    }

    // Calculate total weight
    let total_weight = 0;
    let total_weight_oz = 0;

    for (let z in req.session.userCart) {
        total_weight += req.session.userCart[z].SubtotalWeight;
    }

    total_weight_oz = Math.ceil(total_weight * 0.035274);

    // Fetch discounts
    const discounts = await Discount.findAll();

    // Initialize other values
    let full_og_subtotal_price = 0;
    let deducted = 0;
    let discounted_price = 0;
    let full_total_price = 0;

    // Calculate full original subtotal price, deducted amount, and full total price
    for (let key in req.session.userCart) {
        const item = req.session.userCart[key];
        full_og_subtotal_price += parseFloat(item.SubtotalPrice);
    }

    // Placeholder calculations for demonstration
    // You should replace these with your actual logic
    deducted = 0; // Compute as needed
    discounted_price = 0; // Compute as needed
    full_total_price = full_og_subtotal_price - deducted - discounted_price;

    res.render("checkout/cart", {
        total_weight,
        total_weight_oz,
        discounts,
        title,
        results: {
            pages: 1, // Set correctly based on your pagination logic
            results: Object.keys(req.session.userCart).map(key => ({ [key]: req.session.userCart[key] }))
        },
        full_og_subtotal_price: full_og_subtotal_price.toFixed(2),
        deducted: deducted.toFixed(2),
        discounted_price: discounted_price.toFixed(2),
        full_total_price: full_total_price.toFixed(2),
    });
});


// Cart Coupon
router.post("/applyCoupon", (req, res) => {
	// Check if coupon expired already or not
	Coupon.findAll({
		// order: [['id', 'ASC']],
	})
		.then((coupons) => {
			for (c in coupons) {
				// Mistake: used 'c.destroy()' instead of 'coupons[c].destroy()'
				// let current_time = moment('DD/MM/YYYY, hh:mm:ss a')
				let expiry_time = moment(coupons[c].expiry);
				let current_time = moment();
				// If Coupon expired is public
				// if (current_time.isAfter(expiry_time) && req.session.public_coupon.code == coupons[c].expiry.code) {
				//     coupons[c].destroy();
				//     console.log("Session public coupon is " + req.session.public_coupon)
				//     console.log("Destroying session variable")
				//     req.session.public_coupon = null;
				//     console.log("Now Session public coupon is " + req.session.public_coupon)
				//     res.locals.public_coupon = null;
				//     req.session.save();
				// }

				if (current_time.isAfter(expiry_time)) {
					// Check if there is an existing public coupon
					if (req.session.public_coupon != null) {
						if (coupons[c].code == req.session.public_coupon.code) {
							console.log("Setting session var to NULL");
							req.session.public_coupon = null;
						}
					}
					console.log("Destroying Coupon Code " + coupons[c].code);
					coupons[c].destroy();
					req.session.save();
					console.log(
						"Public Coupon is now " +
							req.session.public_coupon +
							" should be NULL"
					);
				} else {
					console.log(current_time.format("DD/MM/YYYY, hh:mm:ss a"));
					console.log(expiry_time.format("DD/MM/YYYY, hh:mm:ss a"));
					console.log("Current Time is " + current_time);
					console.log("Expiry Time is " + coupons[c].expiry);
					console.log("Expiry Time is  " + expiry_time);
				}
			}
		})

		.then(() => {
			Coupon.findOne({
				where: { code: req.body.coupon },
			})

				.then((coupon) => {
					console.log(coupon.code);
					req.session.coupon_type = coupon.type;
					alertMessage(
						res,
						"success",
						"code " + req.body.coupon + " applied",
						"fas fa-exclamation-circle",
						true
					);
					if (req.session.coupon_type == "OVERALL") {
						req.session.discount = coupon.discount;
						req.session.discount_limit = coupon.limit;
						alertMessage(
							res,
							"success",
							`${coupon.discount * 100}% off your total order (save up to $${
								coupon.limit
							})`,
							"fas fa-exclamation-circle",
							true
						);
					} else if (req.session.coupon_type == "SHIP") {
						req.shipping_discount = coupon.discount;
						req.session.req.shipping_discount_limit = coupon.limit;
						alertMessage(
							res,
							"success",
							`${
								coupon.discount * 100
							}% off your total shipping fee (save up to $${coupon.limit})`,
							"fas fa-exclamation-circle",
							true
						);
					} else if (req.session.coupon_type == "SUB") {
						req.session.sub_discount = coupon.discount;
						req.session.discount_limit = coupon.limit;
						alertMessage(
							res,
							"success",
							`${
								coupon.discount * 100
							}% off your subtotal (excluding shipping) (save up to $${
								coupon.limit
							})`,
							"fas fa-exclamation-circle",
							true
						);
					}

					// discount = coupon.discount;
					// discount_limit = coupon.limit;
					// line below allows us to redirect to another POST request to handle cart update
					res.redirect(307, "goToCart");
					// res.redirect("cart")
				})

				.catch(() => {
					alertMessage(
						res,
						"danger",
						"code " + req.body.coupon + " is invalid",
						"fas fa-exclamation-circle",
						true
					);
					res.redirect("cart?page=1");
				});
		})

		.catch(() => {
			alertMessage(
				res,
				"danger",
				"No coupons are available at the moment",
				"fas fa-exclamation-circle",
				true
			);
			res.redirect("cart?page=1");
		});
});

// Checkout Form
router.get("/checkout", checkCart, (req, res) => {
	var title = "Checkout";
	if (req.user) {
		let user_name = req.user.name;
		let user_phone = req.user.PhoneNo;
		let user_address = req.user.address;
		let user_address1 = req.user.address1;
		let user_city = req.user.city;
		let user_country = req.user.country;
		let user_postalCode = req.user.postalCode;

		res.render("checkout/checkout", {
			user_name,
			user_phone,
			user_address,
			user_address1,
			user_city,
			user_country,
			user_postalCode,
			title,
		});
	} else {
		res.redirect("/");
	}
});

router.post("/checkout", checkCart, (req, res) => {
	// Old variables
	// let fullName = req.body.fullName
	// let phoneNumber = req.body.phoneNumber
	// let address = req.body.address
	// let address1 = req.body.address1
	// let city = req.body.city
	// let country = req.body.country
	// let postalCode = req.body.postalCode
	// New session variables (To store the data temporarily as there will be another page before payment)
	req.session.recipientName = req.body.fullName;
	req.session.recipientPhoneNo = req.body.phoneNumber;
	req.session.address = req.body.address;
	req.session.address1 = req.body.address1;
	req.session.city = req.body.city;
	req.session.countryShipment = req.body.country;
	req.session.postalCode = req.body.postalCode;
	res.redirect("selectPayment");
});

// After checkout form filled, select payment page
router.get("/selectPayment", checkCart, (req, res) => {
	const title = "Select Payment";
	res.render("checkout/selectPayment", {
		title,
	});
});

router.post("/goToStripe", checkCart, (req, res) => {
	res.redirect("stripepayment");
});

router.post("/goToPayNow", checkCart, (req, res) => {
	res.redirect("paynow");
});

router.get("/stripepayment", checkCart, async (req, res) => {
	// Function below will take in customer's stripeID (if it exists)

	console.log("USER STRIPE ID IS " + req.user.stripeID);
	console.log("USER ISADMIN IS " + req.user.isadmin);
	if (req.user.stripeID != null) {
		stripe.customers.retrieve(req.user.stripeID, function (err, customer) {
			// asynchronously called
			console.log(err);
			console.log("CUSTOMER IS " + customer);
		});
	} else {
		// Create a stripe customer
		const customer = await stripe.customers.create({
			name: req.user.name,
			email: req.user.email,
			phone: req.user.PhoneNo,
			shipping: {
				address: {
					line1: req.user.address,
					line2: req.user.address1,
					city: req.user.city,
					country: req.user.country,
					postal_code: req.user.postalCode,
				},
				name: req.user.name,
				phone: req.user.PhoneNo,
			},
		});
		console.log("CUST ID IS + " + customer.id);
		console.log(req.user.stripeID);
		console.log(req.user.random);
		const current_user = await User.findOne({ where: { id: req.user.id } });
		console.log(current_user);
		current_user.stripeID = customer.id;
		current_user.save();
	}

	var title = "Stripe Payment";
	console.log("Full total price is " + req.session.full_total_price);
	const paymentIntent = stripe.paymentIntents
		.create({
			amount: Math.ceil(req.session.full_total_price * 100),
			currency: "sgd",
			payment_method_types: ["card"],
			receipt_email: "whjw1536@gmail.com",
			setup_future_usage: "on_session",
			description: `Order worth $${req.session.full_total_price} by ${req.user.name}`,
		})
		.then((paymentIntent) => {
			console.log(paymentIntent);
			console.log("Client secret is " + paymentIntent.client_secret);
			res.render("checkout/stripe", {
				client_secret: paymentIntent.client_secret,
				title,
			});
		});
});


router.post("/stripepayment", async (req, res) => {
    var total_weight_oz = (0).toFixed(2);

    // Create the parcel object
    const parcel = {
        predefined_package: "Parcel",
        weight: 10, // Adjust according to the total weight of the books
    };

    const fromAddress = {
        // Default address of the company
        name: "Bookstore",
        street1: "118 2nd Street",
        street2: "4th Floor",
        city: "San Francisco",
        state: "CA",
        country: "US",
        zip: "94105",
        phone: "415-123-4567",
        email: "example@example.com",
    };

    const toAddress = {
        verify: ["delivery"],
        // Example data for the recipient
        name: "George Costanza",
        company: "Vandelay Industries",
        street1: "1 E 161st St.",
        phone: process.env.DEV_PHONENO,
        city: "Bronx",
        state: "NY",
        zip: "10451", // Example ZIP code
    };

    try {
        // Create the address
        const addressResponse = await api.Address.create(toAddress);
        console.log("Address Response:", addressResponse); // Log the response for debugging
        const savedToAddress = addressResponse.address;

        if (!savedToAddress || !savedToAddress.id) {
            throw new Error('Failed to create address or address ID is missing.');
        }

        // Verify the address
        const verificationResponse = await api.Address.verify(savedToAddress.id);
        const verification = verificationResponse.address;

        if (!verification || !verification.verifications || !verification.verifications.delivery) {
            throw new Error('Failed to verify address or verification details are missing.');
        }

        if (verification.verifications.delivery.success) {
            const shipment = {
                to_address: savedToAddress.id,
                from_address: fromAddress,
                parcel: parcel,
            };

            // Create the shipment
            const shipmentResponse = await api.Shipment.create(shipment);
            console.log("Shipment Response:", shipmentResponse); // Log the response for debugging
            const savedShipment = shipmentResponse.shipment;

            if (!savedShipment || !savedShipment.id) {
                throw new Error('Failed to create shipment or shipment ID is missing.');
            }

            // Buy the shipment
            const transaction = await savedShipment.buy(
                savedShipment.lowestRate(["USPS"], ["First"])
            );

            if (!transaction || !transaction.id) {
                throw new Error('Failed to buy shipment or transaction ID is missing.');
            }

            console.log("Shipment ID:", transaction.id);

            // Assuming `req.session` has the necessary order details
            let fullName = req.session.recipientName;
            let phoneNumber = req.session.recipientPhoneNo;
            let address = req.session.address;
            let address1 = req.session.address1;
            let city = req.session.city;
            let country = req.session.countryShipment;
            let postalCode = req.session.postalCode;
            let deliverFee = 0;
            let subtotalPrice = req.session.full_subtotal_price;
            let totalPrice = req.session.full_total_price;
            let shippingId = transaction.id;
            let addressId = savedToAddress.id; // Use the address ID from the created address
            let trackingId = transaction.tracker?.id || '';
            let trackingCode = transaction.tracker?.tracking_code || '';
            let dateStart = transaction.created_at;
            let dateEnd = transaction.tracker?.est_delivery_date || '';
            let deliveryStatus = transaction.tracker?.status || '';
            let userId = req.user.id;

            // Create the order
            await order.create({
                fullName,
                phoneNumber,
                address,
                address1,
                city,
                country,
                postalCode,
                deliverFee,
                subtotalPrice,
                totalPrice,
                shippingId,
                addressId,
                trackingId,
                trackingCode,
                dateStart,
                dateEnd,
                deliveryStatus,
                userId,
            }).then(async (order) => {
                for (var i in req.session.userCart) {
                    let product_name = req.session.userCart[i].Name;
                    let author = req.session.userCart[i].Author;
                    let publisher = req.session.userCart[i].Publisher;
                    let genre = req.session.userCart[i].Genre;
                    let price = req.session.userCart[i].SubtotalPrice;
                    let stock = req.session.userCart[i].Quantity;
                    let details = "";
                    let weight = req.session.userCart[i].SubtotalWeight;
                    let product_image = req.session.userCart[i].Image;
                    let orderId = order.id;
                    total_weight_oz = (
                        parseFloat(total_weight_oz) + parseFloat(weight)
                    ).toFixed(2);

                    await order_item.create({
                        product_name,
                        author,
                        publisher,
                        genre,
                        price,
                        stock,
                        details,
                        weight,
                        product_image,
                        orderId,
                    });
                }

                // Send the tracking URL via SMS
                const tracker = await api.Tracker.retrieve(trackingCode);
                let trackingURL = tracker.public_url;
                await client.messages.create({
                    body: `Thank you for your purchase from the Book Store. Your tracking code is ${trackingCode} and you can check your delivery here: ${trackingURL}`,
                    from: process.env.TWILIO_ACCOUNT_PHONENO,
                    to: process.env.DEV_PHONENO,
                }).then((message) => console.log(message.sid));

                // Empty the cart
                req.session.userCart = {};
                req.session.coupon_type = null;
                req.session.discount = 0;
                req.session.discount_limit = 0;
                req.session.discounted_price = (0).toFixed(2);
                req.session.shipping_discount = 0;
                req.session.shipping_discount_limit = 0;
                req.session.shipping_discounted_price = 0;
                req.session.sub_discount = 0;
                req.session.sub_discount_limit = 0;
                req.session.sub_discounted_price = 0;
                req.session.full_subtotal_price = 0;
                req.session.full_total_price = 0;
                req.session.deducted = 0;
                req.session.coupon_type = null;
                req.session.save();

                res.redirect("/product/stripetxn_end");
            });
        } else {
            console.log("Address verification failed");
            alertMessage(
                res,
                "danger",
                "Please enter a valid address",
                "fas fa-exclamation-circle",
                true
            );
            res.redirect("/delivery/checkout");
        }
    } catch (error) {
        console.error("Error:", error.message);
        res.status(500).send("An error occurred while processing your request.");
    }
});




router.get("/paynow", checkCart, (req, res) => {
	var title = "PayNow Payment";
	// let payNowString = paynow('proxyType','proxyValue','edit',price,'merchantName','additionalComments')
	let payNowString = paynow.paynowGenerator(
		"mobile",
		"87558054",
		"no",
		req.session.full_total_price,
		"Test Merchant Name",
		"Testing paynow"
	);
	let qr = QRCode.toDataURL(payNowString)
		.then((url) => {
			//   console.log(url)
			res.render("checkout/paynow", {
				payNowString,
				qr,
				url,
			});
		})
		.catch((err) => {
			console.error(err);
		});
});

router.post("/paynow", async (req, res) => {
	let the_date = moment().format("D MMM YYYY");
	let dateStart = the_date.toString();
	console.log("dateStart is " + dateStart);

	// Create a unconfirmed order
	const new_pending_order = await Pending_Order.create({
		fullName: req.session.recipientName,
		phoneNumber: req.session.recipientPhoneNo,
		address: req.session.address,
		address1: req.session.address1,
		city: req.session.city,
		country: req.session.countryShipment,
		postalCode: req.session.postalCode,
		deliverFee: 0,
		subtotalPrice: parseFloat(req.session.full_subtotal_price).toFixed(2),
		totalPrice: parseFloat(req.session.full_total_price).toFixed(2),
		dateStart: dateStart,
		userId: req.user.id,
	}).catch((err) => {
		console.log("Cannot create pending order");
		console.log(err);
	});

	// Store unconfirmed order's order items
	for (var i in req.session.userCart) {
		let product_name = req.session.userCart[i].Name;
		let author = req.session.userCart[i].Author;
		let publisher = req.session.userCart[i].Publisher;
		let genre = req.session.userCart[i].Genre;
		let price = req.session.userCart[i].SubtotalPrice;
		let stock = req.session.userCart[i].Quantity;
		let details = "";
		let weight = req.session.userCart[i].SubtotalWeight;
		let product_image = req.session.userCart[i].Image;
		let PorderId = new_pending_order.id;
		const new_pi = await Pending_OrderItem.create({
			product_name,
			author,
			publisher,
			genre,
			price,
			stock,
			details,
			weight,
			product_image,
			pendingOrderId: PorderId,
		}).catch((err) => {
			console.log("Cannot create pending order item");
			console.log(err);
		});
	}

	// This block of code below will send a message
	client.messages
		.create({
			body: "You made an order with BookStore via payNow/payLah!, you will be notified again when your order is confirmed",
			from: process.env.TWILIO_ACCOUNT_PHONENO,
			to: process.env.DEV_PHONENO,
		})
		.then((message) => console.log(message.sid));

	// Empty the cart
	req.session.userCart = {};
	req.session.coupon_type = null;
	req.session.discount = 0;
	req.session.discount_limit = 0;
	req.session.discounted_price = (0).toFixed(2);
	req.session.shipping_discount = 0;
	req.session.shipping_discount_limit = 0;
	req.session.shipping_discounted_price = 0;
	req.session.sub_discount = 0;
	req.session.sub_discount_limit = 0;
	req.session.sub_discounted_price = 0;
	req.session.full_subtotal_price = 0;
	req.session.full_total_price = 0;
	req.session.deducted = 0;
	req.session.coupon_type = null;
	alertMessage(
		res,
		"success",
		"Order placed, the administrator will shortly confirm your payment",
		"fas fa-exclamation-circle",
		true
	);
	res.redirect("paynowtxn_end");
});

router.get("/stripetxn_end", (req, res) => {
	var title = "Thank you!";
	res.render("checkout/thankYouStripe", {
		title,
	});
});

router.get("/paynowtxn_end", (req, res) => {
	var title = "Thank you!";
	res.render("checkout/thankYouPayNow", {
		title,
	});
});

// Admin Side

router.get("/discountmenu", ensureAdminAuthenticated, (req, res) => {
	var title = "Discount & Coupon Menu";
	res.render("checkout/discountmenu", {
		title,
	});
});

router.get("/viewPendingOrders", ensureAdminAuthenticated, async (req, res) => {
	const title = "View Pending Orders";

	Pending_Order.findAll({
		where: {},
		include: [{ model: Pending_OrderItem }],
	}).then((pending_order) => {
		res.render("checkout/viewPendingOrders", {
			PendingOrders: pending_order,
			title,
			// Don't need this below, wont work when rendering
			// PendingOrderItems: pending_order.pending_orderitems
		});
	});

	// console.log("PENDING ORDER ITEMS ARE " + PendingOrders.Pending_OrderItem)
}),
	router.get(
		"/ConfirmPOrder/:id",
		ensureAdminAuthenticated,
		async (req, res) => {
			const PO = await Pending_Order.findOne({ where: { id: req.params.id } });
			const Pi = await Pending_OrderItem.findAll({
				where: { pendingOrderId: PO.id },
			});

			const parcel = new api.Parcel({
				predefined_package: "Parcel",
				weight: 10, //change number according to weight of total books
			});

			parcel.save();

			const fromAddress = new api.Address({
				//default address of company
				name: "Bookstore",
				street1: "118 2nd Street",
				street2: "4th Floor",
				city: "San Francisco",
				state: "CA",
				country: "US",
				zip: "94105",
				phone: "415-123-4567",
				email: "example@example.com",
			});
			//fromAddress.save().then(console.log);

			const toAddress = new api.Address({
				verify: ["delivery"],
				/*name: fullName,
            company: "-",
            street1: address,
            city: city,
            state: "-",
            phone: phoneNumber,
            country: country,
            zip: postalCode,*/
				//example code cos too lazy to type down
				name: "George Costanza",
				company: "Vandelay Industries",
				street1: "1 E 161st St.",
				phone: PO.phoneNumber,
				city: "Bronx",
				state: "NY",
				//zip: "10451", //Actual zipcode
				zip: "12412352551",
			});
			toAddress
				.save()
				.then((addr) => {
					//console.log(addr);
					//console.log(addr.verifications)
					let checkAddress = addr.verifications.delivery.success;
					//console.log(addr.verifications.delivery.errors[0])
					if (checkAddress == true) {
						const shipment = new api.Shipment({
							to_address: toAddress,
							from_address: fromAddress,
							parcel: parcel,
						});
						//shipment.save()//.then(console.log);
						shipment.save().then((s) => {
							s.buy(shipment.lowestRate(["USPS"], ["First"])).then((t) => {
								console.log("=============");
								console.log(t.id);
								let fullName = PO.id;
								let phoneNumber = PO.phoneNumber;
								let address = PO.address;
								let address1 = PO.address1;
								let city = PO.city;
								let country = PO.country;
								let postalCode = PO.postalCode;
								let deliverFee = PO.deliverFee;
								let subtotalPrice = PO.subtotalPrice;
								let totalPrice = PO.totalPrice;
								let shippingId = t.id;
								let addressId = t.to_address.id;
								let trackingId = t.tracker.id;
								let trackingCode = t.tracker.tracking_code;
								let dateStart = t.created_at;
								let dateEnd = t.tracker.est_delivery_date;
								let deliveryStatus = t.tracker.status;
								let userId = PO.userId;
								order
									.create({
										fullName,
										phoneNumber,
										address,
										address1,
										city,
										country,
										postalCode,
										deliverFee,
										subtotalPrice,
										totalPrice,
										shippingId,
										addressId,
										trackingId,
										trackingCode,
										dateStart,
										dateEnd,
										deliveryStatus,
										userId,
									})

									.then((order) => {
										for (var i in Pi) {
											//   let id = req.session.userCart[i].ID;
											let product_name = Pi[i].product_name;
											let author = Pi[i].author;
											let publisher = Pi[i].publisher;
											let genre = Pi[i].genre;
											let price = Pi[i].price;
											let stock = Pi[i].stock;
											let details = "";
											let weight = Pi[i].weight;
											let product_image = Pi[i].product_image;
											let orderId = order.id;
											order_item.create({
												product_name,
												author,
												publisher,
												genre,
												price,
												stock,
												details,
												weight,
												product_image,
												orderId,
											});
										}
										console.log(order);
										// Delete pending orders and pis since order confirmed already
										PO.destroy();
										for (i in Pi) {
											console.log(`Deleting Product ${i}`);
											Pi[i].destroy();
										}
										alertMessage(
											res,
											"success",
											`Confirmed Order ${order.id} which belongs to user of id ${order.userId}`,
											"fas fa-exclamation-circle",
											true
										);
										res.redirect("/product/viewPendingOrders");
										let trackingCode = order.dataValues.trackingCode;
										api.Tracker.retrieve(trackingCode).then((t) => {
											console.log(t.public_url);
											let trackingURL = t.public_url;
											client.messages
												.create({
													body:
														"Your order has been confirmed!" +
														"Thank you for your purchase from the Book Store. Your tracking code is " +
														trackingCode +
														" and check your delivery here!\n" +
														trackingURL,
													from: process.env.TWILIO_ACCOUNT_PHONENO,
													to: order.phoneNumber,
												})
												.then((message) => console.log(message.sid));
										});
									});
							});
						});

						console.log("its true");
						//res.redirect("/delivery/checkout2");
					} else {
						console.log("its false");
						alertMessage(
							res,
							"danger",
							"Please enter a valid address",
							"fas faexclamation-circle",
							true
						);
						res.redirect("/product/viewPendingOrders");
					}
					//console.log(addr.verifications.errors);
				})
				.catch((e) => {
					console.log(e); //check errors
				});
		}
	);

router.get("/DeletePOrder/:id", ensureAdminAuthenticated, async (req, res) => {
	// Code commented out below does work... but doesn't remove pending order items associated with it when a PO is deleted
	// Pending_Order.findOne({where: {id: req.params.id}, include:[{model:Pending_OrderItem}]})
	// .then((po)=> {
	//     po.destroy();
	// })

	const PO = await Pending_Order.findOne({ where: { id: req.params.id } });
	const Pi = await Pending_OrderItem.findAll({
		where: { pendingOrderId: PO.id },
	});
	// console.log("Pi IS")
	// console.log(Pi[0].destroy())
	client.messages
		.create({
			body: "From BookStore: We are sorry to inform you that your order has cancelled by the administrator due to lack of payment",
			from: process.env.TWILIO_ACCOUNT_PHONENO,
			to: PO.phoneNumber,
		})
		.then((message) => console.log(message.sid));
	alertMessage(
		res,
		"success",
		`Pending Order with ID ${PO.id} Deleted`,
		"fas fa-exclamation-circle",
		true
	);
	PO.destroy();
	for (i in Pi) {
		console.log(`Deleting Product ${i}`);
		Pi[i].destroy();
	}
	res.redirect("/product/viewPendingOrders");
});

router.get("/createCoupon", ensureAdminAuthenticated, (req, res) => {
	// if (!req.session.public_coupon) {
	//     req.session.public_coupon = "NULL";
	// }
	const title = "Create Coupon";
	let currentDate = moment(req.body.currentDate, "DD/MM/YYYY");
	// Get current time of server
	// hh or HH = 24 hr format, h / H = 12 hr format, a = PM/AM
	let currentTime = moment().format("HH:mm");

	let errors;

	res.render("checkout/createCoupon", {
		title,
		currentTime,
		errors,
	});
});

router.post("/createCoupon", ensureAdminAuthenticated, (req, res) => {
	// Retrieve the inputs from the create coupon form
	let coupon_code = req.body.coupon_code;
	let coupon_type = req.body.coupon_type;
	let coupon_discount = req.body.coupon_discount;
	let coupon_limit = req.body.coupon_limit;
	let coupon_public = req.body.coupon_public;
	let coupon_msg = req.body.coupon_msg;
	// let coupon_expire_date = req.body.coupon_expire_date;
	// let coupon_expire_time = req.body.coupon_expire_time;
	let full_time =
		req.body.coupon_expire_date + " " + req.body.coupon_expire_time;

	// Note that the date/time stored in mySQL will be GMT althought date/time is based on our server(SGT)
	// E.g Coupon expiry date and time is SGT (GMT+8) 09/08/2020, 06:00 -> GMT 08/08/2020, 22:00
	let expiry_date_time = moment(full_time, "DD/MM/YYYY, hh:mm:ss a");

	let current_time = moment();
	let et = moment(expiry_date_time); // format into the same way as current_time (in ms)

	// Set BOOLEAN value of 'public' column
	if (coupon_public == "YES") {
		coupon_public = 1;
	} else {
		coupon_public = 0;
	}

	Coupon.findOne({
		where: { code: coupon_code },
	}).then((c) => {
		// Duplicate case
		if (c) {
			console.log("Coupon of the same code already exist");
			alertMessage(
				res,
				"danger",
				`Code ${c.code} already exists!`,
				"fas fa-exclamation-circle",
				true
			);
			res.redirect("createCoupon");
		}

		// Invalid/Expired time case
		if (et.isBefore(current_time)) {
			// prevent user from inputting a date/time that has already passed
			alertMessage(
				res,
				"danger",
				`Date or Time entered invalid!`,
				"fas fa-exclamation-circle",
				true
			);
			res.redirect("createCoupon");
		}

		// No problem, create
		else {
			Coupon.create({
				code: coupon_code,
				type: coupon_type,
				discount: coupon_discount,
				limit: coupon_limit,
				public: coupon_public,
				message: coupon_msg,
				expiry: expiry_date_time,
			})
				.then((coupon_object) => {
					// If new coupon is public and there are existing public coupon, override it
					if (coupon_object.public == 1 && req.session.public_coupon != null) {
						let oc = req.session.public_coupon;
						console.log(oc.code);
						req.session.public_coupon = coupon_object;
						Coupon.destroy({
							where: { id: oc.id },
						});
						// oc.destroy(); -> doesnt work 'oc doesnt have function 'destroy'
					}

					req.session.save();
					alertMessage(
						res,
						"success",
						`Coupon Code ${coupon_object.code} Created, it expires on ${coupon_object.expiry}`,
						"fas fa-exclamation-circle",
						true
					);
					res.redirect("/product/createCoupon");
				})
				.catch(() => {
					console.log("Something went wrong with creating the coupon");
				});
		}
	});
});

// Create Discount Page
router.get("/createDiscount", ensureAdminAuthenticated, async (req, res) => {
	const title = "Create Discount";
	let currentDate = moment(req.body.currentDate, "DD/MM/YYYY");
	let currentTime = moment().format("HH:mm");
	let errors;

	let products = await ProductAdmin.findAll({});
	res.render("checkout/createDiscount", {
		title,
		currentTime,
		errors,
		products,
	});
});

router.post("/createDiscount", ensureAdminAuthenticated, async (req, res) => {
	// Retrieve the inputs from the create discount form
	let target_id = req.body.target_id;
	let product_discount = req.body.product_discount;
	let min_qty = req.body.min_qty;
	let discount_msg = req.body.discount_msg;
	let discount_expire_date = req.body.discount_expire_date;
	let discount_expire_time = req.body.discount_expire_time;
	let stackable = 0;
	let full_time =
		req.body.discount_expire_date + " " + req.body.discount_expire_time;

	// Note that the date/time stored in mySQL will be GMT althought date/time is based on our server(SGT)
	// E.g Coupon expiry date and time is SGT (GMT+8) 09/08/2020, 06:00 -> GMT 08/08/2020, 22:00
	let expiry_date_time = moment(full_time, "DD/MM/YYYY, hh:mm:ss a");

	let current_time = moment();
	let et = moment(expiry_date_time); // format into the same way as current_time (in ms)

	let d = await Discount.findOne({ where: { target_id: target_id } });

	// Duplicate case
	if (d != null) {
		console.log("Discount of the same code already exist");
		alertMessage(
			res,
			"danger",
			`Discount for ID: ${d.target_id} already exists!`,
			"fas fa-exclamation-circle",
			true
		);
		// res.redirect('createDiscount')
	}

	// Invalid/Expired time case
	else if (et.isBefore(current_time)) {
		// prevent user from inputting a date/time that has already passed
		alertMessage(
			res,
			"danger",
			`Date or Time entered invalid!`,
			"fas fa-exclamation-circle",
			true
		);
		// res.redirect('createDiscount')
	}

	// No problem, create
	else if (d == null) {
		let new_d = await Discount.create({
			discount_rate: product_discount,
			min_qty: min_qty,
			expiry: expiry_date_time,
			stackable: stackable,
			message: discount_msg,
			target_id: target_id,
		});

		alertMessage(
			res,
			"success",
			`Discount for Product ID: ${new_d.target_id} Created, it expires on ${new_d.expiry}`,
			"fas fa-exclamation-circle",
			true
		);
	}

	res.redirect("/product/createDiscount");
});

// Admin - View Discounts and Coupons and Delete together

router.get("/viewDiscount", ensureAdminAuthenticated, async (req, res) => {
	let title = "View Discount";
	let discounts = await Discount.findAll({});
	let coupons = await Coupon.findAll({});
	res.render("checkout/viewDiscount", {
		title,
		discounts,
		coupons,
	});
});

router.get(
	"/deleteDiscount/:id",
	ensureAdminAuthenticated,
	async (req, res) => {
		let target_id = req.params.id;
		let url = "/product/viewDiscount";
		Discount.findOne({
			where: { target_id: target_id },
		})
			.then((disc_object) => {
				if (disc_object != null) {
					disc_object.destroy();
					alertMessage(
						res,
						"success",
						"Discount for Product " + target_id + " is successfully deleted",
						"fas fa-sign-in-alt",
						true
					);
				} else {
					url = "/";
					console.log("Invalid ID provided, not deleting anything");
				}
			})
			.catch((err) => {
				console.log(err);
			});

		res.redirect(url);
	}
);

router.get("/deleteCoupon/:id", ensureAdminAuthenticated, async (req, res) => {
	let id = req.params.id;
	let url = "/product/viewDiscount";
	Coupon.findOne({
		where: { id: id },
	})
		.then((c) => {
			if (c != null) {
				c.destroy();
				alertMessage(
					res,
					"success",
					"Coupon " + id + " is successfully deleted",
					"fas fa-sign-in-alt",
					true
				);
			} else {
				url = "/";
				console.log("Invalid ID provided, not deleting anything");
			}
		})
		.catch((err) => {
			console.log(err);
		});

	res.redirect(url);
});

router.get("/testing", (req, res) => {
	let title = "Testing 123";
	var obj2 = { 0: { num: 1 }, 1: { num: 2 }, 2: { num: 3 }, 3: { num: 4 } };

	const page = parseInt(req.query.page);
	const limit = parseInt(req.query.limit);

	// page - 1 because index start on 0
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	// we want to let user know if there is a page after or before
	const results = {};

	// Retrieve next page data
	if (endIndex < Object.keys(obj2).length) {
		results.next = {
			page: page + 1,
			limit: limit,
		};
	}

	// Retrieve previous page data
	if (startIndex > 0) {
		results.previous = {
			page: page - 1,
			limit: limit,
		};
	}

	var obj = { 0: "zero", 1: "one", 2: "two", 3: "three", 4: "four" };
	// results.results = Object.keys(cart_items).slice(startIndex,endIndex).map(key => ({[key]:cart_items[key]}));
	results.results = Object.keys(obj2)
		.slice(startIndex, endIndex)
		.map((key) => ({ [key]: obj2[key] }));

	// test that it works with this
	// https://localhost:5000/product/getjson?page=2&limit=5

	console.log(results);

	res.render("checkout/testing123", {
		title,
		results,
	});
	// res.json(results)
	// https://localhost:5000/product/testing?page=1&limit=5
});

router.get("/testing2", (req, res) => {
	title = "Pagination";
	const cart_items = req.session.userCart;
	// user cart is an object that stores product ids as key containing all value (product object) e.g
	// {1:{Name:cab}, 2:{Name: abc}}
	// the inputs
	const page = parseInt(req.query.page);
	const limit = 3;
	// const limit = parseInt(req.query.limit)

	// page - 1 because index start on 0
	// e.g page 1 start index (0* 5 = 0 , end index = 1 * 5 = 5)
	// page 2 start: (2-1) * 5 = 5 , end: 2*5 = 10
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	// we want to let user know if there is a page after or before
	const results = {};

	// Retrieve next page data
	// if statement to check if there should be a 'next', when the end index is lesser than the length of object
	if (endIndex < Object.keys(cart_items).length) {
		results.next = {
			page: page + 1,
			limit: limit,
		};
	}

	// Retrieve previous page data
	// works similary for the next
	if (startIndex > 0) {
		results.previous = {
			page: page - 1,
			limit: limit,
		};
	}

	results.pages = Math.ceil(Object.keys(cart_items).length / limit);
	console.log("");
	// console.log("=== PAGES ===", results.pages)
	// console.log("=== PREVIOUS === ", results.previous.page)
	// The line with the magic happening
	// Object.keys(cart_items) will return an array of the product ids in the cart
	// Then we slice it based on the input for the page & limit,
	// finally we apply map() on it to retrieve the cart_items with the segmented product ids
	results.results = Object.keys(cart_items)
		.slice(startIndex, endIndex)
		.map((key) => ({ [key]: cart_items[key] }));

	console.log(results.results);
	res.render("checkout/testing1234", {
		title,
		results,
	});
	// https://localhost:5000/product/testing2?page=1&limit=5
});

// Testing new stuff 18 Aug

router.get("/getjson", (req, res) => {
	// const myusers = await User.findAll({})
	// res.json(myusers)
	const cart_items = req.session.userCart;
	const page = parseInt(req.query.page);
	const limit = parseInt(req.query.limit);

	// page - 1 because index start on 0
	const startIndex = (page - 1) * limit;
	const endIndex = page * limit;

	// we want to let user know if there is a page after or before
	const results = {};

	// Retrieve next page data
	if (endIndex < Object.keys(cart_items).length) {
		results.next = {
			page: page + 1,
			limit: limit,
		};
	}

	// Retrieve previous page data
	if (startIndex > 0) {
		results.previous = {
			page: page - 1,
			limit: limit,
		};
	}

	var obj = { 0: "zero", 1: "one", 2: "two", 3: "three", 4: "four" };
	var obj2 = { 0: { num: 1 }, 1: { num: 2 }, 2: { num: 3 }, 3: { num: 4 } };
	results.results = Object.keys(cart_items)
		.slice(startIndex, endIndex)
		.map((key) => ({ [key]: cart_items[key] }));

	// test that it works with this
	// https://localhost:5000/product/getjson?page=2&limit=5

	// Object.keys() returns array of an object's internal properties
	// var result = Object.keys(obj).slice(0,2).map(key => ({[key]:obj[key]}));
	// console.log(result);
	console.log(results.results);
	res.json(results);
	// res.render('checkout/json')
});

router.get("/event", (req, res) => {
	var title = "Event Emitter Test";
	// We import the EMT class from EMT.js, create a new object with it
	// the object inherits the EventEmitter methods like 'on' and 'emit'
	// 'on' is an alias for 'addEventListener'
	// Note that the 'on' method has to placed before the method tahht calls the event.
	new_emt_obj = new EMT();
	// DONT PUT RES AND REQ IN THE PARAMETERS, WILL MAKE THEM UNDEFINED
	new_emt_obj.on("notify_user", () => {
		console.log("Notify User");
		req.session.userCart = {
			3: {
				ID: 3,
				Name: "Eloquent JavaScript",
				Author: "Marijn Haverbeke",
				Publisher: "No Starch Press",
				Genre: "COMPUTERS",
				Price: "20.00",
				Stock: "30",
				Weight: "1008",
				Image:
					"http://books.google.com/books/content?id=9U5I_tskq9MC&printsec=frontcover&img=1&zoom=1&edge=curl&source=gbs_api",
				Quantity: 1,
				SubtotalPrice: "69.00",
				SubtotalWeight: "1008",
			},
		};
		alertMessage(
			res,
			"success",
			`You are at the event emitter page!`,
			"fas fa-sign-in-alt",
			true
		);
	});

	new_emt_obj.notify_user();

	res.render("checkout/event");
});

export { router };
