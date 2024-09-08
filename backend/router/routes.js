const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const router = express.Router()


require("../db/connnection");
const User = require('../model/userSchema');
const Order = require('../model/OrderSchema');
const authenticate = require('../middleware/authenticate');

router.get('/' , (req,res) => {
    res.send("Backend Home Page");
})

router.get('/viewAllUsers', (req,res) =>{
    User.find()
        .then((users) =>{
            res.send(users)
        })
        .catch((err) => console.log(err))
})

router.get('/currentUser' ,authenticate, (req,res) => {
    res.status(200).send(req.rootUser)
})

router.get('/checkLoggedUser' , authenticate, (req,res) => {
    if (req.rootUser)
        return res.status(200).json({message: 'User is logged in', user: req.rootUser})
    else
        return res.status(401).json({message: 'No User Logged in'})
})

router.get('/getAllOrders' , (req,res) => {
    Order.find()
        .then((products) => {
            res.send(products)
        })
        .catch((e)=>{console.log(e)})
})

router.get('/getOrder/:id' , (req,res) => { 
    Order.findOne({_id:req.params.id})
        .then((campaign) => {
            return res.status(200).send(campaign)
        })
        .catch((e)=>{console.log(e)})
})

router.post('/logout' , (req,res) => {
    res.clearCookie("jwtoken", {path: "/", httpOnly: true, secure: true, sameSite:"none" });
    res.status(200).json({message:"Logged out Successfully!"})
    return res.status(200).send('Logged out');
})

router.delete('/deleteOrder/:id', async (req, res) => {
    try {
        const productId = req.params.id;
        await Order.findByIdAndDelete(productId);
        res.status(200).json({ message: 'Order deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Failed to delete product', error });
    }
});


router.post('/register' , (req , res) => {
    const { username , pwd , role } = req.body
    
    //validation
    // function validateEmail(email) {
    //     const regex = /^[\w.-]+@[a-zA-Z_-]+?\.[a-zA-Z]{2,}$/;
    //     return regex.test(email);
    // }

    // if(!validateEmail(email)){
    //     return res.status(401).json({message: "Invalid Email"})
    // }

    //Checking existing User
    User.findOne({username: username})
        .then( (userExist) => {
            if(userExist){
                return res.status(401).json({message: "Username already Exists"})
            }

            const user = new User({username, pwd, role})
            
            user.save().then(() => {
                res.status(201).json({message: "User registered Succesfully"})
            }).catch((e) => res.status(500).json({message: "Failed to register"}))
            
        })
        .catch( e => { console.log(e) })
})

router.post('/login' , (req , res) => {
    const { username , pwd } = req.body 
    // console.log(req.body)

    //validation
    // function validateEmail(email) {
    //     const regex = /^[\w.-]+@[a-zA-Z_-]+?\.[a-zA-Z]{2,}$/;
    //     return regex.test(email);
    // }
    if(!username || !pwd){
        return res.status(401).json({error : "Please fill all the fields!"})
    }
    // if(!validateEmail(email)){
    //     return res.status(401).json({error: "Invalid Email"})
    // }

    //Checking existing User
    User.findOne({username : username})
        .then(async (userExist) => {      //userExist contains details of the found user or NULL value
            if(userExist){
                bcrypt.compare( pwd , userExist.pwd)
                    .then((isMatch) =>{
                        if(!isMatch)
                            res.status(401).json({message: "Wrong Password"})
                        else
                            res.status(200).json({message: "Login Successfull", loggedUser: userExist})
                    }).catch(e => console.log(e))

                const token = await userExist.generateAuthToken();
                console.log(token)
                
                //cookie
                // res.cookie("jwtoken" , token , { 
                //     expires: new Date(Date.now() + 3600000),
                //     path: "/",
                //     domain:"127.0.0.1",
                //     httpOnly: true,
                //     secure: true,
                //     sameSite: "none"
                // });

                res.cookie("jwtoken", token, {
                    expires: new Date(Date.now() + 3600000),
                    path: "/",
                    // Remove domain for localhost, add in production
                    domain: "127.0.0.1",
                    httpOnly: true,
                    secure: false,  // Set to false if not using HTTPS
                    sameSite: "Lax" // Using Lax instead of None for local development
                });
            }
            else
                res.status(401).json({message: "Couldnt find the User"})
        })
        .catch((e) => {
            console.log(e)
        })
})

router.post('/addOrder' , (req,res) => {
    //adds campaign to the db
    Order.findOne({username: req.body.username})
        .then((existingOrder) => {
            if(existingOrder){
                return res.status(422).json({message: "Order already Exists"})
            }
            else
            {
                const newOrder = new Order({
                    username: req.body.username,
                    name: req.body.name,
                    businessUnit: req.body.businessUnit,
                    gender: req.body.gender,
                    age: req.body.age,
                    phone: req.body.phone,
                    email: req.body.email,
                    address: req.body.address,
                    reference: req.body.reference,
                    zone: req.body.zone,
                    requestedProducts: req.body.requestedProducts,
                    poaMode: req.body.poaMode,
                    productFiles: req.body.productFiles,  
                    picture: req.body.picture,  
                    certificate: req.body.certificate,  
                    requestStatus: req.body.requestStatus,
                    urgencyLevel: req.body.urgencyLevel
                });

                newOrder.save()
                .then(() => {
                    res.status(201).json({message: "Order added Succesfully"})
                    console.log("Order added Succesfully")

                })
                .catch((e) => res.status(500).json({message: "Failed to add Order"}))
            }
        
            })
        .catch((e) => {console.log(e)})

})

router.post('/updateOrder' , (req,res) => {

    Order.findByIdAndUpdate({_id: req.body._id } , { ...req.body })
    .then((updatedOrder)=>{res.status(201).json({message: "Order updated Succesfully", })})
    .catch((e)=>{
        console.log(e);
        res.status(500).json({message: "Failed to update your Order"});
    })
})


module.exports = router
