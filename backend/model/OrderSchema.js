const mongoose = require('mongoose')

require('../db/connnection')

const orderSchema = new mongoose.Schema({
    username: { type: String },
    name: { type: String },
    businessUnit: { type: String},  // Business Unit
    gender: { type: String },  // Enum for gender
    age: { type: Number },
    phone: { type: String },  // Store as a string to accommodate different formats
    email: { type: String },
    address: { type: String },
    reference: {type: String },
    zone: { type: String },
    requestedProducts: [{
        product: { type: String },  // Name of the product
        quantity: { type: Number }  // Quantity of the product
    }],
    poaMode: { type: String },  // POA/Mode, adjust accordingly based on context
    productFiles: [{ type: String }],  // Array of Cloudinary URLs for product files
    picture:[{ type: String }],  // Cloudinary URL to the picture file
    certificate: { type: String },  // Cloudinary URL to the certificate file
    requestStatus: { type: String },  // Example status types
    urgencyLevel: { type: String },  // Define levels of urgency
    collectionStatus: { type: String, default: "Not Collected" },  // Collection status options
    collectedBy: { type: String },  // New field for Collected By
    receivedProducts: { type: String },  // New field for Received Products
    doorstepPicture: [{ type: String }],  // Cloudinary URL for Doorstep Picture
    pickupSheetPicture: [{ type: String }],  // Cloudinary URL for Pickup Sheet Picture
    allocatedPickupDate: { type: Date },
    actualPickupDate: { type: Date },
    receivedProductsDetails: { type: String }  // Details of received products, adjust type if necessary
}, { timestamps: true }); 

orderSchema.index({title: 'text' , towards: 'text'})  // for full text-search

const Order = mongoose.model('PRODUCT' , orderSchema)

module.exports = Order