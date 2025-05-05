import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 4000;

// Use CORS middleware to allow requests from the frontend origin
app.use(cors({
  origin: 'https://portfolio-flax-two-58.vercel.app'
}));

app.get('/', (req, res) => {
  res.send('Backend server is running');
});

app.listen(PORT, () => {
  console.log(`Backend server running on http://localhost:${PORT}`);
});
