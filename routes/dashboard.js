var express = require("express"),
router      = express.Router(),
path        = require('path');


/**
 * CONTROLLERS
 */
const getDashboard = require("../controllers/user/getDashboard");
const { getProfilePage, updateProfile } = require("../controllers/user/profile");
const { getWalletPage, depositManually, getDepositHistory } = require("../controllers/user/deposit");
const { changePassword, getChangePasswordPage } = require("../controllers/user/password");
const { getEmailPrefPage, updateEmailPref } = require("../controllers/user/emailpref");
const { getGiftsPage } = require("../controllers/user/deposit");


/**
 * INDEX AND REFERRALS
 */
router.get("/", (req, res) => {
    getDashboard(req, res);
});


/**
 * PROFILE
 */
router.get("/profile", (req, res) => {
    getProfilePage(req, res);
});

router.post("/profile", (req, res) => {
    updateProfile(req, res);
});

/**
 * PROFILE
 */
 router.get("/emailpref", (req, res) => {
    getEmailPrefPage(req, res);
});

router.post("/emailpref", (req, res) => {
    updateEmailPref(req, res);
});


/**
 * PASSWORD RESET
 */
router.get('/change-password', (req, res) => {
    getChangePasswordPage(req, res);
});

router.post('/change-password', (req, res) => {
    changePassword(req, res);
});


/**
 * DEPOSIT
 */
router.post('/invest', (req, res) => {
    invest(req, res);
});

router.get('/gifts', (req, res) => {
    getGiftsPage(req, res);
});

router.get("/deposit/history", (req, res) => {
    getDepositHistory(req, res);
});

router.post('/deposit/crypto',(req, res) => {
    getWalletPage(req, res);
});

router.post('/deposit/crypto/confirm', (req, res) => {
    depositManually(req, res);
});


module.exports = router;