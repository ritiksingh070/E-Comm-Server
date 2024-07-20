import mongoose from 'mongoose';
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";


const orderItemSchema = new mongoose.Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
    },
    quantity: {
        type: Number,
        required: true,
        min: [1, "Quantity can not be less than 1."],
        default: 1,
    },
});

const orderSchema = new mongoose.Schema(
    {
        orderPrice: {
            type: Number,
            required: true,
        },
        customer: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        orderItems: {
            type: [orderItemSchema],
            default: [],
        },
        address: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            enum: ['PENDING', 'CANCELLED', 'DELIVERED'],
            default: 'PENDING',
        },
        paymentId: {
            type: String,
        },
        isPaymentDone: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

orderSchema.plugin(mongooseAggregatePaginate);

export const Order = mongoose.model('Order', orderSchema);
