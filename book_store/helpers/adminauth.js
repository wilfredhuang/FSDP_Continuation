const alertMessage = require("./messenger"); // Bring in alert messenger

const ensureAdminAuthenticated = (req,res,next) => {
    // console.log("User ID IS !! " + req.user.id)
    // If user is logged in, query logged in user id from db and check if = 2, then allow or else deny.
    // will have different flash msgs if user is unauthorised and tries to get the page or user not logged in and tries to get the page
    if (req.isAuthenticated()) {
        // console.log("THE NAME IS " + req.user.name)
        // Query from db if there is matching current user's name with record in database
        // then, if found return the user object from db, compare if name property has value 'admin'
        // which indicates admin user and allow access
        // otherwise we deny access and show error flash msg
        if (req.user.isadmin == true) {
            // console.log("Admin User Found")
            return next();
        }

        else {
            alertMessage(res, 'danger', 'You are not an admin user', 'fas fa-exclamation-circle', true);
            res.redirect('/');
        }
    }

    else {
        alertMessage(res,'danger','Access Denied (NOT LOGGED IN)','fas fa-exclamation-circle', true);
        res.redirect('/');
    }
};


module.exports = ensureAdminAuthenticated;