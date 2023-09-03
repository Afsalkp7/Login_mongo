const cookieParser = require("cookie-parser");
const mongoose = require("mongoose");
const model = require("../model/model");


const auth = async (req,res,next)=>{
    const userId = req.cookies.session; 
    console.log(userId);
    try {
        if (!userId){
            res.redirect("/login");
            return;
        }
        const user = await model.findById(userId);
    
        if (!user){
            res.redirect("/login");
        }else{
            req.user = user;
            next()
        }
    } catch (error) {
        console.error(error);
        res.send('An error occurred');
    }
   
}



module.exports = auth;