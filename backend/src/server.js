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

// Vercel imports this file as a serverless function (no listening socket —
// it calls the exported app directly per request), so only bind a port when
// running as a normal long-lived Node process (local dev, or a traditional host).
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Eater API listening on http://localhost:${PORT}`);
  });
}

export default app;
