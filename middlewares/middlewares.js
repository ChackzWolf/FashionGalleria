const UserModel = require("../models/User")

const fast2sms = require("fast-two-sms");

const adminLoginChecker = (req,res,next)=>{
    if(req.session.admin){
        next()
    }else{
        return res.redirect("/admin/login")
    }
}

const userStatusCheck = async(req,res,next)=>{

    const userId = req.session.user._id;
    const userDetails = await UserModel.findOne({_id:userId})
    if(userDetails.status == true){
        next()
    }else{
        return res.redirect("/admin/login")
    }
}



const adminLoginVarify = (req,res,next) =>{
    if(req.session.admin){
        return res.redirect("/admin")
    }else{
        next()
    }
}

const userLoginVarify = (req,res,next)=>{
    if(req.session.user){
        next()
    }else{
        return res.redirect('/login')
    }
}

const userLoginChecker = (req,res,next) =>{
    if(req.session.user){
        return res.redirect("/")
    }else{
        next()
    }
}
const otpSend = (req,res,next) =>{
    fast2sms.sendMessage(options)
        .then((response)=>{
    console.log(response)   
    next()
})
        .catch((error)=>{
             console.log(error)
})
} 



module.exports = {
    otpSend,
    adminLoginChecker,
    adminLoginVarify,
    userLoginChecker,
    userLoginVarify,
    userStatusCheck
}