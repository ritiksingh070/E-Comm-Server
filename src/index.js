import dotenv from "dotenv"
import dbConnect from "./database/index.db.js";
import { app } from "./app.js";

dotenv.config({path: './.env'})

dbConnect()
.then(
    app.listen(process.env.PORT || 6000, () => {
        console.log(`Server is started and running at port : ${process.env.PORT}`)
    })
)
.catch((error) => {
    console.log("Error ecountered while connecting : ", error)
})

app.on("error" , (error) => {
    console.log("Error ecountered", error)
    throw error
})
