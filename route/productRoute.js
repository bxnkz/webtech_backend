import express from "express";
import * as productC from "../controller/productController.js";

const router = express.Router()

router.post('/products/addproduct',productC.postProduct)
router.get('/products',productC.getAllProduct)
router.delete('/products/:id',productC.deleteProduct)
router.put('/products/edit/:id',productC.editProduct)

export default router