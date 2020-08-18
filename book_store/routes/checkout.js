// Dont touch this file for now.. - W


const express = require('express');
const Product = require('../models/product'); // Bring in Sequelize object 'Product'
// const CartItems = require('../models/cart_items');
const router = express.Router();
const alertMessage=require('../helpers/messenger');
const moment = require('moment');
const Coupon = require('../models/coupon');
// const Order = require('../models/order');
// const OrderItem = require('../models/order');
// const userCart = {1:{"ID":1, "Name":"Dynamic Book Name", "Image":"r1", "Quantity":5, "SubtotalPrice":10.00},
// 2:{"ID":2, "Name":"Dynamic Book Name 2", "Image":"r2", "Quantity":10, "SubtotalPrice":20.00}}
// const userCart = {1:{"ID":1, "Name":"r1", "Author":"John Doe", 
// "Publisher":"The Publisher", "Genre":"Non-fiction", "Image":"r1", "Price":10.00, "Stock":40, "Quantity":10, "SubtotalPrice":0, "Weight":300, "SubtotalWeight":0},
// 2:{"ID":2, "Name":"r2", "Author":"John Lim", 
// "Publisher":"The Publisher", "Genre":"Fiction", "Image":"r2", "Price":5.50, "Stock":50, "Quantity":10, "SubtotalPrice":0, "Weight":500, "SubtotalWeight":0}}
const userCart = {}
let coupon_type;
let discount = 0;
let discount_limit = 0;
let discounted_price = 0;
let shipping_discount = 0;
let shipping_discount_limit = 0;
let shipping_discounted_price = 0;
let sub_discount = 0;
let sub_discount_limit = 0;
let sub_discounted_price = 0;
let full_total_price = 0;

const stripe = require('stripe')('sk_test_ns9DyHTray5Wihniw93C2ANH00IMJTVjKw', {
    apiVersion: '2020-03-02',
  });

// router.get('/123', (req, res) => {
//     res.render('checkout/checkout', {
//         title:"Testing"
//     })
// })

router.get('/listproduct/:id', (req, res, next) => {
    // 'Add to Cart' button passes value of product id to server
    // queries product id with database
    // stores each cartitesm with id, name and quantity
    console.log("ADDDDDING")
    productadmin.findOne({
        where: {
            id: req.params.id // Button with name: id
        }
    })

    .then((product) => {
        var id = product.id;
        let name = product.product_name;
        let author = product.author;
        let publisher = product.publisher;
        let genre = product.genre;
        let price =product.price;
        let stock = product.stock;
        let details = product.details;
        let weight = product.weight;
        let image = product.product_image;

        console.log('ID IS ' + id)
        if (userCart.length < 1) {
            let qty = 1 
            // Image field not decided yet, the rest is done.
            userCart[[id]] = {"ID":id, "Name":name, "Author":author, "Publisher":publisher, "Genre":genre, "Price":price, "Stock":stock,
            "Weight":weight, "Image":image, "Quantity":qty, "SubtotalPrice":0.00, "SubtotalWeight":0}
            console.log(userCart)
        }
    
        else {
            var check = false;
            for (z in userCart) {
                if (z == id) {
                    console.log("FOUND EXISTING PRODUCT IN CART")
                    userCart[z].Quantity += 1
                    userCart[z].SubtotalPrice = (parseFloat(userCart[z].SubtotalPrice) + parseFloat(product.price)).toFixed(2)
                    check = true;
                    console.log(userCart)
                }
            }
            if (check == false) {
                let qty = 1 
                // Again, the Image field not decided yet, the rest is done.
                // userCart[[id]] = {"ID":id, "Name":name, "Image":image, "Quantity":qty, "SubtotalPrice":product.price}
                userCart[[id]] = {"ID":id, "Name":name, "Author":author, "Publisher":publisher, "Genre":genre, "Price":price, "Stock":stock,
                "Weight":weight, "Image":image, "Quantity":qty, "SubtotalPrice":0.00, "SubtotalWeight":0}
                console.log(userCart)
            }
        }})

    res.redirect('/product/listproduct')
    console.log("Added to cart");
});

// Retrieve Cart
// Done
router.get('/cart', (req, res) => { 
// let time = moment("2020-05-10", "YYYY/MM/DD");
// let time2 = time.toString();
// console.log(time2)

// Get Subtotal Price of each item
for (z in userCart) {
    userCart[z].SubtotalPrice = (userCart[z].Quantity * userCart[z].Price).toFixed(2);
}

for (z in userCart) {
    userCart[z].SubtotalWeight = (userCart[z].Quantity * userCart[z].Weight)
    // console.log(`Subtotal Weight is ${userCart[z].SubtotalWeight}`)
}

// Get the full subtotal price of all items
let full_subtotal_price = 0;

// Get full total price (Subtotal of all items + shipping after discounts(if any))
// let full_total_price = 0;
let shipping_fee = (10).toFixed(2);
let total_weight = 0;
let total_weight_oz = 0;

for (z in userCart) {
    total_weight = total_weight + userCart[z].SubtotalWeight
}

// Round up to next number regardless of decimal value with ceil function
total_weight_oz = Math.ceil((total_weight * 0.035274))

if (coupon_type == "OVERALL") {
    console.log("Coupon TYPE IS OVERALL")
    for (z in userCart) {
        full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(userCart[z].SubtotalPrice)).toFixed(2)
        console.log(full_subtotal_price)
    }
    discounted_price = ((parseFloat(full_subtotal_price) + parseFloat(shipping_fee)) * (parseFloat(discount))).toFixed(2)
    if (parseFloat(discounted_price) > parseFloat(discount_limit)) {
        discounted_price = discount_limit
        full_total_price = ((parseFloat(full_subtotal_price) + parseFloat(shipping_fee)) - parseFloat(discount_limit)).toFixed(2)
}
    else {
        // full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2) * (1- parseFloat(discount)).toFixed(2)
        full_total_price = ((parseFloat(full_subtotal_price) + parseFloat(shipping_fee)) * (1.00 - parseFloat(discount))).toFixed(2)
    }
}

else if (coupon_type == "SHIP") {
    console.log("Coupon TYPE IS SHIP")
    for (z in userCart) {
        full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(userCart[z].SubtotalPrice)).toFixed(2)
        console.log(full_subtotal_price)
    }
    shipping_discounted_price = parseFloat(shipping_fee) * (shipping_discount)
    if (parseFloat(shipping_discounted_price) > parseFloat(shipping_discount_limit)) {
        discounted_price = shipping_discount_limit
        shipping_fee = (parseFloat(shipping_fee) - parseFloat(discount_limit)).toFixed(2)
        full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
    }

    else {
        discounted_price = ((parseFloat(shipping_fee)) * (parseFloat(shipping_discount))).toFixed(2)
        shipping_fee = ((parseFloat(shipping_fee)) * (1-parseFloat(shipping_discount))).toFixed(2)
        full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
    }
}

else if (coupon_type == "SUB") {
    console.log("Coupon TYPE IS SUB")
    for (z in userCart) {
        full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(userCart[z].SubtotalPrice)).toFixed(2)
        console.log(full_subtotal_price)
    }
    sub_discounted_price = parseFloat(full_subtotal_price) * (sub_discount)
    if (parseFloat(sub_discounted_price) > parseFloat(sub_discount_limit)) {
        discounted_price = sub_discount_limit
        console.log(full_subtotal_price)
        full_subtotal_price = (parseFloat(full_subtotal_price) - parseFloat(sub_discount_limit)).toFixed(2)
        console.log(full_subtotal_price)
        full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
    }

    else {
        discounted_price = (parseFloat(full_subtotal_price) * parseFloat(sub_discount)).toFixed(2)
        full_subtotal_price = (parseFloat(full_subtotal_price) * parseFloat(1 - sub_discount)).toFixed(2)
        full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
    }

}

else {
    for (z in userCart) {
        full_subtotal_price = (parseFloat(full_subtotal_price) + parseFloat(userCart[z].SubtotalPrice)).toFixed(2)
        console.log(full_subtotal_price)
    }
    full_total_price = (parseFloat(full_subtotal_price) + parseFloat(shipping_fee)).toFixed(2)
}

res.render('checkout/cart', {
    discount,
    discounted_price,
    full_subtotal_price,
    userCart,
    full_total_price,
    shipping_fee,
    total_weight,
    total_weight_oz
    })
});

// Cart Coupon
router.post('/applyCoupon', (req,res) => {
    Coupon.findOne({
        where: {code: req.body.coupon}
    })

    .then((coupon) => {
        console.log(coupon.code)
        coupon_type = coupon.type
        alertMessage(res, 'success', 'code ' + req.body.coupon + ' applied', 'fas fa-exclamation-circle', true)
        if (coupon_type == "OVERALL") {
            discount = coupon.discount;
            discount_limit = coupon.limit;
            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your total order (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
        }
        else if (coupon_type == "SHIP" ) {
            shipping_discount = coupon.discount
            shipping_discount_limit = coupon.limit
            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your total shipping fee (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
        }

        else if (coupon_type == "SUB") {
            sub_discount = coupon.discount
            sub_discount_limit = coupon.limit
            alertMessage(res, 'success', `${(coupon.discount * 100)}% off your subtotal (excluding shipping) (save up to $${coupon.limit})`, 'fas fa-exclamation-circle', true)
        }
        // discount = coupon.discount;
        // discount_limit = coupon.limit;
        res.redirect("cart")
    })

    .catch(()=> {
        alertMessage(res, 'danger', 'code ' + req.body.coupon + ' is invalid', 'fas fa-exclamation-circle', true)
        res.redirect("cart")
    })
})

//

// Update Cart / Proceed to Checkout
router.post('/cart', (req, res) => {
    if (req.body.checkoutButton == "Update") { 
        for (ID in userCart) {
            let query = req.body["Q"+ID]
            console.log("Queried Quantity is " + query)
            userCart[ID].Quantity = query
            // newSubTotal = query * userCart[ID].SubtotalPrice
            // console.log("Q is" + req.body["Q" + ID])

        }
        console.log(userCart)
        res.redirect('cart');
    }

    else {
        res.redirect('checkout')
    }
})

// Delete Item in Cart

router.get('/delete/:id', (req, res) => {
    console.log(userCart[req.params.id])
    console.log(req.params.id)
    console.log('Before Delete' + userCart)
    delete userCart[req.params.id];
    console.log('After Delete' + userCart)
    alertMessage(res, 'success', req.params.id + ' is successfully deleted', 'fas fa-sign-in-alt', true)
    res.redirect('/checkout/cart');
});

//  Get checkout page
router.get('/checkout', (req, res) => {
    console.log("Full total price is " + full_total_price);
    const paymentIntent = stripe.paymentIntents.create({
        amount: Math.ceil((full_total_price * 100)),
        currency: 'sgd',
        payment_method_types: ['card'],
        receipt_email:'whjw1536@gmail.com',
    })

    .then((paymentIntent) => {
        console.log(paymentIntent)
        console.log("Client secret is " + paymentIntent.client_secret)
        res.render('checkout/checkout', { client_secret: paymentIntent.client_secret });
    })
})

// Checkout POST

router.post('/checkout', (req, res) => {
    // Ignore for now, old order code


    // let id_collection = ""
    // let name_collection = ""
    // let image_collection = ""
    // let qty_collection = ""
    // let subtotal_collection = ""
    // for (i in userCart) {
    //     id_collection = id_collection + i + ";"
    //     name_collection = name_collection + userCart[i].Name + ";"
    //     image_collection = image_collection + userCart[i].Image + ";"
    //     qty_collection = qty_collection + (userCart[i].Quantity).toString() + ";"
    //     subtotal_collection = subtotal_collection + (userCart[i].SubtotalPrice).toString() + ";"
    // }

    // Order.create(
    //     {uid: req.user.id,
    //     products_id_collection: id_collection,
    //     products_name_collection: name_collection,
    //     products_image_collection: image_collection,
    //     products_quantity_collection: qty_collection,
    //     products_subtotal_price_collection: subtotal_collection
    // })

    // .then((order)=> {
    //     console.log(order.get())
    // })
});

module.exports = router, userCart;
