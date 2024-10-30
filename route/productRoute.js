import express from "express";
import * as productC from "../controller/productController.js";
const router = express.Router()


router.post('/products/addproduct',productC.postProduct)
router.get('/products',productC.getAllProduct)
router.get('/getfoods',productC.getFoodMenu)
router.get('/getdrink',productC.getDrinkMenu)
router.delete('/products/:id',productC.deleteProduct)
router.put('/products/edit/:id',productC.editProduct)
router.get('/products/edit/:id',productC.getEditProduct)
router.get('/products/search/:id',productC.getSearchProduct)

export default router