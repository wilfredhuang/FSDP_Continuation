import alertMessage from "../helpers/messenger.js";
export const checkCart = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        console.log(req.user?.confirmed);
        if (req.user && req.session?.cart_grandtotal && req.session.cart_grandtotal > 0) {
            return next();
        }
        else {
            alertMessage(res, "danger", "Access denied. No items found in cart", "fas fa-exclamation-circle", true);
            return res.redirect("/product/product-list");
        }
    }
    alertMessage(res, "danger", "Please Log in to purchase", "fas fa-exclamation-circle", true);
    res.redirect("/user/login");
};
//# sourceMappingURL=cartAuth.js.map