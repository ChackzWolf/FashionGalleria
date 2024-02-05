const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
    couponCode: {
        type: String,
        required: true,
    },
    offerPercentage:{
        type: Number,
        required: true
    },
    couponType:{
        type:String,
        required:true
    },
    description:{
        type: String,
    },
    listStatus: {
        type : Boolean,
        required: true,
    }
});

const CouponModel = mongoose.model("Coupon", CouponSchema);
module.exports = CouponModel;