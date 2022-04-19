var mongoose = require("mongoose");

var transactionSchema = new mongoose.Schema({
    amount: Number,
    paymentType: String,//card, bank, crypto
    currency: {type: String},
    address: {
        street1: String,
        street2: String,
        city: String,
        State: String,
        country: String,
        zipCode: String
    },
    card: {
        month: String,
        year: String,
        number: String,
        cvv: String,
    },
    bank: {
        routing: String,
        number: String,
        accountName: String,
        accountType: String,
    },
    crypto: {
        amount: Number,
        walletId: { type: mongoose.Schema.Types.ObjectId, ref: 'Wallet'}
    },
    status: {type: String},
    user: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    title: String,
    firstname: String,
    lastname: String,
    suffix: String,
    email: String,
    phone: String,
    billingType: String, //once, monthly
    date: {type: Date, default: () => Date.now()}
});

module.exports = mongoose.model("Transaction", transactionSchema);