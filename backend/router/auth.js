const express = require('express')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()

require("../db/connnection")
const User = require('../model/userSchema')
const Campaign = require('../model/campaignSchema')

router.get('/' , (req,res) => {
    res.send("Backend Home Page")
})

module.exports = router