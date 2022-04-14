const axios = require('axios');
const Wallet = require("../../models/wallet");

module.exports.fetchWallets = (req, res) => {
    Wallet.find().sort({date: -1})
    .then(wallets => {
        res.render('admin/wallet', {
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_wallet',
            wallets
        });
    })
    .catch(err => {
        console.log(err);
        req.flash('error', 'Wallets not available at the moment');
    });
}

module.exports.fetchWallet = (req, res) => {
    Wallet.findById(req.params.id)
    .then(wallet => {      
        res.render('admin/wallet/show', {
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_wallet',
            wallet
        });  
    })
    .catch(err => {
        console.log(err);
        req.flash('error', 'Wallets not available at the moment');
        res.redirect('back')
    });
}

module.exports.getCreateWalletPage = (req, res) => {
    res.render('admin/wallet/new', {
        navTheme: {color:'navbar-dark', bg: 'default'},
        page: 'admin_new_wallet'
    }); 
}

module.exports.createWallet = (req, res) => {
    let tokenShort = req.body.tokenShort;
    let tokenName = req.body.tokenName;
    let address = req.body.address;
    let displayName = req.body.displayName;
    if(String(tokenName).toLowerCase() == 'perfect money') {
        tokenShort = 'usd';
    }

    if(!tokenName || !tokenShort || !address || !displayName) {
        req.flash('error', 'None of the fields can be empty');
        return res.redirect('back');
    }
    
    Wallet.find({tokenName, tokenShort, address})
    .then(wallets => {
        let  walletsDisplays = '';
        if(wallets.length > 0) {
            for(let i = 0; i < wallets.length; i++) {
                walletsDisplays += wallets[i].displayName;
                if(i < users.length -2) ewalletAddresses += ', ';
                if(i == users.length -2) ewalletAddresses += 'and ';
            };
            req.flash('error', 'Entry already exists as ' + walletsDisplays);
            return res.redirect('back');
        }

        if(String(tokenName).toLowerCase() == 'perfect money') {
            return Wallet.create({tokenName, tokenShort, address, displayName}, _ => {
                req.flash('success', `Perfect money account has been added`);
                res.redirect('/admin/wallet');
            });
        }

        axios(`https://api.coingecko.com/api/v3/simple/price?ids=${tokenName}&vs_currencies=usd`)
        .then(response => {
            let body = response.data
            if(body[tokenName] && body[tokenName].usd) {
                Wallet.create({tokenName, tokenShort, address, displayName}, _ => {
                    req.flash('success', `Wallet has been added`);
                    res.redirect('/admin/wallet');
                });
            } else {
                req.flash('error', 'Please enter a valid token name');
                res.redirect('back');
            }
        })   
    })
    .catch(err => {
        console.log(err)
        req.flash('error', 'Something went wrong');
        res.redirect('back');
    });
}

module.exports.deleteWallet = (req, res) => {
    Wallet.findByIdAndDelete(req.params.id)
    .then(wallet => {
        req.flash("success", "Deleted successfully");
        res.redirect("/admin/wallet");
    }).catch(err => {
        console.log(err);
        req.flash("error", "Somethong went wrong. Try again");
        res.redirect("back");
    });
}