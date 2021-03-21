const express = require("express"),
      router = express.Router(),
      user = require("../../model/user.js"),
      asyncWrapper = require("../../errorHandler/asyncWrapper.js"),
      passport= require("passport")


const isLoggedIn= (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must Sign In first!!");
        res.redirect("/signUp");
    }
    next();
}

router.route("/signUp")
    .get( (req, res) => {
    if(req.isAuthenticated()){
        const redirectTo=req.session.returnTo || "/campgrounds";
        return res.redirect(redirectTo);
    }
    res.render("signUp.ejs");
})

    .post( asyncWrapper(async (req, res, next) => {
    const {email, username, name, password} =req.body.user;
    const data=new user({email, username, name});
    try{
        const newUser= await user.register(data, password);
        req.login(newUser, err =>{
            if(err) next(err);
        });
    }
    catch(e){
        req.flash("error",e.message);
        res.redirect("/signUp");
        return;
    }
    req.flash("success","Welcome!");
    const redirectTo=req.session.returnTo || "/campgrounds";
    res.redirect(redirectTo);
}))

router.route("/login")
    .get( (req, res) => {
    if(req.isAuthenticated()){
        const redirectTo=req.session.returnTo || "/campgrounds";
        return res.redirect(redirectTo);
    }
    res.render("login.ejs");
})

    .post( passport.authenticate("local",{failureFlash:1 ,failureRedirect: "/login"}) ,asyncWrapper(async (req, res, next) => {
    req.flash("success","Welcome back!");
    const redirectTo=req.session.returnTo || "/campgrounds";
    res.redirect(redirectTo);
}))

router.get("/logout",isLoggedIn, (req,res, next)=>{
    req.logOut();
    res.redirect("/");
})

router.get("/profile",isLoggedIn, (req,res, next)=>{
    res.render("profile.ejs");
})

router.get("/about", (req,res)=>{
    res.render("about.ejs");
})



module.exports = router;