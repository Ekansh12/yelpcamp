// require('dotenv').config();

const express=require("express");
const app=express();
const path=require("path");
const bodyparser=require("body-parser");
const methodOverride=require("method-override");
const ejsMate=require("ejs-mate");
const session=require("express-session");
const flash=require("connect-flash");
const campgroundRouter=require("./router/campgroundRouter.js");
const ErrorHandler=require("./errorHandler/error.js");
const userRouter= require("./router/userRouter.js");
const user= require("./model/user.js");
const passport=require("passport");
const LocalStrategy= require("passport-local");
const helmet=require("helmet");
const moment= require("moment");
const mongoose =require("mongoose");
const MongoStore = require('connect-mongo');

const db_url= process.env.DB_URL || 'mongodb://localhost:27017/yelp-camp';
mongoose.connect(db_url, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});

const db = mongoose.connection;

db.on("error", console.error.bind(console, "Mongoose Error..."));
db.once("open", () => {
    console.log("Mongoose Connected...");
});

app.set("views",path.join(__dirname,"views"));
app.use(express.static(path.join(__dirname,"/public")));
app.engine("ejs",ejsMate);
app.use(bodyparser.urlencoded({extended:true}));
app.use(bodyparser.json());
app.use(methodOverride("_method"));

app.use(session({
    store: MongoStore.create({
        mongoUrl: db_url,
        secret: "YelpCamp",
        touchAfter: 24*60*60 //s
    }),
    name: "_uazx",
    secret: "YelpCamp",
    resave: false,
    saveUninitialized: true,
    cookie:{
        httpOnly:true,
        // secure: true,
        expires: Date.now() + 3*24*60*60*1000, //ms
        maxAge: 3*24*60*60*1000
    }
}));

app.use(flash());
app.use(helmet({ contentSecurityPolicy: false }));

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(user.authenticate()));
passport.serializeUser(user.serializeUser());
passport.deserializeUser(user.deserializeUser());

app.use((req,res,next)=>{
    if(req.originalUrl=="/") req.session.returnTo="/campgrounds";
    else if(!["/","/login","/signUp","/logout","/about"].includes(req.originalUrl)) req.session.returnTo=req.originalUrl;
    res.locals.currentUserInfo=req.user;
    res.locals.moment=moment;
    res.locals.success=req.flash("success");
    res.locals.error=req.flash("error");
    next();
})

app.get("/",(req,res)=>{
    res.render("home.ejs"); 
})

app.use("/campgrounds",campgroundRouter);
app.use("/",userRouter);

app.all("*",(req, res, next)=>{
    req.session.returnTo="/campgrounds";
    next(new ErrorHandler("Page doesn't exist :(",404));
})

app.use((err, req, res, next)=>{
    req.session.returnTo="/campgrounds";
    const {message="Something's not goood..." , statusCode=500}=err;
    res.status(statusCode).render("error.ejs",{message,err});
})

const port= process.env.PORT || 12345;
app.listen(port,()=>{ console.log(`http://localhost:${port}`) });
