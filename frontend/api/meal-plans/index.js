import { randomUUID } from 'crypto';
import { doc, setDoc, collection } from 'firebase/firestore';
import { db } from '../_lib/lib/firebase.js';
import { generateMealPlan, buildShoppingList } from '../_lib/lib/planGenerator.js';
import { sanitizeForFirestore, MEAL_PLANS_COLLECTION } from '../_lib/firestore.js';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).json({ error: 'Method not allowed' });
  }

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

    await setDoc(doc(collection(db, MEAL_PLANS_COLLECTION), id), sanitizeForFirestore(record));

    res.status(201).json(record);
  } catch (err) {
    console.error('Error creating meal plan:', err);
    res.status(500).json({ error: 'No pudimos generar o guardar tu plan. Intenta de nuevo.' });
  }
}
