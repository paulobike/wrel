const countries = require("../../assets/countries");
const User = require("../../models/user");

module.exports.fetchUsers = async (req, res) => {
    var query, search = req.query.search;
    if(search) {
        query = {$or: [
            {username:{$regex: search, $options: "i"}}, 
            {firstname: {$regex: search, $options: "i"}},
            {lastname: {$regex: search, $options: "i"}}
        ]}
    } else {query = {}};
    let offset;
    offset = req.query.offset;
    if(!offset) offset = 0;
    offset = Number(offset);
    let end = 50;
    let count;
    try {
        count = await User.countDocuments({isAdmin: false, ...query});
    } catch (err) {
        console.log(err)
        count = 0;
    }
    User.find({isAdmin: false, ...query}).sort({registered: 1}).skip(offset).limit(end)
    .then(users => {
        res.render("admin/users", {
            users,
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_users',
            search, end, count, offset
        });
    }).catch(err => {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.fetchUser = (req, res) => {
    User.findById(req.params.id).then(duser => {
        res.render("admin/users/show", {
            duser,
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_users',
            countries: countries
        });
    }).catch(err => {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.updateUser = (req, res) => {
    var object = req.body;
    User.findByIdAndUpdate(req.params.id, object).then(user => {
        req.flash("success", "Updated successfully");
        res.redirect("/admin/users/" + req.params.id);
    }).catch(err => {
        console.log(err);
        req.flash("error", "Somethong went wrong. Try again");
        res.redirect("/admin/users/" + req.params.id);
    });
}

module.exports.deleteUser = (req, res) => {
    User.findByIdAndDelete(req.params.id).then(user => {
        req.flash("success", "Deleted successfully");
        res.redirect("/admin/users");
    }).catch(err => {
        console.log(err);
        req.flash("error", "Somethong went wrong. Try again");
        res.redirect("back");
    });
}

module.exports.getUserChangePasswordPage = (req, res) => {
    User.findById(req.params.id)
    .then(duser => {
        res.render('admin/users/change_password', {
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_user',
            duser
        }); 
    })
    .catch(err => {
        console.log(err);
        req.flash("error", "Somethong went wrong. Try again");
        res.redirect("back");
    });
}

module.exports.changeUserPassword = (req, res) => {
    let password = req.body['password'];
    let id = req.params.id;
    User.findById(id)
    .then(user => {
        user.setPassword(password).then((newp) => {
            user.save();
            req.flash('success', 'Password has been changed.')
            res.redirect("/admin/users/" + id);
        }).catch(err => {
            console.log(err);
            req.flash("error", "An error occured. Try again.");
            res.redirect('back');
        });
    })
    .catch(err => {
        console.log(err);
        req.flash("error", "An error occured. Try again.");
        res.redirect('back');
    });
}