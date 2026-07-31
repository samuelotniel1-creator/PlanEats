import type { MealPlanParams, MealPlanRecord, Recipe } from '../types';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  return res.json();
}

export function createMealPlan(params: MealPlanParams): Promise<MealPlanRecord> {
  return request('/meal-plans', { method: 'POST', body: JSON.stringify(params) });
}

export function getMealPlan(id: string): Promise<MealPlanRecord> {
  return request(`/meal-plans/${id}`);
}

export function getRecipeCatalog(): Promise<Recipe[]> {
  return request('/recipes');
}
