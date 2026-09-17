import express from 'express';
import { Routes } from './routes/index.js';

const app = express();
const PORT = process.env.PORT || 3000;

Routes(app);

app.listen(PORT, () => {
  console.log(`Application started in localhost:${PORT}`);
});
