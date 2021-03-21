const mongoose=require("mongoose");

const reviewSchema=new mongoose.Schema({
    rating:{
        type:Number,
        required: true,
        min: 1,
        max: 5
    },
    text:{
        type:String,
        required: 1
    },
    createdAt: { 
        type: Date,
        default: Date.now 
    },
    owner:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
})

const review=mongoose.model("review",reviewSchema);
module.exports=review;