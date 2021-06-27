const ExpressError = require("../utils/ExpressError");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../utils/schemas");

module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    console.log(req.body);
    console.log(campgroundSchema.validate(req.body));
    console.log(error);
    var msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "Please Sign In First");
    res.redirect("/login");
  } else {
    next();
  }
};

module.exports.isAutherized = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  console.log(campground.author, res.locals.currentUser);
  if (!campground.author._id.equals(res.locals.currentUser._id)) {
    req.flash("error", "Not Authorized");
    return res.redirect(
      req.session.returnTo || "/campgrounds/" + req.params.id
    );
  }
  next();
};
