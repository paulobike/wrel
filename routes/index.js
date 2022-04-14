const config  = require('../config');
const methods = require("../assets/methods");
const countries = require('../assets/countries');
const express = require("express"),
router        = express.Router(),
User          = require("../models/user"),
passport      = require("passport"),
middleware    = require("../middleware"),
jwt           = require('jsonwebtoken');
const { getDepositPage, depositManually } = require("../controllers/user/deposit");

router.get("/register", async (req, res) => {
    res.render("auth/register", { page: 'Register', countries: countries });
});

router.post("/register", middleware.toLowerCase, (req, res) => {
    User.register(new User ({username: req.body.username}), config.SECRET, (err, user) => {
        if (err) {
            console.log(err);
            req.flash("error", err.message);
            return res.redirect("/account/register");
        }
        var obj = req.body;
        delete obj.password;
        obj.isAdmin = false;
        User.findOneAndUpdate({username: req.body.username}, obj).then(() => {         
            res.redirect("/account/confirmation?user=" + user._id);            
        }).catch(err => {
            console.log(err);
            User.findOneAndDelete({username: req.body.username}).then(_ => {
                req.flash("error", "Something went wrong.");
                res.redirect("/account/register");
            });
        });
    });
});

router.get('/confirmation', (req, res) => {
    let userId = req.query.user;
    if(!userId) {
        req.flash('err', 'Requires a user to confirm.');
        return res.redirect('back');
    }
    jwt.sign(
        {user: userId},
        config.SECRET,
        {expiresIn: '1d'},
        (err, emailToken) => {
            if(err) {
                console.log(err);
                req.flash('error', 'Something went wrong. Please retry');
                res.redirect('back');
            } else {
                let url = config.URL + '/account/confirmation/' + emailToken;
                console.log(url);
                User.findById(userId)
                .then(user => {
                    if(user.verified) return res.redirect('/dashboard');
                    methods.sendMail({
                        from: `Site Administrator <${config.MAIL_USER}>`,
                        to: user.username,
                        subject: 'Thank you for joining World Relief',
                        html: `<p>Thank you for joining World Relief</p>
                        <p>User Name: <a href="mailto:${user.username}">${user.username}</a></p>
                        <p>Password: <a href="${url}">Set or reset my password now</a></p><br />
                        <p><a href="${config.url}/account/login">Login here</a></p>
                        <p>If there are multiple user names listed above, you have registered on our 
                        site more than one time with the same email address or are sharing this email
                        address with others.</p><br />
                        <p>Sincerely,</p><br /><p>World Relief</p>`,
                        overrideHtml: false 
                    });
                    res.render('auth/confirmation', {user, page: 'Confirm email'});
                })
                .catch(err => {
                    console.log(err);
                    req.flash('error', 'Something went wrong');
                    res.redirect('back');
                });                
            }
            
        }
    );
});

router.get('/confirmation/:token', async (req, res) => {
    let token = req.params.token;
    try {
        const {user} =jwt.verify(token, config.SECRET);
        let updatedUser = await User.findByIdAndUpdate(user, {verified: true});
        // methods.sendMail({
        //     from: `${ config.name || 'Investment project' } <${config.MAIL_USER}>`,
        //     to: updatedUser.username,
        //     subject: 'Welcome',
        //     html: `<h3>Welcome on board</h3>
        //     <div class="card-text">
        //         <h3 style="text-transform: capitalize;">Hi ${updatedUser.firstname}</h3>
        //         <p>You are welcome to ${ config.name || 'Investment project' } company.</p>
        //         <p>Ensure to make the company your home of Investment.</p>
        //         <p>${ config.name || 'Investment project' } is a trading-based cryptocurrency, forex trade, real estate and marketing platform.</p>
        //         <br />
        //         <p>Visit <a href="${config.URL}/dashboard">this page</a> to access your account.</p> 
        //         <br />
        //         <p>For inquiries, please don't hesitate to contact us.</p>
        //         <br>
        //         <p>Regards,</p>
        //         <p>${ config.name || 'Investment project' }.</p>
        //     </div>`  
        // });
        // req.flash('success', 'Registration was successful. Log in to your account');
        res.redirect('/account/forgot_password/' + token);
    } catch(err) {
        console.log(err);
        req.flash('error', 'Link expired');
        res.redirect('/account/login');
    }
})

router.get("/login", (req, res) => {
    res.render("auth/login", {page: 'Login'});
});

router.post("/login", middleware.toLowerCase, passport.authenticate("local", {
    failureRedirect: "/account/login",
    failureFlash: "The User Name or Password is invalid."
}), (req, res) => {
    if(req.user.isAdmin) {
        req.logOut();
        req.flash("error", "The User Name or Password is invalid.");
        res.redirect("/account/login")
    } else {
        req.flash("success", "Welcome Back " + req.user.firstname);
        res.redirect("/dashboard");
    }
});

router.get('/forgot_password', (req, res) => {
    res.render('auth/forgot_password', {page: 'Forgot password'});
});

router.post('/forgot_password', (req, res) => {
    let email = req.body.email;
    User.find({username: email})
    .then(users => {
        if(users.length) {
            jwt.sign(
                {user: users[0]._id},
                config.SECRET,
                {expiresIn: '1d'},
                (err, emailToken) => {
                    if(err) {
                        console.log(err);
                        req.flash('error', 'Something went wrong. Please click resend');
                        res.redirect('/account/forgot_password')
                    } else {
                        let url = config.URL + '/account/forgot_password/' + emailToken;                        
                        methods.sendMail({
                            to: email,
                            subject: 'Your Password Reset Information',
                            html: `<p>Dear ${users[0].firstname}</p><br />
                            <p>A password request was processed from our Website. If you didn't request to recover your username or password,
                            you can ignore this message. If you're concerned about the security of your account, we recommend changing 
                            your password and security question.</p><br />
                            <p>Note: If you registered other people using your email address, this request might have
                            originated with them because your email address is associated with their record.</p><br />
                            <p>To reset your password, click the link below:</p><br />
                            <p><a href="${url}">Set or reset my password now</a></p><br /></p> <br />
                            <p>This link will expire in 72 hours.</p><br />
                            <p>Sincerely</p><br />
                            <p>World Relief</p>`  
                        });
                        req.flash('success', `A mail has been sent to ${email}, Please follow instructions.`);
                        res.redirect('/account/forgot_password');             
                    }
                    
                }
            );
        } else {
           req.flash('error', 'The email entered is not registered');
           res.redirect('/account/forgot_password')
        }
    })
    .catch(err => {
        console.log(err);
        req.flash('error', `Something went wrong.`);
        res.redirect('/account/forgot_password');  
    })
});

router.get('/forgot_password/:token', async (req, res) => {
    let token = req.params.token, duser;
    try {
        const {user} =jwt.verify(token, config.SECRET);
        duser = await User.findById(user);
        res.render('auth/reset_password', {duser, page: 'Reset password', token});
    } catch(err) {
        console.log(err);
        req.flash('error', 'Link expired');
        res.redirect('/account/forgot_password');
    }
});

router.post('/reset_password', (req, res, next) => {
    let password = req.body['password'];
    console.log(req.body)
    let id = req.body.user;
    User.findById(id)
    .then(user => {
        user.setPassword(password).then((newp) => {
            user.passwordHint = req.body.passwordHint;
            user.save();
            passport.authenticate("local", {
                successRedirect: '/dashboard',
                failureRedirect: "/account/forgot_password/" + req.body.token,
                failureFlash: "Something went wrong."
            })(req, res, next);
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
});

router.get("/logout", (req, res) => {
    req.logOut();
    res.redirect("/");
});


router.get('/donate', (req, res) => {
    getDepositPage(req, res);
});

router.get('/donate-monthly', (req, res) => {
    getDepositPage(req, res, 'monthly');
});

router.post('/donate', (req, res) => {
    depositManually(req, res);
});

module.exports = router;