var express = require("express"),
router      = express.Router();

const { getDepositPage, depositManually, depositCrypto, getCryptoPage2, updateCrypto, getCryptoPage1, getWallet } = require("../controllers/user/deposit");

/**
 * DEPOSIT
 */
router.post('/', (req, res) => {
    depositManually(req, res, 'crypto');
})

router.get('/donate', (req, res) => {
    getDepositPage(req, res);
});

router.get('/donate-monthly', (req, res) => {
    getDepositPage(req, res, 'monthly');
});

router.get('/donate-crypto', (req, res) => {
    getDepositPage(req, res, 'crypto');
});

router.post('/donate', (req, res) => {
    depositManually(req, res);
});

router.get('/get-crypto-page1', (req, res, next) => {
    getCryptoPage1(req, res, next);
});

router.get('/get-crypto-page2/:id', (req, res, next) => {
    getCryptoPage2(req, res, next);
});

router.get('/get-wallet/:id', (req, res, next) => {
    getWallet(req, res, next);
});

router.post('/donate-crypto', (req, res, next) => {
    depositCrypto(req, res, next);
});

router.post('/donate-crypto2/:id', (req, res, next) => {
    updateCrypto(req, res, next);
});

module.exports = router;