const mongoose = require('mongoose')
const dotenv = require('dotenv')

// dotenv.config({ path: '../config.env'})
const DB_URL = process.env.DB_URI

mongoose.connect(DB_URL)
    .then( () => {
        console.log('Database Connected')
    })
    .catch( (e) => {
        console.log(e+"Couldnt connect to the Database")
    })