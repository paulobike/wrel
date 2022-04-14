const User = require("../../models/user");
const Mail = require("../../models/mail");
const methods = require('../../assets/methods');

module.exports.fetchMails = (req, res) => {
    Mail.find().sort({date: -1})
    .then(mails => {
        res.render('admin/mail', {
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_mail',
            mails
        });
    })
    .catch(err => {
        console.log(err)
        req.flash('error', 'Mails not available at the moment');
    });
}

module.exports.fetchMail = (req, res) => {
    Mail.findById(req.params.id)
    .then(mail => {      
        res.render('admin/mail/show', {
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_mail',
            mail
        });  
    })
    .catch(err => {
        console.log(err);
        req.flash('error', 'Mails not available at the moment');
        res.redirect('back')
    });
}

module.exports.getSendMailPage = (req, res) => {
    res.render('admin/mail/new', {
        navTheme: {color:'navbar-dark', bg: 'default'},
        page: 'admin_new_mail'
    }); 
}

module.exports.sendNewMail = (req, res) => {
    let sender = req.body.sender;
    let subject = req.body.subject;
    let body = req.body.body;
    let group = req.body.group;
    let userQuery = {isAdmin: false};
    if(group === 'donors') {
        userQuery.giftCount = { $gt: 0 };
    } else if(group === 'nondonors') {
        userQuery.giftCount = { $lte: 0 };
    }
    User.find(userQuery)
    .then(users => {
        let userIds = [], emailAddresses = '';
        for(let i = 0; i < users.length; i++) {
            emailAddresses += users[i].username;
            if(i < users.length -1) emailAddresses += ', ';
            userIds.push(users[i]._id);
        };
        console.log(emailAddresses)
        if(emailAddresses.length < 1) {
            req.flash('error', 'There are no users in the group "' + group + '"');
            return res.redirect('back');
        }
        methods.sendMail({
            from: `${sender} <${config.MAIL_USER}>`,
            bcc: emailAddresses,
            subject,
            text: '',
            html: body
        })
        .then(data => {
            console.log(data);
            Mail.create({subject, body, sender, group, recipients: userIds}, _ => {
                req.flash('success', `${data.accepted.length} sent, ${data.rejected.length} rejected`);
                res.redirect('/admin/mail');
            });
        }).catch(err => {
            console.log(err)
            req.flash('error', 'Something went wrong');
            res.redirect('back');
        });
    })
    .catch(err => {
        console.log(err)
        req.flash('error', 'Something went wrong');
        res.redirect('back');
    });
}

module.exports.deleteMail = (req, res) => {
    Mail.findByIdAndDelete(req.params.id)
    .then(mail => {
        req.flash("success", "Deleted successfully");
        res.redirect("/admin/mail");
    }).catch(err => {
        console.log(err);
        req.flash("error", "Somethong went wrong. Try again");
        res.redirect("back");
    });
}