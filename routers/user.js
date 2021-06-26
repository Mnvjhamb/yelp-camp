const express = require("express");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");

router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res) => {
    try {
      const { email, username, password } = req.body;
      const newUser = await new User({
        email,
        username,
      });
      await User.register(newUser, password);
      req.login(newUser, (err) => {
        if (!err) {
          req.flash("success", "Welcome to Yelp-Camp");
          res.redirect("/campgrounds");
        }
      });
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);

router.get("/login", (req, res) => {
  res.render("users/login");
});

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  async (req, res) => {
    req.flash("success", "Welcome Back");
    const returnURL = req.session.returnTo || "/campgrounds";
    delete req.session.returnTo;
    res.redirect(returnURL);
  }
);

router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "Successfully Logged You Out");
  res.redirect("/campgrounds");
});

module.exports = router;
