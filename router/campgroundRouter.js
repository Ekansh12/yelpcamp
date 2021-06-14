const express=require("express");
const router=express.Router({mergeParams: true});
const campground=require("../model/campground.js");
const review=require("../model/review.js");
const asyncWrapper=require("../errorHandler/asyncWrapper.js");

const { isLoggedIn, isCampOwner, isReviewOwner, isFirstReview}= require("../middleware.js");

router.get("/",asyncWrapper(async (req, res, next)=>{
    let campgrounds=[];
    const term=req.query
    
    if(term.search){
        campgrounds=await campground.find({});
        campgrounds=campgrounds.filter(camp =>{
            if(term.search==='') return 1;
            return camp.name.toLowerCase().includes(term.search);
        })
    }
    else if(term.sortby=="priceLow"){
        campgrounds=await campground.find({})
        .sort({price: 1, avgRating: -1, totalReviews: -1, createdAt: -1})
    }
    else if(term.sortby=="priceHigh"){
        campgrounds=await campground.find({})
        .sort({price: -1, avgRating: -1, totalReviews: -1, createdAt: -1})
    }
    else if(term.sortby=="highRated"){
        campgrounds=await campground.find({})
        .sort({avgRating: -1, totalReviews: -1, price: 1, createdAt: -1})
    }
    else if(term.sortby=="mostRev"){
        campgrounds=await campground.find({})
        .sort({totalReviews: -1, avgRating: -1, price: 1, createdAt: -1})
    }
    else if(term.sortby=="newAdded"){
        campgrounds=await campground.find({})
        .sort({createdAt: -1})
    }
    else{
        campgrounds=await campground.find({});
    }
    res.render("campground/campgrounds.ejs",{campgrounds});
}))

router.get("/new", isLoggedIn, (req,res, next)=>{
    res.render("campground/new.ejs");
})

router.post("/new", isLoggedIn, asyncWrapper(async (req, res, next)=>{
    const newCampground=new campground(req.body.campground);
    newCampground.owner=req.user._id;
    await newCampground.save();
    req.flash("success","Successfully made a new Campground");
    res.redirect(`/campgrounds/${newCampground._id}`);
}))

router.get("/:id", asyncWrapper(async (req, res, next)=>{
    const {id}=req.params;
    const foundCampground=await campground.findById(id)
    .populate({
        path: "reviewsArray",
        options: { sort: { createdAt: -1}},
        populate: {
            path: "owner"
        }
    }).populate("owner");
    if(!foundCampground){
        req.flash("error","Campground not found");
        return res.redirect("/campgrounds");
    }
    res.render("campground/show.ejs",{foundCampground});
}))

router.post("/:id", isLoggedIn, isFirstReview, asyncWrapper(async (req, res, next)=>{
    const {id}=req.params;
    const {text, rating} = req.body;
    const newReview= new review({text:text,rating:rating});
    newReview.owner=req.user._id;
    const foundCampground=await campground.findById(id);
    foundCampground.reviewsArray.push(newReview);
    foundCampground.ratingSum+= parseInt(rating);
    foundCampground.totalReviews+= 1;
    foundCampground.avgRating= Math.round(foundCampground.ratingSum/foundCampground.totalReviews);
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
    const camp=await campground.findByIdAndUpdate(id, {$pull: {reviewsArray: reviewId}}, {new: true});
    camp.ratingSum-= deletedReview.rating;
    camp.totalReviews-= 1;
    if(camp.totalReviews) camp.avgRating= Math.round(camp.ratingSum/camp.totalReviews);
    else camp.avgRating=0;
    await camp.save();
    req.flash("success","Review deleted successfully");
    res.redirect(`/campgrounds/${id}`);
}))

module.exports=router;