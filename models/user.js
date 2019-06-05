const mongoose = require("mongoose");

const User = {
  firstName: { type: String },
  lastName: { type: String },
  userName: { type: String },
  email: { type: String },
  phone: { type: String },
  dob: { type: Date },
  website: { type: String },
  ip: { type: String },
  avatar: { type: String },
  gravatar: { type: String },
  address: {
    country: { type: String },
    countryCode: { type: String },
    state: { type: String },
    city: { type: String },
    street: { type: String },
    zip: { type: String },
    geo: {
      latitude: { type: Number },
      longitude: { type: Number }
    }
  },
  status: { type: Boolean },
  id: { type: Number },
  friends: [
    {
      id: { type: Number }
    }
  ]
};

const userSchema = mongoose.Schema(User);
module.exports = mongoose.model("User", userSchema);
