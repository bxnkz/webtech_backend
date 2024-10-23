import database from "../service/database.js";
import bcrypt from "bcrypt";

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