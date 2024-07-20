import cookieParser from "cookie-parser";
import cors from "cors";
import express from 'express';

const app = express();

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
    })
);


app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());


import userRouter from "./routes/user.routes.js";
import profileRouter from "./routes/profile.routes.js";
import categoryRouter from "./routes/category.routes.js";
import addressRouter from "./routes/address.routes.js";
import productRouter from "./routes/product.routes.js";
import cartRouter from "./routes/cart.routes.js";


app.use("/api/v1/users", userRouter);
app.use("/api/v1/categories", categoryRouter);
app.use("/api/v1/addresses", addressRouter);
app.use("/api/v1/products", productRouter);
app.use("/api/v1/profile", profileRouter);
app.use("/api/v1/cart", cartRouter);

export {app}