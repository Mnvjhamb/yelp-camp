const User = require("../models/user");

module.exports.registerForm = (req, res) => {
  res.render("users/register");
};

module.exports.register = async (req, res) => {
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
};

module.exports.loginForm = (req, res) => {
  res.render("users/login");
};

module.exports.login = async (req, res) => {
  req.flash("success", "Successfully Logged In");
  const returnURL = req.session.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(returnURL);
};

module.exports.logout = (req, res) => {
  req.logout();
  req.flash("success", "Successfully Logged You Out");
  res.redirect("/campgrounds");
};
