require("dotenv").config();
var express = require("express"),
  http = require("http"),
  reload = require("reload"),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  flash = require("connect-flash"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  passportLocalMongoose = require("passport-local-mongoose"),
  Camp = require("./models/campgrounds"),
  User = require("./models/user"),
  Comment = require("./models/comment"),
  app = express(),
  favicon = require("serve-favicon"),
  path = require("path");

var commentRoutes = require("./routes/comments"),
  campgroundRoutes = require("./routes/campgrounds"),
  indexRoutes = require("./routes/index");
app.use(favicon(path.join(__dirname, "public", "favicon.ico")));
mongoose.set("useCreateIndex", true);
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.set("useFindAndModify", false);
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
// connects to the mongo database
mongoose.connect("mongodb+srv://abit:gurung@cluster0-0z5bd.mongodb.net/", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

app.use(
  require("express-session")({
    secret: "hey buddy!",
    resave: false,
    saveUninitialized: false
  })
);
app.locals.moment = require("moment");
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

app.use(indexRoutes);
app.use(commentRoutes);
app.use(campgroundRoutes);
app.use(function(req, res) {
  res.status(404).render("404.ejs");
});
//runs server
app.listen(process.env.PORT || 3000, process.env.IP, function() {
  console.log("The Yelp Camp Server Started!");
});
