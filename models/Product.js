const mongoose = require("mongoose")
const Schema = mongoose.Schema;  // Import Schema for better readability 
const CategoryModel =require("../models/Category");

const ProductSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    offerPrice:{
        type: Number,
        default:0
    },
    sizeStock:{
        sizeLarge:{
            large:{
                type:String
            },
            stock:{
                type:Number
            },
        },
        sizeMedium:{
            medium:{
                type:String
            },
            stock:{
                type:Number
            }
        },
        sizeSmall:{
            small:{
                type:String
            },
            stock:{
                type:Number
            }
        }
    },
    cat:{
        type:Schema.Types.ObjectId,
        ref:'Category',
        required: true
    },
    imageUrl:{
        type:Array,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    listStatus: {
        type:Boolean,
        default: true
    },
    deleteStatus:{
        type: Boolean,
        default: false
    },
    category:{
        type:String,
    },
    productOffer:{
        type:Boolean,
        default:false
    }
})
const ProductModel = mongoose.model("Product",ProductSchema)

module.exports = ProductModel;