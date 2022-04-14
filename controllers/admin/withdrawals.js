const User = require("../../models/user");
const Withdraw = require("../../models/withdraw");
const methods = require('../../assets/methods');
const config = require("../../config");

module.exports.getWithdrawals = async(req, res) => {
    var query, search = req.query.search;
    if(search) {
        query = {$or: [
            {cryptoType:{$regex: search, $options: "i"}}, 
            {'user.username': {$regex: search, $options: "i"}},
        ]}
    } else {query = {}};
    let offset;
    offset = req.query.offset;
    if(!offset || offset < 0) offset = 0;
    offset = Number(offset);
    let end = 50;
    let count;
    try {
        count = await Withdraw.countDocuments(query);
    } catch (err) {
        count = 0;
    }
    Withdraw.find(query).skip(offset).limit(end).sort({date: -1}).then(withdrawals => {
        res.render("admin/withdrawals", {
            withdrawals,
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_withdraw',
            offset, end, count, search
        });
    }).catch(err => {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.getWithdrawal = (req, res) => {
    Withdraw.findById(req.params.id).then(withdrawal => {
        res.render("admin/withdrawals/show", {
            withdrawal,
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_withdraw'
        });
    }).catch(err => {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.updateWithdrawal = (req, res) => {
    var approved = JSON.parse(req.body.approved);
    Withdraw.findByIdAndUpdate(req.params.id, {delivered: approved, approved: approved? 'yes' : 'no'}).then(withdrawal => {
        User.findById(withdrawal.user.id)
        .then(user => {
            if(!approved) {
                user.balance += withdrawal.amount;
                user.save();
            }
            if(config.withdrawal_confirmation_email) {
                let body = `<p style="text-transform: capitalize;">Hi ${user.firstname},</p>
                    <p>Your withdrawal of ${config.currency_unit}${withdrawal.amount} from your account has been ${approved?
                    'authorized and has been sent successfully to your ' + withdrawal.cryptoType.toUpperCase()  + ' wallet: ' + withdrawal.address: 'rejected'}
                    <br>
                    <p>Cheers,</p>
                    <p>${config.name || 'Investment project'} Team.</p>`
                methods.sendMail({
                    from: `${config.name || 'Investment project'} <${config.MAIL_USER}>`,
                    to: user.username,
                    subject: `${approved?' Approval': 'Rejection'} notice`,
                    // text: body,
                    html: body,
                    overrideHtml: false
                });
            }            
            req.flash("success", "Updated Successfully");
            res.redirect("back");
        })        
    }).catch(err => {
        console.log(err);
        req.flash("err", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.deleteWithdrawal = (req, res) => {
    Withdraw.findByIdAndDelete(req.params.id)
    .then(withdraw => {
        req.flash("success", "Deleted successfully");
        res.redirect("/admin/withdrawals");
    }).catch(err => {
        console.log(err);
        req.flash("error", "Somethong went wrong. Try again");
        res.redirect("back");
    });
}