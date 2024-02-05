const mongoose = require("mongoose");

const WishlistSchema = mongoose.Schema({
    userId:{
        type:String,
        required:true
    },
    wishlist:[
        {
            productId:{
                type:String,
                required:true,
            },
            size:{
                type:String,
                required:true
            }
        }
    ]
});

const WishlistModel = mongoose.model("Wishlist",WishlistSchema);
module.exports = WishlistModel;