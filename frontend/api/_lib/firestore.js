/** Firestore rejects `undefined` fields — recursively swap them for `null`. */
export function sanitizeForFirestore(value) {
  if (value === undefined) return null;
  if (Array.isArray(value)) return value.map(sanitizeForFirestore);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, sanitizeForFirestore(v)]));
  }
  return value;
}

export const MEAL_PLANS_COLLECTION = 'mealPlans';
