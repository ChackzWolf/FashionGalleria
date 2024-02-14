const express = require("express")
const {userLoginVarify,userLoginChecker,otpSend,userStatusCheck} = require("../middlewares/middlewares");
const userControllers = require("../controllers/userControllers")
const router = express.Router();

//Get methods
router.get("/",userLoginVarify,userStatusCheck,userControllers.indexView);
router.get("/login",userLoginChecker,userControllers.loginView);
router.get("/signup",userLoginChecker,userControllers.signupView);
router.get("/userLogout",userLoginVarify,userControllers.userLogout);

router.get("/productlist",userStatusCheck,userControllers.productList); // I have to check about this.

router.get("/shop",userLoginVarify,userStatusCheck,userControllers.shopView);
router.get("/product-details",userStatusCheck,userControllers.productDetailsView);
router.get("/blog",userLoginVarify,userStatusCheck,userControllers.blogView);
router.get("/contact",userStatusCheck,userControllers.contactView);
router.get("/otp",userControllers.otpView);
// router.get("/otp",otpSend,userControllers.otpView);
router.get("/cart",userLoginVarify,userStatusCheck,userControllers.cartView);

router.get("/addToCart",userLoginVarify,userControllers.addToCart);
router.get("/report",userStatusCheck,userControllers.loadReport)
router.get("/report-generate",userStatusCheck,userControllers.generateReport)

router.get("/checkout",userStatusCheck,userLoginVarify,userControllers.checkout);
router.get("/delete-cart-item",userStatusCheck,userLoginVarify,userControllers.deleteCartItem);
router.get("/user-profile",userStatusCheck,userLoginVarify,userControllers.userProfile);
router.get("/remove-new-address-user",userStatusCheck,userLoginVarify,userControllers.removeAddress);
router.get("/remove-new-address-checkout",userLoginVarify,userStatusCheck,userControllers.removeAddressCheckout);
router.get("/default-address",userLoginVarify,userStatusCheck,userControllers.defaultAddress);

router.get("/order-response",userStatusCheck,userControllers.orderResponseView);
router.get("/orders",userLoginVarify,userStatusCheck,userControllers.ordersView);
router.get("/order-detail-view",userStatusCheck,userControllers.orderDetailView);
router.get("/cancel-user-order",userStatusCheck,userControllers.cancelUserOrder);
router.get("/return-user-order",userStatusCheck,userControllers.returnUserOrder)
router.get('/email-verify',userControllers.emailVerify);
router.get("/otp-pass",otpSend,userControllers.otpViewPass);
router.get("/transaction-order-details-view",userStatusCheck,userControllers.transactionOrderDetailView);
router.get("/wallet-history",userStatusCheck,userControllers.walletHistory);



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

// router.post("/change-password",userControllers.changePassword);

module.exports = router;