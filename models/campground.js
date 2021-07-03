const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Review = require("./review");
const User = require("./user");

const imageSchema = new Schema({
  url: String,
  filename: String,
});

imageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200,h_200");
});

const campgroundSchema = new Schema(
  {
    title: String,
    price: {
      type: Number,
      min: 0,
    },
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: [Number],
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    description: String,
    location: String,
    images: [imageSchema],
    reviews: [
      {
        type: Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  {
    toJSON: {
      virtuals: true,
    },
  }
);

campgroundSchema.virtual("properties").get(function () {
  return {
    id: this._id,
    title: this.title,
  };
});

campgroundSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: { $in: doc.reviews },
    });
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);
