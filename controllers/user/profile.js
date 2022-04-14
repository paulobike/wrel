const User = require("../../models/user");
const Transaction = require("../../models/transaction");
const countries = require("../../assets/countries");

module.exports.getProfilePage = (req, res) => {
    let dispMode = req.query.dispMode;
    let page = dispMode == 'edit'? 'editprofile': 'profile';
    Transaction.find({'user.id': req.user._id})
    .then(transactions => {
        res.render("dashboard/" + page, {
            page: 'profile',
            transactions,
            countries
        });
    })
    .catch(err => {
        console.log(err);
        res.render("dashboard/" + page, {
            page: 'profile',
            transactions: [],
            countries
        });
    });
}

module.exports.updateProfile = (req, res) => {
    let userObj = req.body;
    User.findByIdAndUpdate(req.user._id, userObj)
    .then(user => {
        req.flash('success', "Successfully changed profile.");
        res.redirect("/dashboard/profile");
    })
    .catch(err => {
        console.log(err);
        req.flash("error", "An error occured. Try again.");
        res.redirect("/dashboard/profile");
    })
}