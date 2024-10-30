import database from "../service/database.js";
import bcrypt from "bcrypt";
import multer from "multer";

const storage = multer.diskStorage({
    destination: function (req,file,cb){
        cb(null, 'img_mem')
    },
    filename: function (req,file,cb){
        const filename = `${req.session.memEmail}.jpg`
        cb(null, filename)
    }
})
const upload = multer({
    storage: storage,
}).single('file');

export async function loginMember(req,res){
    console.log('POST /loginMembers is requested')
    const bodyData = req.body
    try{
        if(req.body.loginname == null || req.body.password == null){
            return res.json({messagelogin:'fail'})
        }
        const existsResult = await database.query({
            text:`SELECT EXISTS (SELECT * FROM members m WHERE m."memEmail" = $1)`,
            values:[req.body.loginname]
        })
        if(!existsResult.rows[0].exists){
            console.log('fail1')
            return res.json({messagelogin:'fail'})
        }
        const result = await database.query({
            text:`SELECT * FROM members m WHERE m."memEmail" = $1`,
            values:[req.body.loginname]
        })
        const loginok = await bcrypt.compare(req.body.password,result.rows[0].memHash)

        if(loginok){
            console.log("ok")
            const role = result.rows[0].dutyId

            req.session.memEmail=result.rows[0].memEmail
            req.session.memName=result.rows[0].memName
            req.session.dutyId=result.rows[0].dutyId
            console.log(req.session)
            res.json({messagelogin:'success',role: role})
        }else{
            console.log('fail2')
            res.json({messagelogin:'fail'})
        }
    }catch(err){
        console.log('fail3')
        return res.json({messagelogin:'fail'})
    }
}


export async function postMember(req,res){
    console.log('POST /members is requested')
    const bodyData = req.body
    try{
        if(req.body.memEmail == null || req.body.memName == null){
            console.log('Fail1')
            return res.json({messageregister:'fail'})
        }
        const existsResult = await database.query({
            text:`SELECT EXISTS (SELECT * FROM members WHERE "memEmail"=$1)`,
            values:[req.body.memEmail]
        })
        if(existsResult.rows[0].exists){
            console.log('Fail2')
            return res.json({messageregister:'fail'})
        }   
        const thePwd = req.body.password
        const saltround = 11
        const pwdHash = await bcrypt.hash(thePwd,saltround)
        const result = await database.query({
            text:`INSERT INTO members ("memEmail","memName","memHash")
            VALUES ($1,$2,$3)`,
            values:[
                req.body.memEmail,
                req.body.memName,
                pwdHash,
            ]
        })
        console.log('OK')
        return res.json({messageregister:'success'})
        // const datetime = new Date()  
        // bodyData.createData = datetime
        // res.status(201).json(bodyData)
    }catch(err){
        console.log('Fail3')
        return res.json({messageregister:'fail'})
    }
}

export async function getSession(req,res) {
    console.log(`GET /getSession is requested`)
    console.log(req.session)
    const thedata={
        email:req.session.memEmail,
        name:req.session.memName,
        duty:req.session.dutyId
    }
    console.log(thedata)
    return res.json(thedata)
}

export async function logoutMember(req,res){
    console.log(`GET /logoutMembers is requested`)
    try{
        // ลบเฉพาะ key ที่ระบุ
        // delete req.session.someKey;
        // ล้าง Session ทั้งหมด
        req.session.destroy()
        // ลบ Cookie ด้วย
        res.clearCookie('connect.sid')
        return res.status(200).json({messagelogout:'success'})
    }catch(err)
    {
        return res.status(500).json({messagelogout:'fail'})
    }
}

export async function uploadMember(req,res){
    upload(req,res,(err) => {
        if(err){
            return res.status(400).json({message: err.message})
        }
        res.status(200).json({message: "File uploaded successfully."})
    })
}