const express = require("express");
const path = require("path");
const ejsMate = require("ejs-mate");
const methodOverride = require("method-override");
const campgroundRouter = require("./routers/campground");
const reviewRouter = require("./routers/review");
const ExpressError = require("./utils/ExpressError");
const catchAsync = require("./utils/catchAsync");
const Campground = require("./models/campground");
const { campgroundSchema } = require("./utils/schemas");
const { reviewSchema } = require("./utils/schemas");
const Review = require("./models/review");

const mongoose = require("mongoose");
mongoose.connect("mongodb://localhost:27017/yelp-camp", {
  useCreateIndex: true,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error"));
db.once("open", () => {
  console.log("connection OPEN");
});

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

const app = express();
app.engine("ejs", ejsMate);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.get(
  "/campgrounds/",
  catchAsync(async (req, res, next) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds", { campgrounds });
  })
);

app.get("/campgrounds/new", (req, res) => {
  res.render("newcamp");
});

app.get(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate("reviews");
    res.render("show", { campground });
  })
);

app.post(
  "/campgrounds/",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const cg = await new Campground(req.body);
    await cg.save();
    res.redirect(`/campgrounds/${cg._id}`);
  })
);
app.put(
  "/campgrounds/:id",
  validateCampground,
  catchAsync(async (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
      var msg = error.details.map((el) => el.message).join(",");
      throw new ExpressError(msg, 400);
    }
    const { id } = req.params;
    await Campground.findByIdAndUpdate(id, { ...req.body });
    res.redirect(`/campgrounds/${id}`);
  })
);
app.delete(
  "/campgrounds/:id",
  catchAsync(async (req, res, next) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    res.redirect("/campgrounds");
  })
);

app.get(
  "/campgrounds/:id/update",
  catchAsync(async (req, res, next) => {
    const campground = await Campground.findById(req.params.id);
    res.render("update", { campground });
  })
);

app.delete(
  "/campgrounds/:id/review/:reviewId",
  catchAsync(async (req, res) => {
    await Campground.findByIdAndUpdate(req.params.id, {
      $pull: { reviews: req.params.reviewId },
    });
    await Review.findByIdAndDelete(req.params.reviewId);

    res.redirect("/campgrounds/" + req.params.id);
  })
);

app.post(
  "/campgrounds/:id/review",
  validateReview,
  catchAsync(async (req, res, next) => {
    const review = await new Review(req.body);
    const campground = await Campground.findById(req.params.id);
    await campground.reviews.push(review);
    await campground.save();
    await review.save();
    res.redirect(`/campgrounds/${req.params.id}`);
  })
);

app.all("*", (req, res, next) => {
  next(new ExpressError("Page not found", 404));
});

app.use((err, req, res, next) => {
  const { status = 500, message = "SOMTHING WENT WRONg" } = err;
  console.log(err);
  res.status(status).render("error", { message });
});

app.listen(3000, () => {
  console.log("LIsteNing On PorT 3000");
});
