import mongoose from "mongoose";
import {DB_NAME} from "../constant.js";

const dbConnect = async () => {
    try {
        const connection = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\n connected to mongodb: ${connection.connection.host}`)
    }catch(error) {
        console.log("Couldn't connect to Mongo", error);
        process.exit(1);
    }
}

export default dbConnect