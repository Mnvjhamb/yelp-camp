const mongoose = require("mongoose");
const { Schema } = mongoose;
const { User } = require("./user");
const reviewSchema = new Schema({
  body: String,
  rating: Number,
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },
});

module.exports = mongoose.model("Review", reviewSchema);
