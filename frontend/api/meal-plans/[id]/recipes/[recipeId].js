import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../_lib/lib/firebase.js';
import { MEAL_PLANS_COLLECTION } from '../../../_lib/firestore.js';

export default async function handler(req, res) {
  const { id, recipeId } = req.query;
  try {
    const snap = await getDoc(doc(db, MEAL_PLANS_COLLECTION, id));
    if (!snap.exists()) return res.status(404).json({ error: 'meal plan not found' });
    const record = snap.data();
    const recipe = record.plan
      .flatMap((day) => day.meals)
      .map((meal) => meal.recipe)
      .find((r) => r.id === recipeId);
    if (!recipe) return res.status(404).json({ error: 'recipe not found' });
    res.status(200).json(recipe);
  } catch (err) {
    console.error('Error fetching recipe:', err);
    res.status(500).json({ error: 'No pudimos cargar la receta.' });
  }
}
