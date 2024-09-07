const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const mongoose = require('mongoose')
const router = express.Router()


require("../db/connnection");
const User = require('../model/userSchema');
const Product = require('../model/ProductSchema');
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

router.get('/profile' , authenticate , (req,res) => {
    return res.send(req.rootUser);
})

router.get('/allProducts' , (req,res) => {
    Product.find()
        .then((products) => {
            res.send(products)
        })
        .catch((e)=>{console.log(e)})
})

router.get('/getProduct/:id' , (req,res) => { 
    Product.findOne({_id:req.params.id})
        .then((campaign) => {
            return res.status(200).send(campaign)
        })
        .catch((e)=>{console.log(e)})
})

router.post('/logout' , (req,res) => {
    res.clearCookie("jwtoken", {path: "/",domain:"127.0.0.1", httpOnly: true, secure: true, sameSite:"none" });
    res.status(200).json({message:"Logged out Successfully!"})
    return res.status(200).send('Logged out');
})

router.post('/deleteProduct', authenticate, (req, res) => {
    // Delete the campaign from the Product collection
    Product.deleteOne({ _id: req.body._id })
        .then(() => {
            // After the campaign is deleted, remove it from the user's yourproducts array
            User.findOneAndUpdate(
                {_id:req.UserID}, 
                { $pull: { yourproducts: { 'campaign.campaign_id': req.body._id } } },
                { new: true }
            )
            .then((updatedUser)=>{console.log("User Updated")})
            .catch((e) => {console.log(e)})
        })
        .then(() => {
            console.log(`Deleted campaign with ID ${req.body._id}`);
            res.status(200).send("Deleted");
        })
        .catch((e) => {
            res.status(400).send(e);
        });
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

router.post('/addProduct' , authenticate , (req,res) => {
    const { name, title, description, towards, target, deadline, image } = req.body

    //adds campaign to the db
    Product.findOne({title: title})
        .then((existingProduct) => {
            if(existingProduct){
                return res.status(422).json({message: "Product already Exists"})
            }
            else
            {
                const campaign = new Product({name, title, description, towards, target, deadline, image})
                campaign.save()
                .then(() => {
                    // res.status(201).json({message: "Product added Succesfully"})
                    console.log("Product added Succesfully")

                })
                .catch((e) => res.status(500).json({message: "Failed to add campaign"}))
            }
        
            })
        .catch((e) => {console.log(e)})

})

router.post('/updateProduct' , (req,res) => {
    const { id, name, title, description, towards, target, deadline, image } = req.body
    
    if( !name || !title || !description|| !towards || !target || !deadline || !image){
        res.status(400).json({error: "Pls Fill all the fields"})
    }

    Product.updateOne({_id: id } , {
        name : name,
        title : title,
        description : description,
        towards : towards,
        target : target,
        deadline : deadline,
        image : image
    })
    .then((updatedProduct)=>{res.status(201).json({message: "Product updated Succesfully", })})
    .catch((e)=>{
        console.log(e);
        res.status(500).json({message: "Failed to update your campaign"});
    })
})


module.exports = router
