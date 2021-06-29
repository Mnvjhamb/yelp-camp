const Campground = require("../models/campground");
const { campgroundSchema } = require("../utils/schemas");

module.exports.index = async (req, res, next) => {
  const campgrounds = await Campground.find({});
  res.render("campgrounds", { campgrounds });
};

module.exports.new = async (req, res, next) => {
  res.render("newcamp");
};

module.exports.show = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id)
    .populate({
      path: "reviews",
      populate: "author",
    })
    .populate("author");
  if (!campground) {
    req.flash("error", "Cannot find that Campground");
    res.redirect("/campgrounds");
  }
  res.render("show", { campground });
};

module.exports.post = async (req, res, next) => {
  const cg = await new Campground(req.body);
  cg.author = req.user._id;
  await cg.save();
  req.flash("success", "Successfully created your Campground");
  res.redirect(`/campgrounds/${cg._id}`);
};

module.exports.update = async (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    var msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  }
  const { id } = req.params;
  await Campground.findByIdAndUpdate(id, { ...req.body });

  req.flash("success", "Successfully updated your campground");
  res.redirect(`/campgrounds/${id}`);
};

module.exports.delete = async (req, res, next) => {
  const { id } = req.params;
  await Campground.findByIdAndDelete(id);
  req.flash("success", "Successfully deleted your campground");
  res.redirect("/campgrounds");
};

module.exports.updateForm = async (req, res, next) => {
  const campground = await Campground.findById(req.params.id);
  if (!campground) {
    req.flash("error", "Cannot find that Campground");
    res.redirect("/campgrounds");
  }
  res.render("update", { campground });
};
