import database from "../service/database.js";


export async function postProduct(req,res){
    console.log(`POST Product is request`)
    // const bodyData = req.body
    try{
        if(req.body.foodId == null || req.body.foodName == null){
            return res.status(422).json({error:'foodId and foodName is required'})
        }
        const existsResult = await database.query({
            text:`SELECT EXISTS (SELECT * FROM foods WHERE "foodId"=$1)`,
            values:[req.body.foodId]
        })
        if(existsResult.rows[0].exists){
            return res.status(409).json({error:`foodId ${req.body.foodId} is exists`})
        }
        const result = await database.query({
            text:`INSERT INTO foods ("foodId","foodName","description","price","category")
                    VALUES ($1,$2,$3,$4,$5)`,
            values:[
                req.body.foodId,
                req.body.foodName,
                req.body.description,
                req.body.price,
                req.body.category
            ]
        })
    }catch(err){
        return res.status(500).json({error:err.message})
    }
}

export async function getAllProduct(req,res){
    console.log('GET All product is requested')
    try{
        const result = await database.query(`SELECT * FROM foods`)
        return res.status(200).json(result.rows)
    }catch(err){
        return res.status(500).json({error:err.message})
    }
}