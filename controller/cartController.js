import database from "../service/database.js";

export async function chkCart(req, res) {
    console.log(`GET CART getCart Check Session is requested`)
    const thedata = {
        id: req.session.cartId,
        qty: req.session.qty,
        money: req.session.money
    }
    console.log("*****" + thedata)
    return res.json(thedata)
}

export async function postCart(req, res) {
    console.log(`POST /CART is requested `)
    try {
        if (req.body.cusId == null) {
            return res.json({ cartOK: false, messageAddCart: 'Customer Id is required' })
        }
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); // เดือนเริ่มจาก 0 ดังนั้นต้องบวก 1
        const day = String(now.getDate()).padStart(2, '0');
        const currentDate = `${year}${month}${day}`;


        let i = 0;
        let theId = ''
        let existsResult = []
        do {
            i++
            theId = `${currentDate}${String(i).padStart(4, '0')}`
            existsResult = await database.query({
                text: 'SELECT EXISTS (SELECT * FROM carts WHERE "cartId" = $1) ',
                values: [theId]
            })
        }
        while (existsResult.rows[0].exists)

        const result = await database.query({
            text: ` INSERT INTO carts ("cartId", "cusId", "cartDate")
                    VALUES ($1,$2,$3) `,
            values: [
                theId,
                req.body.cusId,
                now, 
            ]
        })
        req.session.cartId = theId
        req.session.qty = 0
        req.session.money = 0
        console.log(req.session)
        return res.json({ cartOK: true, messageAddCart: theId })
    }
    catch (err) {
        return res.status(500).json({ error: err.message })
    }
}

export async function postCartDtl(req, res) {
    console.log(`POST /CARTDETAIL is requested `)
    try {
        // ก่อนจะ Excuese Query ทำการ Validate Data ก่อน
        if (req.body.cartId == null || req.body.pdId == null) {
            return res.json({ cartDtlOK: false, messageAddCartDtl: 'CartId && ProductID is required' })
        }
        // ดูว่ามี Product เดิมอยู่่หรือไม่
        const pdResult = await database.query({
            text: `  SELECT * FROM "cartDtl" ctd
                    WHERE ctd."cartId" = $1
                    AND ctd."pdId" = $2 ` ,
            values: [req.body.cartId,
            req.body.pdId] //ค่า Parameter ที่ส่งมา
        })
        // ถ้าไม่มีให้ INSERT
        if (pdResult.rowCount == 0) {
            try {
                const result = await database.query({
                    text: ` INSERT INTO "cartDtl" ("cartId", "pdId", "qty","price")
                            VALUES ($1,$2,$3,$4) `,
                    values: [
                        req.body.cartId,
                        req.body.pdId,
                        1,
                        req.body.pdPrice
                    ]
                })
                return res.json({ cartDtlOK: true, messageAddCart: req.body.cartId })
            }
            catch (err) {
                return res.json({ cartDtlOK: false, messageAddCartDtl: 'INSERT DETAIL ERROR' })
            }
        }      
        else {// ถ้ามีแล้วให้ UPDATE
            try {
                const result = await database.query({
                    text: ` UPDATE "cartDtl" SET "qty" = $1
                            WHERE "cartId" = $2
                            AND "pdId" = $3 `,
                    values: [
                        pdResult.rows[0].qty + 1,
                        req.body.cartId,
                        req.body.pdId,
                    ]
                })
                return res.json({ cartDtlOK: true, messageAddCart: req.body.cartId })
            }
            catch (err) {
                return res.json({ cartDtlOK: false, messageAddCartDtl: 'INSERT DETAIL ERROR' })
            }
        }
    }
    catch (err) {
        return res.json({ cartDtlOK: false, messageAddCartDtl: 'INSERT DETAIL ERROR' })
    }
}

export async function sumCart(req, res) {
    console.log(`GET SumCart is requested `)
    const result = await database.query({
        text: `  SELECT SUM(qty) AS qty,SUM(qty*price) AS money
                FROM "cartDtl" ctd
                WHERE ctd."cartId" = $1` ,
        values: [req.session.cartId] //ค่า Parameter ที่ส่งมา
    })
    console.log(result.rows[0])
    return res.json({
        id: req.session.cartId,
        qty: result.rows[0].qty,
        money: result.rows[0].money
    })
}

export async function getCart(req, res) {
    console.log(`GET Cart is Requested`)
    try {
        const result = await database.query({
            text:`  SELECT ct.*, SUM(ctd.qty) AS sqty,SUM(ctd.price*ctd.qty) AS sprice
                    FROM carts ct LEFT JOIN "cartDtl" ctd ON ct."cartId" = ctd."cartId"
                    WHERE ct."cartId"=$1
                    GROUP BY ct."cartId" ` ,
            values:[req.params.id]
        })
        console.log(`id=${req.params.id} \n`+result.rows[0])
        return res.status(200).json(result.rows)
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

export async function getCartDtl(req, res) {
    console.log(`GET CartDtl is Requested`)
    try {
        const result = await database.query({
        text:`  SELECT  ROW_NUMBER() OVER (ORDER BY ctd."pdId") AS row_number,
                        ctd."pdId",pd."foodName",ctd.qty,ctd.price
                FROM    "cartDtl" ctd LEFT JOIN "foods" pd ON ctd."pdId" = pd."foodId"  
                WHERE ctd."cartId" =$1
                ORDER BY ctd."pdId" ` ,
            values:[req.params.id]
        })
        console.log(`id=${req.params.id} \n`+result.rows[0])
        return res.status(200).json(result.rows)
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

export async function getCartByCus(req, res) {
    console.log(`POST Cart By Customer is Requested`)
    try {
        const result = await database.query({
            text:`  SELECT ROW_NUMBER() OVER (ORDER BY ct."cartId" DESC) AS row_number,
                            ct.*, SUM(ctd.qty) AS sqty,SUM(ctd.price*ctd.qty) AS sprice
                    FROM carts ct LEFT JOIN "cartDtl" ctd ON ct."cartId" = ctd."cartId"
                    WHERE ct."cusId"=$1
                    GROUP BY ct."cartId"
                    ORDER BY ct."cartId" DESC` ,
            values:[req.body.id]
        })
        console.log(`id=${req.params.id} \n`+result.rows[0])
        return res.status(200).json(result.rows)
    }
    catch (err) {
        return res.status(500).json({
            error: err.message
        })
    }
}

export async function updateCartDtl(req, res) {
    console.log(`POST Update CartDtl is Requested`);
    const { cartId, pdId, newQty } = req.body;

    try {
        const result = await database.query({
            text: `UPDATE "cartDtl" 
                   SET qty = $1 
                   WHERE "cartId" = $2 AND "pdId" = $3`,
            values: [newQty, cartId, pdId]
        });

        if (result.rowCount > 0) {
            return res.status(200).json({ message: "Quantity updated successfully!" });
        } else {
            return res.status(404).json({ message: "Cart detail not found." });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            error: err.message
        });
    }
}

export async function confirmOrder(req, res) {
    console.log(`POST /carts/confirmOrder is requested`);
    try {
        const { cartId, cartCf } = req.body;
        if (!cartId) {
            return res.json({ success: false, message: 'Cart ID is required' });
        }
        const result = await database.query({
            text: `UPDATE carts SET "cartCf" = $1 WHERE "cartId" = $2`,
            values: [cartCf, cartId]
        });
        if (result.rowCount > 0) {
            return res.json({ success: true });
        } else {
            return res.json({ success: false, message: 'Cart not found or already confirmed' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}

export async function deleteCart(req, res) {
    console.log(`DELETE /carts/deleteCart is requested`);
    const cartId = req.params.id;
    try {
        if (!cartId) {
            return res.json({ success: false, message: 'Cart ID is required' });
        }
        const result = await database.query({
            text: `DELETE FROM carts WHERE "cartId" = $1`,
            values: [cartId]
        });
        if (result.rowCount > 0) {
            return res.json({ success: true, message: 'Cart deleted successfully' });
        } else {
            return res.json({ success: false, message: 'Cart not found or already deleted' });
        }
    } catch (err) {
        console.error(err);
        return res.status(500).json({ success: false, message: err.message });
    }
}