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
    let products = await ProductModel.find({listStatus: true, deleteStatus: false});
    if(req.query.category === "men"){ // "/shop?category=men" from front end
        products = await ProductModel.find({category:"mens",listStatus: true, deleteStatus: false})
    }else if(req.query.category === "women"){// "/shop?category=women" from back end
        products = await ProductModel.find({category:"womens",listStatus: true,deleteStatus: false})
    }
    const category = await CategoryModel.find();
    return res.render("user/shop",{products,category})
}

const productDetailsView = async (req,res) => {
    const products = await ProductModel.aggregate([{$match:{listStatus:true,deleteStatus:false}}]).limit(4);
    const singleProduct = await ProductModel.findOne({_id:req.query.id});
    return res.render("user/product-details",{singleProduct,products});
}

const blogView = (req,res)=> {
    return res.render("user/blog");
}

const contactView = async(req,res) =>{
    const email = session.email
    await sendMail(email);
    return res.render("user/contact");
}

const otpView = (req,res)=>{
    const email = session.email
    sendMail(email)
    return res.redirect("user/otp");
}

const otpViewPass = async(req,res)=>{
    const email = session.email
    sendMail(email);
    return res.render("user/forgot-password-otp");
}

const productList= (req,res) =>{
    res.render("user/product-list")
}
////////////////////////////////////////////////////////////////////////////////////     POST Methods     >>>>>>>>>>>>>>>>

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

    const {name,email,number,password,password2}= req.body;
    // const user = {
    //     name: req.body.name,
    //     number: req.body.number,
    //     email: req.body.email, 
    //     password: req.body.password,
    //     status: true
    // }
    sendMail(email)
    session.email = email
    if(password === password2){
        
        
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
                    status: true
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
    }else{
        console.log("passwords deos'nt match.")

        res.render("user/signup")
    }
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

const addToCart = async(req,res)=>{
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
        
        const data = {
            productId:productId,
            count:1,
            size:size
        };

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
                        count = item.count
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
}
const removeAddressCheckout = async (req,res)=>{
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
        res.render('user/checkout',{mesgAddressRemove,userDetails,newAddress});
    }else{
        const errOccured = true
        const userDetails = await UserModel.findOne({_id:userId});
        const newAddress = await AddressModel.find({userId:userId})
        res.render("user/checkout",{errOccured,userDetails,newAddress});
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
    let total = await userFunc.getTotalAmount(userId)
    total = total[0] ? total[0].total : 0;

    res.render("user/checkout",{newAddress,userDetails,total});
} catch (error) {
    console.error("Error in changeProductQuantity:", error);
    res.status(500).json({error: "Internal Server Error"});
}
}

 const placeOrder = async(req,res)=>{
    try{
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
    
    const products = cartItems.map(cartItems =>({
        productId: cartItems.product._id,
        name:cartItems.product.name,
        price: cartItems.product.price,
        count:cartItems.count,
        size: cartItems.size
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
    console.log("data",data)
    const order = await OrderModel.create(data)
    console.log("data created :::::::",order);
    if(order){
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
} catch (error) {
    console.error("Error in changeProductQuantity:", error);
    res.status(500).json({error: "Internal Server Error"});
}
}


const orderResponseView =  (req,res)=>{
    res.render('user/order-response')
}


const ordersView =  async(req,res) =>{
    try{
    const pendingOrders = await OrderModel.find().sort({$natural: -1});
    console.log(pendingOrders,'pendingOrderssssssssssssssss');
    res.render('user/orders',{pendingOrders});
} catch (error) {
    console.error("Error in changeProductQuantity:", error);
    res.status(500).json({error: "Internal Server Error"});
}
}

const cancelUserOrder = async(req,res)=>{
    try{
    const orderId = req.query.id;
    const orderDetails = await OrderModel.findById({_id: orderId});

    console.log(orderDetails, 'orderDetialssssssssss');
    
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
        // updateing the orderModel
        const success = await OrderModel.updateOne({_id:orderId},{$set:{status:'cancelled'}});
        if(success){
            console.log('Order has been cancelled');
            res.redirect("/orders");
        }else{
            console.log('failed to update orderModel.');
            res.redirect('/orders');
        }
        

    }           } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
}

const OrderDetailsView = async(req,res)=>{
    try{

    const orderId = req.query.id;
    const orderDetails = await OrderModel.findById({_id:orderId})
    res.render('user/order-detail-view',{orderDetails});
} catch (error) {
    console.error("Error in changeProductQuantity:", error);
    res.status(500).json({error: "Internal Server Error"});
}
}




const userProfile = async(req,res)=>{
    try{
        console.log('user profile');
        const userId = req.session.user._id
        const userDetails = await UserModel.findById({_id:userId});
        const newAddress = await AddressModel.findOne({userId:userId});
        console.log('userProfile',newAddress.address)
        res.render('user/user-profile',{userDetails,newAddress});
    } catch (error) {
        console.error("Error in changeProductQuantity:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
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
            console.log('new Address 2',newAddress);
            console.log(userDetails);
            mesgAddressNew = true;
            res.render("user/checkout",{mesgAddressNew, userDetails, newAddress});
        }else{
            const newAddress = await AddressModel.findOne({userId:userId})
            const userDetails = await UserModel.findById({_id:userId});
            errOccured =true
            console.log('newAddress else 2',newAddress);
            console.log('user Details 2',userDetails)
            res.render("user/checkout",{errOccured, userDetails,newAddress})
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

    // const changeProductQuantity = async(req,res)=>{
    //     // try{
    //         console.log('change product function')
    //         let{cart,product,size,count,quantity}= req.body;
    //         count = parseInt(count);
    //         quantity = parseInt(quantity);
    //         const requestedSize = size;
    //         let response;

    //         if(count === -1 && quantity ===1){
    //             console.log("quantity below 1");
    //             response = {removeProduct:true};
    //             const removeProduct = await CartModel.updateOne({_id:cart},{$pull:{"cart":{productId:product,size:size}}});
    //             if(removeProduct){
    //                 console.log("product removed");
    //                 response = {removeProduct:true}
    //                 res.json(response);
    //             }else{
    //                 console.log('request...');
    //                 response = {removeProduct:false}
    //             }
    //         }else{

    //             const productDetails = await ProductModel.findOne({_id:product})
    //             if(productDetails.sizeStock[requestedSize].stock >= quantity + count){
                    
    //                 const updated = await CartModel.updateOne({_id:cart, 'cart.productId':product, 'cart.size':requestedSize},{$inc:{'cart.$.count':count}})
    //                 console.log('count added')
    //                 if(updated){
    //                     const userId = req.session.user._id;
    //                     let total = await getTotalAmount(userId)
    //                     response = {status:true,total};
    //                     console.log('if updated',total)
    //                 }else{
    //                     console.log("not updated")
    //                     response = {status:false};
    //                 }
    //             }else{
    //                 console.log('reached stock limit')
    //                 response = {stockLimit:true};
                  
    //             }
    //         }
    //         console.log(response);
    //         res.json(response)


    //     // }
    // }
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
    OrderDetailsView,
    emailVerify,
    
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
    otpVerificationPassword
}
