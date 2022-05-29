const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose= require("mongoose");
const session = require("express-session");
const passport = require("passport");
const passportLocalMongoose=require("passport-local-mongoose");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));

app.use(session({
  secret: "Out little secret.",
  resave: false,
  saveUninitialized: false
}));

app.use(passport.initialize());
app.use(passport.session());

mongoose.connect("mongodb+srv://admin-SaiNath:Test123@cluster0.2ngx0.mongodb.net/blogDB1", {useNewUrlParser: true});

let posts=[];
let searchEmail=0;

const postSchema=new mongoose.Schema({
  email:String,
  name: String,
  title: String,
  content: String,
  date: Date,
  tags: String
});

const userSchema = new mongoose.Schema({
  username: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

const contactSchema=new mongoose.Schema({
  contactName: String,
  contactEmail: String,
  contactSubject: String,
  contactMessage: String
});

const Post=new mongoose.model("Post", postSchema);

const User=new mongoose.model("User", userSchema);
passport.use(User.createStrategy());

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

const Contact=new mongoose.model("Contact",contactSchema);

app.get("/",function(req,res){
  Post.find({},function(err,posts){
      res.render("home",{posts:posts});
    });
});

app.get("/about",function(req,res){
  if(req.isAuthenticated()){
    res.render("about",{tempheader:"header1"});
  }
  else{
    res.render("about",{tempheader:"header"});
  }
});

app.get("/contact",function(req,res){
  if(req.isAuthenticated()){
    res.render("contact",{tempheader:"header1"});
  }
  else{
    res.render("contact",{tempheader:"header"});
  }
});

app.get("/post",function(req,res){
    res.render("post");
});

app.get("/login",function(req,res){
  res.render("login");
});


app.get("/yourblogs",function(req,res){

  Post.find({email:searchEmail},function(err,foundPosts){
    if(foundPosts.length==0){
      res.render("noblogs");
    }
    else{
      res.render("yourblogs",{posts:foundPosts});
    }
  });
});

app.get("/signup",function(req,res){
  res.render("signup");
});

app.get("/home1",function(req,res){
  if(req.isAuthenticated()){
    Post.find({},function(err,posts){
      res.render("home1",{posts:posts});
    });
  }
  else{
    res.redirect("/login");
  }
});

app.get("/logout",function(req,res){
  searchEmail=0;
  req.logout((e)=>{
    console.log(e);
  });
  res.redirect("/");
});


app.get("/:Id", function(req, res){

  Post.findById(req.params.Id,function(err,post){
    if(!err){
        if(req.isAuthenticated()){
          res.render("postDetails", {tempheader:"header1",title: post.title, name:post.name,tags: post.tags, date:post.date.toDateString(), content: post.content});
        }
        else{
          res.render("postDetails", {tempheader:"header",title: post.title, name:post.name,tags: post.tags, date:post.date.toDateString(), content: post.content});
        }
    }
  });
});

app.post("/contact",function(req,res){

  const contact=new Contact({
    contactName:req.body.contactName,
    ContactEmail: req.body.contactEmail,
    contactSubject: req.body.contactSubject,
    contactMessage:req.body.contactMessage
  });
  contact.save();
  if(req.isAuthenticated()){
    res.render("contact",{tempheader:"header1"});
  }
  else{
    res.render("contact",{tempheader:"header"});
  }
});

app.post("/post",function(req,res){
searchEmail=req.body.postEmail;
  const post=new Post({
    email:req.body.postEmail,
    name:req.body.postName,
    title: req.body.postTitle,
    content: req.body.postBody,
    date: Date.now(),
    tags:req.body.postTags
  });

  post.save();
  res.redirect("/yourblogs");
});

app.post("/login",function(req,res){
    searchEmail=req.body.username;
    const user=new User({
    username: req.body.username,
    password: req.body.inputPassword
    });

    req.login(user,function(err){
      if(err){
        console.log(err);
      }
      else{
        const authenticate = User.authenticate();
        authenticate(req.body.username, req.body.inputPassword, function(err, result) {
        if(err){
            console.log(err);
        }
        else{
           res.redirect("/home1");
        }
        });
      }
    });
});

app.post("/signup",function(req,res){
  searchEmail=req.body.username;
  User.register({username: req.body.username}, req.body.userPassword, function(err, user) {
    if(err){
        console.log(err);
        res.redirect("/signup");
    }
    else{
      req.login(user,function(err){
        if(err){
          console.log(err);
        }
        else{
          const authenticate = User.authenticate();
          authenticate(req.body.username, req.body.userPassword, function(err, result) {
          if(err){
              console.log(err);
          }
          else{
             res.redirect("/home1");
          }
          });
        }
      });
  }
  });
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function() {
  console.log("Server has started successfully!");
});
