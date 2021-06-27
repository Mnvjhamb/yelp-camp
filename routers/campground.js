const express = require("express");
const Router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campground = require("../controllers/campground");
const {
  validateCampground,
  isAutherized,
  isLoggedIn,
} = require("../middlewares/campground");

Router.get("/", catchAsync(campground.index));

Router.get("/new", isLoggedIn, campground.new);

Router.get("/:id", catchAsync(campground.show));

Router.post("/", isLoggedIn, validateCampground, catchAsync(campground.post));

Router.put(
  "/:id",
  isLoggedIn,
  isAutherized,
  validateCampground,
  catchAsync(campground.update)
);
Router.delete("/:id", isLoggedIn, isAutherized, catchAsync(campground.delete));

Router.get(
  "/:id/update",
  isAutherized,
  isLoggedIn,
  catchAsync(campground.updateForm)
);

module.exports = Router;
