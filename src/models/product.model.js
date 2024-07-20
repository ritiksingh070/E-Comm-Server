import mongoose from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const productSchema = new mongoose.Schema(
    {
        description: {
            required: true,
            type: String,
        },
        name: {
            required: true,
            type: String,
        },
        productImage: {
            required: true,
            type: {
                url: String,
                localPath: String,
            },
        },
        price: {
            type: Number,
            default: 0,
        },
        stock: {
            default: 0,
            type: Number,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Category',
            required: true,
        },
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
    },
    { timestamps: true }

);

productSchema.plugin(mongooseAggregatePaginate);

export const Product = mongoose.model('Product', productSchema);
