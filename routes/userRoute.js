const express =require ('express');
const path =require ('path')
// import { fileURLToPath } from 'url';
const session =require ('express-session');
const {  addCart, addReview, contactUS, createPayment, deleteCart, loadAdmin, loadOfferPage, loadProductTracker, loadResetPassword, loadUserAboutUs, loadUserCart, loadUserCheckout, loadUserContactUs, loadUserHistory, loadUserLogin, loadUserPolicy, loadUserProductBtid, loadUserProductSide, loadUserProfile, loadUserSignup, loadUserTerms, loadUserWishlist, loginUser, logout, Paymentcheckout, register, requestPasswordReset, resetPassword, resetPasswordLimiter, search, updateCartQuantity, updateUser, validateCoupon, verifyPayment } =require ('../controllers/userController.js');
const { adminSession, userSession } =require ('../config/session.js');
const { isLogin } =require ('../middleware/userAuth.js');



const userRoute = express.Router();


// Add session middleware to your app
userRoute.use(session({
    secret: userSession, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));



userRoute.use((req, res, next) => {
    req.app.set('views', path.join(__dirname, '../views/user')); 
    res.locals.layout = '../layout/userLayout';
    next();
});


userRoute.use((req, res, next) => {
    res.locals.userId = req.session.user_id; 
   
    
    next();
  });
  
  userRoute.use((req, res, next)=> {
      const currentUrl = req.originalUrl;
      res.locals.pathname = req.path;
      if (!req.session.user_id && req.method === 'GET' &&  !['/login', '/signup'].includes(currentUrl)) {
        req.session.originalUrl = req.originalUrl; 
        
      }
      next();
    })

    // userRoute.use('/*',(req, res) => {
    //   res.status(404).render('404');  
    // });
    
    userRoute.use((req, res, next) => {
      res.locals.isLoggedIn = req.session.user_id ? true : false;
      next();
    });
    


userRoute.get("/",loadAdmin);
userRoute.get("/about-us",loadUserAboutUs);
userRoute.get("/contact-us",loadUserContactUs);
userRoute.get("/cart",isLogin,loadUserCart);
userRoute.get("/checkout",isLogin,loadUserCheckout);
userRoute.get("/terms-condition",loadUserTerms);
userRoute.get("/profile",isLogin,loadUserProfile);
userRoute.get("/history",isLogin,loadUserHistory);

userRoute.get("/privacy-policy",loadUserPolicy);
userRoute.get("/login",loadUserLogin);
userRoute.get("/sign-up",loadUserSignup);
userRoute.get("/logout",logout);
userRoute.get("/product-side",loadUserProductSide)
userRoute.get("/search",search)
userRoute.get("/resetPassword/:token",loadResetPassword)


userRoute.get('/product-single/:id', loadUserProductBtid);
userRoute.post('/cart-update/:productId',isLogin, updateCartQuantity);



userRoute.post('/add-review',isLogin,addReview);
userRoute.post('/add-to-cart',isLogin,addCart)
userRoute.post('/cart-delete/:id',isLogin,deleteCart)
userRoute.post('/register',register)
userRoute.post('/userlogin',loginUser)
userRoute.post('/paymentcheckout',isLogin,Paymentcheckout)
userRoute.post('/apply-coupon',validateCoupon);
userRoute.post('/contactus',contactUS);
userRoute.post('/create-order',isLogin,createPayment)
userRoute.post('/payment-success',verifyPayment)

userRoute.post("/profile/update", updateUser);


userRoute.post('/requestPasswordReset',resetPasswordLimiter, requestPasswordReset);

userRoute.post('/resetPassword/:token', resetPassword);

module.exports= userRoute