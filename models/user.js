var mongoose          = require("mongoose"),
passportLocalMongoose = require("passport-local-mongoose");
const { nanoid } = require('nanoid');

var userSchema = new mongoose.Schema({
    username: String,
    email: String,
    affiliateId: {type: String, default: () => nanoid(10)},
    password: String,
    passwordHint: String,
    title: String,
    firstname: String,
    lastname: String,
    suffix: String,
    professionalSuffix: String,
    verified: {type: Boolean, default: false},
    isAdmin: {type: Boolean, default: false},
    giftCount: { type: Number, default: 0 },
    balance: { type: Number, default: 0 },
    previousPackage: String,
    address: {
        street1: String,
        street2: String,
        city: String,
        State: String,
        country: String,
        zipCode: String
    },
    phone: String,
    workPhone: String,
    mobilePhone: String,
    fax: String,
    employer: String,
    gender: String,
    dob: {
        month: Number,
        day: Number,
        year: Number
    },
    topics: {
        advocacy: {type: Boolean, default: false},
        churchEmpowerment: {type: Boolean, default: false},
        disasterRelief: {type: Boolean, default: false},
        internationalWork: {type: Boolean, default: false},
        refugee: {type: Boolean, default: false},
        volunteer: {type: Boolean, default: false},
    },
    mailSub: {type: Boolean, default: true},
    postalMail: {type: Boolean, default: false},
    mailFormat: {type: String, default: 'HTML'},
    registered: {type: Date, default: () => Date.now()},
});

userSchema.plugin(passportLocalMongoose);
userSchema.index({affiliateId: 1});

module.exports = mongoose.model("User", userSchema);