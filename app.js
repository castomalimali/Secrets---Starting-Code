//jshint esversion:6
require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const md5 = require("md5");
// const bcrypt = require("bcrypt");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose = require("passport-local-mongoose");
const saltRound = 11;

const userSchema = new mongoose.Schema({
  email: String,
  password: String,
});

const app = express();

let port = 3000;
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

app.use(
  session({
    secret: "My Hero is Super Steel.",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(passport.initialize());
app.use(passport.session());
userSchema.plugin(passportLocalMongoose);
//make connection
mongoose.connect("mongodb://localhost:27017/secretDB");
// mongoose.set("useCreateIndex", true);

// create models and schema for user and secret

const User = mongoose.model("User", userSchema);
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.get("/", function (req, res) {
  res.render("home");
});

app.get("/login", function (req, res) {
  res.render("login");
});

app.post("/login", (req, res) => {
  const userEmail = req.body.username;
  const userPassword = req.body.password;
  console.log(userEmail, userPassword);

  User.findOne({ email: userEmail }).then((result) => {
    if (result) {
      bcrypt.compare(userPassword, result.password, function (err, result) {
        // result == true
        if (result === true) {
          res.render("secrets");
        } else {
          res.send("failure wrong password");
        }
      });
      // if(result.password === userPassword){
      //     res.render("secrets");
      // }
      // else{
      //     res.send("failure wrong password");
      // }
    } else {
      res.send("failure: user not found");
    }
  });
});

app.get("/register", function (req, res) {
  res.render("register");
});

app.get("/secrets", (req,res)=>{

  if(req.isAuthenticated){
    res.render("secrets")
  }
  else{
    res.redirect("/login")
  }
})

app.post("/register", (req, res) => {
  const userEmail = req.body.username;
  const userPassword = req.body.password;
  User.register({ username: userEmail}, userPassword, (err, user)=>{
    if(err){
      console.log(err);
      res.redirect("/register");
    }
    else{
      
      passport.authenticate("local")(req, res, ()=> {
        res.render("secrets");

      });
    }
  })
  
});

app.get("submit", function (req, res) {
  res.render("submit");
});

app.listen(port, function () {
  console.log("Server started on port " + port);
});
