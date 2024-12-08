 const isLogin = async (req,res,next)=>{
    try{
        if(req.session.user_id ){
             next()
        }else{
            res.redirect('/login')
        }
    }
    catch (error){
        console.log("autherror",error.message);
    }
}

 const isLogout = async (req,res,next)=>{
    try{
        if(req.session.user_id || req.isAuthenticated() ){
            res.redirect('/')
        }
        next()
    }
    catch (error){
        console.log(error.message);
    }
}

module.exports={isLogin,isLogout}

