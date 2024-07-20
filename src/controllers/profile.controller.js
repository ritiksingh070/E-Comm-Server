import { Profile} from "../models/profile.model.js";
import { User } from "../models/user.model.js";
import { Order } from "../models/order.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";


const getProfile = asyncHandler(async (req, res) => {

    const user = await Profile.findById(req.user._id);

    if(!user) {
        throw new ApiError(400, "User profile not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, user, "User profile fetched successfully")
    )
})


const updateProfile = asyncHandler(async (req, res) => {

    const {firstName, lastName, phoneNumber} = req.body;

    const userProfile = await Profile.findByIdAndUpdate(req.user._id,
        {
            firstName,
            lastName,
            phoneNumber
        },
        {new: true}
    );

    return res.status(200)
    .json(201, userProfile, "User profile updated successfully")
    
})

const getOrders = asyncHandler(async (req, res) => {

    const {page = 1, limit = 10} = req.query

    const options = {
        page: parseInt(page),
        limit: parseInt(limit),
    };

    const order = await Order.aggregatePaginate([
        {
            $match: { userId: req.user._id },
        },
        {
            $lookup : {
                from : 'addresses',
                localField : 'address',
                foreignField : '_id',
                as : 'address'
            }
        },
        {
            $lookup: {
                from : 'users',
                localField: 'customer',
                foreignField: '_id',
                as: 'customer',
                pipeline: [
                    {
                        $project : {
                            _id : 1,
                            username: 1,
                            email : 1,
                        }
                    }
                ]
            }
        }, 
        {
            $addFields : {
                address : {$first : '$address'},
                customer: {$first : '$customer'},
                totalItems: {$size : '$items'}
            }
        },
        {
            $project: {
                items : 0
            }
        }
    ], options)

    return res.status(200)
    .json(
        new ApiResponse(201, 
            {
                currentPage: order.page,
                totalPages: order.totalPages,
                totalOrders: order.totalDocs,
                hasNextPage: order.hasNextPage,
                nextPage: order.hasNextPage ? result.nextPage : null,
                orders: order.docs,
            },
            "Orders fetched successfully")
    )
})


export { getProfile,
        updateProfile,
        getOrders }