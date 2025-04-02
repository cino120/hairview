import express from 'express';
import analyzeFace from './api/analyzeFace.js';
import generateHaircut from './api/generateHaircut.js';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api', analyzeFace);
app.use('/api', generateHaircut);

app.listen(PORT, () => {
  console.log(`Backend rodando em http://localhost:${PORT}`);
});
