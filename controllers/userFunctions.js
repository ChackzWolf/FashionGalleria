const CartModel = require('../models/Cart');
const ProductModel = require('../models/Product');


const getTotalAmount = async (req,res)=>{
    try{
        console.log(req,'req')
        userId = req;
        console.log(userId,'userId')
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
    catch(err){
        console.log(req,userId)

        console.log('total amount error.')
        res.status(500).render("user/error-handling");       
    }
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
        console.log(cartItems)
        return cartItems

}

const stockQuantityUpdate = async(req,res)=>{
    try{
        const cartItems = await getProducts(userId);
        const products = cartItems.map(cartItem =>({
            productId: cartItem.product._id,
            count: cartItem.count,
            size: cartItem.size
        }));
        for(const product of products){
            const existingProduct = await ProductModel.findById(product.productId);
            if(existingProduct){
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
            }{
                return false
                // should handle product not found here
            }
        }
        const cart = await CartModel.updateOne({userId:userId},{$set:{cart:[]}});
        if(cart){
            return true;
        }else{
            return false;
        }
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

module.exports = {
    getTotalAmount,
    getProducts,
    stockQuantityUpdate,
    newAddressManagement
}