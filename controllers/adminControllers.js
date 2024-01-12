const AdminModel = require("../models/Admin");
const session = require("express-session");
const router = require("../routes/user");
const UserModel = require("../models/User");
const ProductModel = require("../models/Product");
const CategoryModel = require("../models/Category");
const Swal = require('sweetalert2');
const OrderModel = require("../models/Order");


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
   orderShipped
}  