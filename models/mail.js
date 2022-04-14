var mongoose = require("mongoose");

var mailSchema = new mongoose.Schema({
    sender: String,
    subject: String,
    body: String,
    recipients: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User'}],
    group: {type: String},
    date: {type: Date, default: () => Date.now()},
});

module.exports = mongoose.model("Mail", mailSchema);