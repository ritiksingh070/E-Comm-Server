import { Router } from 'express';
import { 
    registerUser, 
    verifyEmail,
    resendVerificationEmail,
    forgotPasswordRequest,
    resetForgottenPassword,
    loginUser,
    logoutUser,
    refreshAccessToken,
    getCurrentUser,
    changePassword,
    updateUserDetails,
    updateUserAvatar,
    deleteUserAccount } from '../controllers/user.controller.js';
import {upload} from "../middlewares/multer.js"
import { verifyJWT } from "../middlewares/auth.js";
import { 
    userRegisterValidator,
    userLoginValidator,
    ChangeCurrentPasswordValidator,
    ForgotPasswordValidator,
    ResetForgottenPasswordValidator } from '../validators/user.validator.js';
    import { validate } from '../validators/validator.js';

    
const router = Router();


// unsecured routes
router.route("/register").post(userRegisterValidator(), validate, upload.single("avatar"), registerUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/verify-email/:verificationToken").get(verifyEmail);
router.route("/refresh-token").post(refreshAccessToken);

router.route("/forgot-password").post(ForgotPasswordValidator(), validate, forgotPasswordRequest);
router.route("/reset-forgot-password:resetToken").post(ResetForgottenPasswordValidator(), validate, resetForgottenPassword);

// secured routes
router.route("/logout").post(verifyJWT, logoutUser);
router.route("/resend-email-verification").post(verifyJWT, resendVerificationEmail);
router.route("/current-user").get(verifyJWT, getCurrentUser);

router.route("/change-password").post(verifyJWT, ChangeCurrentPasswordValidator(), validate, changePassword);

router.route("/update-avatar").patch(verifyJWT, upload.single("avatar"), updateUserAvatar);
router.route("/delete-account").delete(verifyJWT, deleteUserAccount);
router.route("/update-account").patch(verifyJWT, updateUserDetails);

export default router;