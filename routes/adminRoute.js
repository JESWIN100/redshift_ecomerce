const express =require ('express')
const {  addUser, AdminAddProduct, createAdmin, createCategory, createCoupon, deleteCategoryById, deleteCouponById, deleteProduct, errrorPage, getAllCategories, getAllProducts, getProductById, getUsers, homePage, loadCouponList, loadEditService, loadGetMainCategory, loadGetOrdersNewOrder, loadGetOrdersOrderDetails, loadGetOrdersOrderHistory, loadGetOrdersOrderInvoice, loadGetProductsAdd, loadGetProductsdetail, loadGetProductsGrid, loadGetProductsList, loadGetSubCategory, loadGetUserGrid, loadGetUserList, loadGetUserProfile, loadLogin,  loadProfile,  loadSignUp,  loginAdmin,  logoutAdmin, orderStatusUpdate, updateProduct, userDelete, userGetById, userUpdate } =require('../controllers/adminController.js');
const path = require('path');
const { fileURLToPath } = require('url');
const { isLogin, isLogout } = require('../middleware/adminAuth.js');
const session = require('express-session');
const { adminSession, userSession } = require('../config/session.js');
const { upload } = require('../multer/multer.js');


const adminRoute = express.Router(); 


// Add session middleware to your app
adminRoute.use(session({
    secret: adminSession, 
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } 
}));





adminRoute.use((req, res, next) => {
    req.app.set('views', path.join(__dirname, '../views/admin')); 
    res.locals.layout = '../layout/adminLayout';
    next();
});



// adminRoute.use('/*', (req, res) => {
//     res.status(404).render('error');  
//   });

adminRoute.get("/",isLogout,loadLogin);

adminRoute.get("/home",isLogin, homePage);
adminRoute.get("/404", errrorPage);
adminRoute.get("/user-list",isLogin,loadGetUserList);

adminRoute.get("/main-category",isLogin, loadGetMainCategory);
adminRoute.get("/product-list",isLogin, loadGetProductsList );
adminRoute.get("/product-add",isLogin, loadGetProductsAdd );

adminRoute.get("/order-details/:id",isLogin, loadGetOrdersOrderDetails );
adminRoute.get("/order-history",isLogin, loadGetOrdersOrderHistory );
adminRoute.get("/coupon-list",isLogin,loadCouponList);


adminRoute.post("/login" ,loginAdmin);
adminRoute.post("/create",createAdmin);
adminRoute.post("/logout", logoutAdmin);
adminRoute.post("/addUser", addUser);
adminRoute.get("/usergetbyid/:id", userGetById);
adminRoute.get("/users", getUsers);
adminRoute.post("/userUpdate/:id", userUpdate);
adminRoute.post('/userDelete/:id', userDelete);

adminRoute.post('/add-product', upload,AdminAddProduct)
adminRoute.get('/products',isLogin, getAllProducts); 
adminRoute.get('/productsByid/:id', getProductById);
adminRoute.post('/productsUpdate/:id', upload, updateProduct);
adminRoute.post('/productsDelete/:id', deleteProduct);

adminRoute.post('/add-category', upload, createCategory);

adminRoute.get('/categories',isLogin, getAllCategories);
adminRoute.post('/categories/:id', deleteCategoryById);

adminRoute.post('/add-coupon',createCoupon)
adminRoute.post('/delete-coupon/:id',deleteCouponById)

adminRoute.post('/update-order-status',orderStatusUpdate)


module.exports= adminRoute;  