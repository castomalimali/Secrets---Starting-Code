//jshint esversion:6
require ('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const md5 = require("md5");
const bcrypt = require("bcrypt");

const saltRound = 11;


//make connection
mongoose.connect("mongodb://localhost:27017/secretDB");

// create models and schema for user and secret
const userSchema = new mongoose.Schema({
    email: String,
    password: String
});



const User = mongoose.model ("User", userSchema);

const app = express();

let port = 3000;
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

app.get("/", function(req, res) {
    res.render("home");
})



app.get("/login", function(req, res) {
    res.render("login");
})
app.post("/login", (req, res) => {
  const userEmail = req.body.username;
  const userPassword = md5(req.body.password);
  console.log(userEmail, userPassword);

  User.findOne({email: userEmail}).then((result)=>{
    
    if(result){

        if(result.password === userPassword){
            res.render("secrets");
        }
        else{
            res.send("failure wrong password");
        }
    }
    else{
        res.send("failure: user not found");
    }
  })
});


app.get("/register", function(req, res) {
    res.render("register");
})

app.post("/register", (req,res)=>{
    const userEmail = req.body.username;
    const userPassword = req.body.password;


    bcrypt.genSalt(saltRound, function (err, salt) {
      bcrypt.hash(userPassword, salt, function (err, hash) {
        // Store hash in your password DB.
        const newUser = new User({
          email: userEmail,
          password: hash,
        });
        newUser
          .save()
          .then(() => res.render("secrets"))
          .catch((err) => console.log(err));
      });
    });

    

})

app.get("submit", function(req, res) {
    res.render("submit");
})


app.listen(port, function() {
    console.log("Server started on port " +port);
});