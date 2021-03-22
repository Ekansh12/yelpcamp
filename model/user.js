const mongoose =require("mongoose");
const passportLM=require("passport-local-mongoose");

const userSchema=new mongoose.Schema({
    email:{
        type:String,
        required: true,
        unique: true
    },
    name:{
        type: String,
        required: true
    },
    registeredOn: { 
        type: Date,
        default: Date.now 
    },
    campOwned:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: "campground"
    }]
})

userSchema.plugin(passportLM);

module.exports=mongoose.model("user",userSchema);