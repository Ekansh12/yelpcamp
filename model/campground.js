const mongoose =require("mongoose");

const campgroundSchema= new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    price:{
        type:Number,
        required: true,
        min:0
    },
    image:{
        type:String,
        required: true
    },
    description: String,
    location:{
        type:String,
        required: true
    },
    createdAt: { 
        type: Date,
        default: Date.now 
    },
    reviewsArray:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "review"
    }],
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    },
    ratingSum:{
        type: Number,
        default: 0
    },
    totalReviews:{
        type: Number,
        default: 0
    },
    avgRating:{
        type: Number,
        default: 0
    }
})

const campground=mongoose.model("campground",campgroundSchema);

module.exports=campground;