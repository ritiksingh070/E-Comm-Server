import { Router } from "express";
import { getUserCart, clearCart, deleteCart, addOrUpdateCartQuantity } from "../controllers/cart.controller.js";
import { addItemOrUpdateQuantityValidator } from "../validators/cart.validator.js";
import { verifyJWT } from "../middlewares/auth.js";
import { validate } from "../validators/validator.js";
import { mongoIdPathVariableValidator } from "../validators/mongodb.validator.js";

const router = new Router();

router.use(verifyJWT);

router.route("/get-user-cart").get(getUserCart);

router.route("/clear").delete(clearCart);

router.route("/item/:productId")
    .post(mongoIdPathVariableValidator("productId"), addItemOrUpdateQuantityValidator(), validate, addOrUpdateCartQuantity)
    .delete(mongoIdPathVariableValidator("productId"), validate, deleteCart);


export default router;