import mongoose, { Schema } from "mongoose";

const profileSchema = new Schema(
    {
        firstName: {
            type: String,
            default: "Guest",
        },
        lastName: {
            type: String,
            default: "abc",
        },
        phoneNumber: {
            type: String,
            default: "123",
        },
        owner: {
            type: Schema.Types.ObjectId,
            ref: "User",
        },
    },
    { timestamps: true }
);


export const Profile = mongoose.model("Profile", profileSchema)
