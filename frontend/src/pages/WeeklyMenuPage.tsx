import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMealPlan } from '../lib/api';
import type { MealPlanRecord, MealType } from '../types';
import './WeeklyMenuPage.css';

const MEAL_LABEL: Record<MealType, string> = {
  breakfast: 'Desayuno',
  lunch: 'Almuerzo',
  dinner: 'Cena',
};

const DAY_LABEL = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];

export default function WeeklyMenuPage() {
  const { planId } = useParams();
  const [record, setRecord] = useState<MealPlanRecord | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!planId) return;
    getMealPlan(planId)
      .then(setRecord)
      .catch((err) => setError(err.message));
  }, [planId]);

  if (error) return <p className="page-error">{error}</p>;
  if (!record) return <p className="page-loading">Cargando tu menú…</p>;

  return (
    <div className="page">
      <p className="page-eyebrow">Tu plan · {record.params.days} días</p>
      <h1 className="page-title">Menú de la semana</h1>
      <p className="page-subtitle">
        Toca cualquier plato para ver la receta completa. Cuando estés listo, revisa tu{' '}
        <Link to={`/plan/${record.id}/shopping-list`}>lista de compras</Link>.
      </p>

      <div className="menu-grid">
        {record.plan.map((day) => (
          <section className="day-card" key={day.dayIndex}>
            <div className="day-card-header">
              <h2 className="day-card-title">{DAY_LABEL[day.dayIndex] ?? `Día ${day.dayIndex + 1}`}</h2>
              <span className="day-card-kcal">~{day.kcalTotal} kcal</span>
            </div>
            <ul className="day-meals">
              {day.meals.map((meal) => (
                <li key={meal.mealType}>
                  <Link to={`/plan/${record.id}/recipe/${meal.recipe.id}`} className="meal-link">
                    <span className="meal-type">{MEAL_LABEL[meal.mealType]}</span>
                    <span className="meal-name font-display">{meal.recipe.name}</span>
                    <span className="meal-time">{meal.recipe.prepMinutes + meal.recipe.cookMinutes} min</span>
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
