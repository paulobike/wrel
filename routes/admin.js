const express            = require("express");
const router             = express.Router();
const middleware         = require("../middleware");


/**
 * CONTROLLERS
 */
const { authenticate, login } = require("../controllers/admin/login");
const { fetchUser, fetchUsers, updateUser, deleteUser, getUserChangePasswordPage, changeUserPassword }
    = require("../controllers/admin/users");
const { getDeposits, updateDeposit, deleteDeposit, fetchDeposit } = require("../controllers/admin/deposits");
const { fetchMails, getSendMailPage, fetchMail, sendNewMail, deleteMail } 
    = require("../controllers/admin/mail");


/**
 * INDEX AND AUTH
 */
router.get("/", middleware.isAdmin, (req, res) => {
    res.redirect('/admin/users');
});

router.get('/login', (req, res) => {
    res.render("auth/admin-login", {page: 'admin_login'});
});

router.post("/login", middleware.toLowerCase, authenticate(), (req, res) => {
    login(req, res);
});


/**
 * USERS
 */
router.get("/users", middleware.isAdmin, (req, res) => {
    fetchUsers(req, res);
});

router.get("/users/:id", middleware.isAdmin, (req, res) => {
    fetchUser(req, res);
});

router.put("/users/:id", middleware.isAdmin, middleware.toLowerCase, (req, res) => {
    updateUser(req, res);
});

router.delete("/users/:id", middleware.isAdmin, (req, res) => {
    deleteUser(req, res);
});

router.get("/users/:id/transactions", middleware.isAdmin, (req, res) => {
    getDeposits(req, res, req,params.id);
});

router.get('/users/:id/change_password', (req, res) => {
    getUserChangePasswordPage(req, res);
});

router.post('/users/:id/change_password', middleware.isAdmin, (req, res) => {
    changeUserPassword(req, res);
});


/**
 * DEPOSITS
 */
router.get("/transactions", middleware.isAdmin, (req, res) => {
    getDeposits(req, res, null);
});

router.put('/transactions/:id', (req, res) => {
    updateDeposit(req, res);
});

router.get('/transactions/:id', (req, res) => {
    fetchDeposit(req, res);
});


router.delete('/transactions/:id', (req, res) => {
    deleteDeposit(req, res);
});


/**
 * MAILS
 */
router.get('/mail', middleware.isAdmin, (req, res) => {
    fetchMails(req, res);
});

router.get('/mail/new', middleware.isAdmin, (req, res) => {
    getSendMailPage(req, res);
});

router.get('/mail/:id', middleware.isAdmin, (req, res) => {
    fetchMail(req, res);
});

router.post('/mail', middleware.isAdmin, (req, res) => {
    sendNewMail(req, res);
});

router.delete('/mail/:id', middleware.isAdmin, (req, res) => {
   deleteMail(req, res); 
});

module.exports = router;