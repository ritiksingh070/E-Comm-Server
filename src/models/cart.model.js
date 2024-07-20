import mongoose from "mongoose";

const cartItemSchema = new mongoose.Schema({
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


const cartSchema = new mongoose.Schema(
    {
        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        items: {
            type: [cartItemSchema],
            default: [],
        }
    }, {timestamps: true}
);

export const Cart = mongoose.model("Cart", cartSchema);
