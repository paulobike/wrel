const methods = require("../../assets/methods");
const { addAlert } = require("../../assets/packageTimeouts");
const config = require("../../config");
const User = require("../../models/user");
const Package = require("../../models/package");
const packageArr  = require('../../assets/packages');

module.exports.getCreateInvestmentPage = (req, res) => {
    User.findById(req.params.id)
    .then(duser => {
        res.render("admin/package/new", {
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_package',
            duser, packageArr
        });
    })
    .catch(err => {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.createInvestment = (req, res) => {
    let user = req.body.user;
    let name = req.body.name;
    let investment = Number(req.body.amount);
    let dateStr = req.body.date? req.body.date: new Date().toDateString();
    let date;
    let time = req.body.time? req.body.time: '';
    date = new Date(dateStr + ' ' + time);
    if(!req.body.date && !req.body.time) {
        // Take current date and time
        date = new Date();
    }
    if(investment) {
        if (investment < 50) {
            req.flash('error', 'Investment must be at least $500');
            return res.redirect(`/admin/users/${user.id}/packages/new`);
        }
    } else {
        req.flash('error', 'Enter a valid amount');
        return res.redirect(`/admin/users/${user.id}/packages/new`);
    }
    Package.countDocuments({'user.id': user.id, active: true})
    .then(count => {
        if(count > 0 && !config.multiple_investments) {
            req.flash('error', user.username + ' already has an investment.');
            res.redirect(`/dashboard/invest`);
        } else {
            let packageDetails = methods.getPackageDetailsByName(name);
            let toEarn = (investment * packageDetails.percentage) + investment;
            Package.create({
                user, investment, name, dailyEarnings: 0,
                balance: 0, date, toEarn,percentage: packageDetails.percentage,
                duration: packageDetails.duration, createdByAdmin: true
            })
            .then(package => {
                User.findById(user.id)
                .then(async usr => {
                    usr.packageCount && typeof usr.packageCount == 'number' ? 
                    usr.packageCount += 1: usr.packageCount = 1;

                    usr.activePackagecount && typeof usr.activePackagecount == 'number' ? 
                    usr.activePackagecount += 1: usr.activePackagecount = 1;

                    await usr.save();

                    let duration = methods.getPackageDetailsByName(name).duration;
                    let durationInMS = duration * 60 * 60 * 1000;
                    let packageObj = {
                        user: {
                            firstname: usr.firstname,
                            username: usr.username
                        },
                        amount: investment,
                        createdByAdmin: true
                    }
                    addAlert(packageObj, durationInMS);
                    if(config.admin_created_investment_email) {
                        methods.sendMail({
                            from: `${config.name || 'Investment project'} <${config.MAIL_USER}>`,
                            to: usr.username,
                            subject: 'Investment Notice',
                            html: `<h3>Investment Notice</h3>
                            <div class="card-text">
                                <h3 style="text-transform: capitalize;">Hi ${usr.firstname}</h3>
                                <p>Your Investment of ${config.currency_unit}${investment} on the ${name} package from your account is successful.</p>
                                <p>You will receive an email notification when your investment is mature. 
                                Click <a href="${config.URL}/dashboard/package">here</a> to view the progress of your investment.</p>
                                <p>Thank you for investing with us.</p>
                                <br>
                                <p>Regards,</p>
                                <p>${config.name || 'Investment project'}.</p>
                            </div>`
                        });
                    }
                    req.flash('success', 'Investment created');
                    res.redirect(`/admin/users/${user.id}/packages`);
                });
            })
            .catch(err => {
                console.log(err)
                req.flash('error', 'Something went wrong');
                res.redirect(`/admin/users/${user.id}/packages/new`);
            });
        }
    })
    .catch(err => {
        console.log(err)
        req.flash('error', 'Something went wrong');
        res.redirect(`/admin/users/${user.id}/packages/new`);
    });
}

module.exports.fetchInvestments = (req, res) => {
    Package.find().sort({date: -1}).then(packages => {
        res.render("admin/package/table", {
            packages,
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_package',
            packageArr
        });
    }).catch(err => {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.fetchUserInvestments = (req, res) => {
    Package.find({'user.id': req.params.id}).sort({date: -1}).then(packages => {
        User.findById(req.params.id)
        .then(duser => {
            res.render("admin/package", {
                packages,
                navTheme: {color:'navbar-dark', bg: 'default'},
                page: 'admin_package',
                duser, packageArr
            });
        })
        .catch(err => {
            console.log(err);
            req.flash("error", "Something went wrong");
            res.redirect("back");
        })
    }).catch(err => {
       console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}