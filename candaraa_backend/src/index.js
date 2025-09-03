import {config} from "dotenv";
config();
import express from "express";
import authRouter from "./routes/authRoutes.js"
import profileRouter from "./routes/profileRoutes.js"
import gameRouter from "./routes/gameRoutes.js"
import guestRouter from "./routes/guestRoutes.js"
import questionRouter from "./routes/questionRoutes.js"
import conversionRouter from "./routes/conversionRoutes.js"


const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/game", gameRouter);
app.use("/guest", guestRouter);
app.use("/question", questionRouter);
app.use("convert", conversionRouter);


app.listen(PORT, () => {
    console.log(`Server is now running on ${PORT}`);
})