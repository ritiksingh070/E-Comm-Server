import { Router } from "express";
import { 
    createCategory, updateCategory, deleteCategory, getCateoryById, getAllCategories } from "../controllers/category.controller.js";
import { categoryRequestBodyValidator } from "../validators/category.validator.js";
import { mongoIdPathVariableValidator } from "../validators/mongodb.validator.js";
import { validate } from "../validators/validator.js";
import { verifyJWT } from "../middlewares/auth.js";

const router = new Router();

router.use(verifyJWT);

router.route("/create-category").post(categoryRequestBodyValidator(), validate, createCategory);
router.route("/update-category/:categoryId").post(mongoIdPathVariableValidator("addressId"), validate, updateCategory);
router.route("/delete-category/:categoryId").post(mongoIdPathVariableValidator("addressId"), validate, deleteCategory);
router.route("/get-category/:categoryId").get(mongoIdPathVariableValidator("addressId"), validate, getCateoryById)
router.route("/get-all-category").get(getAllCategories);

export default router;