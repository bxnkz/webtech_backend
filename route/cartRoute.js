import express from "express"
import * as cartC from "../controller/cartController.js"
       
const router = express.Router()
router.get('/carts/chkcart',cartC.chkCart)
router.post('/carts/addcart',cartC.postCart)
router.post('/carts/addcartdtl',cartC.postCartDtl)
router.get('/carts/sumcart',cartC.sumCart)
router.get('/carts/getcart/:id',cartC.getCart)
router.get('/carts/getcartdtl/:id',cartC.getCartDtl)
router.post('/carts/getcartbycus',cartC.getCartByCus)
router.post('/carts/updatecartdtl', cartC.updateCartDtl);
router.post('/carts/confirmOrder',cartC.confirmOrder)
router.delete('/carts/delete/:id',cartC.deleteCart)
router.post('/carts/create',cartC.postCart)

export default router