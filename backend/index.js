const express = require('express');
const app = express();
const dotenv = require('dotenv')
const cors = require('cors')
const cookie_parser = require('cookie-parser')

const corsOptions ={
    origin:['http://127.0.0.1:5500','http://127.0.0.1:5501'], 
    allow_methods: ["POST","GET"],
    credentials:true,
    optionSuccessStatus:200
}
dotenv.config({ path: './.env'})
const PORT = process.env.PORT

require('./db/connnection')
app.use(cors(corsOptions))
app.use(cookie_parser())
app.use(express.json())

app.use(require('./router/routes'))

app.get('/' , (req,res) => res.send("Hello"));

app.listen( PORT , () => console.log(`port ${PORT} running`) );