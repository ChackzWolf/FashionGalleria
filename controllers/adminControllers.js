const AdminModel = require("../models/Admin");
const session = require("express-session");
const router = require("../routes/user");
const UserModel = require("../models/User");
const ProductModel = require("../models/Product");
const CategoryModel = require("../models/Category");
const Swal = require('sweetalert2');
const OrderModel = require("../models/Order");
const CouponModel = require("../models/Coupon");
const { findOne } = require("../models/Address");
const formatDate = require("../utils/dateGenerator");


 const dashboardView= (req,res) =>{
    res.render("admin/index")
 }

 const loginView = (req,res)=>{
   res.render("admin/login")
 }
 
 const adminLogout = (req,res)=>{
  req.session.destroy((err)=>{
    console.log("session deleted")
    res.redirect("/admin/login")
  })

  
 }

 const userList = async (req,res)=>{
   const users = await UserModel.find()
   Swal.fire("SweetAlert2 is working!");
   res.render("admin/user-list",{users})
 }


 const addCategory = async(req,res)=>{
  const category = await CategoryModel.find();
  res.render("admin/add-category",{category});
}


const addProductView = async(req,res)=>{
  const category = await CategoryModel.find()
  const subCategory =await CategoryModel.distinct("subCategory")
  res.render("admin/add-product",{category,subCategory})
}

const editProductView = async(req,res) =>{
  const products = await ProductModel.find({deleteStatus:false}).populate('category');
  const category = await CategoryModel.find()
  res.render("admin/edit-product",{products,category});
}


 const userBlockUnblock = async (req,res) => {
   const userData = await UserModel.findOne({_id: req.query.id});
   await UserModel.updateOne({_id:req.query.id},{$set: {status: !userData.status}})
   const users = await UserModel.find()
   res.render("admin/user-list",{users});
 }
 






const loginAdmin = async (req,res)=>{
   const data = {
      email : req.body.adminID,
      password: req.body.password
   }
   
   console.log("Triggered")
   
   const adminData = await AdminModel.findOne({adminID:req.body.adminID})
   if(req.body.adminID != ''){
      if(adminData){
        console.log("email checked")
        
        if(admin = req.body.password === adminData.password){
           req.session.admin = admin;
           
           console.log("password matched")
           console.log("session:",req.session.admin)
           res.redirect('/admin')
  
        }
        else{
          const failedPassword = true;
          res.redirect(`/admin/login?failedPassword=${failedPassword}`)
          console.log("Password not matching.")
        }
     }
     else{
        const failedEmail = true
        res.redirect(`/admin/login?failedEmail=${failedEmail}`);
        console.log("email is not matching.")
     }
   }else{
    let fieldEmpty = true
    res.redirect(`/admin/login?fieldEmpty=${fieldEmpty}`);
    console.log("Field is empty");
   }
 }

const deletedProductsView = async(req,res)=>{
    try{
        const deletedProducts = await ProductModel.find({deletedProducts:true});
        res.render("admin/deleted-products",{deletedProducts});
    }catch(err){
        res.status(500).render("user/error-handling")
    }    
}


const orderDelivered = async(req,res)=>{

    const pendingOrderId = req.query.id;
    console.log(pendingOrderId);
    const product = await OrderModel.findOne({_id:pendingOrderId})
    if(product){
      console.log('order foung',product)
      const deliveredOrder = await OrderModel.updateOne({_id:pendingOrderId},{$set:{status:'delivered'}});
      if(deliveredOrder){
        console.log('order Delivered')
        const pendingOrders = await OrderModel.find({status:{$in:['pending','shipped']}});
        res.render("admin/pending-orders",{pendingOrders});
      }
    }else{
      console.log('order not found')
    }
}

const orderShipped = async(req,res)=>{
  const pendingOrderId = req.query.id;
  console.log(pendingOrderId);
  const product = await OrderModel.findOne({_id:pendingOrderId})
  if(product){
    console.log('order found',product);
    const shippedOrders = await OrderModel.updateOne({_id:pendingOrderId},{$set:{status:'shipped'}});
    if(shippedOrders){
      console.log('order has been shipped');
      const pendingOrders = await OrderModel.find({status:{$in:['pending','shipped']}});
      res.render("admin/pending-orders",{pendingOrders});
    }
  }
}


const categoryListView = async(req,res)=>{
    const categories = await CategoryModel.distinct('category');

    
    console.log(categories)
    const subCategory = await CategoryModel.distinct('subCategory');
    console.log(subCategory);
    res.render("admin/category-list",{categories,subCategory});
}


const pendingOrdersView = async(req,res)=>{
    const pendingOrders = await OrderModel.find({status:{$in:['pending','shipped']}});
    res.render("admin/pending-orders",{pendingOrders});
}
const deliveredOrdersView = async(req,res)=>{
    const deliveredOrders = await OrderModel.find({status:"delivered"})
    res.render("admin/delivered-orders",{deliveredOrders});
}




const cancelledOrdersView = async(req,res)=>{
    const cancelledOrders = await OrderModel.find({status: "cancelled"});
    res.render("admin/cancelled-orders",{cancelledOrders});
}

const orderDetailView = async(req,res)=>{
    const orderId = req.query.id;
    const orderDetails = await OrderModel.findById({_id:orderId});
    res.render("admin/order-details",{orderDetails})
}


const addCouponView = (req,res) =>{
  res.render("admin/add-coupon");
}

const addNewCoupon = async(req,res)=>{
    const {couponName,couponType,percentageValue,description} = req.body;
    const data = {
      couponCode:couponName,
      offerPercentage:percentageValue,
      couponType:couponType,
      description:description,
      listStatus:true
    }
    if(couponName !== ''){

          console.log(data,'dataaaaaa')
          const couponExists = await CouponModel.findOne({couponCode:couponName});
          if(!couponExists){
              console.log("coupon deos'nt exists")
              const coupon = await CouponModel.create(data)
              if(coupon){
                console.log('coupon created')
                let msgTrue = true;
                res.render("admin/add-coupon",{msgTrue})
              }else{
                console.log('coupon not created')
                let msgFalse = true;
                res.render("admin/add-coupon",{msgFalse});
              }
          }else{
            console.log('coupon already exists')
            let msgExists = true;
            res.render("admin/add-coupon",{msgExists});
          }
    }else{
        console.log('couponCode is empty')
        let msgCouponEmpty = true;
        res.render("admin/add-coupon",{msgCouponEmpty});
    }
}

const couponListView = async(req,res)=>{
    const listedCoupon = await CouponModel.find();
    res.render("admin/listed-coupon",{listedCoupon});
}

const listUnlistCoupon = async(req,res)=>{
  console.log("step1");
  const coupon = await CouponModel.findById({_id:req.params.id});
  if(coupon){
    console.log('step2');
    const update = await CouponModel.updateOne({_id:coupon.id},{$set:{listStatus:!coupon.listStatus}});
    if(update){
      console.log('list status updated')
      const listedCoupon = await CouponModel.find();
      res.render("admin/listed-coupon",{listedCoupon})
    }
  }
}


const returnPending =  async (req,res)=>{
    const returnPending = await OrderModel.find({status:{$in:['returnNonDefective','returnDefective']}})
    res.render("admin/return-pending",{returnPending});
}

const returnDefective = async(req,res)=>{
    const returnDefective = await OrderModel.find({status:'returnAcceptDef'})
    res.render("admin/return-defective",{returnDefective})
}

const returnNonDefective = async(req,res)=>{
    const returnAcceptNonDef = await OrderModel.find({status:'returnAcceptNonDef'})
    res.render("admin/return-non-defective",{returnAcceptNonDef});
}

const orderCancel = async(req,res)=>{
    const orderId = req.query.id;
    const defective = await OrderModel.findOne({orderId:orderId,status:'returnDefective'})
    const nonDefective = await OrderModel.findOne({orderId:orderId,status:'returnNonDefective'}); 
    if(defective){
        const updated = await OrderModel.updateOne({orderId:orderId},{$set:{status:'returnAcceptDef'}})
    }else{
        const updated = await OrderModel.updateOne({orderId:orderId},{$set:{status:'returnAcceptNonDef'}})
    }

}

const returnAccept = async (req, res) => {
    try {

    } catch (err) {
        res.status(500).render("user/error-handling");
    }
    const orderId = req.query.id
    const status = req.query.status
    const order = await OrderModel.findOne({_id:orderId});
    const returnPending = await OrderModel.find({status:{$in:['returnNonDefective','returnDefective']}})
    const orderDetails = await OrderModel.findOne({_id:orderId});
    const currentDate = new Date();
    const formattedDate = formatDate(currentDate);

    if(order.status === 'returnDefective'){
      console.log('Status:',order.status)
      const orderUpdate = await OrderModel.updateOne({ _id:orderId},{$set:{status:'returnAcceptDef'}})
    }else{
      console.log('Status:',order.status)
      const orderUpdate = await OrderModel.updateOne({ _id:orderId},{$set:{status:'returnAcceptNonDef'}})
    }
    const transaction = {
        transaction:"Credited",
        amount:orderDetails.amount,
        orderId:orderDetails.orderId,
        date:formattedDate
    }
    console.log(orderDetails.amount)
    const walletUpdate = await UserModel.updateOne({ _id: orderDetails.userId }, { $inc: { wallet: orderDetails.amount } }); // Here I'm adding back the amount to the user's wallet.
    const walletHistory = await UserModel.updateOne({_id:orderDetails.userId},{$push:{walletHistory:transaction}}) // here I'm journaling transaction history to the user model


  
    // Check the result of the update
    if (walletUpdate) {
      console.log(walletUpdate)
        res.render("admin/return-pending",{returnPending})
    } else {
        res.render("admin/return-pending",{returnPending})
    }

}

const editCouponDetails = async(req,res)=>{
    const editCoupon = await CouponModel.findOne({_id:req.query.id});
    res.render("admin/edit-coupon-details",{editCoupon});
}

const editCoupon = async(req,res)=>{
    const {id,couponName,couponType,percentageValue,description} = req.body;
    const updateData = {
        couponCode:couponName,
        couponType:couponType,
        offerPercentage:percentageValue,
        description:description
    }
    const couponExist = await CouponModel.findOne({_id:id})
    if(couponExist){
        const update = await CouponModel.updateOne({_id:id},{$set: updateData});
        if(update){
            const updated = true;
            const listedCoupon = await CouponModel.find();
            res.render('admin/listed-coupon',{updated,listedCoupon});
        }
    }
}

const deleteCoupon = async(req,res)=>{
    const couponId = req.params.id;
    const deletedCoupon = await CouponModel.deleteOne({_id:couponId});
    if(deletedCoupon){
        const couponDeleted = true;
        const listedCoupon = await CouponModel.find();
        res.render("admin/listed-coupon",{couponDeleted,listedCoupon});
    }else{
        const couponDeletedFailed = true;
        const listedCoupon = await CouponModel.find();
        res.render("admin/listed-coupon",{couponDeletedFailed,listedCoupon});
    }

}
// const walletUpdate = await UserModel.updateOne({ _id: orderDetails.userId }, { $inc: { wallet: orderDetails.amount } });


 module.exports = {
   loginView,
   dashboardView,
   userBlockUnblock,
   adminLogout,
   addCategory,
   addProductView,
   editProductView,
   categoryListView,
   deletedProductsView,
   loginAdmin,
   userList,
   addCategory,
   pendingOrdersView,
   deliveredOrdersView,
   cancelledOrdersView,
   orderDelivered,
   orderShipped,
   orderDetailView,
   addCouponView,
   addNewCoupon,
   couponListView,
   listUnlistCoupon,
   returnPending,
   returnDefective,
   returnNonDefective,
   orderCancel,
   returnAccept,
   editCouponDetails,
   editCoupon,
   deleteCoupon
}  