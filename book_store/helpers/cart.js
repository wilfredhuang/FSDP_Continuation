const alertMessage = require("./messenger"); // Bring in alert messenger


// Checkout auth
const checkCart = (req, res, next) => {
    if(req.isAuthenticated() ) { // If user is authenticated
        console.log(req.user.confirmed);
        if (req.user && req.session.full_total_price > 0){
                return next(); // Calling next() to proceed to the next statement
            }
        else{
        alertMessage(res, 'danger', 'Access denied. No items found in cart', 'fas fa-exclamation-circle', true);
        res.redirect('/product/listProducts');
        }
    }
        // If not authenticated, show alert message and redirect to ‘/’
    alertMessage(res, 'danger', 'Please Log in to purchase', 'fas fa-exclamation-circle', true);
    res.redirect('/user/login');
};

// // Payment Auth
// const ensureAuthenticated = (req, res, next) => {
//     if(req.isAuthenticated() ) { // If user is authenticated
//         console.log(req.user.confirmed);
//         if (req.user.confirmed == true){
//                 return next(); // Calling next() to proceed to the next statement
//             }
//         else if(req.user.confirmed === null){
//             return next();
//         }else{
//         alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
//         res.redirect('/');
//         }
//     }
//         // If not authenticated, show alert message and redirect to ‘/’
//     alertMessage(res, 'danger', 'Access Denied', 'fas fa-exclamation-circle', true);
//     res.redirect('/');
// };

// Don't put {} at the ends of each side, doesn't work anymore(?)
module.exports = checkCart;