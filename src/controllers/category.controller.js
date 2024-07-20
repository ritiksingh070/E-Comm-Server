import { Category } from "../models/category.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";


const createCategory = asyncHandler(async(req, res) => {

    const {name} = req.body;

    const category = await Category.create({
        name,
        owner: req.user._id,
    })

    if(!category) {
        throw new ApiError(400, "Invalid Request")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, category,"Category created")
    )
})


const updateCategory = asyncHandler(async(req, res)  => {
    const {name} = req.body;
    const categoryId = req.params

    const category = await Category.findByIdAndUpdate(
        categoryId,
        {
            $set: {
                name
            }
        }, {new:true}
    )

    if (!category) {
        throw new ApiError(400, "Category not found")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, category,"Category updated successfully")
    )
})


const deleteCategory = asyncHandler(async(req,res) => {

    const categoryId = req.params;

    const category = await Category.findOneAndDelete(
        {categoryId}
    )

    if(!category) {
        throw new ApiError(400, "Category not found")
    }

    return res.status(200)
    .json(201, { deletedCategory: category}, "Category deleted successfully")
})


const getCateoryById = asyncHandler(async (req, res) => {

    const categoryId = req.params

    const category = await Category.findById(categoryId)

    if(!category) {
        throw new ApiError(400, "Category not found")
    }

    return res.status(200)
    .json(201, category, "Category fetched successfully")
})


const getAllCategories = asyncHandler(async (req, res) => {
    const {page = 1, limit = 10} = req.query

    const options = {
        page : parseInt(page),
        limit : parseInt(limit)
    }

    const category = await Category.aggregatePaginate([
        {
            $match : {}
        }
    ], options)

    if(!category) {
        throw new ApiError(404, "Failed to fetch the categories")
    }

    return res.status(200)
    .json(
        new ApiResponse(201, category, "Categories fetched successfully")
    )
})


export {createCategory,
        updateCategory,
        deleteCategory,
        getCateoryById,
        getAllCategories}