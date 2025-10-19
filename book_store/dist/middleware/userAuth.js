import alertMessage from "../helpers/messenger.js";
const ensureAuthenticated = (req, res, next) => {
    if (req.isAuthenticated && req.isAuthenticated()) {
        console.log(req.user?.confirmed);
        if (req.user?.confirmed === true || req.user?.confirmed === false) {
            return next();
        }
        else {
            alertMessage(res, "danger", "Access Denied", "fas fa-exclamation-circle", true);
            return res.redirect("/");
        }
    }
    alertMessage(res, "danger", "Access Denied", "fas fa-exclamation-circle", true);
    res.redirect("/");
};
export default ensureAuthenticated;
//# sourceMappingURL=userAuth.js.map