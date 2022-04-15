const User = require("../../models/user");
const Transaction = require("../../models/transaction");
const methods = require('../../assets/methods');
const config = require("../../config");

module.exports.getDeposits = async (req, res, userId) => {
    var query, search = req.query.search;
    if(search) {
        query = {$or: [
            {code:{$regex: search, $options: "i"}},
            {'user.username': {$regex: search, $options: "i"}},
        ]}
    } else {query = {}};

    let offset;
    offset = req.query.offset;
    let pending = req.query.pending;
    if(!offset) offset = 0;
    offset = Number(offset);
    let end = 50;
    let count;

    if(userId) {
        query['user.id'] = userId;
    }
    let duser;

    try {
        count = await Transaction.countDocuments(query);
        if(userId) duser = await User.findById(userId);
    } catch (err) {
        count = 0;
    }
    pending ? query.status = 'pending' : query.status = {$not: {$in: ['pending']}};   
    Transaction.find(query).skip(offset).limit(end).sort({date: -1})
    .then(transactions => {
        res.render("admin/transaction", {
            transactions,
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: pending? 'admin_pending_deposits' : 'admin_deposits',
            showUser: !Boolean(userId),
            offset,
            duser,
            end,
            count,
            pending,
            search
        });
    }).catch(err => {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.updateDeposit = (req, res) => {
    let action = req.body.action;
    let status = 'pending';
    if(action === 'approve') status = 'approved';
    if(action === 'reject') status = 'rejected';
    Transaction.findByIdAndUpdate(req.params.id, { status })
    .then(txn => {
        User.findById(txn.user.id)
        .then(user => {                
            if(action === 'approve') {
                user.balance += txn.amount;
                user.save();
                if(user.referrer) {
                    User.findById(user.referrer.id)
                    .then(referrer => {
                        let hasRefUser = referrer.referalEarnings.find(e => e.user.id.equals(user._id));
                        if(config.recurring_referral_earnings || !hasRefUser) {
                            let amount;
                            if(config.referral_earnings_unit === '%')
                                amount = config.referral_earnings * txn.amount / 100;
                            else 
                                amount = config.referral_earnings;
                            referrer.referalEarnings.push({
                                user: {id: user._id, username: user.username},
                                amount
                            });
                            referrer.balance += amount;
                            referrer.save();

                            if(config.referee_deposit_confirmation_email) {
                                methods.sendMail({
                                    from: `${config.name || 'Investment project'} <${config.MAIL_USER}>`,
                                    to: referrer.username,
                                    subject: 'Referral bonus',
                                    html: `<h3>Referral bonus</h3>
                                    <div class="card-text">
                                        <h3 style="text-transform: capitalize;">Hi ${referrer.firstname}</h3>
                                        <p>Your account has been credited with ${config.currency_unit}${amount} following the deposit made by your downline ${user.username}.</p>
                                        <p>Click <a href="${config.URL}/dashboard/referrals">here</a> to view.</p> 
                                        <p>Thank you for investing with us.</p>
                                        <br>
                                        <p>Regards,</p>
                                        <p>${config.name || 'Investment project'}.</p>
                                    </div>`  
                                });
                            }
                            
                        }                        
                    });
                }                
            }

            if(config.deposit_confirmation_email){
                methods.sendMail({
                    from: `${config.name || 'Investment project'} <${config.MAIL_USER}>`,
                    to: user.username,
                    subject: 'Deposit Notice',
                    html: `<h3>Deposit Notice</h3>
                    <div class="card-text">
                        <h3 style="text-transform: capitalize;">Hi ${user.firstname}</h3>
                        <p>Your deposit of ${config.currency_unit}${txn.amount} in ${txn.cryptoType} to your account has been ${status}.</p>
                        <p>Click <a href="${config.URL}/dashboard/deposit/history">here</a> to view.</p> 
                        <p>Any complaints? reach us at support@${config.DOMAIN}</p>
                        <p>Thank you for investing with us.</p>
                        <br>
                        <p>Regards,</p>
                        <p>${config.name || 'Investment project'}.</p>
                    </div>`  
                });
            }
            
            req.flash('success', `Deposit has been ${status}`);
            res.redirect('back');
        });
    })
    .catch(err => {
        console.log(err)
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.deleteDeposit = (req, res) => {
    Transaction.findByIdAndDelete(req.params.id)
    .then(txn => {
        req.flash('success', `Deposit has been deleted`);
        res.redirect('back');
    })
    .catch(err => {
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.fetchDeposit = (req, res) => {
    Transaction.findById(req.params.id).then(transaction => {
        console.log(transaction)
        res.render("admin/transaction/show", {
            transaction,
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_deposits',
        });
    }).catch(err => {
        console.log(err);
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}