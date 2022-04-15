var mongoose = require("mongoose");

var walletSchema = new mongoose.Schema({
    tokenShort: String,
    tokenName: { type: String, set: toLowerCase },
    displayName: String,
    address: String,
    memo: String,
    date: {type: Date, default: () => Date.now()},
});

function toLowerCase(string) {
    return string.toLowerCase();
}

module.exports = mongoose.model("Wallet", walletSchema);