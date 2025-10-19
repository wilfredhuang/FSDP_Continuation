import alertMessage from "../helpers/messenger.js";
const ensureAdminAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        if (req.user?.isadmin === true) {
            console.log("Admin User Found");
            return next();
        }
        else {
            alertMessage(res, "danger", "You are not an admin user", "fas fa-exclamation-circle", true);
            return res.redirect("/");
        }
    }
    alertMessage(res, "danger", "Access Denied (NOT LOGGED IN)", "fas fa-exclamation-circle", true);
    res.redirect("/");
};
export default ensureAdminAuthenticated;
//# sourceMappingURL=adminAuth.js.map