const transporter = require('./transporter');
const html        = require('./html');

var methods = {
    sendMail: (mail) => {
        return new Promise((resolve,reject)=>{
            if(!mail.overrideHtml)
                mail.html = html.header + mail.html + html.footer;
            else delete mail.overrideHtml;
            transporter.sendMail(mail, function(error, response){
                if(error){
                    console.log(error);
                    reject(error);
                }else{
                    console.log("Message sent: " + JSON.stringify(response));
                    resolve(response);
                }

                transporter.close();
            });
        });
    }
}

module.exports = methods;