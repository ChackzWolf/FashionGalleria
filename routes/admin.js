const express = require("express");
const  adminControllers = require("../controllers/adminControllers");
const productControllers = require("../controllers/productControllers")
const {adminLoginChecker,adminLoginVarify} =require("../middlewares/middlewares");
const { upload } = require('../utils/imageHandler')
const router = express.Router();



//Get methods
router.get("/",adminLoginChecker,adminControllers.dashboardView);
router.get("/login",adminLoginVarify,adminControllers.loginView);
router.get("/adminLogout",adminControllers.adminLogout)
router.get("/userList",adminLoginChecker,adminControllers.userList);
router.get("/block-unblock",adminLoginChecker,adminControllers.userBlockUnblock);
router.get("/add-Product",adminLoginChecker,adminControllers.addProductView);
router.get("/edit-product",adminLoginChecker,adminControllers.editProductView);
router.get("/list-unlist-product/:id",adminLoginChecker,productControllers.listUnlistProduct);
router.get("/edit-productDetails",adminLoginChecker,productControllers.editProductDetailsView)
router.get("/delete-product/:id",adminLoginChecker,productControllers.deleteProduct);
router.get("/deleted-products",adminLoginChecker,adminControllers.deletedProductsView)
router.get("/add-category",adminLoginChecker,adminControllers.addCategory);
router.get("/category-list",adminLoginChecker,adminControllers.categoryListView);
router.get("/list-unlist-category",adminLoginChecker,productControllers.listUnlistCategory);
router.get("/pending-orders",adminLoginChecker,adminControllers.pendingOrdersView);
router.get("/delivered-orders",adminLoginChecker,adminControllers.deliveredOrdersView);
router.get("/cancelled-orders",adminLoginChecker,adminControllers.cancelledOrdersView);
router.get("/order-shipped",adminLoginChecker,adminControllers.orderShipped);
router.get("/order-delivered",adminLoginChecker,adminControllers.orderDelivered);



//post methods
router.post("/loginAdmin",adminControllers.loginAdmin);
router.post("/addProduct",upload.array('image',3),productControllers.addProduct)
// router.post("/editProduct",adminControllers.editProduct)
router.post("/edited-productDetails",upload.array('image',3),productControllers.editedProductDetails)
router.post("/addCategory",productControllers.addCategory)


module.exports = router