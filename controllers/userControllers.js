const bcrypt = require("bcrypt")
const saltRounds = 10;
const UserModel = require("../models/User")
const ProductModel = require("../models/Product")
const userFunc = require("../controllers/userFunctions");
const { response } = require("express");
const sendMail = require("../utils/nodeMailer");
const session = require("express-session");
const CartModel = require("../models/Cart");
const CategoryModel =require("../models/Category");
const AddressModel = require("../models/Address");
const OrderModel =require("../models/Order")
const formatDate = require("../utils/dateGenerator");
const generateRandomOrderId = require("../utils/orderIdGenerator");
const { sendMessage } = require("fast-two-sms");
const Razorpay = require('razorpay');
const { resolve } = require("path");
const CouponModel = require("../models/Coupon")
const moment =require("moment");
const WishlistModel = require("../models/Wishlist");

var instance = new Razorpay({
    key_id: 'rzp_test_lc7R4jCpEpM90Q',
    key_secret: 'l23pXte67Ewz57CcDGSNANZd',
});

const loginView = (req,res) => {
    return res.render("user/login");
}

const indexView = async (req,res) => {

    const products = await ProductModel.find({listStatus: true, deleteStatus: false}).limit(8)
    const mensProduct = await ProductModel.find({listStatus: true, deleteStatus: false,category:"Men"}).limit(8)
    const womensProduct = await ProductModel.find({listStatus:true,deleteStatus:false,category:'Women'}).limit(8);
    const category = await CategoryModel.find()
    console.log("Women's",womensProduct)
    console.log("Men's",mensProduct)
    res.render("user/index",{products,mensProduct,womensProduct,category});        
}

const signupView = (req,res) => {
    return res.render("user/signup");
}

const shopView = async (req,res) => {

    const pageNum =  req.query.page;
    const perPage = 6
    let docCount
    let pages

    let strMin = req.query.minamount;
    let strMax = req.query.maxamount;
    let minAmount;
    let maxAmount;

    if(typeof strMin === 'string' && typeof strMax === 'string'){
        
        // Split the string into an array of characters
        const charArrayMin = strMin.split('');
        const charArrayMax = strMax.split('');
        // Filter out non-numeric characters
        const numericArrayMin = charArrayMin.filter(char => !isNaN(char));
        const numericArrayMax = charArrayMax.filter(char => !isNaN(char));
        // Join the filtered characters back into a string
        const minAmountStr = numericArrayMin.join('');
        const maxAmountStr = numericArrayMax.join('');
        // Convert the cleaned string to a number
        minAmount = Number(minAmountStr);
        maxAmount = Number(maxAmountStr);
        console.log(maxAmount,typeof maxAmount);

    }




    console.log(req.query.category,'222222222222')


    
    // if(req.query.sort || req.query.category){
    if(req.query.category || minAmount || maxAmount){
        const category = req.query.category;
        console.log('reached',maxAmount,category)


        const products = await ProductModel.find({$and:[{category:category},{ price: { $gt: minAmount, $lt: maxAmount }},{listStatus: true}, {deleteStatus: false}]}).skip((pageNum - 1) * perPage).limit(perPage);

        const documents = await ProductModel.countDocuments({
            $and:[
                {category:category},
                {price:{$gt:minAmount,$lt:maxAmount}}
            ]
        });

        console.log('products',products);
        console.log('documets',documents)
        
        docCount = documents
        pages = Math.ceil(docCount / perPage)

        let countPages = []
        for (let i = 0; i < pages; i++) {

            countPages[i] = i + 1
        }

        let small = 0;
        let medium = 0;
        let large = 0;
        let men = 0
        let women = 0

        // sizes
        // if (Array.isArray(sizes)) {
        //     for (let i = 0; i < sizes.length; i++) {
        //         if (sizes[i] === "Small") {
        //             small++;
        //         } else if (sizes[i] === "Medium") {
        //             medium++;
        //         } else if (sizes[i] === "Large") {
        //             large++;
        //         }
        //     }
        // } else if (sizes === "Small") {
        //     small++;
        // } else if (sizes === "Medium") {
        //     medium++;
        // } else if (sizes === "Large") {
        //     large++;
        // }

        //category 
        if (Array.isArray(category)) {
            for (let i = 0; i < category.length; i++) {
                if (category[i] === "Men") {
                    men++
                } else if (category[i] === "Women") {
                    women++
                }
            }
        } else if (category === "Men") {
            men++ ;
        } else if (category === "Women") {
            women++ ;
        };
        docCount= documents
        const categoryName = await CategoryModel.find();
        res.render("user/shop", { products,men, women, small, medium, large ,categoryName})
    }else{
        console.log('going through else.')
        let products = await ProductModel.find({listStatus: true, deleteStatus: false});
        if(req.query.category === "men"){ // "/shop?category=men" from front end
            products = await ProductModel.find({category:"men",listStatus: true, deleteStatus: false})
        }else if(req.query.category === "women"){// "/shop?category=women" from back end
            products = await ProductModel.find({category:"women",listStatus: true,deleteStatus: false})
        }
        const categoryName = await CategoryModel.find();
        return res.render("user/shop",{products,categoryName});
    }
};

const productDetailsView = async (req,res) => {
    const products = await ProductModel.aggregate([{$match:{listStatus:true,deleteStatus:false}}]).limit(4);
    const singleProduct = await ProductModel.findOne({_id:req.query.id});
    return res.render("user/product-details",{singleProduct,products});
};

const blogView = (req,res)=> {
    return res.render("user/blog");
};

const contactView = async(req,res) =>{
    const email = session.email
    await sendMail(email);
    return res.render("user/contact");
};

const otpView = (req,res)=>{
    const email = session.email
    sendMail(email)
    return res.redirect("user/otp");
};

const otpViewPass = async(req,res)=>{
    const email = session.email
    sendMail(email);
    return res.render("user/forgot-password-otp");
};

const productList= (req,res) =>{
    res.render("user/product-list")
}

const wishlistView = async(req,res)=>{
    const userId = req.session.user._id;
    const wishlist = await WishlistModel.find({userId:userId});
    const productId = wishlist.wishlist.productId;
    console.log('Idddd',productId);

    const products = await ProductModel.find({_id:productId});
    console.log(products,'products')
    res.render("user/wishlist",{products});
} 


////////////////////////////////////////////////////////////////////////////////////     POST Methods     >>>>>>>>>>>>>>>>
const filteredShop =  async (req,res)=>{
    const {name,minamount,maxamount,sizeSmall,sizeMedium,sizeLarge} = req.body;
      
};

const loginUser = async (req,res) => {
        const data = {
            email: req.body.email,
            password: req.body.password
        }
        const user = await UserModel.findOne({email: req.body.email})
        console.log(req.body.email)
        if(req.body.email !=''|| req.body.password !=''){
            if(user){
                console.log("email matched")
                
                if(req.body.password === user.password){
                    console.log("password matched.")
                    if(user.status == true){
                        req.session.user = user;
                        console.log("session: ", req.session.user)
                        res.redirect('/')
                    }else{
                        res.render("user/login")
                        console.log("User blocked")
                    }
                 
                }else{
                    const failedPassword = true
                    res.redirect(`/login?failedPassword=${failedPassword}`);
    
                    console.log("Wrong password.")
                }
            }
            else {
                const failedEmail = true
                res.redirect(`/login?failedEmail=${failedEmail}`)
                console.log("Wrong email.")
            }
        }else{
            const emptyField = true;
            res.redirect(`/login?emptyField=${emptyField}`);
            console.log("empty form");

        }
}

const userLogout = (req,res)=>{
    req.session.destroy(()=>{
        res.redirect("/login")
    })
}

const signupUser  = async (req,res) =>{
    const {name,email,number,password,referenceId}= req.body;

    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    let wallet = 50;
    let walletHistory=[{transaction:'credited',amount:100,orderId:'Joining bonus',date:formattedDate}];

    if(referenceId){
        var referralOffer = await userFunc.referenceIdApplyOffer(referenceId);
        if(referralOffer){
            wallet = wallet+100
            const dataHistory = {
                                transaction:'credited',
                                amount:50,
                                orderId:'Referral joining bonus',
                                date:formattedDate
                            }
            walletHistory.push(dataHistory);
        }
    }

    sendMail(email)
    session.email = email
  
    UserModel.findOne({email: req.body.email}).then(async (user)=> {
        if(user){
            console.log("Email already exists.");
            res.render("user/signup")
        }else{
            const data = {
                name: req.body.name,
                number: req.body.number,
                email : req.body.email,
                password : req.body.password,
                status: true,
                wallet:wallet,
                walletHistory:walletHistory,
                referenceId: userFunc.generateRandomReferenceId()
            }
            // data.password = await bcrypt.hash(data.password,saltRound)
            // await UserModel.insertMany([data])
            console.log("data inserted")
            session.userData = data;
            if(session.userData){
                res.render("user/otp")
            }
        }
    })
}

const emailVerifyOtp = async (req,res)=>{
    const email = req.body.email;
    await sendMail(email)
    const userExist = await UserModel.findOne({email:email})
    session.email = email
    console.log(session.email)
    if(userExist){ 
        console.log('userExist');
        res.render("user/forgot-password-otp")
    }
}

const otpVerification = async(req,res)=>{
    const {otpNum1,otpNum2,otpNum3,otpNum4,otpNum5,otpNum6} =  req.body;
    const fullOTP = otpNum1 + otpNum2 + otpNum3 + otpNum4 + otpNum5 + otpNum6;
    
    if(fullOTP == session.otp){
        data = session.userData;
        const user = await UserModel.create(data);
        res.redirect('/');
    }else{
        msg = true
         res.render("user/otp",{msg});
    }
}

const otpVerificationPassword = async(req,res)=>{
    const {otpNum1,otpNum2,otpNum3,otpNum4,otpNum5,otpNum6} =  req.body;
    const fullOTP = otpNum1 + otpNum2 + otpNum3 + otpNum4 + otpNum5 + otpNum6;
    console.log('entered Otp',fullOTP);
    console.log(session.otp);
    if(fullOTP == session.otp){
        email = session.email;
        res.render('user/forgot-password-change');
    }else{
        msg = true
         res.render("user/otp",{msg});
    }
}

const cartView = async(req,res) =>{
//    try{
        const stockLimit = req.query.stockLimit;
        const userId = req.session.user._id;
        const cartItems = await userFunc.getProducts(userId);
        console.log(userId,'userId')

        let total = await userFunc.getTotalAmount(userId);       
        total = total[0]?total[0].total:0;

        console.log(total,"in cartview")
        res.render("user/cart",{cartItems,total,stockLimit}); //pass tthe cart Object to the render function
    //return cartItems
//    }
//    catch(err){
//     console.log("cart View error.")
//         res.status(500).render("user/error-handling");
//    }
}

const  addToCart = async(req,res)=>{
    try{
        console.log("add to cart start.")
        const productId = req.query.id;
        console.log(productId);
        const userId = req.session.user._id;
        console.log('11')
        let size = req.query.size;
        console.log('22')

        if(size == undefined){
            console.log("size was undefined")
            size = 'sizeMedium'
        }
        
        const product = await ProductModel.findOne({_id:productId});
        console.log(product)
        if(product.offerPrice > 0){
            var price = product.offerPrice
        }else{
            var price = product.price
        }
        console.log(price,"price")
        const data = {
            productId:productId,
            count:1,
            size:size,
            price:price
        };
        console.log('cart data', data)
        

        console.log(size)
        console.log(data);
        const cart = await CartModel.findOne({userId: userId});
        if(cart){
            console.log("cart positive")
            const productExists = cart.cart.some(item=> item.productId === productId && item.size === size);
            if(productExists){
                console.log("product exists")
                const productDetails = await ProductModel.findOne({_id:productId});

                //defining count before using it.

                let count = 0

                for(const item of cart.cart){///changed cart to cart.cart
                    if(item.productId === productId && item.size === size){
                        console.log("Match is found.")
                        count = item.count;
                        break; //breaking once the match is found
                    }
                }
                if(productDetails.sizeStock[size].stock > count){
                    console.log('stock>count')
                    await CartModel.updateOne(
                        {userId: userId,'cart.productId': productId, 'cart.size':size},
                        {$inc:{'cart.$.count':1},}
                    );
                    res.redirect("/cart");  
                }else{
                    let stockLimit = true;
                    res.redirect(`/cart?stockLimit=${stockLimit}`);
                }
            }else{
                await CartModel.updateOne({userId:userId},{$push:{cart:{productId,count:1,size}}})
                res.redirect("/cart");
            }
        }else{
            console.log("reached cart else.")
            const cartData = {
                userId: userId,
                cart : [data]
            };
            console.log(cartData)
            const newCart = await CartModel.create(cartData);
            if(newCart){ 
                console.log("if new cart")
                res.redirect('/'); //moved the redirect here
            }else{
                console.log("reached newcart else error.")
                res.status(404).render("user/error-handling");
            }
        }
    }catch(err){
        console.log(err)
        res.status(500).render("user/error-handling")
    }
}
// const addToCartProductDetails = async(req,res)=>{
    
// }
const deleteCartItem = async(req,res)=>{
    try{
        const productId = req.query.id
        const size = req.query.size 
        const userId =  req.session.user._id;
        const cart = await CartModel.updateOne({userId:userId},{$pull:{'cart':{productId:productId,size:size}}})

        res.redirect("/cart")
           } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

const removeAddress = async (req,res)=>{
    try{
        console.log('start')
        const addressId = req.query.id;
        const userId = req.session.user._id;
        console.log('kkkkkkkkkkkkkkk')
        const removeAddress = await AddressModel.updateOne({userId:userId},{$pull:{address:{_id:addressId}}});
        console.log(removeAddress,'kkkkkkkkkkkkkkk')
        if(removeAddress){
            console.log("removed address");
            const mesgAddressRemove = true
            const userDetails = await UserModel.findOne({_id:userId});
            const newAddress = await AddressModel.findOne({userId:userId});
            res.render('user/user-profile',{mesgAddressRemove,userDetails,newAddress});
        }else{
            const errOccured = true
            const userDetails = await UserModel.findOne({_id:userId});
            const newAddress = await AddressModel.find({userId:userId})
            res.render("user/user-profile",{errOccured,userDetails,newAddress});
        }
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};

const removeAddressCheckout = async (req,res)=>{
    try{
        const coupons = await CouponModel.find();  
        let total = await userFunc.getTotalAmount(userId)
        total = total[0] ? total[0].total : 0;
    console.log('start')
    const addressId = req.query.id;
    const userId = req.session.user._id;
    console.log('kkkkkkkkkkkkkkk')
    const removeAddress = await AddressModel.updateOne({userId:userId},{$pull:{address:{_id:addressId}}});
    console.log(removeAddress,'kkkkkkkkkkkkkkk')
    if(removeAddress){
        console.log("removed address");
        const mesgAddressRemove = true
        const userDetails = await UserModel.findOne({_id:userId});
        const newAddress = await AddressModel.findOne({userId:userId});
        res.render('user/checkout',{mesgAddressRemove,userDetails,newAddress,coupons,total});
    }else{
        const errOccured = true
        const userDetails = await UserModel.findOne({_id:userId});
        const newAddress = await AddressModel.find({userId:userId})
        res.render("user/checkout",{errOccured,userDetails,newAddress,total,coupons});
    }

    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}


const defaultAddress = async (req,res)=>{
    try{
        console.log("default start");
        const userId = req.session.user._id;
        const addressId = req.query.id;
        
        console.log("1");
        const currentDefaultAddress = await AddressModel.updateOne({"address.default":true},{$set:{"address.$.default":false}});
        if(currentDefaultAddress){
            console.log("current default addresses is $set false",currentDefaultAddress)
        }
        const defaultAddress = await AddressModel.updateOne({'address._id':addressId},{$set:{"address.$.default":true}});
        if(defaultAddress){
            console.log('then changed this address default',defaultAddress)
            const userDetails = await UserModel.findById({_id:userId})
            const newAddress = await AddressModel.findOne({userId:userId})
            console.log(newAddress)
            res.render('user/user-profile',{userDetails,newAddress})
        }
        else{
            const errOccured = true
            const userDetails = await UserModel.findOne({_id:userId})
            const newAddress = await AddressModel.find({userId:userId})
            res.render("user/user-profile",{userDetails,newAddress,errOccured});
        }
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

const checkout = async(req,res)=>{
    try{
        const userId = req.session.user._id;
        const userDetails = await UserModel.findById({_id:userId})
        const newAddress = await AddressModel.findOne({userId:userId})
        const coupons = await CouponModel.find();

        let total = await userFunc.getTotalAmount(userId)
        total = total[0] ? total[0].total : 0;

        res.render("user/checkout",{newAddress,userDetails,total,coupons});
        } catch (error) {
            console.error("Error in changeProductQuantity:", error);
            res.status(500).json({error: "Internal Server Error"});
        } 
}

 const placeOrder = async(req,res)=>{
    // try{
    let response;
    const userId = req.session.user._id;
    const selectedAddressId = req.body.selectedAddressId;
    console.log('sekkkkkkkkkkkkkkk',selectedAddressId)
    const randomOrderId = generateRandomOrderId();
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);
    const finalAmount = req.body.finalAmount;
    let userAddress = await  AddressModel.findOne({userId: userId});
    console.log('userAddress',userAddress)
    
    const address = userAddress.address.find(address => address._id.equals(selectedAddressId));
    const cartItems = await userFunc.getProducts(userId);

    console.log("---------------------1111111111111111111---------------------",address)
    console.log(cartItems)
    
    // const products = cartItems.map(cartItems =>({
    //     productId: cartItems.product._id,
    //     name:cartItems.product.name,//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //     price: cartItems.product.price,//////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    //     count:cartItems.count,
    //     size: cartItems.size,
    //     status:'pending'
    // }));

    const products = cartItems.map(({ product, count, size }) => ({
        productId: product._id,
        name: product.name,
        price: product.price,
        count: count,
        size: size,
        status: 'pending'
    }));
    
    console.log("==========",products)
    const data = {
        "userId":userId,
        "orderId":randomOrderId,
        "address":address,
        "date":formattedDate,
        products:products,
        "amount":finalAmount,
        "paymentMethod":'COD',
        "status":"pending"
    }
    const transaction = {
        transaction:'debited',
        amount:finalAmount,
        orderId:randomOrderId,
        date:formattedDate
    }

    console.log(req.body.paymentMethod,'payment method req');
    console.log("data",data)
    const order = await OrderModel.create(data)
    console.log("data created :::::::",order);
    if(order){
        if(req.body.paymentMethod == 'Wallet'){
            console.log('-------------------Wallet')
            let stockUpdate = userFunc.stockQuantityUpdate();
            if(stockUpdate){
                await UserModel.updateOne({_id:userId},{$inc:{wallet: -finalAmount}})
                await UserModel.updateOne({_id:userId},{$push:{walletHistory:transaction}})
                const pendingOrders = await OrderModel.findOne({orderId:order.orderId})
                const updateDetails = await OrderModel.updateOne({orderId:order.orderId},{$set:{paymentMethod: 'Wallet'}});
            
                if(updateDetails){
                    response ={status:true,pendingOrders}
                    res.json(response);
                }else{
                    response = {status:false}
                    res.json(response);
                }
            }
        }else if(req.body.paymentMethod == 'Online'){
            console.log('------------------------Online')
            const order = await generateRazorpay(randomOrderId,finalAmount);
            
            response = {status:true,order}
            console.log(response)
            res.json(response);
        }else{
            console.log("stage1111111111111111");
            let stockUpdate = userFunc.stockQuantityUpdate();
            if(stockUpdate){
                console.log("stage 2222222222222222222222222");
                const pendingOrders = await OrderModel.findOne({orderId:order.orderId});
                console.log("pending order//:",pendingOrders)
                const deleteCart = await CartModel.deleteMany({});
                if(deleteCart){
                    console.log('cart deleted');
                    response = {status:true,pendingOrders}
                    res.json(response);
                }
            }
        }
    }
// }catch(error){
//     console.error("", error);
//     res.status(500).json({error: "Internal Server Error"});
// }
}


const verifyPayment = async (req,res)=>{

    console.log('payment verification req.body', req.body['order[receipt]']);
    const verificationSuccess = await userFunc.paymentVarification(req.body);
    console.log('jjjjjjjjjjjfjjjjjjjjfjfjj')
    let response;
    console.log(verificationSuccess)
    if(verificationSuccess){
        console.log('verificationSuccess')
        const success = await userFunc.changePaymentStatus(req.body['order[receipt]'])
        if(success){
            console.log('success')
            const onlineDetails  = await OrderModel.findOne({ orderId: req.body['order[receipt]'] })
            const stockUpdate = await userFunc.stockQuantityUpdate()
            if(stockUpdate){
                console.log('stock updated')
                response = {status:true,onlineDetails}
                res.json(response);
            }else{
                console.log('product not updated');
            }
        }else{
            console.log('Not success.')
            res.status(404).render("user/error-handling")
        }

    }
}


const generateRazorpay = async (randomOrderId, finalAmount) => {
    try {
      const order = await instance.orders.create({
        amount: finalAmount * 100,
        currency: "INR",
        receipt: randomOrderId,
        notes: {
          key1: "value3",
          key2: "value2"
        }
      });
      console.log(order,'order-------------------')
      return order;
    } catch (error) {
      console.error(error);
      throw error; // Throw the error again
    }
 };




const orderResponseView =  (req,res)=>{
    res.render('user/order-response')
}


const ordersView =  async(req,res) =>{
    try{
    const userId = req.session.user._id
    const pendingOrders = await OrderModel.find({userId:userId}).sort({$natural: -1});
    console.log(pendingOrders,'pendingOrderssssssssssssssss');
    res.render('user/orders',{pendingOrders});
} catch (error) {
    console.error("Error in changeProductQuantity:", error);
    res.status(500).json({error: "Internal Server Error"});
}
}

const cancelUserOrder = async(req,res)=>{
    try{
        const orderId = req.query.id; // this is Id of order doc
        const productId = req.query.pro_Id;// this is the Id of produt Array in the Order

        console.log(orderId,'orderId');
        console.log(productId,'productId');
        const orderDetails = await OrderModel.findById({_id: orderId});
        console.log(orderDetails,'order details');
        const userId = req.session.user._id
        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);
        console.log(orderDetails, 'orderDetialssssssssss');
        if(orderDetails.paymentMethod === 'Online'){
            console.log('It was online----------------------------------------------------')
            const amount = orderDetails.amount

            const transaction = {// This is for wallet transaction history.
                transaction:'Credited',
                amount:amount,
                orderId:orderDetails.orderId,
                date:formattedDate
            }

            const userDetails = await UserModel.updateOne({_id:userId},{$inc:{wallet:amount}});  // Refunding money to the user's wallet.

            await UserModel.updateOne({_id:userId},{$push:{walletHistory:transaction}})//creating a transaction history of the wallet. Here I'm creating credit transaction history.
            if(userDetails){
                console.log('Money added to wallet.')
            }else{
                console.log('paisa poi')
            }
        }

        if(orderDetails.status == 'pending'){
            for(let product of orderDetails.products){
                console.log(product.productId,'productIDdddd')
                const productDetails = await ProductModel.findById(product.productId);
                console.log(productDetails, ' product detailssssssss')
                if(productDetails && productDetails.sizeStock[product.size].stock >= product.count){
                    //increasing the stock count for the specific size in the product model

                    console.log('readched heree')
                    const updatedStock = productDetails.sizeStock[product.size].stock+product.count;
                    productDetails.sizeStock[product.size].stock = updatedStock;
                    // save the updated product model
                    await productDetails.save()
                }else{
                    console.log('Failed2222222222');
                }
            }
            //updateing the orderModel
            const success = await OrderModel.updateOne(
                { _id: orderId, 'products._id': productId }, // Filter
                { $set: { 'products.$.status': 'cancelled' } } // Update
              );
              console.log(success,'success')
              console.log(orderDetails,'order details updated');
            if(success){
                console.log('Order has been cancelled');
                res.redirect("/orders");
            }else{
                console.log('failed to update orderModel.');
                res.redirect('/orders');
            }
        } else {
            console.log('order was already cancelled.');
            res.redirect("/orders");
        }       
    } catch (error) {
        console.error("Error in canceling order:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

const orderDetailView = async(req,res)=>{
  
    const orderId = req.query.id;
    const orderDetails = await OrderModel.findById({_id:orderId});

    if(!orderDetails){
      return res.status(404).json({message:'Order not found.'});
    }

    const today = new Date();
    const formattedDeliveryDate = moment(orderDetails.date,'DD/MM/YYYY').format('YYYY-MM-DD');

    const deliveryDate = new Date(formattedDeliveryDate);

    if(isNaN(deliveryDate.getTime())){
      return res.status(404).json({message:"invalid delivery date."})
    }

    const daysDifference = Math.floor((today-deliveryDate)/(1000*60*60*24)) + 1;

    console.log(daysDifference)
    let orderReturn = false;

    if(daysDifference<=7){
      orderReturn = true;
    }
    res.render("user/order-detail-view",{orderDetails,orderReturn});
}


const transactionOrderDetailView = async(req,res)=>{

    const orderId = req.query.id;
    const orderDetails = await OrderModel.findOne({orderId:orderId});

    if(!orderDetails){
      return res.ststus(404).json({message:'Order not found.'});
    }


    const today = new Date();
    const formattedDeliveryDate = moment(orderDetails.date,'DD/MM/YYYY').format('YYYY-MM-DD');

    const deliveryDate = new Date(formattedDeliveryDate);

    if(isNaN(deliveryDate.getTime())){
      return res.status(404).json({message:"invalid delivery date."})
    }

    const daysDifference = Math.floor((today-deliveryDate)/(1000*60*60*24)) + 1;
console.log(daysDifference)
    let orderReturn = false;

    if(daysDifference<=7){
      orderReturn = true;
    }
    res.render("user/order-detail-view",{orderDetails,orderReturn});
}





const userProfile = async(req,res)=>{
    // try{
        console.log('user profile');
        const userId = req.session.user._id
        const userDetails = await UserModel.findById({_id:userId});
        const newAddress = await AddressModel.findOne({userId:userId});
        if(newAddress){
            console.log('userProfile',newAddress.address)
            res.render('user/user-profile',{userDetails,newAddress});
        }
        console.log(newAddress);

        res.render('user/user-profile',{userDetails,newAddress});
    // } catch (error) {
    //     console.error("Error in changeProductQuantity:", error);
    //     res.status(500).json({error: "Internal Server Error"});
    // }
}




const addNewAddress = async(req,res)=>{
    try{
        const details = req.body;
        const userId = req.session.user._id
        
        const updateAddress = await userFunc.newAddressManagement(details,userId);
        console.log('update address 1', updateAddress)
    if(updateAddress){
        const newAddress = await AddressModel.findOne({userId:userId});
        const userDetails = await UserModel.findById({_id:userId});
        console.log('new Address 2',newAddress);
        console.log(userDetails);
        mesgAddressNew = true;
        res.render("user/user-profile",{mesgAddressNew, userDetails, newAddress});
    }else{
        const newAddress = await AddressModel.findOne({userId:userId})
        const userDetails = await UserModel.findById({_id:userId});
        errOccured =true
        console.log('newAddress else 2',newAddress);
        console.log('user Details 2',userDetails)
        res.render("user/user-profile",{errOccured, userDetails,newAddress})
    }           
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}


const addNewAddressCheckout = async(req,res)=>{
    try{
        const details = req.body;
        const userId = req.session.user._id
        
        const updateAddress = await userFunc.newAddressManagement(details,userId);
        console.log('update address 1', updateAddress)
        if(updateAddress){
            const newAddress = await AddressModel.findOne({userId:userId});
            const userDetails = await UserModel.findById({_id:userId});

            const coupons = await CouponModel.find();
        
            let total = await userFunc.getTotalAmount(userId)
            total = total[0] ? total[0].total : 0;

            console.log('new Address 2',newAddress);
            console.log(userDetails);
            mesgAddressNew = true;
            res.render("user/checkout",{mesgAddressNew, userDetails, newAddress,total,coupons});
        }else{
            const newAddress = await AddressModel.findOne({userId:userId})
            const userDetails = await UserModel.findById({_id:userId});


            const coupons = await CouponModel.find();
        
            let total = await userFunc.getTotalAmount(userId)
            total = total[0] ? total[0].total : 0;

            errOccured =true
            console.log('newAddress else 2',newAddress);
            console.log('user Details 2',userDetails)
            res.render("user/checkout",{errOccured, userDetails,newAddress,total,coupons})
        }
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }      
}


const editProfile = async(req,res)=>{
    try{
    const userId = req.session.user._id;
    const {name,email,number} = req.body;
    const update = await UserModel.updateOne({_id:userId},{
        $set:{
            name:name,
            email:email,
            number:number
        }
    })
    if(update){
        const msgProfile = true
        const userDetails = await UserModel.findOne({_id:userId});
        const newAddress = await AddressModel.findOne({userId:userId});
        console.log('updated',update)
        res.render('user/user-profile',{msgProfile,userDetails,newAddress})
    }else{
        const errOccured = true
        const userDetails = await UserModel.findOne({_id:userId});
        const newAddress = await AddressModel.findOne({userId:userId});
        res.render('user/user-profile',{errOccured,userDetails,newAddress});
    }
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}


const changePassword = async (req, res) => { // changing existing password from user's profile

    try {
      const currentPassword = req.body.password
      
      let newPassword = req.body.newpassword
      console.log(newPassword)

      const userId = req.session.user._id
      const userDetails = await UserModel.findById({ _id: userId })
      console.log(userDetails,'userDetailsssssssss')
      console.log(currentPassword,'current password.')
      console.log(userDetails.password,'existing password..............');
      const currentPasswordT = currentPassword.trim();
      const userPassword = userDetails.password.trim()
      const isPasswordValid = await bcrypt.compare(currentPasswordT,userPassword);
      if (isPasswordValid) {
        
  
        newPassword = await bcrypt.hash(newPassword, saltRounds)
  
        const updated = await UserModel.updateOne({ _id: userId }, { $set: { password: newPassword } })
        if (updated) {
            console.log('passsword updated,')
            msgNewPass = true
  
            res.render("user/user-profile", { msgNewPass, userDetails })
        } else {
  
            errNewPass = true
            res.render("user/user-profile", { errNewPass, userDetails })
        }
      } else {
            errMatchPass = true
            res.render("user/user-profile", { errMatchPass, userDetails })
      }
    } catch (error) {
        errOccurred = true
        res.render("user/user-profile", { errOccurred, userDetails })
    }
}

const createNewPasswrod = async(req,res)=>{ // for forgot password
    const currentPassword = req.body.password
      
    let newPassword = req.body.newPassword
    const renewPassword = req.body.renewPassword;
    console.log(newPassword)
    const email = session.email;
    console.log('email',email);
    if(newPassword === renewPassword){
        console.log('password updated')
        const update = await UserModel.updateOne({email:email},{$set:{password:newPassword}})
        if(update){
            console.log('password really updated');
            res.render('user/login');
        }
    }
}

const changeProductQuantity = async (req, res) => {
    try {
        console.log('change product function');
        let { cart, product, size, count, quantity } = req.body;
        count = parseInt(count);
        quantity = parseInt(quantity);
        const requestedSize = size;
        let response;

        if (count === -1 && quantity === 1) {
            console.log("quantity below 1");
            const removeProduct = await CartModel.updateOne({_id: cart}, {$pull: {"cart": {productId: product, size: size}}});

            if (removeProduct) {
                console.log("product removed");
                response = {removeProduct: true};
            } else {
                console.log('request...');
                response = {removeProduct: false};
            }
        } else {
            const productDetails = await ProductModel.findOne({_id: product});

            if (productDetails.sizeStock[requestedSize].stock >= quantity + count) {
                const updated = await CartModel.updateOne({_id: cart, 'cart.productId': product, 'cart.size': requestedSize}, {$inc: {'cart.$.count': count}});
                console.log('count added');

                if (updated) {
                    const userId = req.session.user._id;
                    console.log('type of ')
                    console.log(typeof price);
                    console.log(typeof quantity);
                    let total = await userFunc.getTotalAmount(userId);
                    response = {status: true, total};
                    console.log('if updated', total);
                } else {
                    console.log("not updated");
                    response = {status: false};
                }
            } else {
                console.log('reached stock limit');
                response = {stockLimit: true};
            }
        }

        console.log(response);
        res.json(response);
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
};





const emailVerify = (req,res)=>{
    res.render("user/email-verify");
}



const couponValidate = async (req,res)=>{
    let response
    const couponCode = req.body.couponCode; // code from user side
    const totalAmount = req.body.totalAmount 
    const userId = req.session.user._id;
    const couponValidate = await CouponModel.findOne({couponCode:couponCode}); //checking if coupon code exists
    console.log('step 1', couponValidate)
    if(couponValidate){
        const usedCoupon = await OrderModel.findOne({userId:userId,couponCode:couponCode}) //checking if coupon is already userd by coupon
        if(usedCoupon){
            console.log('coupon already used', usedCoupon);//if the coupon already exists. It will not be used
            response = {status:false} 
        }else{
            console.log('coupon not used')
            //if coupon havent used before by user
            const couponDiscount = (totalAmount * couponValidate.offerPercentage)/100 //finding discount price
            const discountTotal = (totalAmount-couponDiscount); //creating discounted price
            response = {status:true,discountTotal}
        }
    }else{
        console.log('not validating coupon')
        response={status:false};
    }
    res.json(response);
}


const search = async (req,res)=>{
    let searchs = req.query.search;
    // let searchProduct = await productHelper.searchProduct(search);
    var search = new RegExp(searchs, 'i')
  
    const searchProduct = await ProductModel.find({ $or: [{ name: search }, { category: search }] })
  
    res.json(searchProduct);
}


const returnUserOrder = async(req,res)=>{
    console.log('start')
    const orderId = req.query.orderId;
    const productId =req.query.pro_id;

    console.log(orderId,"orderId")
    console.log(productId,'productId');

    const returnType = req.query.returnType;

    console.log(orderId,'orderId');
    console.log(returnType,"return type");

    if(returnType === '1'){
        const orderDetails = await OrderModel.findById({_id:orderId});
        console.log('step1')
        for(const product of orderDetails.products){
            const productDetails = await ProductModel.findById(productId); 
            console.log('step 2')
            if(productDetails && productDetails.sizeStock[product.size].stock >= product.count){
                console.log('step 3')
                // increasing the stock count for that perticular size.
                const updateStock = productDetails.sizeStock[product.size].stock + product.count;
                productDetails.sizeStock[product.size].stock = updateStock;

                //saving updated product model
                await productDetails.save();
            }else{
                res.ststus(404).render("user/error-handling");
                // I will handle insufficient stock scenario  here, eg. notify the user
            }
        }
        // const returnNonDefective = await OrderModel.updateOne({_id:orderId},{$set:{status:"returnNonDefective"}});
        const returnNonDefective = await OrderModel.updateOne({_id:orderId,'products._id':productId},{ $set: { 'products.$.status': 'returnNonDefective' }});
        if(returnNonDefective){
            const orderDetails = await OrderModel.find() 
            res.render("user/orders",{returnSuccess:true,pendingOrders:orderDetails});
        }else{
            res.render("user/orders",{returnErr:true});
        }
    }else{
        // const returnDefective = await OrderModel.updateOne({_id:orderId},{$set:{status:"returnDefective"}})
        const returnDefective = await OrderModel.updateOne({_id:orderId,'products._id':productId},{ $set: { 'products.$.status': 'returnDefective' }});
        if(returnDefective){
            const orderDetails = await OrderModel.find() 
            res.render("user/orders",{returnSuccess:true,pendingOrders:orderDetails});
        }else{
            res.render("user/orders",{returnErr:true});
        }
    }
}


const walletHistory = async(req,res)=>{
    const userId = req.session.user._id
    const user = await UserModel.findOne({_id:userId});
    res.render("user/wallet-history",{user});
}

module.exports = {
    loginView,
    indexView,
    signupView,
    productList,
    userLogout,
    shopView,
    productDetailsView,
    blogView,
    contactView,
    otpView,
    otpViewPass,
    cartView,
    deleteCartItem,
    checkout,
    userProfile,
    removeAddress,
    removeAddressCheckout,
    defaultAddress,
    orderResponseView,
    ordersView,
    orderDetailView,
    emailVerify,
    search,
    returnUserOrder,
    wishlistView,
    walletHistory,
    transactionOrderDetailView,
    
    ///////////////////////////////////////////post
    otpVerification,
    otpVerificationPassword,
    addToCart,
    signupUser,
    loginUser,
    changeProductQuantity,
    addNewAddress,
    addNewAddressCheckout,
    editProfile,
    changePassword,
    placeOrder,
    cancelUserOrder,
    changePassword,
    createNewPasswrod,
    emailVerifyOtp,
    otpVerificationPassword,
    verifyPayment,
    couponValidate,
    filteredShop
    // addToCartProductDetails
}
