const express = require("express");
const app = express();
const path = require("path");
const User = require("./model/user.js");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const ejsMate = require("ejs-mate");
const user = require("./routes/user.js");
const flash = require("connect-flash");
const mongoose = require("mongoose");
const reviews = require("./routes/review.js");
const blogs = require("./routes/blog.js");
const methodOverride = require("method-override");
const bodyParser = require("body-parser");

app.set("views", path.join(__dirname, "/views"));
app.set("view engine", "ejs");
app.use(express.static(path.join(__dirname, "/public")));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.json());

app.engine("ejs", ejsMate);

// const dbUrl = "mongodb://127.0.0.1:27017/BLOG";
const dbUrl =
  "mongodb+srv://mogu:01152003@cluster0.pg5ji3o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

main()
  .then((res) => {
    console.log("successfull");
  })
  .catch((err) => console.log(err));

async function main() {
  await mongoose.connect(dbUrl);
}

const store = MongoStore.create({
  mongoUrl: dbUrl,
  crypto: {
    secret: process.env.SECRET,
  },
  touchAfter: 24 * 3600,
});

store.on("error", () => {
  console.log("ERROR in MONGO SESSION STORE", err);
});
const sessionOptions = {
  secret: "OurFirstProject",
  resave: false,
  saveUninitialized: true,
  cookie: {
    expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true,
  },
};

app.use(session(sessionOptions));
app.use(flash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

app.use("/blogs", blogs);
app.use("/blogs/:id/reviews", reviews);
app.use("/", user);

app.listen(8080, () => {
  console.log("serving is working now");
});
