const mongoose = require("mongoose");
const AddressModel = require("./Address");

const UserSchema = new mongoose.Schema({
    name:{
        type:String,
        required: true
    },
    email: {
        type: String,
        required: true        
    },
    password: {
        type: String,
        required: true
    },
    number: {
        type: Number,
        required: true
    },
    wallet:{
        type: Number
    },
    address:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Address'
    },
    pincode:{
        type:Number
    },
    status:{
        type: Boolean,
        required: true
    }

})

const UserModel = mongoose.model("User", UserSchema)
module.exports = UserModel;