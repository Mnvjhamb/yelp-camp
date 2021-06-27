const express = require("express");
const Router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const review = require("../controllers/review");
const {
  isAutherized,
  isLoggedIn,
  validateReview,
} = require("../middlewares/review");

Router.delete(
  "/:reviewId",
  isLoggedIn,
  isAutherized,
  catchAsync(review.delete)
);

Router.post("/", isLoggedIn, validateReview, catchAsync(review.post));

module.exports = Router;
