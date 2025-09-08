import {config} from "dotenv";
config();
import express from "express";
import cors from "cors";
import cookieParser from 'cookie-parser';
import authRouter from "./routes/authRoutes.js"
import profileRouter from "./routes/profileRoutes.js"
import gameRouter from "./routes/gameRoutes.js"
import questionRouter from "./routes/questionRoutes.js"
import conversionRouter from "./routes/conversionRoutes.js"
import adminRouter from "./routes/adminRoutes.js"
import leaderBoardRouter from "./routes/leaderBoard.js"
import walletRouter from "./routes/walletRoutes.js"
import guestRouter from "./routes/guestRoutes.js"



const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: ["http://localhost:5500", "http://127.0.0.1:5500", "https://candaraa-frontend.vercel.app"] ,
  credentials: true          
}));




app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/game", gameRouter);
app.use("/question", questionRouter);
app.use("/convert", conversionRouter);
app.use("/admin", adminRouter)
app.use("/leaderboard", leaderBoardRouter)
app.use("/wallet", walletRouter)
app.use("/guest", guestRouter)

app.listen(PORT, () => {
    console.log(`Server is now running on ${PORT}`);
})