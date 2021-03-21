const express=require("express");
const router=express.Router({mergeParams: true});
const campground=require("../../model/campground.js");
const review=require("../../model/review.js");
const asyncWrapper=require("../../errorHandler/asyncWrapper.js");

const isLoggedIn= (req, res, next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must Sign In first!!");
        res.redirect("/signUp");
    }
    next();
}

const isCampOwner= asyncWrapper(async(req,res, next)=>{
    const {id}=req.params;
    const camp= await campground.findById(id);
    if(camp.owner.equals(req.user._id)) return next();
    req.flash("error","Access denied");
    res.redirect(`/campgrounds/${id}`);
})

const isReviewOwner= asyncWrapper(async(req,res, next)=>{
    const {id, reviewId}=req.params;
    const rev= await review.findById(reviewId);
    if(rev.owner.equals(req.user._id)) return next();
    req.flash("error","Access denied");
    res.redirect(`/campgrounds/${id}`);
})

router.get("/",asyncWrapper(async (req, res, next)=>{
    let campgrounds;
    if(req.query.sortby=="priceLow"){
        campgrounds=await campground.find({})
        .sort({price: 1})
    }
    else if(req.query.sortby=="priceHigh"){
        campgrounds=await campground.find({})
        .sort({price: -1})
    }
    else if(req.query.sortby=="newAdded"){
        campgrounds=await campground.find({})
        .sort({createdAt: -1})
    }
    else{
        campgrounds=await campground.find({});
    }
    res.render("campgrounds.ejs",{campgrounds});
}))

router.get("/new",isLoggedIn, (req,res, next)=>{
    res.render("new.ejs");
})

router.post("/new",isLoggedIn, asyncWrapper(async (req, res, next)=>{
    const newCampground=new campground(req.body.campground);
    newCampground.owner=req.user._id;
    await newCampground.save();
    req.flash("success","Successfully made a new Campground");
    res.redirect(`/campgrounds/${newCampground._id}`);
}))

router.get("/:id", asyncWrapper(async (req, res, next)=>{
    const {id}=req.params;
    const foundCampground=await campground.findById(id).populate({
        path: "reviewsArray",
        populate: {
            path: "owner"
        }
    }).populate("owner");
    if(!foundCampground){
        req.flash("error","Campground not found");
        res.redirect("/campgrounds");
    }
    res.render("show.ejs",{foundCampground});
}))

router.post("/:id", isLoggedIn, asyncWrapper(async (req, res, next)=>{
    const {id}=req.params;
    const {text, rating} = req.body;
    const newReview= new review({text:text,rating:rating});
    newReview.owner=req.user._id;
    const foundCampground=await campground.findById(id);
    foundCampground.reviewsArray.push(newReview);
    foundCampground.ratingSum+= parseInt(rating);
    await newReview.save();
    await foundCampground.save();
    req.flash("success","Review created");
    res.redirect(`/campgrounds/${id}`);
}))

router.delete("/:id", isLoggedIn, isCampOwner, asyncWrapper(async (req,res, next)=>{
    const {id}=req.params;
    const del= await campground.findById(id);
    for(let rev of del.reviewsArray){
        await review.findByIdAndDelete(rev._id);
    }
    await campground.findByIdAndDelete(id);
    req.flash("success","Campground deleted successfully");
    res.redirect("/campgrounds");
}))

router.delete("/:id/:reviewId", isLoggedIn, isReviewOwner, asyncWrapper(async (req,res, next)=>{
    const {id, reviewId}=req.params;
    const deletedReview=await review.findByIdAndDelete(reviewId);
    await campground.findByIdAndUpdate(id,{ratingSum: ratingSum-deletedReview.rating, $pull: {reviewsArray: reviewId}});
    req.flash("success","Review deleted successfully");
    res.redirect(`/campgrounds/${id}`);
}))

module.exports=router;