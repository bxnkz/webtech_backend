import express from "express";
import * as productC from "../controller/productController.js";

const router = express.Router()

router.post('/products',productC.postProduct)
router.get('/products',productC.getAllProduct)

export default router