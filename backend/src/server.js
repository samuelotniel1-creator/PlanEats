import express from 'express';
import cors from 'cors';
import mealPlansRouter from './routes/mealplans.js';
import recipesRouter from './routes/recipes.js';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => res.json({ ok: true }));
app.use('/api/meal-plans', mealPlansRouter);
app.use('/api/recipes', recipesRouter);

app.listen(PORT, () => {
  console.log(`Eater API listening on http://localhost:${PORT}`);
});
