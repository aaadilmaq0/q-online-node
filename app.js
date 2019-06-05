var cors = require("cors");
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const request = require("request");
const config = require("./config");

var jwt = require("jsonwebtoken");

const app = express();
const mongooseUrl  = config.mongooseUrl;
const options = { useNewUrlParser: true };
const User = require("./models/user");

const url = config.url;


//establishing mongoose connection
mongoose
  .connect(mongooseUrl, options)
  .then(() => {
    console.log("Connected");
  })
  .catch(error => {
    console.log(error);
  });

// saving the data from get request (1 time action)
// request(url, { json: true }, (err, response, body) => {
//   body.forEach(user => {
//     const newUser = new User(user);
//     newUser.save();
//   });
// });

app.set("secret", config.secret);

app.use(bodyParser.json());

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PATCH, DELETE, OPTIONS"
  );
  next();
});


//api for authentication using id and email
app.post("/authenticate", (req, res) => {
  User.findOne({ id: req.body.id }, (error, user) => {
    if (error) {
      res.status(400).send(error);
    }

    if (!user) {
      res.status(400).json({
        message: "User not found"
      });
    } else if (user.email != req.body.email) {
      res.status(400).json({
        message: "Invalid Credentials"
      });
    } else {
      const payload = {
        user: user
      };

      //creating a token for the payload
      var token = jwt.sign(payload, app.get("secret"), {
        expiresIn: 60 * 60 * 3 // will expire in 3 hours
      });

      res.status(200).json({
        message: "Authenticated",
        token: token
      });
    }
  });
});

//verifying the token before any other request
app.use((req, res, next) => {
  const token = req.body.token || req.query.token;

  if (!token) {
    return res.status(403).json({
      message: "No token"
    });
  } else {
    jwt.verify(token, app.get('secret'), (err , decoded)=>{
      if(err){
        return res.status(403).json({
          message: "Wrong Token"
        });
      }
      req.decoded = decoded;
      next();
    });
  }
});

//token required for all other requests. pass token as query parameter or in request body as 'token'

//api for getting all the user data
app.get("/findAll", (req, res) => {
  User.find().then(documents => {
    res.status(200).json(documents);
  });
});


//api for getting a user's data by id. passign id as a query parameter
app.get("/findById", (req, res) => {
  User.findOne({ id: req.query.id }, (error, response) => {
    if (response) {
      res.status(200).json({
        message: "User Found !",
        user: response
      });
    } else {
      res.status(400).json({
        message: "No user found with the given id",
        user: {}
      });
    }
  });
});

//api for getting a user's friends data by id. passign id as a query parameter
app.get("/findFriendsById", (req, res) => {
  User.findOne({ id: req.query.id }, (error, response) => {
    if (response) {
      if (response.friends.length == 0) {
        res.status(400).json({
          message: "User has no friends",
          friends: []
        });
      } else {
        res.status(200).json({
          message: "User has friends!",
          friends: response.friends
        });
      }
    } else {
      res.status(400).json({
        message: "No user found with the given id",
        friends: null
      });
    }
  });
});

//api for adding a user based on the schema
app.post("/addUser", (req, res) => {
  User.findOne({ id: req.body.user.id }, (error, response) => {
    if (response) {
      res.status(400).json({
        message: "Unique id needed. User not added"
      });
    } else {
      try {
        const newUser = new User(req.body.user);
        newUser.save();
        res.status(200).json({
          message: "User added"
        });
      } catch (e) {
        res.status(400).json({
          message: "Error. User not added",
          error: e
        });
      }
    }
  });
});

//api for adding a friend by id. 'id' query param is the user id and 'friendId' is request body field for adding the friend with id = friendId
app.put("/addFriend", (req, res) => {
  User.findOne({ id: req.query.id }, (error, response) => {
    if (response) {
      var friends = response.friends;
      if (friends.find(friend => friend.id == req.body.friendId)) {
        res.status(400).json({
          message: "Friend Already present"
        });
      } else {
        User.findOne({ id: req.body.friendId }, (error2, response2) => {
          if (response2) {
            friends.push({ id: req.body.friendId });
            User.updateOne(
              { id: req.query.id },
              { friends: friends },
              (err, result) => {
                if (error) {
                  res.status(500).send(error);
                }
                if (result) {
                  res.status(200).json({
                    message: "Friend Added"
                  });
                } else {
                  res.status(400).json({
                    message: "Error"
                  });
                }
              }
            );
          } else {
            res.status(400).json({
              message: "Wrong Friend ID"
            });
          }
        });
      }
    } else {
      res.status(400).json({
        message: "No user found with the given id"
      });
    }
  });
});

app.use(cors());
module.exports = app;
