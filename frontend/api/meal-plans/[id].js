import { doc, getDoc } from 'firebase/firestore';
import { db } from '../_lib/lib/firebase.js';
import { MEAL_PLANS_COLLECTION } from '../_lib/firestore.js';

export default async function handler(req, res) {
  const { id } = req.query;
  try {
    const snap = await getDoc(doc(db, MEAL_PLANS_COLLECTION, id));
    if (!snap.exists()) return res.status(404).json({ error: 'meal plan not found' });
    res.status(200).json(snap.data());
  } catch (err) {
    console.error('Error fetching meal plan:', err);
    res.status(500).json({ error: 'No pudimos cargar tu plan.' });
  }
}
