import moment from "moment";
import Coupon from "../models/Coupon.js";
import productadmin from "../models/ProductAdmin.js";
import Discount from "../models/Discount.js";
import helper from "./hbs.js";
import chalk from 'chalk';

// Check if cart is empty
const checkEmptyCart = (userCart) => {
  for (const ID in userCart) {
    if (userCart.hasOwnProperty(ID)) return false;
  }
  return true;
};

// Check current quantity of cart
const countCartQty = (userCart) => {
  let totalqty = 0;
  for (const z in userCart) {
    const qty = userCart[z].Quantity;
    totalqty += parseInt(qty);
  }
  return totalqty;
};

const checkPromo = (public_coupon_session_obj) =>
  public_coupon_session_obj != null;

const convertDiscount = (discount) => discount * 100;

const displayCouponType = (coupon_type) => {
  switch (coupon_type) {
    case "OVERALL":
      return "total order";
    case "SHIP":
      return "shipping fee";
    case "SUB":
      return "subtotal (excluding shipping charge)";
    default:
      return "";
  }
};

const checkShipmentCountrySingapore = (country_var) => country_var === "SG";

// In use
const checkProductPriceDiscounted = (qty, price, new_sub) => {
  const og_subtotal = (qty * price).toFixed(2);
  return og_subtotal !== new_sub ? og_subtotal : undefined;
};

const calculate_cart_total_coupon_savings = async (req, coupon_input) => {
  const cart_shipping_fee = req.session.cart_shipping_fee;
  const initialSubTotal = req.session.cart_subtotal_initial;
  const discountedSubtotal = req.session.cart_subtotal_final;

  console.log(`${cart_shipping_fee}`);
  console.log(`${initialSubTotal}`);
  console.log(`${discountedSubtotal}`);
  let couponSavingsTotal = 0;

  try {
    const coupon = await Coupon.findOne({ where: { code: coupon_input } });

    if (coupon) {
      req.session.coupon_object = coupon;
      req.session.coupon_type = coupon.type;
    } else {
      req.session.coupon_object = null;
      req.session.coupon_type = null;
      req.session.cart_coupon_savings = 0;
      return 0; // Return 0 if no valid coupon is found
    }

    switch (req.session.coupon_type) {
      case "OVERALL":
        req.session.coupon_discount = coupon.discount;
        req.session.coupon_discount_limit = coupon.limit;
        couponSavingsTotal =
          discountedSubtotal +
          cart_shipping_fee -
          (discountedSubtotal + cart_shipping_fee) *
            (1 - req.session.coupon_discount);
        if (couponSavingsTotal >= req.session.coupon_discount_limit) {
          couponSavingsTotal = req.session.coupon_discount_limit;
        }
        break;
      case "SHIP":
        req.session.coupon_shipping_discount = coupon.discount;
        req.session.coupon_shipping_discount_limit = coupon.limit;
        couponSavingsTotal =
          cart_shipping_fee * (1 - req.session.coupon_discount);
        if (couponSavingsTotal >= req.session.coupon_discount_limit) {
          couponSavingsTotal = req.session.coupon_discount_limit;
        }
        break;
      case "SUB":
        req.session.coupon_subtotal_discount = coupon.discount;
        req.session.coupon_discount_limit = coupon.limit;
        couponSavingsTotal =
          initialSubTotal -
          discountedSubtotal * (1 - req.session.coupon_discount);
        if (couponSavingsTotal >= req.session.coupon_discount_limit) {
          couponSavingsTotal = req.session.coupon_discount_limit;
        }
        break;
      default:
        couponSavingsTotal = 0;
    }

    console.log(`couponSavingsTotal is ${couponSavingsTotal}`);
    couponSavingsTotal = parseFloat(couponSavingsTotal);
    req.session.cart_coupon_savings = parseFloat(couponSavingsTotal.toFixed(2));
    console.log(`couponSavingsTotal2 is ${couponSavingsTotal}`);

    // Need to do this otherwise the session wont save properly due to async operations and the main cart page session variables would still be 0
    const saveSessionResult = await helper.saveSession(req);
    console.log(`Session Promise Result: ${saveSessionResult}`);
    return couponSavingsTotal;
  } catch (err) {
    console.error(err);
    return 0; // Return 0 in case of an error
  }
};

// Calculate Discounted Price if item qty > 1
const calculateDiscountedPrice = (
  req,
  quantity,
  price,
  discountRate,
  minQty,
) => {
  const discountGroups = Math.floor(quantity / minQty);
  const originalSubtotalPrice = quantity * price;
  const discountedAmountForGroups =
    discountGroups * minQty * price * (1 - discountRate);
  const priceOfNonDiscountedItems =
    (quantity - discountGroups * minQty) * price;
  const discountedSubtotalPrice =
    discountedAmountForGroups + priceOfNonDiscountedItems;
  const totalDiscount = originalSubtotalPrice - discountedSubtotalPrice;

  req.session.cart_subtotal_initial = originalSubtotalPrice;
  req.session.cart_subtotal_final = discountedSubtotalPrice;
  req.session.cart_discount_savings = totalDiscount;

  return {
    originalSubtotalPrice: originalSubtotalPrice.toFixed(2),
    discountedSubtotalPrice: discountedSubtotalPrice.toFixed(2),
    totalDiscount: totalDiscount.toFixed(2),
  };
};

const updateCartItem = (req, cartItem, product, discount, increment_bool) => {
  if (increment_bool) {
    cartItem.Quantity += 1;
  }

  if (discount) {
    const { discountedSubtotalPrice, totalDiscount } = calculateDiscountedPrice(
      req,
      cartItem.Quantity,
      cartItem.Price,
      discount.discount_rate,
      discount.min_qty,
    );
    cartItem.SubtotalPrice = discountedSubtotalPrice;
  } else {
    // cartItem.SubtotalPrice = (
    //   parseFloat(cartItem.SubtotalPrice) + parseFloat(product.price)
    // ).toFixed(2);

    cartItem.SubtotalPrice = (
      parseFloat(cartItem.Price) * parseFloat(cartItem.Quantity)
    ).toFixed(2);
  }

  //   cartItem.SubtotalWeight = (
  //     parseFloat(cartItem.SubtotalWeight) + parseFloat(product.weight)
  //   ).toFixed(2);

  cartItem.SubtotalWeight = (
    parseFloat(cartItem.Weight) * parseFloat(product.Quantity)
  ).toFixed(2);
};

const refreshCartCalculations = async (req, cart) => {
  var initialSubtotal = 0;
  var discountedSubtotal = 0;
  var discountSavingsTotal = 0;
  var couponSavingsTotal = 0;
  var grandTotal = 0;
  var cart_shipping_fee = 0;
  // After the user deletes a cartitem obj from userCart session variable
  // Recalculate userCart initialSubTotal, discountedSubTotal
  // initialSubTotal = parseFloat((cart[item].Price) * (cart[item.Quantity])).toFixed(2)

  // Loop through the whole ssn cart, calculating the cart's initial subtotal, savings etc
  for (var i in cart) {
    var item = cart[i];
    console.log(`RCC | ${item.Name} `);
    const d = await Discount.findOne({
      where: { target_id: item.ID },
    });

    if (d) {
      console.log(`RCC | Discount Found `);
      var qty = parseFloat(item.Quantity);
      var price = parseFloat(item.Price);
      var dis_minQty = parseFloat(d.min_qty);
      var discountRate = parseFloat(d.discount_rate);
      const discountGroups = Math.floor(qty / dis_minQty);
      const originalSubtotalPrice = qty * price;
      const discountedAmountForGroups =
        discountGroups * dis_minQty * price * (1 - discountRate);
      const priceOfNonDiscountedItems =
        (qty - discountGroups * dis_minQty) * price;
      const discountedSubtotalPrice =
        discountedAmountForGroups + priceOfNonDiscountedItems;
      const totalDiscount = originalSubtotalPrice - discountedSubtotalPrice;
      initialSubtotal += originalSubtotalPrice;
      discountedSubtotal += discountedSubtotalPrice;
      discountSavingsTotal += totalDiscount;

      console.log(`RCC | Item ${item.Name}`);
      console.log(`RCC | initialSubtotal ${initialSubtotal}`);
      console.log(`RCC | discountedSubtotal ${discountedSubtotal}`);
      console.log(`RCC | discountSavingsTotal ${discountSavingsTotal}`);
    } else {
      console.log(`RCC | No Discount Found `);
      var qty = parseFloat(item.Quantity);
      var price = parseFloat(item.Price);
      const originalSubTotal = parseFloat(qty) * parseFloat(price);
      initialSubtotal += originalSubTotal;
      console.log(`RCC | initialSubtotal ${initialSubtotal}`);
    }

    console.log(chalk.magenta(`RCC | Final initialSubtotal ${initialSubtotal}`));
    console.log(chalk.magenta(`RCC | Final discountedSubtotal ${discountedSubtotal} `));
    console.log(chalk.magenta(`RCC | Final discountSavingsTotal ${discountSavingsTotal} `));
  }

  // Retrieve coupon if there is already a valid coupon object
  // Set the appropriate ssn variables
  if (req.session.coupon_object) {
    const coupon = await Coupon.findOne({
      where: { code: req.session.coupon_object.code },
    });
    if (coupon) {
      console.log(`RCC | Coupon Found`);
      req.session.coupon_object = coupon;
      req.session.coupon_type = coupon.type;
    } else {
      console.log(`RCC | No Coupon Found`);
      req.session.coupon_object = null;
      req.session.coupon_type = null;
      req.session.cart_coupon_savings = 0;
    }

    // Calculate couponSavingsTotal based on type
    switch (req.session.coupon_type) {
      case "OVERALL":
        req.session.coupon_discount = coupon.discount;
        req.session.coupon_discount_limit = coupon.limit;
        couponSavingsTotal =
          discountedSubtotal +
          cart_shipping_fee -
          (discountedSubtotal + cart_shipping_fee) *
            (1 - req.session.coupon_discount);
        if (couponSavingsTotal >= req.session.coupon_discount_limit) {
          couponSavingsTotal = req.session.coupon_discount_limit;
        }
        break;
      case "SHIP":
        req.session.coupon_shipping_discount = coupon.discount;
        req.session.coupon_shipping_discount_limit = coupon.limit;
        couponSavingsTotal =
          cart_shipping_fee * (1 - req.session.coupon_discount);
        if (couponSavingsTotal >= req.session.coupon_discount_limit) {
          couponSavingsTotal = req.session.coupon_discount_limit;
        }
        break;
      case "SUB":
        req.session.coupon_subtotal_discount = coupon.discount;
        req.session.coupon_discount_limit = coupon.limit;
        couponSavingsTotal =
          initialSubtotal -
          discountedSubtotal * (1 - req.session.coupon_discount);
        if (couponSavingsTotal >= req.session.coupon_discount_limit) {
          couponSavingsTotal = req.session.coupon_discount_limit;
        }
        break;
      default:
        couponSavingsTotal = 0;
    }
  }

  // Calculate grandTotal
  grandTotal = initialSubtotal - discountSavingsTotal - couponSavingsTotal;

  console.log("=== End of refreshCartCalculations ===");
  console.log(`initialSubtotal = ${initialSubtotal}`);
  console.log(`discountedSubtotal = ${discountedSubtotal}`);
  console.log(`discountSavingsTotal = ${discountSavingsTotal}`);
  console.log(`couponSavingsTotal = ${couponSavingsTotal}`);
  console.log(`grandTotal = ${grandTotal}`);

  req.session.cart_subtotal_initial = initialSubtotal;
  req.session.cart_subtotal_final = discountedSubtotal;
  req.session.cart_discount_savings = discountSavingsTotal;
  req.session.cart_coupon_savings = couponSavingsTotal;
  req.session.cart_grandtotal = grandTotal;

  console.log(`REQ initialSubtotal = ${req.session.cart_subtotal_initial}`);
  console.log(`REQ discountedSubtotal = ${req.session.cart_subtotal_final}`);
  console.log(
    `REQ discountSavingsTotal = ${req.session.cart_discount_savings}`,
  );
  console.log(`REQ couponSavingsTotal = ${req.session.cart_coupon_savings}`);
  console.log(`REQ grandTotal = ${req.session.cart_grandtotal}`);

  // Need to do this otherwise the session wont save properly due to async operations and the main cart page session variables would still be 0
  const saveSessionResult = await helper.saveSession(req);
  console.log(`Session Promise Result: ${saveSessionResult}`);
};

const addNewCartItem = (req, cart, product, discount) => {
  if (discount) {
    const currentQuantity = cart[product.id]
      ? cart[product.id].Quantity + 1
      : 1;

    const subtotalPrice =
      currentQuantity >= discount.min_qty
        ? (product.price * (1 - discount.discount_rate)).toFixed(2)
        : product.price;

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
      Quantity: currentQuantity,
      SubtotalPrice: (currentQuantity * parseFloat(subtotalPrice)).toFixed(2),
      SubtotalWeight: product.weight,
    };
  } else {
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
      SubtotalPrice: product.price,
      SubtotalWeight: product.weight,
    };
  }
};

const getProductDiscount = async (productId) => {
  const discount = await Discount.findOne({ where: { target_id: productId } });
  if (discount) {
    const expiryTime = moment(discount.expiry);
    if (moment().isAfter(expiryTime)) {
      await discount.destroy();
      // TODO initiate a cart refresh?
      return null;
    }
  }
  return discount;
};

// Determine how to handle addition of cart item and quantity
const processCart = (req, cart, product, discount, increment_bool) => {
  if (cart[product.id]) {
    updateCartItem(req, cart[product.id], product, discount, increment_bool);
  } else {
    addNewCartItem(req, cart, product, discount);
  }
};

export default {
  checkEmptyCart,
  countCartQty,
  checkPromo,
  convertDiscount,
  displayCouponType,
  checkShipmentCountrySingapore,
  checkProductPriceDiscounted,
  calculate_cart_total_coupon_savings,
  calculateDiscountedPrice,
  updateCartItem,
  addNewCartItem,
  getProductDiscount,
  processCart,
  refreshCartCalculations,
};
