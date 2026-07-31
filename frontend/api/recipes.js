import { recipes } from './_lib/data/seed.js';
import { estimateNutrition, breakdownNutrition } from './_lib/lib/nutrition.js';

export default function handler(_req, res) {
  const catalog = recipes.map((recipe) => {
    const { instructionsFn, ...rest } = recipe;
    return {
      ...rest,
      instructions: instructionsFn(recipe.ingredients),
      nutrition: estimateNutrition(recipe.ingredients),
      equivalencias: breakdownNutrition(recipe.ingredients),
    };
  });
  res.status(200).json(catalog);
}
