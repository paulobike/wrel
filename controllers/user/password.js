const User = require("../../models/user");

module.exports.getChangePasswordPage = (req, res) => {
    res.render('dashboard/change-password', {
        navTheme: {color:'navbar-dark', bg: 'default'},
        page: 'profile'
    });    
}

module.exports.changePassword = (req, res) => {
    let oldPassword = req.body['old-password'];
    let newPassword = req.body['new-password'];
    let passwordHint = req.body['passwordHint'];
    let authenticate = User.authenticate();
    authenticate(req.user.username, oldPassword, function(err, user) {
        if (err) { 
            console.log(err);
            req.flash('error', 'An error occured. Try again.')
            return res.redirect('/dashboard/change-password');
        }
        if( !user ) {
            req.flash('error', 'Value entered for current password is not correct.')
            return res.redirect('/dashboard/change-password');
        }
        user.setPassword(newPassword).then((newp) => {
            user.passwordHint = passwordHint;
            user.save();
            req.flash('success', 'Successfully changed password.')
            res.redirect("/dashboard/profile");
        }).catch(err => {
            console.log(err);
            req.flash("error", "An error occured. Try again.");
        });
    });
}