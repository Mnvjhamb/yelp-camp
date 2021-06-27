const { reviewSchema } = require("../utils/schemas");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    console.log(req.body);
    console.log(reviewSchema.validate(req.body));
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
  const review = await Review.findById(req.params.reviewId);
  if (!review.author._id.equals(res.locals.currentUser._id)) {
    req.flash("error", "Not Authorized");
    return res.redirect(
      req.session.returnTo || "/campgrounds/" + req.params.id
    );
  }
  next();
};
