import express from 'express';
import cors from 'cors';
import interviewRouter from './routes/interview.js';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use('/api/interview', interviewRouter);

app.listen(PORT, () => {
    console.log(`Mockmate server is running on port ${PORT}`);
});