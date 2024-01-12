const mongoose = require("mongoose");
const Schema = mongoose.Schema

const CategorySchema = new mongoose.Schema({
    name:{
        type:String,
        required:true,
    },listStatus:{
        type:Boolean,
        default:true,
    }
})
 
const CategoryModel = mongoose.model("Category",CategorySchema);
module.exports = CategoryModel;