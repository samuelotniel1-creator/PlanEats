import { recipes as allRecipes } from '../data/seed.js';
import { estimateNutrition, breakdownNutrition } from './nutrition.js';

const MEAL_ORDER = ['breakfast', 'lunch', 'dinner'];

function mealTypesFor(mealsPerDay) {
  if (mealsPerDay >= 3) return MEAL_ORDER;
  if (mealsPerDay === 2) return ['lunch', 'dinner'];
  return ['dinner'];
}

function matchesPreferences(recipe, prefs) {
  const { dietType, allergies = [], dislikes = [], maxPrepMinutes } = prefs;
  if (dietType && dietType !== 'none' && !recipe.dietTags.includes(dietType)) return false;
  if (allergies.some((a) => recipe.allergenTags.includes(a))) return false;
  if (dislikes.some((d) => recipe.ingredients.some((i) => i.name.toLowerCase().includes(d.toLowerCase())))) return false;
  if (maxPrepMinutes && recipe.prepMinutes + recipe.cookMinutes > maxPrepMinutes) return false;
  return true;
}

/**
 * Picks a recipe for a meal slot, minimizing repeats within a look-back window.
 * When a per-meal kcal target is given, narrows the pool first to the 3 candidates
 * whose estimated calories (at the requested serving size) land closest to that
 * target, then applies the repeat-avoidance and randomizes among what's left —
 * this is a best-effort nudge, not a strict calorie guarantee.
 */
function pickRecipe(candidates, recentlyUsed, lookback, targetKcalPerMeal) {
  let pool = candidates;
  if (targetKcalPerMeal) {
    // Per-person kcal is independent of how many servings the household cooks
    // (scaling preserves the per-person amount), so compare against the
    // recipe's own serving count rather than the requested household size.
    const withDistance = candidates
      .map((r) => {
        const perPersonKcal = estimateNutrition(r.ingredients).kcal / r.servings;
        return { recipe: r, distance: Math.abs(perPersonKcal - targetKcalPerMeal) };
      })
      .sort((a, b) => a.distance - b.distance);
    pool = withDistance.slice(0, Math.min(3, withDistance.length)).map((w) => w.recipe);
  }
  const fresh = pool.filter((r) => !recentlyUsed.slice(-lookback).includes(r.id));
  const finalPool = fresh.length > 0 ? fresh : pool;
  return finalPool[Math.floor(Math.random() * finalPool.length)];
}

/**
 * Returns a copy of the recipe with ingredient quantities scaled to the
 * requested serving size, and instructions regenerated from those scaled
 * quantities (instructionsFn is a template that reads amounts off the
 * ingredient list, so the prose stays in sync with the numbers).
 */
function scaleRecipe(recipe, targetServings) {
  const factor = targetServings / recipe.servings;
  const scaledIngredients = recipe.ingredients.map((i) => ({
    ...i,
    quantity: roundQuantity(i.quantity * factor),
  }));
  const { instructionsFn, ...rest } = recipe;
  return {
    ...rest,
    servings: targetServings,
    ingredients: scaledIngredients,
    instructions: instructionsFn(scaledIngredients),
    nutrition: estimateNutrition(scaledIngredients),
    equivalencias: breakdownNutrition(scaledIngredients),
  };
}

function roundQuantity(q) {
  return Math.round(q * 100) / 100;
}

export function generateMealPlan({ days, mealsPerDay, servings, dietType, allergies, dislikes, maxPrepMinutes, maxDailyKcal }) {
  const prefs = { dietType, allergies, dislikes, maxPrepMinutes };
  const mealTypes = mealTypesFor(mealsPerDay);
  const usedByMealType = Object.fromEntries(mealTypes.map((t) => [t, []]));
  const targetKcalPerMeal = maxDailyKcal ? maxDailyKcal / mealTypes.length : undefined;

  const plan = [];
  for (let dayIndex = 0; dayIndex < days; dayIndex++) {
    const meals = [];
    for (const mealType of mealTypes) {
      const candidates = allRecipes.filter((r) => r.mealType === mealType && matchesPreferences(r, prefs));
      if (candidates.length === 0) continue;
      const lookback = Math.min(candidates.length - 1, 3);
      const recipe = pickRecipe(candidates, usedByMealType[mealType], Math.max(lookback, 0), targetKcalPerMeal);
      usedByMealType[mealType].push(recipe.id);
      meals.push({ mealType, recipe: scaleRecipe(recipe, servings) });
    }
    const kcalTotal = meals.reduce((sum, m) => sum + m.recipe.nutrition.kcal, 0);
    plan.push({ dayIndex, meals, kcalTotal });
  }
  return plan;
}

const DAYS_PER_SHOPPING_TRIP = 7;

/**
 * Builds a categorized shopping list from a generated plan.
 *
 * Non-perishables are summed across the whole plan and bought once at the start.
 *
 * Perishables are re-grouped every 7 days (a realistic shopping-trip cadence):
 * quantities only accumulate WITHIN a week, so a 30-day plan produces ~4 restock
 * lists instead of collapsing everything onto the first few days an ingredient
 * happens to appear — which is what a plan built from a small recipe pool that
 * repeats every 3-4 days would otherwise do if grouped by first-ever occurrence.
 */
export function buildShoppingList(plan) {
  const nonPerishableTotals = new Map(); // key -> item
  const perishableByWeek = new Map(); // weekIndex -> Map(key -> item)

  for (const { dayIndex, meals } of plan) {
    const weekIndex = Math.floor(dayIndex / DAYS_PER_SHOPPING_TRIP);
    for (const { recipe } of meals) {
      for (const item of recipe.ingredients) {
        const key = `${item.ingredientId}:${item.unit}`;
        const isPerishable = !NON_PERISHABLE_NAMES.has(item.name);

        if (!isPerishable) {
          const existing = nonPerishableTotals.get(key);
          if (existing) existing.quantity += item.quantity;
          else nonPerishableTotals.set(key, { ingredientId: item.ingredientId, name: item.name, unit: item.unit, quantity: item.quantity, isPerishable: false, firstDayIndex: 0 });
          continue;
        }

        if (!perishableByWeek.has(weekIndex)) perishableByWeek.set(weekIndex, new Map());
        const weekTotals = perishableByWeek.get(weekIndex);
        const existing = weekTotals.get(key);
        if (existing) {
          existing.quantity += item.quantity;
          existing.firstDayIndex = Math.min(existing.firstDayIndex, dayIndex);
        } else {
          weekTotals.set(key, {
            ingredientId: item.ingredientId,
            name: item.name,
            unit: item.unit,
            quantity: item.quantity,
            isPerishable: true,
            firstDayIndex: dayIndex,
          });
        }
      }
    }
  }

  const perishables = [...perishableByWeek.values()]
    .flatMap((weekTotals) => [...weekTotals.values()])
    .sort((a, b) => a.firstDayIndex - b.firstDayIndex || a.name.localeCompare(b.name));

  return {
    nonPerishables: [...nonPerishableTotals.values()].sort((a, b) => a.name.localeCompare(b.name)),
    perishables,
  };
}

const NON_PERISHABLE_NAMES = new Set([
  'avena', 'miel', 'canela en polvo', 'frijoles refritos', 'garbanzo cocido',
  'arroz', 'frijol negro cocido', 'papa', 'lentejas',
  'comino en polvo', 'aceite de oliva', 'ajo', 'cebolla blanca',
  'nuez', 'atún en agua', 'camote', 'cebolla morada', 'chile guajillo', 'chile ancho',
]);
