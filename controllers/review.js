const { reviewSchema } = require("../utils/schemas");
const Review = require("../models/review");
const Campground = require("../models/campground");

module.exports.delete = async (req, res) => {
  await Review.findByIdAndDelete(req.params.reviewId);
  await Campground.findByIdAndUpdate(req.params.id, {
    $pull: { reviews: req.params.reviewId },
  });
  req.flash("success", "Successfully deleted your Review");
  res.redirect("/campgrounds/" + req.params.id);
};

module.exports.post = async (req, res, next) => {
  const review = await new Review(req.body);
  review.author = res.locals.currentUser;
  const campground = await Campground.findById(req.params.id);
  await campground.reviews.push(review);
  await campground.save();
  await review.save();
  req.flash("success", "Successfully added a Review");
  res.redirect(`/campgrounds/${req.params.id}`);
};
