// Traduce el nombre de grupo usado en el desglose nutrimental de una receta
// (ver backend/src/data/ingredientNutrition.js) a los ids de FoodGroup de
// frontend/src/data/equivalencias.ts, para poder saltar directo a "sus"
// sustitutos dentro de la tabla completa del SMAE.
const GRUPO_LABEL_TO_IDS: Record<string, string[]> = {
  'Cereales sin grasa': ['cereales-sin-grasa'],
  'Cereales con grasa': ['cereales-con-grasa'],
  'Verduras': ['verduras-1', 'verduras-2'],
  'Frutas': ['frutas'],
  'AOA — muy bajo en grasa': ['aoa-muy-bajo'],
  'AOA — bajo en grasa': ['aoa-bajo'],
  'AOA — moderado en grasa': ['aoa-moderado'],
  'AOA — alto en grasa': ['aoa-alto'],
  'Leche descremada': ['leche-descremada'],
  'Leche entera': ['leche-entera'],
  'Leguminosas': ['leguminosas'],
  'Grasas monoinsaturadas': ['grasas-mono'],
  'Grasas poliinsaturadas': ['grasas-poli'],
  'Grasas saturadas': ['grasas-sat'],
  'Azúcares': ['azucares'],
  'Alimentos libres de energía': ['libres'],
};

export function mapGrupoLabelToIds(label: string): string[] {
  return GRUPO_LABEL_TO_IDS[label] ?? [];
}
