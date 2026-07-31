export type MealType = 'breakfast' | 'lunch' | 'dinner';

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
}

export interface NutritionEstimate {
  kcal: number;
  proteina: number;
  grasa: number;
  hc: number;
}

export interface EquivalenciaLine extends RecipeIngredient {
  grupo: string;
  kcal: number;
}

export interface Recipe {
  id: string;
  name: string;
  mealType: MealType;
  dietTags: string[];
  allergenTags: string[];
  prepMinutes: number;
  cookMinutes: number;
  servings: number;
  ingredients: RecipeIngredient[];
  instructions: string[];
  nutrition: NutritionEstimate;
  equivalencias: EquivalenciaLine[];
}

export interface PlanMeal {
  mealType: MealType;
  recipe: Recipe;
}

export interface PlanDay {
  dayIndex: number;
  meals: PlanMeal[];
  kcalTotal: number;
}

export interface ShoppingItem {
  ingredientId: string;
  name: string;
  unit: string;
  quantity: number;
  isPerishable: boolean;
  firstDayIndex: number;
}

export interface ShoppingList {
  nonPerishables: ShoppingItem[];
  perishables: ShoppingItem[];
}

export interface MealPlanParams {
  days: number;
  mealsPerDay: number;
  servings: number;
  dietType?: string;
  allergies: string[];
  dislikes: string[];
  maxPrepMinutes?: number;
  maxDailyKcal?: number;
}

export interface MealPlanRecord {
  id: string;
  createdAt: string;
  params: MealPlanParams;
  plan: PlanDay[];
  shoppingList: ShoppingList;
}
