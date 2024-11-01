import express from "express";
import bodyParser from "body-parser";
import dotenv from "dotenv";
import memberRoute from "./route/memberRoute.js";
import productRoute from "./route/productRoute.js"
import cartRoute from "./route/cartRoute.js"
import cors from "cors";
import session from "express-session";
import swaggerUI from "swagger-ui-express";
import yaml from "yaml";
import fs from "fs";


dotenv.config()
const app = express()
const port = process.env.PORT

const swaggerfile = fs.readFileSync('service/swagger.yaml','utf-8')
const swaggerDoc = yaml.parse(swaggerfile)

app.use('/api-docs',swaggerUI.serve,swaggerUI.setup(swaggerDoc))

app.use(bodyParser.json())
app.use("/img_fd",express.static('img_fd'))
app.use("/img_mem",express.static('img_mem'))
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
app.use(cartRoute)


app.get('/',(req,res)=>{
    console.log('Server start')
    return res.status(200).json()
})

app.listen(port, () => {
    console.log(`Server start at port:${port}`)
});