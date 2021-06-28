const express = require("express");
const Router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campground = require("../controllers/campground");
const {
  validateCampground,
  isAutherized,
  isLoggedIn,
} = require("../middlewares/campground");

Router.route("/")
  .get(catchAsync(campground.index))
  .post(isLoggedIn, validateCampground, catchAsync(campground.post));

Router.get("/new", isLoggedIn, campground.new);

Router.route("/:id")
  .get(catchAsync(campground.show))
  .put(
    isLoggedIn,
    isAutherized,
    validateCampground,
    catchAsync(campground.update)
  )
  .delete(isLoggedIn, isAutherized, catchAsync(campground.delete));

Router.get(
  "/:id/update",
  isAutherized,
  isLoggedIn,
  catchAsync(campground.updateForm)
);

module.exports = Router;
