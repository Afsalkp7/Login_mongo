const express = require("express");
const session = require("express-session");
const app = express();
const PORT = 2900;
const bcrypt = require("bcrypt");
const auth = require("./auth");
const cookieParser = require("cookie-parser")
const bodyParser = require("body-parser")
const {check,validationResult} = require("express-validator")
const urlencodedParser = bodyParser.urlencoded({ extended:false })
require("./database");
const signinCollection = require("../model/model")

app.use(express.urlencoded({extended : false}))
app.use(cookieParser());
 
app.set("view engine","hbs");
app.set("views")

app.get("/signin",(req,res)=>{
    const token = req.cookies.session;
      if (token){
          res.redirect('/index');
      }else
          res.render("signup")
})

app.get('/', (req, res) => {
    const token = req.cookies.session;
      if (token)
          res.redirect('/index');
      else
          res.render('login');
});

app.post("/signin",urlencodedParser,[
    check('name',"User name must be 3 characters")
        .exists()
        .isLength({ min:3 }),
    check("email","Email is not valid")
        .exists()
        .isEmail()
        .normalizeEmail(),
    check("phone","entered phone number is not valid")
        .exists()
        .isLength({ min:10 , max:10 })
        .isMobilePhone()
        .isNumeric(),
    check("password","password must need alphanumeic,regex,and 8 character")
        .exists()
        .isLength({ min : 8 , max : 25 })
        // .matches(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])[0-9a-zA-Z]{8,}$/, "i")
        .isAlphanumeric()
], async (req,res)=>{
    const errors = validationResult(req)
    if(!errors.isEmpty()){
        const errorArray = errors.array()
        const alert = errorArray[0] 
        console.log(alert);
        return res.render("signup",{alert : alert})
    }
    try {
    const password = req.body.password;
    const cpassword = req.body.cpassword;
    if( password === cpassword){
        const userData = new signinCollection({
            name : req.body.name,
            email : req.body.email,
            phone : req.body.phone,
            password : req.body.password,
            cpassword : req.body.cpassword
        })
        const postData = await userData.save()
        res.render("login")
    }
    else{
        res.render("signup",{notMatch : true})
    }
    } catch (error) {
        res.send(error);
    }
})
 
app.get("/login",(req,res)=>{
    const token = req.cookies.session;
      if (token){
        res.redirect('/index');
      }else{
        res.render('login');
      }
})


app.post("/login", async (req,res)=>{
    try {
        const email = req.body.email;
        const password = req.body.loginPassword;
        const getEmail = await signinCollection.findOne({email : email})
        if (!getEmail) {
            return res.render("login",{emailMacth : true});
        }
        // console.log(getEmail.password);
        // console.log(password);
        const passReal = await bcrypt.compare(password,getEmail.password);
        if (passReal) {
            res.cookie('session', getEmail._id.toString());
            res.redirect("/index")
        }else{
            res.render("login",{emailPassMacth : true});
        }
    } catch (error) {
        res.send(error)
    }
})


app.get("/index",auth,(req, res) => {
    const user = req.user;
    res.render("index",{user : user})
})
    
app.get("/edit",auth,(req,res)=>{
    const user = req.user;
    res.render("edit",{user : user})
})

app.post("/edit",auth,async(req,res)=>{
    try {
        const userId = req.cookies.session;
        const updatedName = req.body.name;
        const updatedEmail = req.body.email;
        const updatedPhone = req.body.phone;
    
        await signinCollection.findByIdAndUpdate(userId, {
            name: updatedName,
            email: updatedEmail,
            phone: updatedPhone
        });
        res.redirect("index")
    } catch (error) {
        console.log(error);
        res.send("error identified...")
    }
})

// app.get("/change",auth,(req,res)=>{
//     // const user = req.user;
//     res.render("passwordChange")
// })

// app.post("/change",auth,async(req,res)=>{
//     try {
//         const userId = req.cookies.session;
//         const currentPassword = req.body.currentPassword;
//         const newPassword = req.body.newPassword;
//         const confirmPassword = req.body.confirmPassword;

//         const user = await signinCollection.findById(userId);
//         console.log(user);
//         if (!user) {
//           return res.status(404).send("User not found.");
//         }

//         const passwordMatch = await bcrypt.compare(currentPassword, user.password);
//         if (!passwordMatch) {
//             return res.status(401).send("Current password is incorrect.");
//         }

//         if (newPassword !== confirmPassword) {
//             return res.status(400).send("New passwords do not match.");
//         }
//         const newPasswordHash = await bcrypt.hash(newPassword, 10);
//         user.password = newPasswordHash;
//         await user.save();
//         console.log(user);
//         // console.log("session : "+req.cookies.session);
//         res.clearCookie('session');
//         res.redirect("/login");
//     } catch (error) {
//         console.log(error);
//         res.send("error identified...")
//     }
// })

app.get('/logout',(req,res)=>{
    const token = req.cookies.session;
    if (token){
        res.clearCookie('session');
        res.redirect("/login");
    }else{
        res.render('login');
    }
})

app.get("/delete/:userId",async(req,res)=>{
    const token = req.cookies.session;
    if (token){
        const userId = req.params.userId;
        await signinCollection.findByIdAndRemove(userId);
        res.clearCookie('session');
        res.redirect("/login");
    }else{
        res.render('login');
    }
})

app.listen(PORT,()=>console.log(`server running in port ${PORT} ...`));