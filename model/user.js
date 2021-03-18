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
    }
})

userSchema.plugin(passportLM);

module.exports=mongoose.model("user",userSchema);