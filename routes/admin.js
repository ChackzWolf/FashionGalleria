const express = require("express");
const  adminControllers = require("../controllers/adminControllers");
const productControllers = require("../controllers/productControllers")
const {adminLoginChecker,adminLoginVarify} =require("../middlewares/middlewares");
const { upload } = require('../utils/imageHandler')
const router = express.Router();



//------------------------------------Get methods------------------------------------------

router.get("/",adminLoginChecker,adminControllers.dashboardView);
router.get("/login",adminLoginVarify,adminControllers.loginView);
router.get("/adminLogout",adminControllers.adminLogout)
router.get("/userList",adminLoginChecker,adminControllers.userList);
router.get("/block-unblock",adminLoginChecker,adminControllers.userBlockUnblock);

//product management
router.get("/add-Product",adminLoginChecker,adminControllers.addProductView);
router.get("/edit-product",adminLoginChecker,adminControllers.editProductView);
router.get("/list-unlist-product/:id",adminLoginChecker,productControllers.listUnlistProduct);
router.get("/edit-productDetails",adminLoginChecker,productControllers.editProductDetailsView)
router.get("/delete-product/:id",adminLoginChecker,productControllers.deleteProduct);
router.get("/deleted-products",adminLoginChecker,adminControllers.deletedProductsView)

//category management
router.get("/add-category",adminLoginChecker,adminControllers.addCategory);
router.get("/category-list",adminLoginChecker,adminControllers.categoryListView);
router.get("/list-unlist-category",adminLoginChecker,productControllers.listUnlistCategory);

//order management
router.get("/pending-orders",adminLoginChecker,adminControllers.pendingOrdersView);
router.get("/delivered-orders",adminLoginChecker,adminControllers.deliveredOrdersView);
router.get("/cancelled-orders",adminLoginChecker,adminControllers.cancelledOrdersView);
router.get("/order-shipped",adminLoginChecker,adminControllers.orderShipped);
router.get("/order-delivered",adminLoginChecker,adminControllers.orderDelivered);
router.get("/order-detail-view",adminLoginChecker,adminControllers.orderDetailView)

//coupon management
router.get("/add-coupon",adminControllers.addCouponView);
router.get("/coupon-list",adminControllers.couponListView);
router.get("/list-unlist-coupon/:id",adminControllers.listUnlistCoupon);
router.get("/edit-couponDetails",adminControllers.editCouponDetails)
router.get("/delete-coupon/:id",adminControllers.deleteCoupon);

//return product managment;
router.get("/return-pending",adminControllers.returnPending);
router.get("/return-defective",adminControllers.returnDefective);
router.get("/return-non-defective",adminControllers.returnNonDefective);
router.get("order-cancelled",adminControllers.orderCancel);
router.get("/return-accept",adminControllers.returnAccept);




//---------------------------------------post methods-----------------------------------------
router.post("/loginAdmin",adminControllers.loginAdmin);
router.post("/addProduct",upload.array('image',3),productControllers.addProduct)
// router.post("/editProduct",adminControllers.editProduct)
router.post("/edited-productDetails",upload.array('image',3),productControllers.editedProductDetails)
router.post("/addCategory",productControllers.addCategory)
router.post("/addNewCoupon",adminControllers.addNewCoupon)
router.post("/edit-coupon",adminControllers.editCoupon)


module.exports = router