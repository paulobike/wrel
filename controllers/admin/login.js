const passport = require("passport");

module.exports.login = (req, res) => {
    if(req.user.isAdmin) {
        req.flash("success", "Welcome Back " + req.user.firstname);
        res.redirect("/admin")
    } else {        
        req.logOut();
        req.flash("error", "Incorrect credentials");
        res.redirect("/admin/login");
    }
}

module.exports.authenticate = () => passport.authenticate("local", {
    failureRedirect: "/admin/login",
    failureFlash: "incorrect credentials"
});