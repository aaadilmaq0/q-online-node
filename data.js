const mongoose = require("mongoose");
const request = require("request");
const config = require("./config");
const mongooseUrl  = config.mongooseUrl;
const User = require("./models/user");
const options = { useNewUrlParser: true };
const url = config.url;


mongoose
  .connect(mongooseUrl, options)
  .then(() => {
    console.log("Connected");
  })
  .catch(error => {
    console.log(error);
  });

request(url, { json: true }, (err, response, body) => {
  body.forEach(user => {
    const newUser = new User(user);
    newUser.save();
  });
});