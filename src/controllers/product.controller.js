import {Product} from "../models/product.model.js";
import {Category} from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { cloudinaryUpload, cloudinaryDelete } from "../utils/cloudinary.js";


const addProduct = asyncHandler(async(req, res) => {

    const {name, description, price, category, stock} = req.body

    const getCategory = await Category.findById(category);

    if(!getCategory) {
        throw new ApiError(402, "Category doesn't exist")
    }

    const productImagePath = req.files?.productImage[0].path;

    const productImageUrl = await cloudinaryUpload(productImagePath) 

    if(!productImageUrl) {
        throw new ApiError(400, "Failed to upload product image")
    }

    const product = await Product.create({
        name,
        description,
        price,
        stock,
        productImage: productImageUrl
    })

    return res.status(200)
    .json(
        new ApiResponse(201, product, "Product created successfully")
    )
})


const updateProduct = asyncHandler( async (req, res) => {
    const productId = req.params
    const {name, description, price, stock} = req.body

    const product = await Product.findByIdAndUpdate({
        productId,
        $set :{
            name,
            description,
            stock,
            price
        },
    }, {new:true} )

    if(!product) {
        throw new ApiError(401, "Failed to update product details")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, product, "Product details updated successfully")
    )
})


const getProductById = asyncHandler( async (req, res) => {

    const productId = req.params;

    const product = await Product.findById(productId);

    if(!product) {
        throw new ApiError(401, "Failed to access the product")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, product, "Product fetched successfully")
    )    
})


const getProductByCategory = asyncHandler(async (req,res) => {
    const {page = 1, limit = 10} = req.query
    const categoryId = req.params

    const category = await Category.findById(categoryId).select("name _id")

    if(!category) {
        throw new ApiError(401, "Failed to access the category")
    }

    const options  = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const product = await Product.aggregatePaginate([
        {
            $match: {
                category : new Mongoose.Types.ObjectId(category)
            }
        }
    ], options)

    return res.status(200)
    .json(
        new ApiResponse(201, {
            currentPage: product.page,
            totalPages: product.totalPages,
            totalProduct: product.totalDocs,
            hasNextPage: product.hasNextPage,
            nextPage: product.hasNextPage ? result.nextPage : null,
            products: product.docs,
        }, "Products fetched by category")
    )
})


const getAllProducts = asyncHandler( async(req, res) => {
    const {page = 1, limit = 10}  = req.query

    const options = {
        page: parseInt(page),
        limit: parseInt(limit)
    }

    const products = await Product.aggregatePaginate([
        {
            $match : {}
        }
    ], options)

    return res.status(200)
    .json(
        new ApiResponse(201, {
            currentPage: products.page,
            totalPages: products.totalPages,
            totalProduct: products.totalDocs,
            hasNextPage: products.hasNextPage,
            nextPage: products.hasNextPage ? result.nextPage : null,
            products: products.docs,
        }, "Products fetched successfully")
    )
})


export {addProduct,
        updateProduct,
        getProductById,
        getProductByCategory,
        getAllProducts}