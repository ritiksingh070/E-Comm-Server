import { asyncHandler } from "../utils/asyncHandler.js"; 
import {ApiError} from "../utils/ApiError.js"
import {User} from "../models/user.model.js"
import {cloudinaryUpload, cloudinaryDelete} from "../utils/cloudinary.js"
import { ApiResponse } from "../utils/ApiResponse.js";
import jwt from "jsonwebtoken"
import { sendEmail } from "../utils/mail.js";
import { emailVerificationMailgenContent } from "../utils/mail.js";
import { forgotPasswordMailgenContent } from "../utils/mail.js";


const generateAccessAndRefreshTokens =  async (userId) => {

    try {
            const user = await User.findById(userId)
            const accessToken = await user.generateAccessToken()
            const refreshToken = await user.generateRefreshToken()
        
            user.refreshToken = refreshToken
        
            await user.save({validateBeforeSave : false})
        
            return {refreshToken, accessToken}
    } catch (error) {
        throw new ApiError(400, "couldn't generate access and refresh tokens")
    }
    
}


const registerUser = asyncHandler(async(req, res) => {
    const {username, email, fullname, password} = req.body;

    const userExists = await User.findOne({
        $or : [{username}, {email}]
    });

    if(userExists) {
        throw new ApiError(405, "User already exists, use different email or username")
    }

    const avatarPath = req.files?.avatar[0]?.path

    if(!avatarPath) {
        throw new ApiError(402, "avatar not found")
    }

    const avatarUrl = await cloudinaryUpload(avatarPath)

    if(!avatarUrl) { 
        throw new ApiError(400, "Error uploading avatar")
    }

    const user = await User.create({
        email,
        username,
        password,
        avatarUrl : avatarUrl.url,
        isEmailVerified : false,
    })

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;
    
    await user.save({validateBeforeSave: false});

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get(
            "host"
        )}/api/v1/users/verify-email/${unHashedToken}`
        ),
    });

    const findUser = await User.findById(user._id)
    .select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry")

    if(!findUser) {
        throw new ApiError(400, "couldn't register user")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, {user : findUser}, "User registered successfully, please verify your email")
    )
})


const verifyEmail = asyncHandler(async (req, res) => {
    const { verificationToken } = req.params;

    if(!verificationToken) {
        throw new ApiError(403, "Verification token is missing")
    }

    let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

    const user = await User.findOne({
        emailVerificationToken: hashedToken,
        emailVerificationToken: {$gt : Date.now()}
    })

    if(!user) {
        throw new ApiError(402, "User not found or token is invalid")
    }

    // user is verified so no point of storing the token and expiry date
    isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpiry = undefined;

    await user.save({validateBeforeSave: false})

    return res.status(200)
    .json(
        new ApiResponse(201, {isEmailVerified:true} , "Email is verfied successfully")
    )
})


const resendVerificationEmail = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if(!user) {
        throw new ApiError(404, "User not found")
    }

    if(user.isEmailVerified == true) {
        throw new ApiError(400, "User is already verified")
    }

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();

    user.emailVerificationToken = hashedToken;
    user.emailVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false});

    await sendEmail({
        email: user?.email,
        subject: "Please verify your email",
        mailgenContent: emailVerificationMailgenContent(
            user.username,
            `${req.protocol}://${req.get(
            "host"
        )}/api/v1/users/verify-email/${unHashedToken}`
        ),
    });

    return res.status(200)
    .json(
        new ApiResponse(201, {} , "Verification email sent to your mailbox")
    )
})


const forgotPasswordRequest = asyncHandler(async (req, res) => {
    const {email} = req.body

    const user = await User.findOne(email);

    if(!user) {
        throw new ApiError(404, "User not found");
    }

    const { hashedToken, unHashedToken, tokenExpiry } = await user.generateTemporaryToken()

    user.passwordVerificationToken = hashedToken;
    user.passwordVerificationExpiry = tokenExpiry;

    await user.save({validateBeforeSave: false})

    await sendEmail({
        email: user?.email,
        subject: "Password reset request",
        mailgenContent: forgotPasswordMailgenContent(
            user.username,
            `${req.protocol}://${req.get(
            "host"
        )}/api/v1/users/reset-pasword/${unHashedToken}`
        ),
    });

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Email sent to your mailbox for resetting your password")
    )
})


const resetForgottenPassword = asyncHandler(async (req, res) => {
    const { resetToken } = req.params;
    const { newPassword } = req.body;

    // Create a hash of the incoming reset token

    let hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

    // See if user with hash similar to resetToken exists
    // If yes then check if token expiry is greater than current date
    const user = await User.findOne({
        forgotPasswordToken: hashedToken,
        forgotPasswordExpiry: { $gt: Date.now() },
    });

    if (!user) {
        throw new ApiError(489, "Token is invalid or expired");
    }

    // if everything is ok and token id valid
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    user.password = newPassword;
    await user.save({ validateBeforeSave: false });

    return res
    .status(200)
    .json(
        new ApiResponse(200, {}, "Password reset successfully")
    )

});


const loginUser = asyncHandler(async (req, res) => {

    const {email, username, password} = req.body

    if(!email && !username) {
        throw new ApiError(401, "email or username required")
    }

    const user = await User.findOne({
        $or : [{email}, {username}]
    })

    if(!user) {
        throw new ApiError(401, "user doesn't exist")
    }

    const checkForPassword = await user.isPasswordCorrect(password)

    if(!checkForPassword) {
        throw new ApiError(401, "password is incorrect")
    }

    const {accessToken, refreshToken} = await generateAccessAndRefreshTokens(user._id)

    const userLoggedIn = await User.findById(user._id)
    .select("-password -refreshToken")

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(
        new ApiResponse(202,
            {user: userLoggedIn, accessToken, refreshToken},
            "User logged In successfully")
    )

})


const logoutUser = asyncHandler(async (req, res) => {

    await User.findByIdAndUpdate(req.user._id,
        {
            $unset: {
                refreshToken: 1,
            }
        },
        {
            new : true,
        }
    )

    const options = {
        httpOnly : true,
        secure : true
    }

    return res.status(200)
    .cookie("access_token", options)
    .cookie("refresh_token", options)
    .json(
        new ApiResponse(200, {} , "user logged out successfully")
    )
})


const refreshAccessToken = asyncHandler(async (req, res) => {

    const incomingRefreshToken = req.body.refreshToken || req.cookie.refreshToken

    if(!incomingRefreshToken) {
        throw new ApiError(400, "Invalid Request")
    }

    const decodedToken = jwt.verify(incomingRefreshToken, process.env.REFRESH_TOKEN_SECRET)

    const user = await User.findById(decodedToken?._id)

    if(!user) {
        throw new ApiError(400, "Refresh token Invalid")
    }

    if(user?.refreshToken !== incomingRefreshToken) {
        throw new ApiError(400, "Refresh token Invalid or expired")
    }

    const {refreshToken, accessToken} = await generateAccessAndRefreshTokens(user._id)

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200)
    .cookie("access_token", accessToken, options)
    .cookie("refresh_token", refreshToken, options)
    .json(
        new ApiResponse(200, 
            {accessToken, refreshToken},
            "Access token refresed successfully")
        )
})


const getCurrentUser = asyncHandler(async (req, res) => {

    return res.status(200)
    .json(200, req.user , "User fetched successfully")
})


const changePassword = asyncHandler(async (req, res) => {
    const {oldPassword, newPassword} = req.body

    const user = await User.findById(user._id)
    const checkForPassword = await user.isPasswordCorrect(oldPassword)

    if(!checkForPassword) {
        throw new ApiError(200, "Password Incorrect")
    }

    user.password = newPassword
    await user.save({validateBeforeSave: false})

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "Password Changed Successfully")
    )
})


const updateUserDetails = asyncHandler(async (req, res) => {
    const {email, fullname} = req.body

    if(!email && !fullname) {
        throw new ApiError(400, "One of the field is required fot updation")
    }

    const user = await User.findByIdAndUpdate(req.user._id, 
        {
            $set : {
                email,
                fullname
            }
        },
        {new: true})
        .select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "User details updated successfully")
    )
})


const updateUserAvatar = asyncHandler(async (req, res) => {
    const avatarPath = req.file?.path

    if(!avatarPath) {
        throw new ApiError(400, "No avatar path provided")
    }

    const avatar = await cloudinaryUpload(avatarPath)

    if(!avatar.url) {
        throw new ApiError(400, "Failed to upload avatar")
    }

    const oldAvatarUrl = req.user.avatar

    const deleteOldAvatar = await cloudinaryDelete(oldAvatarUrl)

    if(!deleteOldAvatar) {
        throw new ApiError(400, "Failed to delete old avatar" )
    }

    const user = await User.findByIdAndUpdate(req.user._id,
        {
            $set: {
                avatar : avatar.url
            }
        }, {new: true})
        .select("-password")

    return res.status(200)
    .json(
        new ApiResponse(200, user, "Avatar Updatad Successfully")
    )
})


const deleteUserAccount = asyncHandler(async(req, res) => {
    const userId = req.user._id

    const user = await User.findOneAndDelete(userId)

    if(!user) {
        throw new ApiError(400, "User Account deletion failed" )
    }

    return res.status(200)
    .json(
        new ApiResponse(200, {}, "User Account Deleted Successfully")
    )
})


export { registerUser,
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
        deleteUserAccount, }