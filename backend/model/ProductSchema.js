const mongoose = require('mongoose')

require('../db/connnection')

const productSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    title:{
        type: String,
        required: true
    },
    description:{
        type: String,
        required: true
    },
    towards:{
        type: String,
        required: true
    },
    target:{
        type: Number,
        required: true
    },
    deadline:{
        type: Date,
        required: true
    },
    image:{
        type: String,
        required: true
    },
    amountCollected:{
        type: Number,
        default: 0
    },
    
})

productSchema.index({title: 'text' , towards: 'text'})  // for full text-search

const Product = mongoose.model('PRODUCT' , productSchema)

module.exports = Product