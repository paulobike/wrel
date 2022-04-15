var express = require("express"),
router      = express.Router();

const { getDepositPage, depositManually } = require("../controllers/user/deposit");

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


module.exports = router;