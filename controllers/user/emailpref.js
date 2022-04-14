const User = require("../../models/user");
const Transaction = require("../../models/transaction");
const countries = require("../../assets/countries");

module.exports.getEmailPrefPage = (req, res) => {
    let dispMode = req.query.dispMode;
    let page = dispMode == 'edit'? 'editemailpref': 'emailpref';
    Transaction.find({'user.id': req.user._id})
    .then(transactions => {
        res.render("dashboard/" + page, {
            page: 'emailpref',
            transactions,
            countries
        });
    })
    .catch(err => {
        console.log(err);
        res.render("dashboard/" + page, {
            page: 'emailpref',
            transactions: [],
            countries
        });
    });
}

module.exports.updateEmailPref = (req, res) => {
    let userObj = req.body;
    User.findByIdAndUpdate(req.user._id, userObj)
    .then(user => {
        req.flash('success', "Successfully updated your email preferences.");
        res.redirect("/dashboard/emailpref");
    })
    .catch(err => {
        console.log(err);
        req.flash("error", "An error occured. Try again.");
        res.redirect("/dashboard/emailpref");
    })
}