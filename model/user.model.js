import mongoose from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

//in this file we define the user schema for MongoDB using Mongoose.
// The schema defines the structure of the user documents in the database, including fields like username,  
// email, phone, password, aboutMe, avatar, and methods for hashing passwords and generating JSON Web Tokens.

const userSchema = new mongoose.Schema({
    username:{
        type:String,
        required: true,
        trim:true,
        lowercase:true,
        unique:true,
        minlength:[3,'User must be at least 3 characters long']
    },
    email: {
        type:String,
        required: true,
        trim:true,
        lowercase:true,
        unique:true,
        minlength:[13,'Email must be at least 13 characters long']
    },
    phone:{
        type: String,
        required: true
    },
    password: {
        type:String,
        required: true,
        trim:true,
        minlength:[5,'Password must be at least 5 characters long'],
        select: false
    },
    aboutMe: {
        type:String,
        required:[true,"About Me Field  Required!"]
    },
    avatar: {
        public_id: {
            type:String,
            required:true,
        },
        url: {
            type: String,
            required: true
        }
    },
    resetPasswordToken:String,
    resetPasswordExpire: Date, 
})

// FOR HASHING password
userSchema.pre("save", async function(next){
    if(!this.isModified("password")){
        next()
    }
    // if password is modified or created, then hash it
    this.password = await bcrypt.hash(this.password, 10)
})
// FOR COMPARING PASSWORD 
userSchema.methods.comparePassword = async function(enteredPassword){
    return await bcrypt.compare(enteredPassword , this.password)
}
// GENERATING JSONWEBTOKEN
userSchema.methods.generateJsonWEbToken =  function (){
return jwt.sign(
        { _id: this._id },
        process.env.JWT_SECRET_KEY,
        { expiresIn: process.env.JWT_EXPIRES }
    );
}

userSchema.methods.getResetPasswordToken = function (){
    const resetToken = crypto.randomBytes(20).toString("hex");
    this.resetPasswordToken = crypto.createHash("sha256").update(resetToken).digest("hex");

    this.resetPasswordExpire = Date.now() + 15 * 60 * 1000;

    return resetToken;
}


export const User = mongoose.model('user',userSchema);