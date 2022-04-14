const fs = require('fs');
const path = require('path');
const User = require("../../models/user");
const Kyc = require("../../models/kyc");
const methods = require('../../assets/methods');

module.exports.fetchKycs = async (req, res) => {
    let offset;
    offset = req.query.offset;
    if(!offset) offset = 0;
    offset = Number(offset);
    let end = offset + 20;
    let count;
    try {
        count = await Kyc.countDocuments({});
    } catch (err) {
        count = 0;
    }
    Kyc.find().sort({status: -1})
    .then(kycs => {
        res.render('admin/kyc', {
            navTheme: {color:'navbar-dark', bg: 'default'},
            page: 'admin_kyc',
            kycs, offset, end, count,
            url: config.URL
        });
    })
    .catch(err => {
        console.log(err);
        req.flash("error", "An error occured. Try again.");
        res.redirect('back');
    });
}

module.exports.updateKyc = (req, res) => {
    let action = req.body.action;
    let status = 'pending';
    if(action === 'approve') status = 'approved';
    if(action === 'reject') status = 'rejected';
    Kyc.findByIdAndUpdate(req.params.id, { status })
    .then(kyc => {
        User.findById(kyc.user.id)
        .then(user => {
            methods.sendMail({
                from: `${config.name || 'Investment project'} <${config.MAIL_USER}>`,
                to: user.username,
                subject: 'KYC application Notice',
                html: `<h3>KYC application Notice</h3>
                <div class="card-text">
                    <h3 style="text-transform: capitalize;">Hi ${user.firstname},</h3>
                    <p>Your KYC application has been ${status}.</p>
                    <p>Click <a href="${config.URL}/dashboard/kyc">here</a> to view KYC status.</p>
                    <p>Any complaints? reach us at support@${config.DOMAIN}</p>
                    <p>Thank you for investing with us.</p>
                    <br>
                    <p>Regards,</p>
                    <p>${config.name || 'Investment project'}.</p>
                </div>`  
            });
            req.flash('success', `KYC application has been ${status}`);
            res.redirect('back');
        });
    })
    .catch(err => {
        console.log(err)
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}

module.exports.deleteKyc = (req, res) => {
    Kyc.findById(req.params.id)
    .then(kyc => {
        fs.rmSync(path.join(__dirname, '../uploads/' + kyc.file));
        kyc.remove()
        req.flash('success', `KYC application has been deleted`);
        res.redirect('back');  
    })
    .catch(err => {
        req.flash("error", "Something went wrong");
        res.redirect("back");
    });
}