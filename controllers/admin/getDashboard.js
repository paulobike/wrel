const User = require("../../models/user");
const Package = require("../../models/package");
const Withdraw = require("../../models/withdraw");

module.exports.getDashboard = async (req, res) => {
    let users, activePackages, investments = 0, withdrawals;
    users = await User.find({isAdmin: false}).sort({registered: -1});
    activePackages = await Package.find({active: true});
    withdrawals = await Withdraw.find({delivered: false});
    Package.aggregate([ {$group: {_id: null, sum: {$sum: "$investment"}}} ])
    .then(result => {
        console.log(result)
        res.render("admin", {
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_dashboard',
            users, activePackages, withdrawals,
            investments: result[0]? result[0].sum || 0: 0
        });
    });
}