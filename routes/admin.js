const express = require("express");
const  adminControllers = require("../controllers/adminControllers");
const userControllers = require("../controllers/userControllers")

const productControllers = require("../controllers/productControllers")
const {adminLoginChecker,adminLoginVarify} =require("../middlewares/middlewares");
const { upload } = require('../utils/imageHandler')
const router = express.Router();


 /////////////////////////////////////////////////////////////////////////////////////////////
//------------------------------------Get methods------------------------------------------//


router.get("/login",adminLoginVarify,adminControllers.loginView);
router.get("/adminLogout",adminControllers.adminLogout)
router.get("/userList",adminLoginChecker,adminControllers.userList);
router.get("/block-unblock",adminLoginChecker,adminControllers.userBlockUnblock);

//dashboard
router.get("/",adminLoginChecker,adminControllers.dashboardView);
router.get("/adminChartLoad", adminControllers.adminChartLoad);

//product management
router.get("/add-Product",adminLoginChecker,adminControllers.addProductView);
router.get("/edit-product",adminControllers.editProductView);
router.get("/list-unlist-product/:id",adminLoginChecker,productControllers.listUnlistProduct);
router.get("/edit-productDetails",adminLoginChecker,productControllers.editProductDetailsView)
router.get("/delete-product/:id",adminLoginChecker,productControllers.deleteProduct);
router.get("/deleted-products",adminLoginChecker,adminControllers.deletedProductsView)

//category management
router.get("/add-category",adminLoginChecker,adminControllers.addCategory);
router.get("/category-list",adminLoginChecker,adminControllers.categoryListView);
router.get("/edit-category",adminControllers.editCategoryView);
router.get("/list-unlist-category/:id",adminControllers.listUnlistCategory)
router.get("/delete-category",adminControllers.deleteCategory);
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

//return product managment
router.get("/return-pending",adminControllers.returnPending);
router.get("/return-defective",adminControllers.returnDefective);
router.get("/return-non-defective",adminControllers.returnNonDefective);
router.get("/order-cancelled",adminControllers.orderCancel);
router.get("/return-accept",adminControllers.returnAccept);

//offer management
router.get("/product-offer",adminControllers.productOfferList);
router.get("/add-product-offer",adminControllers.addPrdouctOfferView);
router.get("/edit-product-offer",adminControllers.editProductOfferView);
router.get("/remove-product-offer/:id",adminControllers.removeProductOffer);

//banner management
router.get("/add-banner-view",adminControllers.mainBannerView);
router.get("/banner-list",adminControllers.bannerListView)
router.get("/list-unlist-banner/:id",adminControllers.listUnlistBanner);
router.get("/delete-banner/:id",adminControllers.deleteBanner);



 /////////////////////////////////////////////////////////////////////////////////////////////
//------------------------------------post methods-----------------------------------------//

router.post("/loginAdmin",adminControllers.loginAdmin);

//products
router.post("/addProduct",upload.array('image',3),productControllers.addProduct)
router.post("/edited-productDetails",upload.array('image',3),productControllers.editedProductDetails)

//category
router.post("/addCategory",productControllers.addCategory)
router.post("/editCategory",adminControllers.editCategory)

//coupon
router.post("/addNewCoupon",adminControllers.addNewCoupon)
router.post("/edit-coupon",adminControllers.editCoupon)

//offer
router.post("/add-product-offer",adminControllers.addProductOffer);

//banner
router.post("/add-banner",upload.array('image',3),adminControllers.addBanner);



module.exports = router