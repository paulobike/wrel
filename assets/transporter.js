const config = require('../config');
const mailer = require('nodemailer');

const transporterOptions = {
    auth: {
        user: config.MAIL_USER,
        pass: config.MAIL_PASS
    }
}

if(config.MAIL_SERVICE) transporterOptions.service = config.MAIL_SERVICE;
else {
    transporterOptions.host = config.MAIL_HOST || 'mail.privateemail.com';
    transporterOptions.port = config.MAIL_PORT || 465;
} 

const transporter = mailer.createTransport(transporterOptions);

module.exports = transporter;