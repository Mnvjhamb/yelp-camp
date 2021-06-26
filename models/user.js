const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
var uniqueValidator = require("mongoose-unique-validator");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(uniqueValidator, { message: "{PATH} must be unique" });

module.exports = mongoose.model("User", userSchema);
