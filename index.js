import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import memberRoute from "./route/memberRoute.js";
import productRoute from "./route/productRoute.js"
import cors from "cors";
import session from "express-session";

dotenv.config()
const app = express()
const port = process.env.PORT

app.use(bodyParser.json())
app.use(cors({
    origin:['http://localhost:8080','http://127.0.0.1:8080'],
    methods: ['GET','POST','PUT','DELETE'],
    credentials: true
}))
const thesecret = process.env.SECRET
app.use(session({
    secret: thesecret,
    resave: false,
    saveUninitialized: true
}))

app.use(memberRoute)
app.use(productRoute)



app.get('/',(req,res)=>{
    console.log('Server start')
    return res.status(200).json()
})

app.listen(port, () => {
    console.log(`Server start at port:${port}`)
});