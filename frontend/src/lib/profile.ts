// Perfil nutricional del usuario. Por ahora vive solo en localStorage —
// cuando se conecte una base de datos real, este módulo es el único lugar
// que cambia (persistencia), no las pantallas que lo consumen.

export type Sex = 'mujer' | 'hombre';
export type ActivityLevel = 'sedentario' | 'ligera' | 'moderada' | 'alta' | 'muy_alta';
export type Goal = 'bajar' | 'mantener' | 'subir';

export interface Profile {
  hasDiet: boolean;
  dietType?: string;
  sex?: Sex;
  weightKg?: number;
  heightCm?: number;
  age?: number;
  activityLevel?: ActivityLevel;
  goal?: Goal;
  dailyKcal?: number;
}

const STORAGE_KEY = 'planeats_profile';

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  sedentario: 1.2,
  ligera: 1.375,
  moderada: 1.55,
  alta: 1.725,
  muy_alta: 1.9,
};

const GOAL_ADJUSTMENT: Record<Goal, number> = {
  bajar: -500,
  mantener: 0,
  subir: 300,
};

/** Ecuación de Mifflin-St Jeor + factor de actividad + ajuste por objetivo. */
export function calcDailyKcal(profile: Required<Pick<Profile, 'sex' | 'weightKg' | 'heightCm' | 'age' | 'activityLevel' | 'goal'>>): number {
  const bmr =
    profile.sex === 'hombre'
      ? 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age + 5
      : 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age - 161;
  const maintenance = bmr * ACTIVITY_MULTIPLIER[profile.activityLevel];
  return Math.round(maintenance + GOAL_ADJUSTMENT[profile.goal]);
}

export function saveProfile(profile: Profile) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
}

export function loadProfile(): Profile | null {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Profile;
  } catch {
    return null;
  }
}

export function clearProfile() {
  localStorage.removeItem(STORAGE_KEY);
}
