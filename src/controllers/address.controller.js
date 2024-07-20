import { Address } from "../models/address.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const addAddress = asyncHandler(async (req, res) => {
    const {addressLine1, addressLine2, phoneNumber,
            alternatePhoneNumber, pinCode, city, state, country, landmark} = req.body;

    const owner = req.user._id

    const address = await Address.create({
        owner,
        addressLine1,
        addressLine2 : addressLine2 || "", 
        phoneNumber,
        alternatePhoneNumber : alternatePhoneNumber || "",
        pinCode, 
        city, 
        state, 
        country, 
        landmark : landmark || "",
    })

    return res.status(200)
    .json(
        new ApiResponse(201, address, "Address added successfully")
    )

})


const updateAddress = asyncHandler(async(req, res) => {

    const{addressId} = req.params;
    const userId = req.user._id;

    const {addressLine1, addressLine2, phoneNumber,
            alternatePhoneNumber, pinCode, city, state, country, landmark} = req.body;
    
    const address = await Address.findByIdAndUpdate(
        {
            _id :addressId,
            owner: userId, 
        },
        {
            $set : {
                owner,
                addressLine1,
                addressLine2 : addressLine2 || "", 
                phoneNumber,
                alternatePhoneNumber : alternatePhoneNumber || "",
                pinCode, 
                city, 
                state, 
                country, 
                landmark : landmark || "",    
            }     
        }, {new: true}
    )

    if(!address) {
        throw new ApiError(404, "address not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, address, "Address updated successfully")
    )
})


const getAdressById = asyncHandler(async (req, res) => {

    const addressId = req.params
    const userId = req.user._id

    const address = await Address.findOne({
        _id: addressId,
        owner: userId
    })

    if(!address) {
        throw new ApiError(404, "address not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(200, address, "Address fetched succesfully")
    )
})


const deleteAddress = asyncHandler(async(req, res) => {

    const addressId = req.param;
    const userId = req.user._id;

    const address =  await Address.findByIdAndDelete({
        owner: userId,
        _id : addressId,
    })

    if(!address) {
        throw new ApiError(404, "address not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, {deletedAdressInfo: address}, "Address deleted succesfully")
    )
})


const getAllAddresses = asyncHandler(async(req, res) => {
    
    const {page = 1, limit = 10} = req.query

    const options = {
        page : parseInt(page),
        limit : parseInt(limit)
    }

    const address = await Address.aggregatePaginate([
        {
            $match : { owner : req.user._id },
        }
    ], options)

    if(!address) {
        throw new ApiError(404, "Addresses not found")
    }

    return res.status(200)
    .json(
        new ApiResponse( 201, 
            {
                currentPage: address.page,
                totalPages: address.totalPages,
                totalAddress: address.totalDocs,
                hasNextPage: address.hasNextPage,
                nextPage: address.hasNextPage ? result.nextPage : null,
                addresses: address.docs,
            },
            "All address feteched successfully")
    )

})

export {addAddress,
        updateAddress,
        getAdressById,
        deleteAddress,
        getAllAddresses}
