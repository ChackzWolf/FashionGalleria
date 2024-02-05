const mongoose = require('mongoose');

const CartSchema = new mongoose.Schema({
    userId:{
        type:String,
        required:true,
    },
    cart:[
        {
            productId: {
                type: String,
                required: true,
            },
            count:{
                type:Number,
                required:0,
            },
            size:{
                type:String,
                required: true,
            }
        }
    ],
});
const CartModel = mongoose.model("Cart",CartSchema);
module.exports = CartModel;


