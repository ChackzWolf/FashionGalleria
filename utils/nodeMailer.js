const nodemailer = require("nodemailer");
const session =require("express-session")


const oneTimePass = function otp(){
    let otp = Math.random()
    otp = Math.trunc(otp = otp*100000000)
    otp = otp.toString()
    otp = otp.slice(0,6)
    otp = Number(otp)
    console.log(otp)
    return otp
}

const sendMail = async(email)=>{
    const userEmail = email;
    var userOtp = oneTimePass();
    session.otp = userOtp


    const transpoter = nodemailer.createTransport({
        service: "gmail",
        host: "smtp.forwardemail.net",
        port: 465,
        secure:true,
        auth:{
            user: "voguecraft65@gmail.com",
            pass: "psjnsjmfkqzytrit"
        }
    });



    const info = await transpoter.sendMail({
        from:'"Jackson Cheiryan test message" <voguecraft65@gmail.com>',
        to: userEmail,//list of receiver
        subject: "trial email",
        text:" Hello world!!",//plain text body
        html:userOtp.toString()
    })
}
module.exports = sendMail