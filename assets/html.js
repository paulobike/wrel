const config = require('../config');

let header =
    `<html> <head> <meta name="viewport" content="width=device-width, initial-scale=1.0"> <link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"> </head> <body style="width: 100%; margin: 0 auto; max-width: 600px; font-family: 'Montserrat',sans-serif;; font-size: 14px; line-height: 15px; letter-spacing: 1px;"> <div style="background-color: #111114; color: white; padding: 30px;"> <h2 style="text-align: center;"><img src="${config.URL}/styles/img/logo-1.png" width="70" height="50"/></h2> <div style="padding: 30px 0">`


let footer =
    `</div><small> This is an automatically generated email. Please do not reply to this email. If you face any issues, please contact us at <a href="mailto:${config.MAIL_USER}" style="color: #f34e4e;">${config.MAIL_USER}</a> anytime </small> </div><div style="background-color: #ecf0f1; padding: 1px 10px; text-align: center;"> <p>Copyright © ${ config.year || '2021' } ${ config.name || 'Investment project' } All Rights Reserved</p><p>This email was sent to you as a registered user of <a href="${config.DOMAIN}" style="color:#f34e4e;">${config.DOMAIN}</a>.</p></div></body></html>`

module.exports.footer = footer;
module.exports.header = header;