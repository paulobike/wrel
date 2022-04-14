var express           = require("express");
const app             = express(),
path                  = require('path'),
mongoose              = require("mongoose"),
passport              = require("passport"),
LocalStrategy         = require("passport-local"),
User                  = require("./models/user"),
adminRoutes           = require("./routes/admin"),
dashboardRoutes       = require("./routes/dashboard"),
indexRoutes           = require("./routes/index"),
flash                 = require("connect-flash"),
methodOverride        = require("method-override"),
middleware            = require("./middleware"),
session               = require("express-session");
const config          = require('./config');

const PORT        = config.PORT,
IP                = config.IP
CONNECTION_STRING = config.MONGO_CONNECTION_STRING

mongoose.connect(CONNECTION_STRING + '?retryWrites=true&w=majority', {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false, useUnifiedTopology: true }).then(() => {
    console.log("Mongoose connected");
}).catch((err) => {
    console.log(err);
});

const MongoStore = require("connect-mongo")(session);
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header(
      'Access-Control-Allow-Headers',
      'Origin, X-Requested-With, Content-Type, Accept, Authentication'
    );
    res.header('Access-Control-Allow-Credentials', true);
    next();
}); 
app.use(session({
    secret: config.SECRET,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({mongooseConnection: mongoose.connection})
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static("public"));
app.use(express.urlencoded({extended: true}));
app.use(flash());
app.use((req, res, next) => {
    res.locals.user = req.user;
    res.locals.error = req.flash("error");
    res.locals.success = req.flash("success");
    res.locals.page = null;
    let configuration = { ...config };
    delete configuration.SECRET;
    delete configuration.MAIL_PASS;
    delete configuration.MONGO_CONNECTION_STRING;
    delete configuration.PORT;
    delete configuration.IP;
    res.locals.config = configuration;
    next();
});
app.use(methodOverride("_method"));
app.set("view engine", "ejs");

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(middleware.secure);
app.use('/account', indexRoutes);
app.use("/dashboard", middleware.isLoggedIn, middleware.toAdmin, dashboardRoutes);
app.use("/admin", adminRoutes);

app.listen(PORT, IP, () => {
    console.log("Investment app running at http://" + IP + ":" + PORT + "!!!");
});