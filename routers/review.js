const express = require("express");
const Router = express.Router();
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
    await Campground.findByIdAndUpdate(req.params.campId, {
      $pull: { reviews: req.params.reviewId },
    });

    res.redirect("/campgrounds/" + req.params.campId);
  })
);

Router.post(
  "/",
  validateReview,
  catchAsync(async (req, res, next) => {
    const review = await new Review(req.body);
    console.log(req.params);
    const campground = await Campground.find({ _id: req.params.id });
    console.log(campground, review);
    await campground.reviews.push(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${req.params.id}`);
  })
);

module.exports = Router;
