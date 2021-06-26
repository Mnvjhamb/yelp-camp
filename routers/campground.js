const express = require("express");
const Router = express.Router();
const ExpressError = require("../utils/ExpressError");
const catchAsync = require("../utils/catchAsync");
const Campground = require("../models/campground");
const { campgroundSchema } = require("../utils/schemas");

const validateCampground = (req, res, next) => {
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

Router.get(
  "/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds", { campgrounds });
  })
);

Router.get("/new", (req, res) => {
  res.render("newcamp");
});

Router.get(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    if (!campground) {
      req.flash("error", "Cannot find that Campground");
      res.redirect("/campgrounds");
    }
    res.render("show", { campground });
  })
);

Router.post(
  "/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const cg = await new Campground(req.body);
    await cg.save();
    req.flash("success", "Successfully created your Campground");
    res.redirect(`/campgrounds/${cg._id}`);
  })
);
Router.put(
  "/:id",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      var msg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(msg, 400);
    }
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body });

    req.flash("success", "Successfully updated your campground");
    res.redirect(`/campgrounds/${id}`);
  })
);
Router.delete(
  "/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted your campground");
    res.redirect("/campgrounds");
  })
);

Router.get(
  "/:id/update",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    if (!campground) {
      req.flash("error", "Cannot find that Campground");
      res.redirect("/campgrounds");
    }
    res.render("update", { campground });
  })
);

module.exports = Router;
