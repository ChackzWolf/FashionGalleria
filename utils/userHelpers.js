const CartModel = require('../models/Cart');
const OrderModel = require('../models/Order');
const ProductModel = require('../models/Product');
const bcrypt = require("bcryptjs");
const saltRounds = 10;
const AddressModel = require("../models/Address");
const formatDate = require("./dateGenerator");
const UserModel = require("../models/User")




function validateEmail(email) {
    // Regular expression for validating an email address
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
}

const validatePassword = (password)=> {
    // Define password requirements
    const minLength = 8;
    const uppercaseRegex = /[A-Z]/;
    const lowercaseRegex = /[a-z]/;
    const numberRegex = /[0-9]/;
    const specialCharRegex = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/;

    // Check length
    if (password.length < minLength) {
        return "Password must be at least " + minLength + " characters long.";
    }

    // Check for uppercase letters
    if (!uppercaseRegex.test(password)) {
        return "Password must contain at least one uppercase letter.";
    }

    // Check for lowercase letters
    if (!lowercaseRegex.test(password)) {
        return "Password must contain at least one lowercase letter.";
    }

    // Check for numbers
    if (!numberRegex.test(password)) {
        return "Password must contain at least one number.";
    }

    // Check for special characters
    if (!specialCharRegex.test(password)) {
        return "Password must contain at least one special character.";
    }

    // Password meets all requirements
    return true;
}



const getTotalAmount = async (req,res)=>{
    // try{
        console.log('_______________________________________________kkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkkk')
        console.log(req,'req')
        userId = req;
        console.log(userId,'userId')
        let productId;
        let product;
        const cartDocument = await CartModel.findOne({userId:userId});
        
        console.log(cartDocument,'cart')

        if(cartDocument.cart.length !==  0  ){  // if cart is not empty
            productId = cartDocument.cart[0].productId;
            console.log(cartDocument,'cart')
            product = await ProductModel.findOne({_id:productId});
            console.log(productId,'productId');

            if(product.offerPrice > 0){         // if offer price is greater than zero (not zero);
                    console.log(product.offerPrice, 'offerPrice')
                    const total = await CartModel.aggregate([
                    {
                        $match:{userId: userId}
                    },
                    {
                        $unwind:  '$cart'
                    },
                    {
                        $project:{
                            product: {$toObjectId: '$cart.productId'},
                            count: '$cart.count',
                        }
                    },
                    {
                        $lookup:{
                            from:'products',
                            localField: 'product',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $project:{
                            price:'$product.offerPrice',
                            name: '$product.name',
                            quantity: '$count'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: {$sum: {$multiply: ['$quantity','$price']}}
                        },
                    
                    },
                    {
                        $unwind: '$total'
                    }    
                ])
                // console.log(typeof price)
                console.log(total,"in function total")
                return total
            }else{                                     // if cart is not empty and offer price is 0;
                const total = await CartModel.aggregate([
                    {
                        $match:{userId: userId}
                    },
                    {
                        $unwind:  '$cart'
                    },
                    {
                        $project:{
                            product: {$toObjectId: '$cart.productId'},
                            count: '$cart.count',
                        }
                    },
                    {
                        $lookup:{
                            from:'products',
                            localField: 'product',
                            foreignField: '_id',
                            as: 'product'
                        }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $project:{
                            price:'$product.price',
                            name: '$product.name',
                            quantity: '$count'
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            total: {$sum: {$multiply: ['$quantity','$price']}}
                        },
                    },
                    {
                        $unwind: '$total'
                    }    
                ])
                console.log(typeof price)
                console.log(total,"in function total")
                return total
            }

        } else {
            const total = await CartModel.aggregate([
                {
                    $match:{userId: userId}
                },
                {
                    $unwind:  '$cart'
                },
                {
                    $project:{
                        product: {$toObjectId: '$cart.productId'},
                        count: '$cart.count',
                    }
                },
                {
                    $lookup:{
                        from:'products',
                        localField: 'product',
                        foreignField: '_id',
                        as: 'product'
                    }
                },
                {
                    $unwind: '$product'
                },
                {
                    $project:{
                        price:'$product.price',
                        name: '$product.name',
                        quantity: '$count'
                    }
                },
                {
                    $group: {
                        _id: null,
                        total: {$sum: {$multiply: ['$quantity','$price']}}
                    },
                },
                {
                    $unwind: '$total'
                }    
            ])
            console.log(typeof price)
            console.log(total,"in function total")
            return total
        }
    // }
    // catch(err){
    //     console.log(req,userId)

    //     console.log('total amount error.')
    //     res.status(500).render("user/error-handling");       
    // }
}

const getProducts = async(userId)=>{
  
    const cartItems = await CartModel.aggregate([
        {
            $match: {userId: userId}
        },
        {
            $unwind: '$cart'
        },
        {
            $project:
            {
                product: {$toObjectId:"$cart.productId"},
                count: '$cart.count',
                size: "$cart.size"
            },
        },
        {
            $lookup:
            {
                from: "products",
                localField: "product",
                foreignField: "_id",
                as: 'product'
            }
        },
        {          
            $unwind: '$product'
        }
    ])
    console.log(cartItems,'iiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiiii')
    return cartItems

}

const stockQuantityUpdate = async(req,res)=>{
    try{console.log('start')
        const cartItems = await getProducts(userId);
        const products = cartItems.map(cartItem =>({
            productId: cartItem.product._id,
            count: cartItem.count,
            size: cartItem.size
        }));
        console.log(products,"product___________")
        for(const product of products){
            const existingProduct = await ProductModel.findById(product.productId);
            if(existingProduct){
                console.log('existing product');
                //check if the requested size is available in the existing product
                const requestedSize = product.size;
                if(existingProduct.sizeStock[requestedSize] && existingProduct.sizeStock[requestedSize].stock>=product.count){
                    //updating the stock of the requested size
                    const updatedStock = existingProduct.sizeStock[requestedSize].stock-product.count;

                    //updating the product's sizeStock field
                    existingProduct.sizeStock[requestedSize].size = updatedStock;

                    //save the updated product
                    await existingProduct.save();
                }else{
                    return false
                    // should handle insufficient stock
                }
            }else{
                console.log('not existing')
                return false
                // should handle product not found here
            }
        };
        const cart = await CartModel.updateOne({userId:userId},{$set:{cart:[]}});
        if(cart){
            return true;
        }else{
            return false;
        };
    }catch(error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}



/// this funciton is for update address and manage address.
const newAddressManagement = async (details,userId)=>{
    try{
        const {name,email,number,address, city, state, pincode} = details;
        const newAddress = {
            name:name,
            email:email,
            number:number,
            address:address,
            city:city,
            state:state,
            pincode:pincode,
        }
        console.log(newAddress)
        console.log('step1')
        const addressExists = await AddressModel.findOne({userId:userId})
        if(addressExists){
            console.log('account exists')
            const updateAddress = await AddressModel.updateOne({userId:userId},{$push:{address:newAddress}})
            if(updateAddress){
                return true
            }
        }else{
            console.log("account don't exists")
            let data={
                userId: userId,
                address:[newAddress]
            }
            console.log(data);
            const updateAddress = await AddressModel.create(data);
            if(updateAddress){
                return true
            }else{
                return false
            }
        }
    } catch (error) {
            console.error("Error in changeProductQuantity:", error);
            res.status(500).json({error: "Internal Server Error"});
    }    
}


const paymentVarification = (details)=>{
    const crypto = require('crypto');
    let hmac = crypto.createHmac("sha256", "l23pXte67Ewz57CcDGSNANZd")

    hmac.update(details['payment[razorpay_order_id]'] + '|' + details['payment[razorpay_payment_id]'])
    hmac = hmac.digest('hex');
    if(hmac == details['payment[razorpay_signature]']){
        return true;
    }else{
        return false;
    }
}



const changePaymentStatus = async (orderId) => {
    try {
        console.log(orderId);
        const updatedDetails = await OrderModel.updateOne({ orderId: orderId }, { $set: { paymentMethod: "Online" } });
        // const orderDetails = await OrderModel.findOne({ orderId: orderId });
        if (updatedDetails) {
            return true;
        } else {
            return false;
        }
    } catch (err) {
        console.log('It was an error:', err);
        return false; // Return false in case of an error
    }
};

const generateRandomReferenceId = () => {
    // Generate a 4-digit random number
    const randomNumber = Math.floor(Math.random() * 10000);

    // Generate 4 random uppercase letters
    const randomLetters = Array.from({ length: 4 }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('');

    // Combine the random number and random letters
    const referenceId = `${randomNumber}${randomLetters}`;

    return referenceId;
};


const referenceIdApplyOffer = async(referenceId)=>{
    const findReference = await UserModel.findOne({referenceId:referenceId});
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    if(findReference){
        const applyOffer = await UserModel.updateOne({referenceId:referenceId},{$inc:{wallet:200}});
        if(applyOffer){
            const walletData = {
                transaction:'credited',
                amount:200,
                orderId:'Referral bonus',
                date:formattedDate
            }
            const walletHistory = await UserModel.updateOne({referenceId:referenceId},{$push:{walletHistory:walletData}})
            if(walletHistory){
                return true;
            }
            else{
                console.log('failed updating wallet history.');
                return false;
            }
        }else{
            console.log("failed applaying offer");
            return false;
        }

    }else{
        console.log('failed finding reference order')
        return false;
    }
}

module.exports = {
    getTotalAmount,
    getProducts,
    stockQuantityUpdate,
    newAddressManagement,
    paymentVarification,
    changePaymentStatus,
    generateRandomReferenceId,
    referenceIdApplyOffer,
    validatePassword,
    validateEmail

}