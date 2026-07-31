import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createMealPlan } from '../lib/api';
import { loadProfile } from '../lib/profile';
import './SetupPage.css';

const DIET_OPTIONS = [
  { value: 'none', label: 'Sin restricción' },
  { value: 'vegetarian', label: 'Vegetariana' },
  { value: 'vegan', label: 'Vegana' },
];

export default function SetupPage() {
  const navigate = useNavigate();
  const profile = loadProfile();

  const [days, setDays] = useState(7);
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [servings, setServings] = useState(2);
  const [dailyKcal, setDailyKcal] = useState<number | ''>(profile?.dailyKcal ?? '');
  const [dietType, setDietType] = useState(profile?.dietType ?? 'none');
  const [allergiesText, setAllergiesText] = useState('');
  const [dislikesText, setDislikesText] = useState('');
  const [maxPrepMinutes, setMaxPrepMinutes] = useState<number | ''>('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const record = await createMealPlan({
        days,
        mealsPerDay,
        servings,
        dietType: dietType === 'none' ? undefined : dietType,
        allergies: splitList(allergiesText),
        dislikes: splitList(dislikesText),
        maxPrepMinutes: maxPrepMinutes === '' ? undefined : Number(maxPrepMinutes),
        maxDailyKcal: dailyKcal === '' ? undefined : dailyKcal,
      });
      navigate(`/plan/${record.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No pudimos generar tu plan. Intenta de nuevo.');
      setLoading(false);
    }
  }

  return (
    <div className="page">
      <p className="page-eyebrow">Nuevo plan</p>
      <h1 className="page-title">¿Qué quieres cocinar esta semana?</h1>
      <p className="page-subtitle">
        Dinos cuántos días y comidas necesitas. Nosotros armamos el menú, la lista de compras
        organizada y cada receta lista para cocinar.
      </p>

      {profile?.hasDiet && profile.dailyKcal && (
        <p className="profile-banner">
          Según tu perfil, calculamos que necesitas <strong>~{profile.dailyKcal} kcal/día</strong>.
          Puedes ajustar ese número abajo si quieres.
        </p>
      )}

      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="setup-grid">
          <fieldset className="field field-wide">
            <legend>Calorías por día (opcional)</legend>
            <input
              type="number"
              min={800}
              max={5000}
              step={50}
              placeholder="ej. 1800 — déjalo vacío si no quieres límite"
              className="text-input"
              value={dailyKcal}
              onChange={(e) => setDailyKcal(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </fieldset>

          <fieldset className="field">
            <legend>Días a planificar</legend>
            <div className="pill-group">
              {[7, 14, 30].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`pill ${days === n ? 'pill-active' : ''}`}
                  onClick={() => setDays(n)}
                >
                  {n} días
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Comidas por día</legend>
            <div className="pill-group">
              {[1, 2, 3].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`pill ${mealsPerDay === n ? 'pill-active' : ''}`}
                  onClick={() => setMealsPerDay(n)}
                >
                  {n === 1 ? 'Solo cena' : n === 2 ? 'Almuerzo + cena' : 'Desayuno, almuerzo y cena'}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Porciones por comida</legend>
            <div className="pill-group">
              {[1, 2, 4, 6].map((n) => (
                <button
                  type="button"
                  key={n}
                  className={`pill ${servings === n ? 'pill-active' : ''}`}
                  onClick={() => setServings(n)}
                >
                  {n} {n === 1 ? 'persona' : 'personas'}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Tipo de dieta</legend>
            <div className="pill-group">
              {DIET_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`pill ${dietType === opt.value ? 'pill-active' : ''}`}
                  onClick={() => setDietType(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Tiempo máximo de preparación (opcional)</legend>
            <input
              type="number"
              min={5}
              max={120}
              placeholder="ej. 30 minutos"
              className="text-input"
              value={maxPrepMinutes}
              onChange={(e) => setMaxPrepMinutes(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </fieldset>

          <fieldset className="field field-wide">
            <legend>Alergias (separadas por coma, opcional)</legend>
            <input
              type="text"
              placeholder="ej. nueces, mariscos"
              className="text-input"
              value={allergiesText}
              onChange={(e) => setAllergiesText(e.target.value)}
            />
          </fieldset>

          <fieldset className="field field-wide">
            <legend>Ingredientes que no te gustan (opcional)</legend>
            <input
              type="text"
              placeholder="ej. champiñones, cilantro"
              className="text-input"
              value={dislikesText}
              onChange={(e) => setDislikesText(e.target.value)}
            />
          </fieldset>
        </div>

        {error && <p className="form-error" role="alert">{error}</p>}

        <button type="submit" className="submit-button" disabled={loading}>
          {loading ? 'Generando tu plan…' : 'Generar mi plan de comidas'}
        </button>
      </form>
    </div>
  );
}

function splitList(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}
