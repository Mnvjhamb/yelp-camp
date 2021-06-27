const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const user = require("../controllers/user");

router.get("/register", user.registerForm);
router.post("/register", catchAsync(user.register));
router.get("/login", user.loginForm);

router.post(
  "/login",
  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  user.login
);

router.get("/logout", user.logout);

module.exports = router;
