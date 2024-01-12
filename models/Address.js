const mongoose = require("mongoose");

const AddressSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    address:[
        {
            name:{
                type: String,
                require:true
            },
            number:{
                type:String,
                require:true
            },
            address:{
                type:String,
                require: true
            },
            city:{
                type: String,
                require:true,
            },
            state:{
                type:String,
                require:true
            },
            pincode:{
                type:Number,
                require:true
            },
            default:{
                type: Boolean,
                default:false
            }
        }
    ],
})

 const AddressModel = mongoose.model("Address", AddressSchema);
 module.exports = AddressModel;