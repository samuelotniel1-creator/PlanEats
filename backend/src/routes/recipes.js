import { Router } from 'express';
import { recipes } from '../data/seed.js';
import { estimateNutrition, breakdownNutrition } from '../lib/nutrition.js';
import { rewriteRecipeWithGemini } from '../lib/gemini.js';

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

/**
 * Reescribe una receta con IA (Gemini) cuando el usuario sustituye un
 * ingrediente por un equivalente SMAE desde RecipePage. La cantidad de la
 * sustitución "vive" en el frontend (ver `substitutions` en RecipePage.tsx);
 * aquí solo se le pide a la IA que redacte la receta resultante.
 */
router.post('/rewrite', async (req, res) => {
  const { recipe, originalIngredient, substituteIngredient, equivalentGroup, quantity } = req.body ?? {};

  if (
    !recipe ||
    typeof recipe.name !== 'string' ||
    !Array.isArray(recipe.ingredients) ||
    !Array.isArray(recipe.instructions) ||
    typeof originalIngredient !== 'string' ||
    typeof substituteIngredient !== 'string' ||
    typeof equivalentGroup !== 'string'
  ) {
    return res.status(400).json({ error: 'Faltan campos requeridos o tienen un formato inválido' });
  }

  try {
    const rewritten = await rewriteRecipeWithGemini({
      recipe,
      originalIngredient,
      substituteIngredient,
      equivalentGroup,
      quantity: typeof quantity === 'number' ? quantity : 1,
    });
    res.json(rewritten);
  } catch (err) {
    console.error('rewriteRecipeWithGemini failed:', err.message);
    res.status(502).json({ error: 'No se pudo generar la receta con IA en este momento. Intenta de nuevo.' });
  }
});

export default router;
