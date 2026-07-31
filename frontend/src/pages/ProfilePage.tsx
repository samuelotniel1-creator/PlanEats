import { FormEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { calcDailyKcal, saveProfile, type ActivityLevel, type Goal, type Sex } from '../lib/profile';
import './SetupPage.css';
import './ProfilePage.css';

const DIET_OPTIONS = [
  { value: 'none', label: 'Sin restricción' },
  { value: 'vegetarian', label: 'Vegetariana' },
  { value: 'vegan', label: 'Vegana' },
];

const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string }[] = [
  { value: 'sedentario', label: 'Sedentario (poco o nada de ejercicio)' },
  { value: 'ligera', label: 'Actividad ligera (1-3 días/semana)' },
  { value: 'moderada', label: 'Actividad moderada (3-5 días/semana)' },
  { value: 'alta', label: 'Actividad alta (6-7 días/semana)' },
  { value: 'muy_alta', label: 'Muy alta (entrenamiento intenso diario)' },
];

const GOAL_OPTIONS: { value: Goal; label: string }[] = [
  { value: 'bajar', label: 'Bajar de peso' },
  { value: 'mantener', label: 'Mantener mi peso' },
  { value: 'subir', label: 'Subir de peso' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState<'ask' | 'form'>('ask');

  // Pregunta de calorías al inicio, opcional, compartida por ambos caminos
  // (calcularlas con el formulario detallado, o seguir sin calcularlas).
  const [dailyKcal, setDailyKcal] = useState<number | ''>('');

  const [dietType, setDietType] = useState('none');
  const [sex, setSex] = useState<Sex>('mujer');
  const [weightKg, setWeightKg] = useState<number | ''>('');
  const [heightCm, setHeightCm] = useState<number | ''>('');
  const [age, setAge] = useState<number | ''>('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('sedentario');
  const [goal, setGoal] = useState<Goal>('mantener');

  function continueWithoutCalculating() {
    saveProfile({ hasDiet: dailyKcal !== '', dailyKcal: dailyKcal === '' ? undefined : dailyKcal });
    navigate('/setup');
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (weightKg === '' || heightCm === '' || age === '') return;
    const calculatedKcal = calcDailyKcal({ sex, weightKg, heightCm, age, activityLevel, goal });
    saveProfile({
      hasDiet: true,
      dietType: dietType === 'none' ? undefined : dietType,
      sex,
      weightKg,
      heightCm,
      age,
      activityLevel,
      goal,
      // Si el usuario ya había escrito un número manualmente, lo respetamos
      // en vez de sobreescribirlo con el cálculo automático.
      dailyKcal: dailyKcal !== '' ? dailyKcal : calculatedKcal,
    });
    navigate('/setup');
  }

  const kcalField = (
    <fieldset className="field field-wide">
      <legend>Calorías por día que buscas (opcional)</legend>
      <input
        type="number"
        min={800}
        max={5000}
        step={50}
        placeholder="ej. 1800 — déjalo vacío si no lo sabes"
        className="text-input"
        value={dailyKcal}
        onChange={(e) => setDailyKcal(e.target.value === '' ? '' : Number(e.target.value))}
      />
    </fieldset>
  );

  if (step === 'ask') {
    return (
      <div className="page">
        <p className="page-eyebrow">Bienvenido a PlanEats</p>
        <h1 className="page-title">¿Cuántas calorías por día buscas?</h1>
        <p className="page-subtitle">
          Es opcional — si ya sabes tu número, escríbelo. Si no, podemos calcularlo con tu
          peso, estatura y actividad, o seguir sin calorías por ahora.
        </p>

        <form className="setup-form" onSubmit={(e) => e.preventDefault()}>
          <div className="setup-grid">{kcalField}</div>
        </form>

        <div className="ask-cards">
          <button type="button" className="ask-card" onClick={() => setStep('form')}>
            <span className="ask-card-title">Ayúdenme a calcularlas</span>
            <span className="ask-card-desc">
              Te pedimos peso, estatura, edad y actividad para estimar cuántas calorías
              necesitas al día.
            </span>
          </button>
          <button type="button" className="ask-card" onClick={continueWithoutCalculating}>
            <span className="ask-card-title">Continuar al plan de comidas</span>
            <span className="ask-card-desc">
              Usamos el número de arriba si lo escribiste, o seguimos sin límite de calorías.
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="page">
      <p className="page-eyebrow">Tu perfil</p>
      <h1 className="page-title">Cuéntanos un poco de ti</h1>
      <p className="page-subtitle">
        Usamos la ecuación de Mifflin-St Jeor para estimar tus calorías diarias. Es un
        estimado — ajusta tu objetivo con tu nutriólogo si llevas seguimiento médico.
      </p>

      <form className="setup-form" onSubmit={handleSubmit}>
        <div className="setup-grid">
          {kcalField}

          <fieldset className="field">
            <legend>Sexo</legend>
            <div className="pill-group">
              <button type="button" className={`pill ${sex === 'mujer' ? 'pill-active' : ''}`} onClick={() => setSex('mujer')}>
                Mujer
              </button>
              <button type="button" className={`pill ${sex === 'hombre' ? 'pill-active' : ''}`} onClick={() => setSex('hombre')}>
                Hombre
              </button>
            </div>
          </fieldset>

          <fieldset className="field">
            <legend>Edad (años)</legend>
            <input
              type="number"
              min={12}
              max={100}
              required
              className="text-input"
              value={age}
              onChange={(e) => setAge(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </fieldset>

          <fieldset className="field">
            <legend>Peso (kg)</legend>
            <input
              type="number"
              min={30}
              max={250}
              required
              className="text-input"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </fieldset>

          <fieldset className="field">
            <legend>Estatura (cm)</legend>
            <input
              type="number"
              min={120}
              max={230}
              required
              className="text-input"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value === '' ? '' : Number(e.target.value))}
            />
          </fieldset>

          <fieldset className="field field-wide">
            <legend>Nivel de actividad física</legend>
            <div className="pill-group">
              {ACTIVITY_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`pill ${activityLevel === opt.value ? 'pill-active' : ''}`}
                  onClick={() => setActivityLevel(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field field-wide">
            <legend>Objetivo</legend>
            <div className="pill-group">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  type="button"
                  key={opt.value}
                  className={`pill ${goal === opt.value ? 'pill-active' : ''}`}
                  onClick={() => setGoal(opt.value)}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </fieldset>

          <fieldset className="field field-wide">
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
        </div>

        <button type="submit" className="submit-button">
          Calcular mis calorías y continuar
        </button>
      </form>
    </div>
  );
}
