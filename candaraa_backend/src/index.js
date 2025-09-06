import {config} from "dotenv";
config();
import express from "express";
import cors from "cors";
import authRouter from "./routes/authRoutes.js"
import profileRouter from "./routes/profileRoutes.js"
import gameRouter from "./routes/gameRoutes.js"
import questionRouter from "./routes/questionRoutes.js"
import conversionRouter from "./routes/conversionRoutes.js"
import adminRouter from "./routes/adminRoutes.js"
import leaderBoardRouter from "./routes/leaderBoard.js"



const app = express();
const PORT = process.env.PORT;

app.use(cors({
  origin: 'http://127.0.0.1:5500', 
  credentials: true,               
}));

app.use(express.json());
app.use(express.urlencoded({extended: true}));


app.use("/auth", authRouter);
app.use("/profile", profileRouter);
app.use("/game", gameRouter);
app.use("/question", questionRouter);
app.use("/convert", conversionRouter);
app.use("/auth", adminRouter)
app.use("/leaderboard", leaderBoardRouter)


app.listen(PORT, () => {
    console.log(`Server is now running on ${PORT}`);
})