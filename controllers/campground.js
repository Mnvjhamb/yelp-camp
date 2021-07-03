const Campground = require("../models/campground");
const { campgroundSchema } = require("../utils/schemas");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const geoCoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

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

  cg.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));

  const geoData = await geoCoder
    .forwardGeocode({
      query: cg.location,
      limit: 1,
    })
    .send();

  cg.geometry = geoData.body.features[0].geometry;
  console.log(cg);
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
  const campground = await Campground.findByIdAndUpdate(id, { ...req.body });
  campground.images.push(
    ...req.files.map((f) => ({
      url: f.path,
      filename: f.filename,
    }))
  );
  if (req.body.deleteImages) {
    for (var filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await campground.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
  }

  const geoData = await geoCoder
    .forwardGeocode({
      query: campground.location,
      limit: 1,
    })
    .send();

  campground.geometry = geoData.body.features[0].geometry;
  await campground.save();
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
