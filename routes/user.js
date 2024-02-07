const express = require("express")
const {userLoginVarify,userLoginChecker,otpSend} = require("../middlewares/middlewares");
const userControllers = require("../controllers/userControllers")
const router = express.Router();



//Get methods
router.get("/",userLoginVarify,userControllers.indexView);
router.get("/login",userLoginChecker,userControllers.loginView);
router.get("/signup",userLoginChecker,userControllers.signupView);
router.get("/userLogout",userLoginVarify,userControllers.userLogout);
router.get("/productlist",userControllers.productList); // I have to check about this.
router.get("/shop",userLoginVarify,userControllers.shopView);
router.get("/product-details",userControllers.productDetailsView);
router.get("/blog",userLoginVarify,userControllers.blogView);
router.get("/contact",userControllers.contactView);
router.get("/otp",userControllers.otpView);
// router.get("/otp",otpSend,userControllers.otpView);
router.get("/cart",userLoginVarify,userControllers.cartView);
router.get("/addToCart",userLoginVarify,userControllers.addToCart);
router.get("/checkout",userLoginVarify,userControllers.checkout);
router.get("/delete-cart-item",userLoginVarify,userControllers.deleteCartItem);
router.get("/user-profile",userLoginVarify,userControllers.userProfile);
router.get("/remove-new-address-user",userLoginVarify,userControllers.removeAddress);
router.get("/remove-new-address-checkout",userLoginVarify,userControllers.removeAddressCheckout);
router.get("/default-address",userLoginVarify,userControllers.defaultAddress);
router.get("/order-response",userControllers.orderResponseView);
router.get("/orders",userLoginVarify,userControllers.ordersView);
router.get("/order-detail-view",userControllers.orderDetailView);
router.get("/cancel-user-order",userControllers.cancelUserOrder);
router.get('/email-verify',userControllers.emailVerify);
router.get("/otp-pass",otpSend,userControllers.otpViewPass);
router.get("/transaction-order-details-view",userControllers.transactionOrderDetailView);
router.get("/wallet-history",userControllers.walletHistory);


//post methods  ------------------
router.post("/signupUser",userControllers.signupUser);
router.post("/loginUser",userControllers.loginUser);
router.post("/otpVerification",userControllers.otpVerification)
router.post("/change-product-quantity",userControllers.changeProductQuantity);
router.post("/add-new-address",userControllers.addNewAddress);
router.post("/edit-profile",userControllers.editProfile);
router.post("/change-password",userControllers.changePassword);
router.post("/place-order",userControllers.placeOrder);
router.post("/email-verify-otp",userControllers.emailVerifyOtp);
router.post("/changePassword",userControllers.createNewPasswrod);
router.post("/otp-verify-passwordChange",userControllers.otpVerificationPassword);
router.post("/verify-payment",userControllers.verifyPayment);
router.post("/add-new-address-checkout",userControllers.addNewAddressCheckout);
router.post("/coupon-validate",userControllers.couponValidate);
router.post("/filtered-shop",userControllers.filteredShop);
// router.post("/change-password",userControllers.changePassword);

module.exports = router;