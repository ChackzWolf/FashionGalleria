require('dotenv').config();
const express = require("express");
const session = require("express-session")
const app = express();
const hbs = require("hbs");
const path = require("path")
// const nocache = require("nocache")
const userRouter = require("./routes/user");
const adminRouter = require("./routes/admin");
const connectDB = require("./config/connections");



app.use(express.json())
app.use(express.urlencoded({ extended: false }));


app.set("view engine","hbs");





//directory connection

app.set('views', path.join(__dirname, 'views'));
// 
app.use(express.static(path.join(__dirname,"public")));

const partialsPath = path.join(__dirname,"views/partials")
hbs.registerPartials(partialsPath)









// Register a Handlebars helper function
hbs.registerHelper('isInArray', function (value, array, options) {
  if (array && array.includes(value)) {
    return options.fn(this);
  } else {
    return options.inverse(this);
  }
});

hbs.registerHelper('gt', function (a, b) {  //i am using a hbd > (greather than) on product detail for get the stock more than 0 . for that this is needed
    return a > b;
});
hbs.registerHelper('eq', function (a, b, options) {
  return a === b ? options.fn(this) : options.inverse(this);
});

// Register a custom "and" helper
hbs.registerHelper('and', function () {
  return Array.prototype.slice.call(arguments, 0, -1).every(Boolean);
});
hbs.registerHelper('lt', function (a, b) {  //i am using a hbd > (greather than) on product detail for get the stock more than 0 . for that this is needed
  return a < b;
});
hbs.registerHelper('eq', function (a, b) {  //using in orders page
  return a === b;
});
hbs.registerHelper('or', function (a, b) {  //using in orders page
  return a === b;
});

hbs.registerHelper("inc", function(value, options)
{
    return parseInt(value) + 1;
});
hbs.registerHelper('increment', function(value) {
  return value + 1;
});





app.use(function(req, res, next) {
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
})




// app.use(nocache())

//session
app.set("trust proxy", 1)
app.use(session({
    secret: "keyboard cat",
    resave : false,
    saveUninitialized : true,
    cookie : {
        secure:false,
    }
}))

connectDB()



app.use("/", userRouter);

app.use("/admin", adminRouter);

app.listen(1212,()=> console.log("server is running"))

app.get('*',function(req,res){
  res.status(404).render("user/error-handling");
})