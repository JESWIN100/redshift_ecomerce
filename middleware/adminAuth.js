const isLogin = async (req,res,next)=>{
    try{
        if(req.session.admin_id ){
             next()
        }else{
            res.redirect('/admin')
        }
    }
    catch (error){
        console.log("autherror",error.message);
    }
}



const isLogout = async (req, res, next) => {
    try {
        // Check if the admin is already logged in
        if (req.session.admin_id) {
            // Admin is logged in, redirect to the admin dashboard
            return res.redirect('/admin');
        } else {
            // Admin is not logged in, proceed to the login page
            return next(); // Proceed to the login route
        }
    } catch (error) {
        console.log('Error in isLogout middleware:', error.message);
        return res.status(500).send('Internal Server Error');
    }
};

module.exports = { isLogin, isLogout };