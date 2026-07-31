import { Router } from 'express';
import { recipes } from '../data/seed.js';
import { estimateNutrition, breakdownNutrition } from '../lib/nutrition.js';

const router = Router();

/**
 * Full recipe catalog (not tied to a generated plan), at each recipe's base
 * serving size. Used by "¿qué puedo cocinar con lo que tengo?" in la tabla
 * de equivalencias, which needs to see every recipe's ingredient list to
 * match it against what the user marked as available.
 */
router.get('/', (_req, res) => {
  const catalog = recipes.map((recipe) => {
    const { instructionsFn, ...rest } = recipe;
    return {
      ...rest,
      instructions: instructionsFn(recipe.ingredients),
      nutrition: estimateNutrition(recipe.ingredients),
      equivalencias: breakdownNutrition(recipe.ingredients),
    };
  });
  res.json(catalog);
});

export default router;
