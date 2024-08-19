import moment from "moment";
import Coupon from "../models/Coupon.js";


export default {

// Check if cart is empty
emptyCart: function (userCart) {
    for (var ID in userCart) {
        console.log(ID);
        if (userCart.hasOwnProperty(ID)) return false;
    }
    return true;
},


// Check current quantity of cart
count_cartQty: function (userCart) {
    let totalqty = 0;
    for (var z in userCart) {
        let qty = userCart[z].Quantity;
        totalqty = parseInt(totalqty) + parseInt(qty);
    }
    return totalqty;
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


check_product_discounted: function (qty, price, new_sub) {
    var og_subtotal = (qty * price).toFixed(2);
    if (og_subtotal != new_sub) {
        return og_subtotal;
    } else {
        return;
    }
},


displayAnyPrice: function (price) {
    price = parseFloat(price)
    return price.toFixed(2)
},

calculate_cart_initial_subtotal: function (userCart) {

    var cartSubtotal = 0

    for (var i in userCart) {
        var Item = userCart[i]
        var itemSubtotalPriceInitial = (Item.Price * Item.Quantity).toFixed(2)
        cartSubtotal += parseFloat(itemSubtotalPriceInitial)
    }

    return cartSubtotal

},

calculate_cart_discounted_subtotal: function (userCart) {
    var cartSubtotal = 0

    for (var i in userCart) {
        var Item = userCart[i]
        var itemSubtotalPricePostDiscount = (Item.SubtotalPrice).toFixed(2)
        cartSubtotal += parseFloat(itemSubtotalPricePostDiscount)
    }

    return cartSubtotal
},


// Calculate the total discount of the order on cart page (WORKING)
calculate_cart_total_discount_savings: function(userCart) {
    // Loop thru each item in cart, calculate total original price of an item - total discounted price of the item
    // Sum them together to get the total discount

    var cartTotalSavings = 0
    for (var i in userCart) {
        var Item = userCart[i]
        var itemSubtotalPriceOriginal = (Item.Price * Item.Quantity).toFixed(2)
        var itemSubtotalPriceDiscounted = Item.SubtotalPrice
        var itemTotalSavings = (itemSubtotalPriceOriginal - itemSubtotalPriceDiscounted).toFixed(2)
        cartTotalSavings += parseFloat(itemTotalSavings)

        // For testing
        // console.log(`=== Begin Calculating Discounts ===`)
        // console.log(`=== Item Name: ${Item.Name} ===`)
        // console.log(`Original Subtotal Price: ${itemSubtotalPriceOriginal} ===`)
        // console.log(`Discount Subtotal Price: ${itemSubtotalPriceDiscounted} ===`)
        // console.log(`Total Savings for item: ${itemTotalSavings} ===`)
    }

    //console.log(`=== Cart Total Savings: ${cartTotalSavings.toFixed(2)} ===`)
    return cartTotalSavings.toFixed(2)
},

calculate_cart_total_coupon_savings: async function(req, coupon_input) {
  // Retrieve necessary session variables
  const cart_shipping_fee = req.session.cart_shipping_fee;
  const initialSubTotal = req.session.cart_subtotal_initial;
  const discountedSubtotal = req.session.cart_subtotal_final;

  // For testing
  console.log(`=== [HELPER] Begin Calculating Coupon Savings ===`)
  console.log(`Current cart shipping fee: ${cart_shipping_fee} ===`)
  console.log(`Original Subtotal Price: ${initialSubTotal} ===`)
  console.log(`Discount Subtotal Price: ${discountedSubtotal} ===`)

  let couponTotalSavings = 0;

  try {
    const coupon = await Coupon.findOne({
      where: { code: coupon_input },
    });

    if (coupon) {
      console.log(`=== VALID COUPON FOUND! ${JSON.stringify(coupon)}`);

      // Set Session Variable
      req.session.coupon_object = coupon;
      req.session.coupon_type = coupon.type;

      // console.log("=== Checking Session2 Variables ===")
      // console.log(req.session)
    } else {
      // Reset Session Variable
      req.session.coupon_object = null;
      req.session.coupon_type = null;
      req.session.cart_coupon_savings = 0;
      console.log(`=== INVALID COUPON FOUND!`);
      return 0; // Return 0 if no valid coupon is found
    }

    if (req.session.coupon_type === "OVERALL") {
      console.log("=== OVERALL COUPON ===");
      console.log(`Initial Subtotal: ${initialSubTotal}`);
      console.log(`Discounted Subtotal: ${discountedSubtotal}`);
      console.log(`Cart Shipping Fee: ${cart_shipping_fee}`);

      req.session.coupon_discount = coupon.discount;
      req.session.coupon_discount_limit = coupon.limit;

      couponTotalSavings =
        discountedSubtotal +
        cart_shipping_fee -
        (discountedSubtotal + cart_shipping_fee) *
          (1 - req.session.coupon_discount);
      if (couponTotalSavings >= req.session.coupon_discount_limit) {
        couponTotalSavings = req.session.coupon_discount_limit;
      }
    } else if (req.session.coupon_type === "SHIP") {
      console.log("=== SHIP COUPON ===");
      req.session.coupon_shipping_discount = coupon.discount;
      req.session.coupon_shipping_discount_limit = coupon.limit;

      couponTotalSavings =
        cart_shipping_fee * (1 - req.session.coupon_discount);
      if (couponTotalSavings >= req.session.coupon_discount_limit) {
        couponTotalSavings = req.session.coupon_discount_limit;
      }
    } else if (req.session.coupon_type === "SUB") {
      console.log("=== SUB COUPON ===");
      req.session.coupon_subtotal_discount = coupon.discount;
      req.session.coupon_discount_limit = coupon.limit;

      couponTotalSavings =
        initialSubTotal -
        discountedSubtotal * (1 - req.session.coupon_discount);
      if (couponTotalSavings >= req.session.coupon_discount_limit) {
        couponTotalSavings = req.session.coupon_discount_limit;
      }
    }

    // convert to two d.p
    couponTotalSavings = couponTotalSavings.toFixed(2);
    console.log(couponTotalSavings);
    req.session.cart_coupon_savings = parseFloat(couponTotalSavings);
    return parseFloat(couponTotalSavings);
  } catch (err) {
    console.error(err);
    return 0; // Return 0 in case of an error
  }
}
}