import alertMessage from "./messenger.js";


// Checkout auth
export const checkCart = (req, res, next) => {
	if (req.isAuthenticated()) {
		// If user is authenticated
		console.log(req.user.confirmed);
		if (req.user && req.session.full_total_price > 0) {
			return next(); // Calling next() to proceed to the next statement
		} else {
			alertMessage(
				res,
				"danger",
				"Access denied. No items found in cart",
				"fas fa-exclamation-circle",
				true
			);
			res.redirect("/product/product-list");
		}
	}
	// If not authenticated, show alert message and redirect to ‘/’
	alertMessage(
		res,
		"danger",
		"Please Log in to purchase",
		"fas fa-exclamation-circle",
		true
	);
	res.redirect("/user/login");
};
