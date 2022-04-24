// const Transaction = require("../../models/transaction"),
// methods           = require('../../assets/methods'),
Wallet            = require( '../../models/wallet');
// const { nanoid }  = require('nanoid');
const axios       = require('axios');
// const config      = require("../../config");

const countries = require("../../assets/countries");
const Transaction = require("../../models/transaction");

module.exports.getDepositPage = async (req, res, type) => {
    if(!res.locals.user) {
        res.locals.user = {firstname: '', lastname: '', username: '', _id: '', address: {}}
    }
    res.render('dashboard/' + (type == 'monthly'? 'deposit-monthly': (type == 'crypto'? 'deposit-crypto': 'deposit')), {
        navTheme: {color:'navbar-dark', bg: 'default'},
        page: 'deposit',
        countries: countries,
    });
}

module.exports.getGiftsPage = async (req, res) => {
    res.render('dashboard/gifts', {
        navTheme: {color:'navbar-dark', bg: 'default'},
        page: 'deposit'
    });
}

// module.exports.getConfirmDepositPage = async (req, res) => {
//     let method = req.body.method;
//     let coin;
//     let amount = Number(req.body.amount);
//     try {
//         coin = await Wallet.findById(method);
//     } catch(err) {
//         console.log(err);
//         coin = {};
//     }
//     if(amount) {
//         if (amount < 50) {
//             req.flash('error', 'Deposit must be at least $50');
//             return res.redirect('/dashboard/deposit');
//         }
//     } else {
//         req.flash('error', 'Enter a valid amount');
//         return res.redirect('/dashboard/deposit');
//     }
//     res.render('dashboard/confirmation', {
//         coin, amount,
//         navTheme: {color:'navbar-dark', bg: 'default'},
//         page: 'deposit',
//         url: config.URL
//     });
// }

// module.exports.getWalletPage = async (req, res) => {
//     let user = { username: req.user.username, id: req.user._id, firstname: req.user.firstname };
//     let amount = Number(req.body.amount);
//     let coin = req.body.method;

//     try {
//         details = await Wallet.findById(coin);
//     } catch(err) {
//         req.flash('error', 'An error occured, please retry');
//         return res.redirect('/dashboard/deposit');   
//     }

//     let coinAddress = details.address;
//     let coinDisplayName = details.displayName;
//     let coinName = details.tokenName;
//     let memo = details.memo;
//     if(coinName == 'perfect money') {
//         return sendWallet(1);
//     }
//     axios(`https://api.coingecko.com/api/v3/simple/price?ids=${coinName}&vs_currencies=usd`)
//     .then(response => {
//         sendWallet(response.data[coinName].usd);
//     })
//     .catch(err => {
//         console.log(err.response.data);
//         req.flash('error', 'An error occured, please retry');
//         res.redirect('/dashboard/deposit');
//     })

//     async function sendWallet(rate) {
//         let cryptoAmount = Math.round((amount / (rate * config.currency_conversion)) * 10000) / 10000;
//         if(!config.manual_deposit) {
//             let txn = await createDeposit(user, amount, cryptoAmount, details);
//             if(txn instanceof Error) {
//                 req.flash('error', 'An error occured, please retry');
//                 return res.redirect('/dashboard/deposit');            
//             }
//         }

//         res.render('dashboard/wallet', { 
//             page: 'deposit',
//             navTheme: {color:'navbar-dark', bg: 'default'},
//             coin: details.tokenShort,
//             coinAddress,
//             amount,
//             coinName,
//             cryptoAmount,
//             memo,
//             coinDisplayName,
//             coinId: coin
//         });
//     }
// }

module.exports.depositManually = async (req, res, type) => {
    let transactionObj = { ...req.body };
    if(transactionObj.payment_typepay_typeradio == 'credit') transactionObj.paymentType = 'cashapp'
    if(transactionObj.payment_typepay_typeradio == 'ach') transactionObj.paymentType = 'bank'
    if(type) {
        transactionObj.paymentType = type;
        if(type == 'crypto') {
            transactionObj.address = {
                street1: transactionObj['Address 1'],
                street2: transactionObj['Address 2'],
                city: transactionObj['City'],
                State: transactionObj['State'],
                country: transactionObj['Country'],
                zipCode: transactionObj['Zipcode']
            };
            transactionObj.firstname = transactionObj['First name'];
            transactionObj.lastname = transactionObj['Last name'];
            transactionObj.email = transactionObj['Email'];
            transactionObj.phone = transactionObj['City'];
            transactionObj.amount = transactionObj['pledgeAmount'];
            transactionObj.crypto = {currency: transactionObj['pledgeCurrency']}
        }
    }
    if(req.user) {
        transactionObj.user = {
            id: req.user._id,
            username: req.user.username
        }
    }
    Transaction.create(transactionObj)
    .then(transaction => {
        console.log(transaction);
        req.flash('success', 'Processing your payment...');
        res.redirect('/deposit/donate');
    })
    .catch(err => {
        console.log(err);
        req.flash('error', 'An error occured, please retry');
        res.redirect('/deposit/donate');
    })
    // req.flash('success', 'Your payment is processing')
    // res.redirect('/dashboard/deposit/history');
}

module.exports.depositCrypto = (req, res, next) => {
    let transactionObj = { ...req.body, paymentType: 'crypto' };
    Transaction.create(transactionObj)
    .then(transaction => {
        res.redirect('/deposit/get-crypto-page2/' + transaction._id);
    })
    .catch(err => {
        console.log(err);
        req.flash('error', 'An error occured, please retry');
        res.redirect('back');
    });
}

module.exports.getCryptoPage1 = (req, res, next) => {
    Wallet.find()
    .then(wallets => {
        res.render('crypto-page1', {wallets});
    })
    .catch(err => {
        res.send('Something went wrong. Try again');
    });
}

module.exports.getCryptoPage2 = (req, res, next) => {
    Transaction.findById(req.params.id)
    .then(transaction => {
        res.render('crypto-page2', {transaction: transaction._id, countries});
    })
    .catch(err => {
        console.log(err);
        req.flash('error', 'An error occured, please retry');
        res.redirect('back');
    });
}

module.exports.updateCrypto = (req, res, next) => {
    Transaction.findByIdAndUpdate(req.params.id, {$set: req.body})
    .then(transaction => {
        res.redirect('/deposit/get-wallet/' + req.params.id);
    })
    .catch(err => {
        console.log(err);
        req.flash('error', 'An error occured, please retry');
        res.redirect('back');
    });
}

module.exports.getWallet = (req, res, next) => {
    Transaction.findById(req.params.id).populate('crypto.walletId')
    .then(transaction => {
        let coinName = transaction.crypto.walletId.tokenName;
        axios(`https://api.coingecko.com/api/v3/simple/price?ids=${coinName}&vs_currencies=usd`)
        .then(response => {
            transaction.crypto.amount = transaction.amount / Number(response.data[coinName].usd);
            transaction.save();
            res.render('wallet', {transaction});
        })
        .catch(err => {
            console.log(err.response.data);
            req.flash('error', 'An error occured, please retry');
            res.redirect('/get-crypto-page2/' + req.params.id);
        });        
    })
    .catch(err => {
        console.log(err);
        req.flash('error', 'An error occured, please retry');
        res.redirect('/get-crypto-page2/' + req.params.id);
    });
}

// module.exports.getDepositHistory = async (req, res) => {
//     Transaction.find({"user.id": req.user._id}).then(transactions => {
//         res.render("dashboard/deposit-history", {
//             navTheme: {color:'navbar-dark', bg: 'default'},
//             page: 'deposit',
//             transactions
//         });
//     }).catch(err => {
//        console.log(err);
//        req.flash("error", "Couldn't Find History. Please Try Again");
//        res.render("dashboard/history", {
//             navTheme: {color:'navbar-dark', bg: 'default'},
//             page: 'withdraw',
//             transactions: []
//         });
//     });
// }



// async function createDeposit(user, amount, cryptoAmount, details) {
    
//     let txn;
//     try {
//         txn = await Transaction.create({
//             user,
//             amount, 
//             code: nanoid(12),
//             status: 'pending',
//             cryptoType: details.tokenShort,
//             cryptoAmount
//         });
//     } catch(err) {
//         console.log(err);
//         return err;
//     }
//     try {

//     } catch(err) {
//         console.log(err)
//     }
//     if(config.deposit_email) {
//         methods.sendMail({
//             from: `${config.name || 'Investment project'} <${config.MAIL_USER}>`,
//             to: user.username,
//             subject: 'Deposit Notice',
//             html: `<h3>Deposit Notice</h3>
//             <div class="card-text">
//                 <h3 style="text-transform: capitalize;">Hi ${user.firstname}</h3>
//                 <p>Your deposit transaction has been initiated.</p>
//                 <p>Kindly send an exact payment of ${cryptoAmount}${details.tokenShort.toUpperCase()} to the address below</p>
//                 <p>${details.address}</p>
//                 ${details.memo? '<p>memo: <strong>' + details.memo + '</strong></p>': ''}
//                 <p>Please note that deposit is automated and it may take up to 10 to 15 minutes for your account to be credited due to block confirmations. 
//                 If your account doesn't get credited after 15 minutes, reach us at support@${config.DOMAIN}</p>
//                 <p>Click <a href="${config.URL}/dashboard/deposit/history">here</a> to view the deposit status.</p> 
//                 <p>Thank you for investing with us.</p>
//                 <br>
//                 <p>Regards,</p>
//                 <p>${config.name || 'Investment project'}.</p>
//             </div>`  
//         });
//     }
//     if(config.admin_email_notification) {
//         methods.sendMail({
//             from: `${config.name || 'Investment project'} <${config.MAIL_USER}>`,
//             to: config.MAIL_USER,
//             subject: 'Deposit Notice',
//             html: `<h3>Deposit Notice</h3>
//             <div class="card-text">
//                 <h3 style="text-transform: capitalize;">Hi Admin</h3>
//                 <p>There has been a deposit of ${config.currency_unit}${amount} in ${details.tokenShort}</p>
//                 <p>Click <a href="${config.URL}/admin/transactions?pending=true">here</a> to view.</p> 
//             </div>`  
//         });
//     }
    
//     return txn;
// }