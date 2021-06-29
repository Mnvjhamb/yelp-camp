const mongoose = require("mongoose");
const passportLocalMongoose = require("passport-local-mongoose");
var uniqueValidator = require("mongoose-unique-validator");
const findOrCreate = require("mongoose-findorcreate");
const userSchema = new mongoose.Schema({
  email: {
    type: String,
  },
  googleId: String,
  facebookId: String,
});

userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);
userSchema.plugin(uniqueValidator, { message: "{PATH} must be unique" });

module.exports = mongoose.model("User", userSchema);
