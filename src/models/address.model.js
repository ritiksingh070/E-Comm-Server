import mongoose, { Schema } from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const addressSchema = new Schema(
    {
        owner: { 
            type: Schema.Types.ObjectId,
            ref: "User",
        },
        addressLine1: {
            type: String,
            required: true,
        },
        addressLine2: {
            type: String,
        },
        phoneNumber: {
            type : String,
            default : "123",
            required: true,
        },
        alternatePhoneNumber: {
            type : String,
        },
        pinCode: {
            type : String,
            required : true,
        },
        city: {
            type : String,
            required : true,
        },
        state : {
            type : String,
            required : true,
        },
        country: {
            type : String,
            required : true,
        },
        landmark: {
            type : String,
        }

    }, {timestamps: true}
);

addressSchema.plugin(mongooseAggregatePaginate);

export const Address = mongoose.model("Address", addressSchema);