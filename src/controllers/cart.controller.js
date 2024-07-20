import { Cart } from "../models/cart.model.js";
import {Product } from "../models/product.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getCart = async (userId) => {
    const cart = await Cart.aggregate([
        {
            $match: { owner: userId}
        },
        {
            $unwind: "$items"
        },
        {
            $lookup : {
                from : "products",
                localField : "items.productId",
                foreignField : "_id",
                as: "product"
            }
        },
        {
            $project : {
                product : {$first : "$product"},
                quantity : "$items.quantity",
            }
        },
        {
            $group : {
                _id : "$_id",
                items : {
                    $push : "$$ROOT",
                },
                cartTotal : {
                    $sum : {
                        $multiply : ["product.price", "$quantity"]
                    }
                },
            }
        },
    ])

    return cart[0] ?? {
        _id : null,
        items : [],
        cartTotal: 0
    }

};


const getUserCart = asyncHandler(async(req, res ) => {
    try {
        const cart = await getCart(req.user._id)
        
        return res.status(200)
        .json(
            new ApiResponse(201, cart, "Cart fetched successfully")
        )
    } catch (error) {
        throw new ApiError(400, error.message);
    }
});


const addOrUpdateCartQuantity = asyncHandler(async(req, res) => {
    const {productId} = req.params;
    const {quantity = 1} = req.body;

    const cart = await Cart.findOne({
        owner : req.user._id,
    })

    const product = await Product.findById(productId);

    if(!product) {
        throw new ApiError(402, "Product doesn't exist")
    }

    if(quantity> product.stock) {
        throw new ApiError(400, "Product is out of stock");
    }

    // check if product already exists in the cart
    const addedProduct = cart.items?.find(
    (item) => item.productId.toString() === productId)

    if(addedProduct) {
        addedProduct.quantity = quantity;

        cart.items.push({
            productId,
            quantity
        })
    }

    await cart.save({validatebeforesave : true});

    const cartDetails = await getCart(req.user._id)

    return res.status(200)
    .json(
        new ApiError(200, cartDetails, "cart details updated successfully")
    )

});


const deleteCart = asyncHandler (async (req, res) => {
    const {productId} = req.params

    await Cart.findOneAndUpdate(
        {
            owner : req.user._id,
        },
        {
            $pull : {
                items : {
                    productId : productId
                }   
            }
        }, {new : true});

    const finalCart = await Cart.findById(req.user._id)
    
    return res.status(200)
    .json(
        new ApiResponse(200, finalCart, "cart deleted successfully")
    )

});


const clearCart = asyncHandler (async (req, res) => {

    await Cart.findOneAndUpdate(
        {
            owner : req.user._id,
        },
        {
            $set : {
                items : []
            }
        },
        {new : true}
    );

    const cart = await Cart.findById(req.user._id);

    return res.status(200) 
    .json(
        new ApiResponse(200, cart, "cart cleared successfully")
    )

});


export {
    getCart,
    getUserCart,
    addOrUpdateCartQuantity,
    deleteCart,
    clearCart
}