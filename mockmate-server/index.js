import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import interviewRouter from './src/routes/interview.js';
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/auth.js";

const PORT = process.env.PORT || 5000;
connectDB();

const app = express();
app.use(cors());

app.use(express.json());


app.use('/api/interview', interviewRouter);
app.use("/api/auth", authRoutes);


app.listen(PORT, () => {
    console.log(`Mockmate server is running on port ${PORT}`);
});