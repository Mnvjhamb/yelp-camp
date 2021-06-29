const Campground = require("../models/campground");
const cities = require("./cities");
const { descriptors, places } = require("./seedHelpers");
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

const seedDB = async () => {
  await Campground.deleteMany({});
  for (let i = 0; i < 15; i++) {
    var random = Math.floor(Math.random() * 1000);

    const camp = await new Campground({
      title: `${descriptors[Math.floor(Math.random() * descriptors.length)]} ${
        places[Math.floor(Math.random() * places.length)]
      }`,
      author: "60dad69aefe38b261c87df2a",
      image: "https://source.unsplash.com/collection/483251",
      price: `${Math.floor(Math.random() * 50)}`,
      location: `${cities[random].city}, ${cities[random].state}`,
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Repellendus eligendi facilis necessitatibus, neque sint magnam explicabo dolore est voluptates, laudantium culpa dolorum, earum excepturi pariatur itaque minus veniam rerum vitae?",
    });
    await camp.save();
  }
};

seedDB().then(() => {
  mongoose.connection.close();
});
