const mongoose = require("mongoose");


const BannerSchema = new mongoose.Schema({
        caption:{
            type:String,
        },
        descriptionTag:{
            type:String
        },
        link:{
            type:String
        },
        imageUrl:{
            type:Array,
            required: true
        },
        listStatus:{
            type:Boolean,
            default:true
        }
})

const BannerModel = mongoose.model("Banner",BannerSchema);

module.exports = BannerModel; 