const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const signinSchema = new mongoose.Schema({
    name : {
        type : String,
        required : true
    },
    email : {
        type : String,
        unique : true,
        required : true
    },
    phone : {
        type : Number,
        required : true
    },
    password : {
        type : String,
        required : true
    },
    cpassword : {
        type : String,
        required : true
    }
})


signinSchema.pre("save", async function (next){
    console.log(this.password);
    this.password = await bcrypt.hash(this.password, 10);
    this.cpassword = await bcrypt.hash(this.password, 10);
    next();
})
const signinCollection = new mongoose.model("signincollection",signinSchema)

module.exports = signinCollection;  