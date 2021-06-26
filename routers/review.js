const express = require("express");
const Router = express.Router({ mergeParams: true });
const Campground = require("../models/campground");
const catchAsync = require("../utils/catchAsync");
const { reviewSchema } = require("../utils/schemas");
const Review = require("../models/review");
const ExpressError = require("../utils/ExpressError");

const validateReview = (req, res, next) => {
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

Router.delete(
  "/:reviewId",
  catchAsync(async (req, res) => {
    await Review.findByIdAndDelete(req.params.reviewId);
    await Campground.findByIdAndUpdate(req.params.id, {
      $pull: { reviews: req.params.reviewId },
    });
    req.flash("success", "Successfully deleted your Review");
    res.redirect("/campgrounds/" + req.params.id);
  })
);

Router.post(
  "/",
  validateReview,
  catchAsync(async (req, res, next) => {
    const review = await new Review(req.body);
    const campground = await Campground.findById(req.params.id);
    await campground.reviews.push(review);
    await campground.save();
    await review.save();
    req.flash("success", "Successfully added a Review");
    res.redirect(`/campgrounds/${req.params.id}`);
  })
);

module.exports = Router;
