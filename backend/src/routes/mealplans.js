import { Router } from 'express';
import { randomUUID } from 'crypto';
import { generateMealPlan, buildShoppingList } from '../lib/planGenerator.js';

const router = Router();

// In-memory store for generated plans (session-scoped; not persisted across restarts).
const plans = new Map();

router.post('/', (req, res) => {
  const { days, mealsPerDay, servings, dietType, allergies = [], dislikes = [], maxPrepMinutes, maxDailyKcal } = req.body || {};

  const daysNum = Number(days);
  const mealsNum = Number(mealsPerDay);
  const servingsNum = servings ? Number(servings) : 2;
  if (!Number.isInteger(daysNum) || daysNum < 1 || daysNum > 30) {
    return res.status(400).json({ error: 'days must be an integer between 1 and 30' });
  }
  if (!Number.isInteger(mealsNum) || mealsNum < 1 || mealsNum > 3) {
    return res.status(400).json({ error: 'mealsPerDay must be an integer between 1 and 3' });
  }
  if (!Number.isInteger(servingsNum) || servingsNum < 1 || servingsNum > 12) {
    return res.status(400).json({ error: 'servings must be an integer between 1 and 12' });
  }

  const maxDailyKcalNum = maxDailyKcal ? Number(maxDailyKcal) : undefined;

  const plan = generateMealPlan({
    days: daysNum,
    mealsPerDay: mealsNum,
    servings: servingsNum,
    dietType,
    allergies,
    dislikes,
    maxPrepMinutes: maxPrepMinutes ? Number(maxPrepMinutes) : undefined,
    maxDailyKcal: maxDailyKcalNum,
  });
  const shoppingList = buildShoppingList(plan);

  const id = randomUUID();
  const record = {
    id,
    createdAt: new Date().toISOString(),
    params: { days: daysNum, mealsPerDay: mealsNum, servings: servingsNum, dietType, allergies, dislikes, maxPrepMinutes, maxDailyKcal: maxDailyKcalNum },
    plan,
    shoppingList,
  };
  plans.set(id, record);

  res.status(201).json(record);
});

router.get('/:id', (req, res) => {
  const record = plans.get(req.params.id);
  if (!record) return res.status(404).json({ error: 'meal plan not found' });
  res.json(record);
});

router.get('/:id/recipes/:recipeId', (req, res) => {
  const record = plans.get(req.params.id);
  if (!record) return res.status(404).json({ error: 'meal plan not found' });
  const recipe = record.plan
    .flatMap((day) => day.meals)
    .map((meal) => meal.recipe)
    .find((r) => r.id === req.params.recipeId);
  if (!recipe) return res.status(404).json({ error: 'recipe not found' });
  res.json(recipe);
});

export default router;
