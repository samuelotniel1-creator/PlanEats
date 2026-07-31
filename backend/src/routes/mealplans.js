import { Router } from 'express';
import { randomUUID } from 'crypto';
import { doc, getDoc, setDoc, collection } from 'firebase/firestore';
import { db } from '../lib/firebase.js';
import { generateMealPlan, buildShoppingList } from '../lib/planGenerator.js';

const router = Router();
const COLLECTION = 'mealPlans';

/** Firestore rejects `undefined` fields — recursively swap them for `null`. */
function sanitizeForFirestore(value) {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(sanitizeForFirestore);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeForFirestore(v)]));
  }
  return value;
}

router.post('/', async (req, res) => {
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

  try {
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

    await setDoc(doc(collection(db, COLLECTION), id), sanitizeForFirestore(record));

    res.status(201).json(record);
  } catch (err) {
    console.error('Error creating meal plan:', err);
    res.status(500).json({ error: 'No pudimos generar o guardar tu plan. Intenta de nuevo.' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, req.params.id));
    if (!snap.exists()) return res.status(404).json({ error: 'meal plan not found' });
    res.json(snap.data());
  } catch (err) {
    console.error('Error fetching meal plan:', err);
    res.status(500).json({ error: 'No pudimos cargar tu plan.' });
  }
});

router.get('/:id/recipes/:recipeId', async (req, res) => {
  try {
    const snap = await getDoc(doc(db, COLLECTION, req.params.id));
    if (!snap.exists()) return res.status(404).json({ error: 'meal plan not found' });
    const record = snap.data();
    const recipe = record.plan
      .flatMap((day) => day.meals)
      .map((meal) => meal.recipe)
      .find((r) => r.id === req.params.recipeId);
    if (!recipe) return res.status(404).json({ error: 'recipe not found' });
    res.json(recipe);
  } catch (err) {
    console.error('Error fetching recipe:', err);
    res.status(500).json({ error: 'No pudimos cargar la receta.' });
  }
});

export default router;
