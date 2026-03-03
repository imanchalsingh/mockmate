import dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import cors from 'cors';
import interviewRouter from './src/routes/interview.js';

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 5000;

app.use(cors());

app.use('/api/interview', interviewRouter);

app.listen(PORT, () => {
    console.log(`Mockmate server is running on port ${PORT}`);
});