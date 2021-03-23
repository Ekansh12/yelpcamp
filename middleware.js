const campground=require("./model/campground.js");
const review=require("./model/review.js");
const user = require("./model/user.js");
const asyncWrapper=require("./errorHandler/asyncWrapper.js");

module.exports.isLoggedIn= asyncWrapper( async(req, res, next)=>{
    if(!req.isAuthenticated()){
        req.flash("error","You must Sign Up first!!");
        return res.redirect("/signUp");
    }
    next();
})

module.exports.isCampOwner= asyncWrapper(async(req,res, next)=>{
    const {id}=req.params;
    const camp= await campground.findById(id);
    if(camp.owner.equals(req.user._id)) return next();
    req.flash("error","Access denied");
    res.redirect(`/campgrounds/${id}`);
})

module.exports.isReviewOwner= asyncWrapper(async(req,res, next)=>{
    const {id, reviewId}=req.params;
    const rev= await review.findById(reviewId);
    if(rev.owner.equals(req.user._id)) return next();
    req.flash("error","Access denied");
    res.redirect(`/campgrounds/${id}`);
})

module.exports.isFirstReview= asyncWrapper(async(req, res, next)=>{
    const {id}=req.params;
    const camp= await campground.findById(id).populate({
        path: "reviewsArray",
        select: "owner",
        populate: { 
            path: "owner",
            select: "_id"
        }
    })
    const length=camp.reviewsArray.length;
    for(let i=0;i<length;i++){
        if(camp.reviewsArray[i].owner._id.equals(req.user._id)){
            req.flash("error", "You already review this Campground, want to create another then delete the one you created for this campground");
            return res.redirect(`/campgrounds/${id}`);
        }
    }
    return next();
})