import moment from "moment";
import Coupon from "../models/Coupon.js";
import Discount from "../models/Discount.js";
import helper from "./hbs.js";
import chalk from "chalk";
const n = (v, fallback = 0) => {
    const num = Number(v);
    return Number.isFinite(num) ? num : fallback;
};
// ------------------- BASIC CART HELPERS -------------------
export const checkEmptyCart = (userCart) => {
    for (const id in userCart) {
        if (Object.prototype.hasOwnProperty.call(userCart, id))
            return false;
    }
    return true;
};
export const countCartQty = (userCart) => {
    let total = 0;
    for (const id in userCart) {
        total += parseInt(userCart[id].Quantity);
    }
    return total;
};
export const checkPromo = (couponObj) => couponObj != null;
export const convertDiscount = (discount) => discount * 100;
export const displayCouponType = (type) => {
    switch (type) {
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
export const checkShipmentCountrySingapore = (country) => {
    console.log(`Country Var: ${country}`);
    return country === "SG";
};
export const checkProductPriceDiscounted = (qty, price, newSub) => {
    if (qty == null ||
        price == null ||
        newSub == null ||
        isNaN(Number(qty)) ||
        isNaN(Number(price)) ||
        isNaN(Number(newSub))) {
        return undefined;
    }
    const ogSubtotal = (qty * price).toFixed(2);
    const formattedNewSub = parseFloat(String(newSub)).toFixed(2);
    // 🧠 Only return if there’s a real discount difference (> $0.01)
    if (Math.abs(parseFloat(ogSubtotal) - parseFloat(formattedNewSub)) > 0.01) {
        return ogSubtotal;
    }
    return undefined;
};
// ------------------- COUPON CALCULATION -------------------
export const calculate_cart_total_coupon_savings = async (req, coupon_input) => {
    const cart_shipping_fee = req.session.cart_shipping_fee || 0;
    const initialSubTotal = req.session.cart_subtotal_initial || 0;
    const discountedSubtotal = req.session.cart_subtotal_final || 0;
    let couponSavingsTotal = 0;
    try {
        const coupon = await Coupon.findOne({ where: { code: coupon_input } });
        if (coupon) {
            req.session.coupon_object = coupon;
            req.session.coupon_type = coupon.type;
        }
        else {
            req.session.coupon_object = null;
            req.session.coupon_type = null;
            req.session.cart_coupon_savings = 0;
            return 0;
        }
        switch (req.session.coupon_type) {
            case "OVERALL":
                couponSavingsTotal =
                    discountedSubtotal +
                        cart_shipping_fee -
                        (discountedSubtotal + cart_shipping_fee) *
                            (1 - (coupon.discount ?? 0));
                break;
            case "SHIP":
                couponSavingsTotal = cart_shipping_fee * (1 - (coupon.discount ?? 0));
                break;
            case "SUB":
                couponSavingsTotal =
                    initialSubTotal -
                        discountedSubtotal * (1 - (coupon.discount ?? 0));
                break;
            default:
                couponSavingsTotal = 0;
        }
        if (couponSavingsTotal > (coupon.limit ?? 0))
            couponSavingsTotal = coupon.limit ?? 0;
        req.session.cart_coupon_savings = parseFloat(couponSavingsTotal.toFixed(2));
        await helper.saveSession(req);
        return couponSavingsTotal;
    }
    catch (err) {
        console.error(err);
        return 0;
    }
};
// ------------------- DISCOUNT CALCULATION -------------------
export const calculateDiscountedPrice = (req, quantity, price, discountRate, minQty) => {
    const qty = Math.max(0, quantity);
    const p = n(price);
    const rate = Math.min(Math.max(n(discountRate), 0), 1);
    const m = Math.max(1, Math.floor(n(minQty) || 1)); // avoid /0
    const groups = Math.floor(qty / m);
    const originalSubtotal = qty * p;
    const discountedGroupAmount = groups * m * p * (1 - rate);
    const remainder = (qty - groups * m) * p;
    const discountedSubtotal = discountedGroupAmount + remainder;
    const totalDiscount = originalSubtotal - discountedSubtotal;
    req.session.cart_subtotal_initial = originalSubtotal;
    req.session.cart_subtotal_final = discountedSubtotal;
    req.session.cart_discount_savings = totalDiscount;
    return {
        originalSubtotalPrice: originalSubtotal.toFixed(2),
        discountedSubtotalPrice: discountedSubtotal.toFixed(2),
        totalDiscount: totalDiscount.toFixed(2),
    };
};
// ------------------- CART ITEM UPDATES -------------------
export const updateCartItem = (req, cartItem, product, discount, increment) => {
    if (increment)
        cartItem.Quantity = n(cartItem.Quantity, 0) + 1;
    const qty = n(cartItem.Quantity, 0);
    const price = n(cartItem.Price, n(product?.price));
    if (discount) {
        const rate = n(discount.discount_rate, 0);
        const minQty = Math.max(1, Math.floor(n(discount.min_qty, 1)));
        const { discountedSubtotalPrice } = calculateDiscountedPrice(req, qty, price, rate, minQty);
        cartItem.SubtotalPrice = discountedSubtotalPrice;
    }
    else {
        cartItem.SubtotalPrice = (qty * price).toFixed(2);
    }
    const weight = n(cartItem.Weight, n(product?.weight));
    cartItem.SubtotalWeight = (qty * weight).toFixed(2);
};
// ------------------- MAIN CART REFRESH -------------------
export const refreshCartCalculations = async (req, cart) => {
    let initialSubtotal = 0;
    let discountedSubtotal = 0;
    let discountSavingsTotal = 0;
    let couponSavingsTotal = 0;
    const cart_shipping_fee = req.session.cart_shipping_fee || 0;
    // 🧹 Normalize / validate cart items (fix old 'ID' vs 'id')
    for (const key in cart) {
        const item = cart[key];
        if (!item?.ID && !item?.id) {
            console.warn(`[refreshCartCalculations] Skipping invalid cart item`, item);
            continue;
        }
        const targetId = item.ID ?? item.id; // ✅ compatible with old/new sessions
        const d = await Discount.findOne({ where: { target_id: targetId } });
        if (d) {
            const qty = parseFloat(item.Quantity);
            const price = parseFloat(item.Price);
            const minQty = parseFloat(String(d.min_qty ?? 0));
            const rate = parseFloat(String(d.discount_rate ?? 0));
            const groups = Math.floor(qty / minQty);
            const originalSubtotal = qty * price;
            const discountedGroupAmt = groups * minQty * price * (1 - rate);
            const remainder = (qty - groups * minQty) * price;
            const discountedSubtotalPrice = discountedGroupAmt + remainder;
            const totalDiscount = originalSubtotal - discountedSubtotalPrice;
            initialSubtotal += originalSubtotal;
            discountedSubtotal += discountedSubtotalPrice;
            discountSavingsTotal += totalDiscount;
        }
        else {
            const qty = parseFloat(item.Quantity);
            const price = parseFloat(item.Price);
            const subtotal = qty * price;
            initialSubtotal += subtotal;
            discountedSubtotal += subtotal;
        }
    }
    // 🧮 Apply coupon logic
    if (req.session.coupon_object) {
        const coupon = await Coupon.findOne({
            where: { code: req.session.coupon_object.code },
        });
        if (coupon) {
            req.session.coupon_object = coupon;
            req.session.coupon_type = coupon.type;
        }
        else {
            req.session.coupon_object = null;
            req.session.coupon_type = null;
            req.session.cart_coupon_savings = 0;
        }
        switch (req.session.coupon_type) {
            case "OVERALL":
                couponSavingsTotal =
                    discountedSubtotal +
                        cart_shipping_fee -
                        (discountedSubtotal + cart_shipping_fee) *
                            (1 - (coupon?.discount ?? 0));
                break;
            case "SHIP":
                couponSavingsTotal =
                    cart_shipping_fee * (1 - (coupon?.discount ?? 0));
                break;
            case "SUB":
                couponSavingsTotal =
                    initialSubtotal -
                        discountedSubtotal * (1 - (coupon?.discount ?? 0));
                break;
            default:
                couponSavingsTotal = 0;
        }
        if (couponSavingsTotal > (coupon?.limit ?? 0))
            couponSavingsTotal = coupon?.limit ?? 0;
    }
    // 🧾 Final totals
    const grandTotal = initialSubtotal - discountSavingsTotal - couponSavingsTotal;
    req.session.cart_subtotal_initial = initialSubtotal;
    req.session.cart_subtotal_final = discountedSubtotal;
    req.session.cart_discount_savings = discountSavingsTotal;
    req.session.cart_coupon_savings = couponSavingsTotal;
    req.session.cart_grandtotal = grandTotal;
    console.log(chalk.magenta("🧮 Cart Recalculated:"), {
        initialSubtotal,
        discountedSubtotal,
        discountSavingsTotal,
        couponSavingsTotal,
        grandTotal,
    });
    await helper.saveSession(req);
};
// ------------------- CART ADDITION / DISCOUNT -------------------
export const addNewCartItem = (req, cart, product, discount) => {
    const currentQty = cart[product.id]
        ? cart[product.id].Quantity + 1
        : 1;
    const subtotalPrice = discount
        ? currentQty >= discount.min_qty
            ? (product.price * (1 - discount.discount_rate)).toFixed(2)
            : product.price
        : product.price;
    // ✅ Always use lowercase 'id' (TypeScript-safe)
    cart[product.id] = {
        id: product.id, // 👈 now lowercase, consistent with Sequelize
        Name: product.product_name,
        Author: product.author,
        Publisher: product.publisher,
        Genre: product.genre,
        Price: product.price,
        Stock: product.stock,
        Weight: product.weight,
        Image: product.product_image,
        Quantity: currentQty,
        SubtotalPrice: (currentQty * parseFloat(subtotalPrice)).toFixed(2),
        SubtotalWeight: product.weight,
    };
};
export const getProductDiscount = async (productId) => {
    const discount = await Discount.findOne({ where: { target_id: productId } });
    if (discount) {
        const expiry = moment(discount.expiry);
        if (moment().isAfter(expiry)) {
            await discount.destroy();
            return null;
        }
    }
    return discount;
};
export const processCart = (req, cart, product, discount, increment) => {
    if (cart[product.id]) {
        updateCartItem(req, cart[product.id], product, discount, increment);
    }
    else {
        addNewCartItem(req, cart, product, discount);
    }
};
// ✅ Default export bundle
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
//# sourceMappingURL=cartHelper.js.map