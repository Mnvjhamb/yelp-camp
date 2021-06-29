require("dotenv").config();
const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const ExpressError = require("./utils/ExpressError");
const bodyParser = require("body-parser");

const campgroundRouter = require("./routers/campground");
const reviewRouter = require("./routers/review");
const userRouter = require("./routers/user");

const flash = require("connect-flash");
const session = require("express-session");

const passport = require("passport");
const localStrategy = require("passport-local");
const User = require("./models/user");
const GoogleStrategy = require("passport-google-oauth20").Strategy;
const FacebookStrategy = require("passport-facebook").Strategy;

const mongoose = require("mongoose");
const { env } = require("process");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("connection OPEN");
});

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use(
  session({
    secret: "Thisisasecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
      maxAge: 1000 * 60 * 60 * 24 * 7,
    },
  })
);
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));

passport.serializeUser(function (user, done) {
  done(null, user.id);
});

passport.deserializeUser(function (id, done) {
  User.findById(id, function (err, user) {
    done(err, user);
  });
});
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/google/campgrounds",
    },
    async function (accessToken, refreshToken, profile, done) {
      var user = await User.findOne({ googleId: profile.id });
      if (!user) {
        user = await new User({
          email: profile._json.email,
          username: profile.displayName,
          googleId: profile.id,
        }).save();
      }
      done(null, user);
    }
  )
);

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.FACEBOOK_CLIENT_ID,
      clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/auth/facebook/campgrounds",
      profileFields: ["id", "displayName", "emails"],
    },
    async function (accessToken, refreshToken, profile, done) {
      var user = await User.findOne({ facebookId: profile.id });
      if (!user) {
        user = await new User({
          email: profile._json.email,
          username: profile.displayName,
          facebookId: profile.id,
        }).save();
      }
      done(null, user);
    }
  )
);

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");

  next();
});

app.use("/", userRouter);
app.use("/campgrounds", campgroundRouter);
app.use("/campgrounds/:id/review", reviewRouter);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "SOMTHING WENT WRONg" } = err;
  console.log(err);
  res.status(status).render("error", { message });
});

app.listen(3000, () => {
  console.log("LIsteNing On PorT 3000");
});
