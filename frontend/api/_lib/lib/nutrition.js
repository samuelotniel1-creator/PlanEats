import { ingredientNutrition } from '../data/ingredientNutrition.js';

/** Suma la contribución nutrimental de una lista de ingredientes ya escalados. */
export function estimateNutrition(ingredients) {
  const totals = { kcal: 0, proteina: 0, grasa: 0, hc: 0 };
  for (const item of ingredients) {
    const info = ingredientNutrition[item.name];
    if (!info) continue;
    totals.kcal += info.kcalPerUnit * item.quantity;
    totals.proteina += info.proteinaPerUnit * item.quantity;
    totals.grasa += info.grasaPerUnit * item.quantity;
    totals.hc += info.hcPerUnit * item.quantity;
  }
  return {
    kcal: Math.round(totals.kcal),
    proteina: Math.round(totals.proteina * 10) / 10,
    grasa: Math.round(totals.grasa * 10) / 10,
    hc: Math.round(totals.hc * 10) / 10,
  };
}

/** Igual que estimateNutrition, pero conserva el desglose por ingrediente (para "ver en equivalencias"). */
export function breakdownNutrition(ingredients) {
  return ingredients.map((item) => {
    const info = ingredientNutrition[item.name];
    if (!info) return { ...item, grupo: 'Sin clasificar', kcal: 0 };
    return {
      ...item,
      grupo: info.grupo,
      kcal: Math.round(info.kcalPerUnit * item.quantity),
    };
  });
}
