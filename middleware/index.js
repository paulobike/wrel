const config = require('../config');
const crypto = require('crypto');
var middleware = {
    isLoggedIn : (req, res, next) => {
        if(req.isAuthenticated()){
            if(!config.email_confirmation || req.user.verified) {                
                return next();
            }
            return res.redirect('/account/confirmation?user='+req.user._id);
        }
        req.flash("error", "You need to be logged in!");
        res.redirect("/account/login");
    },
    
    isAdmin : (req, res, next) => {
        if(req.isAuthenticated() && req.user.isAdmin) {
            return next();
        }
        req.flash("error", "Login with an admin account");
        res.redirect("/admin/login");
    },

    toAdmin: (req, res, next) => {
        if(req.url.indexOf('change-password') === -1) {
            if(req.isAuthenticated() && req.user.isAdmin) {
                return res.redirect("/admin");
            }
        }
        next();             
    },

    isCoinPayments: (req, res, next) => {
        let rawBody = serialize(req.body);
        const HMAC = crypto.createHmac('sha512', config.SECRET)
        .update(rawBody).digest('hex');
        let sentHmac = req.get('HMAC');
        if(HMAC === sentHmac) {
            console.log('Hmac match')
            next();
        } else {
            console.log('Hmac unmatch');
            res.end();
        }        
    },
    
    secure : (req, res, next) => {
        // if(req.headers['x-forwarded-proto'] !== 'https') {
        //     return res.redirect("https://highglobefxtraders.com" + req.url);
        // }
        next();
    },

    toLowerCase : (req, res, next) => {
        req.body.username = req.body.username.trim().toLowerCase();
        next();
    },

    // isPerfectMoney : (req, res, next) => {
    //     let webHookData = req.body;
    //     let payeeAccount = webHookData.PAYEE_ACCOUNT;
    //     let payerAccount = webHookData.PAYER_ACCOUNT;
    //     let amount = webHookData.PAYMENT_AMOUNT;
    //     let code = webHookData.PAYMENT_BATCH_NUM;
    //     let timeStamp = webHookData.TIMESTAMPGMT;
    //     let V2_HASH = webHookData.V2_HASH

    //     let passphraseHash = md5Hash(config.PM_PASSPHRASE);
    //     let v2ToHash = ''.concat('NULL', payeeAccount, amount, 'USD', code, payerAccount, passphraseHash, timeStamp)
    //     let generatedV2Hash = md5Hash(v2ToHash);
        
    //     if(V2_HASH === generatedV2Hash) next()
    //     else res.status(400).end();
    // }
}

// const md5Hash = (string) => {
//     let hash = crypto.createHash('md5').update(string).digest("hex").toUpperCase();
//     return hash;
// }

const serialize = function(obj) {
    var str = [];
    for (var p in obj)
      if (obj.hasOwnProperty(p)) {
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
      }
    return str.join("&");
  }

module.exports = middleware;