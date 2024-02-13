const AdminModel = require("../models/Admin");
const session = require("express-session");
const router = require("../routes/user");
const UserModel = require("../models/User");
const ProductModel = require("../models/Product");
const CategoryModel = require("../models/Category");
const Swal = require('sweetalert2');
const OrderModel = require("../models/Order");
const CouponModel = require("../models/Coupon");
const BannerModel = require("../models/Banner");
const { findOne } = require("../models/Address");
const formatDate = require("../utils/dateGenerator");
const adminFunc = require("../controllers/adminFunctions");
const puppeteer = require("puppeteer")
const fileHandler = require("../utils/files")


//  const dashboardView = (req,res) =>{
//     res.render("admin/index")
//  }


 const dashboardView = async (req, res) => {
    try {
        let totalDeliveredAmount = 0;
        // const recentOrders = await OrderModel.find({ status: 'delivered' })
        const recentOrders = await OrderModel.find({ status: 'delivered' }).populate('userId');
        const countOfDeliveredOrders = await OrderModel.countDocuments({ status: 'delivered' });
        const countOfUsers = await UserModel.countDocuments();
        const user = await UserModel.find({_id:recentOrders.userId});
        
        recentOrders.forEach(order => {
            totalDeliveredAmount += order.amount;
        });

        res.render("admin/index", { recentOrders, countOfDeliveredOrders, totalDeliveredAmount, countOfUsers,user })
    } catch (err) {
        res.status(500).render("user/error-handling");
    }
}

const adminChartLoad = async (req, res) => {
    try {
        const data = await OrderModel.find()
        res.json(data);
    } catch (error) {
        res.status(500).render("user/error-handling");
    }
};

 const loginView = (req,res)=>{
    try{
        res.render("admin/login")
    }catch(error){
        res.status(500).render("user/error-handling");
    }
   
 }
 
 const adminLogout = (req,res)=>{
    try{
       req.session.destroy((err)=>{
           console.log("session deleted")
           res.redirect("/admin/login")
           }) 
    }catch{
       res.status(500).render("user/error-handling");
    }
}

 const userList = async (req,res)=>{
    try{
        const users = await UserModel.find()
        Swal.fire("SweetAlert2 is working!");
        res.render("admin/user-list",{users})
    }catch(error){
        res.status(500).render("user/error-handling");
    }

 }


const addCategory = async(req,res)=>{
    try{
        const category = await CategoryModel.find();
        res.render("admin/add-category",{category});
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}


const addProductView = async(req,res)=>{
    try{
        const category = await CategoryModel.find()
        res.render("admin/add-product",{category})
    }catch(error){
        res.status(500).render("user/error-handling");
    }

}


const editProductView = async(req,res) =>{
    try{
        const products = await ProductModel.find({deleteStatus:false}).populate('category');
        const category = await CategoryModel.find()
        res.render("admin/edit-product",{products,category});
    }catch(error){
        res.status(500).render("user/error-handling");
    }

}


const userBlockUnblock = async (req,res) => {
    try{
        const userData = await UserModel.findOne({_id: req.query.id});
        await UserModel.updateOne({_id:req.query.id},{$set: {status: !userData.status}})
        const users = await UserModel.find()
        res.render("admin/user-list",{users});
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}
 

const loginAdmin = async (req,res)=>{
    try{
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
    }catch(error){
        res.status(500).render("user/error-handling"); 
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
const categoryListView = async(req,res)=>{
    try{
        const categories = await CategoryModel.find({deleteStatus:false});
        res.render("admin/category-list",{categories});
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}

const orderDelivered = async(req,res)=>{
    try{
        const orderId = req.query.id;
        const productId = req.query.pro_id
        console.log(orderId);
        const product = await OrderModel.findOne({_id:orderId})
        if(product){
          console.log('order found',product)
        //   const deliveredOrder = await OrderModel.updateOne({_id:pendingOrderId},{$set:{status:'delivered'}});
            const deliveredOrder = await OrderModel.updateOne(
                {
                    _id:orderId,  'products._id':productId
                },
                { 
                    $set: { 'products.$.status': 'delivered' }
                });
    
            if(deliveredOrder){ 
                console.log('order Delivered')
                // const pendingOrders = await OrderModel.find({status:{$in:['pending','shipped']}});
                const pendingOrders = await OrderModel.find({
                    products: {
                        $elemMatch: {
                            status: { $in: ['pending', 'shipped'] }
                        }
                    }
                });
                  
                res.render("admin/pending-orders",{pendingOrders});
            }
        }else{
            console.log('order not found')
        }
    }catch(error){
        res.status(500).render("user/error-handling")
    }

}

const orderShipped = async(req,res)=>{
    try{
        const orderId = req.query.id;
        const productId = req.query.pro_id;
    
        console.log(orderId);
        const order = await OrderModel.findOne({_id:orderId})
        if(order){
            console.log('order found',order);
            const shippedOrders = await OrderModel.updateOne({_id:orderId,'products._id':productId},{ $set: { 'products.$.status': 'shipped' }});
            if(shippedOrders){ 
                console.log('order has been shipped');
                // const pendingOrders = await OrderModel.find({status:{$in:['pending','shipped']}});
                const pendingOrders = await OrderModel.find({
                    products: {
                        $elemMatch: {
                            status: { $in: ['pending', 'shipped'] }
                        }
                    }
                });
                res.render("admin/pending-orders",{pendingOrders});
            }
        }
    }catch(error){
        res.status(500).render("user/error-handling")
    }

}


const pendingOrdersView = async(req,res)=>{
    try{
        const pendingOrders = await OrderModel.find({
            products: {
                $elemMatch: {
                    status: { $in: ['pending', 'shipped'] }
                }
            }
        });
      
        res.render("admin/pending-orders",{pendingOrders});
    }catch(error){
        res.status(500).render("user/error-handling") 
    }
}


const deliveredOrdersView = async(req,res)=>{
    try{
        const deliveredOrders = await OrderModel.find({status:"delivered"})
        res.render("admin/delivered-orders",{deliveredOrders});
    }catch(error){
        res.status(500).render("user/error-handling") 
    }

}




const cancelledOrdersView = async(req,res)=>{
    try{
        const cancelledOrders = await OrderModel.find({status: "cancelled"});
        res.render("admin/cancelled-orders",{cancelledOrders});
    }catch(error){
        res.status(500).render("user/error-handling") 
    }
}


const orderDetailView = async(req,res)=>{
    try{
        const orderId = req.query.id;
        const orderDetails = await OrderModel.findById({_id:orderId});
        res.render("admin/order-details",{orderDetails})
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}

// to add new coupon page
const addCouponView = (req,res) =>{
    try{
        res.render("admin/add-coupon");
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}

// to add new coupon fucntion
const addNewCoupon = async(req,res)=>{
    try{
        const {couponName,couponType,description} = req.body;
        var percentageValue =req.body.percentageValue;
    
        const data = {
            couponCode:couponName,
            offerPercentage:percentageValue,
            couponType:couponType,
            description:description,
            listStatus:true
        }
    
        console.log(typeof percentageValue,'percentageValue')
        console.log(couponName, 'couponName')
        if(couponName !== '' && typeof percentageValue !== String && couponType !== undefined ){
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
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}

const couponListView = async(req,res)=>{
    try{
        const listedCoupon = await CouponModel.find();
        res.render("admin/listed-coupon",{listedCoupon});
    }catch(error){
        res.status(500).render("user/error-handling") 
    }

}

const listUnlistCoupon = async(req,res)=>{
    try{
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
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}


const returnPending =  async (req,res)=>{
    try{
        const returnPending = await OrderModel.find({
            products: {
                $elemMatch: {
                    status: { $in: ['returnNonDefective', 'returnDefective'] }
                }
            }
        }) 
        res.render("admin/return-pending",{returnPending})
    }catch{
        res.status(500).render("user/error-handling")
    }
}


const returnDefective = async(req,res)=>{
    try{
        const returnDefective = await OrderModel.find({status:'returnAcceptDef'})
        res.render("admin/return-defective",{returnDefective})
    }catch(error){
        res.status(500).render("user/error-handling") 
    }
}


const returnNonDefective = async(req,res)=>{
    try{
        const returnAcceptNonDef = await OrderModel.find({status:'returnAcceptNonDef'})
        res.render("admin/return-non-defective",{returnAcceptNonDef});
    }catch(error){
        res.status(500).render("user/error-handling") 
    }
}

const orderCancel = async(req,res)=>{//// I have made some terribl changes here 
    try{
        const orderId = req.query.orderId;
        const productId = req.query.productId;
        
        console.log(orderId,'orderId')
        console.log(productId,'proudctId')
    
        // const defective = await OrderModel.findOne({orderId:orderId,status:'returnDefective'})
        const defective = await OrderModel.find({
            products: {
                $elemMatch: {
                    status:'returnDefective'
                }
            }
        });
        // const nonDefective = await OrderModel.findOne({orderId:orderId,status:'returnNonDefective'}); 
        const nonDefective = await OrderModel.find({
            products: {
                $elemMatch: {
                    status: 'returnNonDefective'
                }
            }
        });
        if(defective){
            // const updated = await OrderModel.updateOne({orderId:orderId},{$set:{status:'returnAcceptDef'}})
            const updated = await OrderModel.updateOne(
                {
                    _id:orderId,  'products._id':productId
                },
                { 
                    $set: { 'products.$.status': 'returnAcceptDef' }
                });
        }else{
            const updated = await OrderModel.updateOne({orderId:orderId},{$set:{status:'returnAcceptNonDef'}})
        }
    }catch(error){
        res.status(500).render("user/error-handling")
    }
}//// I have made some terribl changes here 


const returnAccept = async (req, res) => {
    try {
        const orderId = req.query.orderId
        const productId = req.query.productId
        console.log(productId,'productId');
        console.log(orderId,'orderId');
    
        const status = req.query.status
        const order = await OrderModel.findOne({_id:orderId});
        // const returnPending = await OrderModel.find({status:{$in:['returnNonDefective','returnDefective']}})
        const returnPending = await OrderModel.find({
            products: {
                $elemMatch: {
                    status: { $in: ['returnNonDefective', 'returnDefective'] }
                }
            }
        });
        const orderDetails = await OrderModel.findOne({_id:orderId});
        const currentDate = new Date();
        const formattedDate = formatDate(currentDate);
    
        const product = await OrderModel.find({
            products: {
                $elemMatch: {
                    _id: productId
                }
            }
        }, {
            'products.$':  1 // Projection to get the matched product
        }).lean(); // Convert the result to plain JavaScript objects
        
        // Access the price of the first matching product
        const price = product.products[0].price;
    
        if(status === 'returnDefective'){
            console.log('Status:',status)
        //   const orderUpdate = await OrderModel.updateOne({ _id:orderId},{$set:{status:'returnAcceptDef'}})
    
            const orderUpdate = await OrderModel.updateOne(
                {
                    _id:orderId,  'products._id':productId
                },
                { 
                    $set: { 'products.$.status': 'returnAcceptDef' }
                });
            
        }else{
          console.log('Status:',status)
        //   const orderUpdate = await OrderModel.updateOne({ _id:orderId},{$set:{status:'returnAcceptNonDef'}})
          const orderUpdate = await OrderModel.updateOne(
            {
                _id:orderId,  'products._id':productId
            },
            { 
                $set: { 'products.$.status': 'returnAcceptNonDef' }
            });
        }
        const transaction = {
            transaction:"Credited",
            amount:price,
            orderId:orderDetails.orderId,
            date:formattedDate
        }
        console.log(price,'price')
        const walletUpdate = await UserModel.updateOne({ _id: orderDetails.userId }, { $inc: { wallet: orderDetails.amount } }); // Here I'm adding back the amount to the user's wallet.
        const walletHistory = await UserModel.updateOne({_id:orderDetails.userId},{$push:{walletHistory:transaction}}) // here I'm journaling transaction history to the user model
    
    
      
        // Check the result of the update
        if (walletUpdate) {
          console.log(walletUpdate)
            res.render("admin/return-pending",{returnPending});
        } else {
            res.render("admin/return-pending",{returnPending});
        }

    } catch (err) {
        res.status(500).render("user/error-handling");
    }
}


const editCouponDetails = async(req,res)=>{
    try{
        const editCoupon = await CouponModel.findOne({_id:req.query.id});
        res.render("admin/edit-coupon-details",{editCoupon});
    }catch(error){

    }

}

const editCoupon = async(req,res)=>{
    try{
        const {id,couponName,couponType,percentageValue,description} = req.body;
        const updateData = {
            couponCode:couponName,
            couponType:couponType,
            offerPercentage:percentageValue,
            description:description
        }
        if(couponName !== '' && couponType !== undefined && percentageValue >0 ){
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
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}

const deleteCoupon = async(req,res)=>{
    try{
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
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}


const editCategoryView = async(req,res)=>{
    try{
        console.log(req.query.id,'iddd');
        const editCategory = await CategoryModel.findOne({_id:req.query.id});
        console.log(editCategory);
        res.render("admin/edit-category-details",{editCategory})
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}

// const walletUpdate = await UserModel.updateOne({ _id: orderDetails.userId }, { $inc: { wallet: orderDetails.amount } });
const editCategory = async(req,res)=>{
    try{
        const {id,name,offer} = req.body;
        let offerNum = parseFloat(offer);
        console.log('id',id ,'name',name ,'offer ',offer)
        const updateData = {
            name:name,
            listStatus:true,
            offer:offerNum
        }
      
      
        console.log(updateData)
        
      //   const updateCategory = await CategoryModel.updateOne({_id:id},{$set:{updateData}})
        const update = await CategoryModel.updateOne({_id:id},{$set:{name:name,offer:offerNum}});
        console.log(update,'update');
        if(offerNum >0){
          const productsUpdate = await ProductModel.updateMany(
              { category: id },
              [
                 {
                   $set: {
                     offerPrice: {
                       $toInt: {
                         $subtract: ["$price", { $multiply: ["$price", { $divide: [offerNum,  100] }] }]
                       }
                     }
                   }
                 }                            
              ]
            );
        }else{
              console.log('was 0')
              const backtoback = await ProductModel.updateMany({category:id},{$set:{offerPrice:0}});
              console.log(backtoback,'000')
        } 
          if(update){
              console.log('updated')
              let success = true
              res.redirect(`/admin/category-list?success=${success}`)
          }else{
              console.log('failed');  
          }
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}   


const productOfferList = async(req,res)=>{
    try{
        const productsOffer = await ProductModel.find({productOffer:true});
        const productsNoOffer = await ProductModel.find({productOffer:false});
        res.render("admin/product-offer-list",{productsOffer,productsNoOffer});
    }catch(error){
        res.status(500).render("user/error-handling");
    }
}

const addPrdouctOfferView = async(req,res)=> {
    try{
        const productId = req.query.id;
        const singleProduct = await ProductModel.findOne({_id:productId});
        res.render("admin/add-product-offer-view",{singleProduct});
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}

const addProductOffer = async(req,res)=>{
    try{
        const {id,offerPercentage} = req.body;
        console.log(req.body.id,'id');
        console.log(offerPercentage,'offer percentage');
        const product = await ProductModel.findOne({_id:id});
        // const offer = product.price * offerPercentage / 100
    
        const offerPrice = adminFunc.reducePercentageFromPrice(product.price,offerPercentage);
        if(offerPercentage > 0 ){
            const addOffer = await ProductModel.updateOne({_id:id},{$set:{offerPrice:offerPrice,productOffer:true}})
            if(addOffer){
                const msg = true;
                const productsOffer = await ProductModel.find({productOffer:true});
                const productsNoOffer = await ProductModel.find({productOffer:false});
                res.render("admin/product-offer-list",{productsOffer,productsNoOffer,msg});
            }else{
                const errMsg = true;
                const singleProduct = await ProductModel.findOne({_id:id});
                res.render("admin/add-product-offer-view",{singleProduct,errMsg});
            }
        }else{
            const empty =true;
            const singleProduct = await ProductModel.findOne({_id:id});
            res.render("admin/add-product-offer-view",{singleProduct,empty});
        }
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }

}

const editProductOfferView = async(req,res)=>{
    try{
        const productId = req.query.id;
        const singleProduct = await ProductModel.findOne({_id:productId});
        const percentage = adminFunc.calculatePercentageDifference(singleProduct.price, singleProduct.offerPrice)
        res.render("admin/edit-product-offer-view",{singleProduct,percentage});
    }catch{
        res.status(500).render("user/error-handling"); 
    }
}


const removeProductOffer = async(req,res)=>{
    try{
        const productId = req.params.id;
        console.log(productId)
        const removeProduct = await ProductModel.updateOne({_id:productId},{$set:{offerPrice:0,productOffer:false}});
        const removed = true;
        const productsOffer = await ProductModel.find({productOffer:true});
        const productsNoOffer = await ProductModel.find({productOffer:false});
        res.render("admin/product-offer-list",{productsOffer,productsNoOffer,removed})
    }catch{
        res.status(500).render("user/error-handling"); 
    }
}

const mainBannerView = async(req,res)=>{
    try{
        const banner = await BannerModel.findOne()
        res.render("admin/main-banner-view",{banner})
    }catch{
        res.status(500).render("user/error-handling"); 
    }
}


const addBanner = async(req,res)=>{
    try{
        const {caption,description} = req.body;
        const images = req.files
                    .filter((file) =>
                          file.mimetype === "image/png" || file.mimetype === "image/jpeg" || file.mimetype === "image/webp")
                    .map((file) => file.filename);
        console.log(images,'imagesdd')
        if(images.length === 1){
            const data = {
                caption:caption,
                description:description,
                imageUrl:images
                
            }
    
            console.log('data',data);
            let banner = await BannerModel.create(data);
            console.log(banner);
    
        }else{
            const noImage = true;
            res.render("admin/main-banner-view",{noImage})
        }
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}


const bannerListView = async(req,res)=>{
    try{
        const banner = await BannerModel.find();
        res.render("admin/banner-list",{banner})
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}

const listUnlistBanner = async(req,res)=>{
    try{
        const bannerId = req.params.id;
        const singleBanner = await BannerModel.findById({_id:bannerId});
        if(singleBanner){
            const updateBanner = await BannerModel.updateOne({_id:bannerId},{$set:{listStatus:!singleBanner.listStatus}});
            if(updateBanner){
                console.log('updated')
                const banner = await BannerModel.find();
                res.render("admin/banner-list",{banner})
            }else{
                const errMsg = true
                const banner = await BannerModel.find()
                res.render("admin/banner-list",{banner,errMsg})
            }
        }else{
            const errMsg = true
            const banner = await BannerModel.find()
            res.render("admin/banner-list",{banner,errMsg})
        }
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }

}

const deleteBanner = async(req,res)=>{
    try{
        const bannerId = req.params.id;
        const chosenBanner = await BannerModel.findById({_id:bannerId})
        if(!chosenBanner){
            return res.status(404).json({message: "banner not found."});
        }else{
            // Delete each image associated with the product
            for (const imageUrl of chosenBanner.imageUrl) {
                fileHandler.deleteFile(imageUrl);
            }
            await BannerModel.deleteOne({_id:bannerId});
            console.log('Deleted')
            const banner = await BannerModel.find();
            res.render("admin/banner-list",{banner})
            
        }
    }catch(error){
        res.status(500).render("user/error-handling"); 
    }
}



const generateReport = async (req, res) => {

    try {
        console.log('1')
        const browser = await puppeteer.launch({
          headless: false //
        });
        console.log('2')

        const page = await browser.newPage();
        await page.goto(`${req.protocol}://${req.get("host")}` + "/report", {
          waitUntil: "networkidle2"
        })
        console.log('3')

        await page.setViewport({ width: 1680, height: 1050 })
        const todayDate = new Date()
        const pdfn = await page.pdf({
          path: `${path.join(__dirname, "../public/files", todayDate.getTime() + ".pdf")}`,
          printBackground: true,
          format: "A4"
        })
        console.log('4')

        if (browser) await browser.close()
        console.log('if browser')

        const pdfURL = path.join(__dirname, "../public/files", todayDate.getTime() + ".pdf")
        res.download(pdfURL, function (err) {
          if (err) {
              console.log('err')
            res.status(500).render("user/error-handling");
          }
        })
    } catch (error) {
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
  }

const listUnlistCategory = async (req,res)=>{
    try{
        const categoryId = req.params.id;
        const category = await CategoryModel.findById({_id:categoryId});
        console.log(category.listStatus)
        if(category.listStatus){
    
            const updateCategory = await CategoryModel.updateOne({_id:categoryId},{$set:{listStatus:false}});
            const updateProducts = await ProductModel.updateMany({category:categoryId},{$set:{listStatus:false}})
            console.log('false')
        }else{
            const updateCategory = await CategoryModel.updateOne({_id:categoryId},{$set:{listStatus:true}});
            const updateProducts = await ProductModel.updateMany({category:categoryId},{$set:{listStatus:true}})
            console.log('true')
        }
        const categories = await CategoryModel.find({deleteStatus:false})
        res.render("admin/category-list",{categories})
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
}

const deleteCategory = async (req,res)=>{
    try{
        const categoryId = req.params.id;
        const deleteCategory = await CategoryModel.updateOne({_id:categoryId},{$set:{deleteStatus:true}});
    
        if(deleteCategory){
            const deleteProducts = await CategoryModel.updateMany({category:categoryId},{$set:{deleteStatus:true}});
            if(deleteProducts){
                const deleted = true
                const categories = await CategoryModel.find({deleteStatus:false});
            }
        }
    }catch(error){
        res.status(500).json({ status: false, error: 'Something went wrong on the server.' });
    }
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
    deleteCoupon,
    editCategoryView,
    editCategory,
    productOfferList,
    addPrdouctOfferView,
    addProductOffer,
    editProductOfferView,
    removeProductOffer,
    mainBannerView,
    addBanner,
    bannerListView,
    listUnlistBanner,
    adminChartLoad,
    generateReport,
    deleteBanner,
    listUnlistCategory,
    deleteCategory

}  