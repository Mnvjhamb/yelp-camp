const joi = require("joi");

module.exports.campgroundSchema = joi.object({
  title: joi.string().required(),
  price: joi.number().required(),
  location: joi.string().required(),
  description: joi.string().required(),
  deleteImages: joi.array(),
});

module.exports.reviewSchema = joi.object({
  body: joi.string().required(),
  rating: joi.number().required(),
});
