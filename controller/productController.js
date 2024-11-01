
import database from "../service/database.js";
import multer from "multer";
import path from "path";


const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'img_fd'); 
    },
    filename: function (req, file, cb) {
        const foodId = req.body.foodId; 
        const extension = path.extname(file.originalname); 
        cb(null, `${foodId}${extension}`); 
    }
});

const upload = multer({ storage: storage }).single('image');

export async function postProduct(req, res) {
    console.log(`POST Product is requested`);
    upload(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ error: 'Image upload failed' });
        }
        try {
            if (!req.body.foodId || !req.body.foodName) {
                return res.status(422).json({ error: 'foodId and foodName are required' });
            }
            const existsResult = await database.query({
                text: `SELECT EXISTS (SELECT * FROM foods WHERE "foodId"=$1)`,
                values: [req.body.foodId]
            });

            if (existsResult.rows[0].exists) {
                return res.status(409).json({ error: `foodId ${req.body.foodId} already exists` });
            }
            const result = await database.query({
                text: `INSERT INTO foods ("foodId", "foodName", "description", "price", "category")
                       VALUES ($1, $2, $3, $4, $5)`,
                values: [
                    req.body.foodId,
                    req.body.foodName,
                    req.body.description,
                    req.body.price,
                    req.body.category
                ]
            });
            return res.status(201).json({ message: 'Product added successfully', data: result });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    });
}

export async function getAllProduct(req, res) {
    console.log('GET All products is requested');
    try {
        const result = await database.query(`SELECT * FROM foods ORDER BY "foodId" ASC;`);
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function getFoodMenu(req, res) {
    console.log('GET All products is requested');
    try {
        const result = await database.query(`SELECT * FROM foods WHERE category='maindish' ORDER BY "foodId" ASC;`);
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function getDrinkMenu(req, res) {
    console.log('GET All products is requested');
    try {
        const result = await database.query(`SELECT * FROM foods WHERE category='drink' ORDER BY "foodId" ASC;`);
        return res.status(200).json(result.rows);
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function deleteProduct(req,res){
    console.log('DELETE Products is requested')
    const foodId = req.params.id;
    try{
        const existsResult = await database.query({
            text:`SELECT EXISTS (SELECT * FROM foods WHERE "foodId"=$1)`,
            values:[foodId]
        })
        if(!existsResult.rows[0].exists){
            return res.status(404).json({error: `Food Id ${foodId} not found`})
        }
        const result = await database.query({
            text:`DELETE FROM foods WHERE "foodId" = $1`,
            values:[foodId]
        })
        return res.status(200).json({message:'Product deleted successfully', data: result.rows[0]})
    }catch(err){
        return res.status(500).json({error: err.message})
    }
}

export async function editProduct(req, res) {
    console.log('PUT Edit Product is requested');
    const foodId = req.params.id;

    // ใช้ multer เพื่ออัปโหลดไฟล์ภาพ
    upload(req, res, async function (err) {
        if (err) {
            return res.status(500).json({ error: 'Image upload failed' });
        }

        const { foodName, description, price, category } = req.body;
        try {
            const existsResult = await database.query({
                text: `SELECT EXISTS (SELECT * FROM foods WHERE "foodId"=$1)`,
                values: [foodId]
            });
            if (!existsResult.rows[0].exists) {
                return res.status(400).json({ error: `Food ID ${foodId} not found` });
            }

            // อัปเดตข้อมูลรวมถึงค่าใหม่ (ไม่มีไฟล์ภาพ)
            const result = await database.query({
                text: `UPDATE foods SET "foodName"=$1, "description"=$2, "price"=$3, "category"=$4 WHERE "foodId"=$5`,
                values: [foodName, description, price, category, foodId]
            });
            return res.status(200).json({ message: 'Product updated successfully', data: result });
        } catch (err) {
            return res.status(500).json({ error: err.message });
        }
    });
}

export async function getEditProduct(req, res) {
    console.log('GET id products is requested');
    try {
        const result = await database.query(
            {
               text: `SELECT * FROM	foods f
            WHERE f."foodId" ILIKE $1
            `,
            values:[req.params.id]
            });
        return res.status(200).json(result.rows);
        
    } catch (err) {
        return res.status(500).json({ error: err.message });
    }
}

export async function getSearchFood(req,res){
    console.log('GET /Search is requested')
    try{
        const result = await database.query({
            text: `SELECT * FROM foods WHERE "foodName" ILIKE $1 AND "category"='maindish'`,
            values:[`%${req.params.id}%`]
        })
        return res.status(200).json(result.rows)
    }
    catch(err){
        return res.status(500).json({error:err.message})
    }
}

export async function getSearchDrink(req,res){
    console.log('GET /Search is requested')
    try{
        const result = await database.query({
            text: `SELECT * FROM foods WHERE "foodName" ILIKE $1 AND "category"='drink'`,
            values:[`%${req.params.id}%`]
        })
        return res.status(200).json(result.rows)
    }
    catch(err){
        return res.status(500).json({error:err.message})
    }
}