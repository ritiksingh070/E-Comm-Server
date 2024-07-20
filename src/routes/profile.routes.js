import { Router } from "express";
import { getProfile, updateProfile, getOrders } from "../controllers/profile.controller.js";
import { verifyJWT } from "../middlewares/auth.js";
import { updateProfileValidator } from '../validators/profile.validator.js';
import { validate } from '../validators/validator.js';


const router = Router();

router.route("/get-profile").get(verifyJWT, getProfile);

router.route("/update-profile").patch(verifyJWT, updateProfileValidator(), validate, updateProfile);

router.route("/get-orders").get(verifyJWT, getOrders)

export default router;