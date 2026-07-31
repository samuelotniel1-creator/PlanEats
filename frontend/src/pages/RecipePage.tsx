import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getMealPlan } from '../lib/api';
import { equivalencias } from '../data/equivalencias';
import { mapGrupoLabelToIds } from '../lib/groupMapping';
import type { MealPlanRecord, Recipe } from '../types';
import './RecipePage.css';

interface Substitution {
  nombre: string;
  racion: string;
  raciones: number;
  grupoNombre: string;
  kcal: number;
  proteina: number;
  grasa: number;
  hc: number;
}

export default function RecipePage() {
  const { planId, recipeId } = useParams();
  const [record, setRecord] = useState<MealPlanRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showEquivalencias, setShowEquivalencias] = useState(false);
  const [openFor, setOpenFor] = useState<string | null>(null);
  const [substitutions, setSubstitutions] = useState<Record<string, Substitution>>({});

  useEffect(() => {
    if (!planId) return;
    getMealPlan(planId)
      .then(setRecord)
      .catch((err) => setError(err.message));
  }, [planId]);

  const recipe: Recipe | undefined = record?.plan
    .flatMap((d) => d.meals)
    .map((m) => m.recipe)
    .find((r) => r.id === recipeId);

  const hasSubstitutions = Object.keys(substitutions).length > 0;

  const totals = useMemo(() => {
    if (!recipe) return null;
    if (!hasSubstitutions) return recipe.nutrition;
    let kcal = 0, proteina = 0, grasa = 0, hc = 0;
    for (const eq of recipe.equivalencias) {
      const sub = substitutions[eq.ingredientId];
      if (sub) {
        kcal += sub.kcal;
        proteina += sub.proteina;
        grasa += sub.grasa;
        hc += sub.hc;
      } else {
        // Para los ingredientes no sustituidos, reconstruimos su aporte
        // completo (no solo kcal) a partir de su propio grupo SMAE.
        const groupIds = mapGrupoLabelToIds(eq.grupo);
        const group = equivalencias.find((g) => groupIds.includes(g.id));
        if (group && group.kcal > 0) {
          const raciones = eq.kcal / group.kcal;
          proteina += group.proteina * raciones;
          grasa += group.grasa * raciones;
          hc += group.hc * raciones;
        }
        kcal += eq.kcal;
      }
    }
    return {
      kcal: Math.round(kcal),
      proteina: Math.round(proteina * 10) / 10,
      grasa: Math.round(grasa * 10) / 10,
      hc: Math.round(hc * 10) / 10,
    };
  }, [recipe, substitutions, hasSubstitutions]);

  if (error) return <p className="page-error">{error}</p>;
  if (!record) return <p className="page-loading">Cargando receta…</p>;
  if (!recipe) return <p className="page-error">No encontramos esta receta en tu plan.</p>;

  const totalMinutes = recipe.prepMinutes + recipe.cookMinutes;

  function pickSubstitute(ingredientId: string, groupId: string, alimento: { nombre: string; racion: string }) {
    const group = equivalencias.find((g) => g.id === groupId);
    const original = recipe!.equivalencias.find((e) => e.ingredientId === ingredientId);
    if (!group || !original) return;
    const originalGroupIds = mapGrupoLabelToIds(original.grupo);
    const originalGroup = equivalencias.find((g) => originalGroupIds.includes(g.id));
    const originalGroupKcal = originalGroup?.kcal || 1;
    const raciones = Math.max(0.5, Math.round((original.kcal / originalGroupKcal) * 2) / 2);
    setSubstitutions((prev) => ({
      ...prev,
      [ingredientId]: {
        nombre: alimento.nombre,
        racion: alimento.racion,
        raciones,
        grupoNombre: group.nombre,
        kcal: group.kcal * raciones,
        proteina: group.proteina * raciones,
        grasa: group.grasa * raciones,
        hc: group.hc * raciones,
      },
    }));
    setOpenFor(null);
  }

  function clearSubstitute(ingredientId: string) {
    setSubstitutions((prev) => {
      const next = { ...prev };
      delete next[ingredientId];
      return next;
    });
  }

  return (
    <div className="page recipe-page">
      <Link to={`/plan/${record.id}`} className="back-link">
        ← Volver al menú
      </Link>

      <div className="recipe-hero">
        <p className="page-eyebrow">{mealTypeLabel(recipe.mealType)}</p>
        <h1 className="recipe-title font-display">{recipe.name}</h1>
        <div className="recipe-meta">
          <span>{recipe.prepMinutes} min preparación</span>
          <span className="meta-sep">·</span>
          <span>{recipe.cookMinutes} min cocción</span>
          <span className="meta-sep">·</span>
          <span>{totalMinutes} min total</span>
          <span className="meta-sep">·</span>
          <span>{recipe.servings} {recipe.servings === 1 ? 'porción' : 'porciones'}</span>
          <span className="meta-sep">·</span>
          <span>~{totals?.kcal ?? recipe.nutrition.kcal} kcal</span>
        </div>
        {recipe.dietTags.length > 0 && (
          <div className="tag-row">
            {recipe.dietTags.map((tag) => (
              <span className="tag" key={tag}>{dietTagLabel(tag)}</span>
            ))}
          </div>
        )}
      </div>

      <div className="recipe-body">
        <section className="ingredients-panel">
          <h2 className="panel-title">Ingredientes</h2>
          <ul className="ingredients-list">
            {recipe.ingredients.map((ing) => {
              const eq = recipe.equivalencias.find((e) => e.ingredientId === ing.ingredientId);
              const groupIds = eq ? mapGrupoLabelToIds(eq.grupo) : [];
              const alternatives = groupIds
                .flatMap((id) => {
                  const group = equivalencias.find((g) => g.id === id);
                  return group ? group.alimentos.map((a) => ({ ...a, groupId: id, groupKcal: group.kcal })) : [];
                })
                .filter((a) => a.nombre.toLowerCase() !== ing.name.toLowerCase());

              const raciones = eq && alternatives[0] ? Math.max(0.5, Math.round((eq.kcal / alternatives[0].groupKcal) * 2) / 2) : null;
              const isOpen = openFor === ing.ingredientId;
              const sub = substitutions[ing.ingredientId];

              return (
                <li key={ing.ingredientId} className="ing-row">
                  <div className="ing-main">
                    {sub ? (
                      <>
                        <span className="ing-quantity">{sub.raciones} × {sub.racion}</span>
                        <span className="ing-name">{sub.nombre}</span>
                      </>
                    ) : (
                      <>
                        <span className="ing-quantity">{formatQuantity(ing.quantity)} {ing.unit}</span>
                        <span className="ing-name">{ing.name}</span>
                      </>
                    )}
                  </div>
                  {alternatives.length > 0 && (
                    <div className="ing-actions">
                      {sub && (
                        <button type="button" className="ing-action-link" onClick={() => clearSubstitute(ing.ingredientId)}>
                          revertir
                        </button>
                      )}
                      <button
                        type="button"
                        className="ing-action-link"
                        onClick={() => setOpenFor(isOpen ? null : ing.ingredientId)}
                      >
                        {isOpen ? 'ocultar equivalentes' : 'ver equivalentes'}
                      </button>
                    </div>
                  )}

                  {sub && (
                    <p className="ing-swap-warning">
                      ⚠️ Cambiaste <strong>{ing.name}</strong> por <strong>{sub.nombre}</strong> — los
                      pasos de preparación de abajo se escribieron para {ing.name}, el proceso puede
                      no ser exactamente el mismo con este ingrediente.
                    </p>
                  )}

                  {isOpen && (
                    <div className="ing-picker">
                      <p className="ing-picker-label">
                        Si no tienes "{ing.name}", puedes usar en su lugar (misma cantidad
                        nutrimental, grupo {eq?.grupo}):
                      </p>
                      <ul className="ing-equivalents-list">
                        {alternatives.map((alt) => (
                          <li key={alt.nombre}>
                            <span className="eq-alt-name">{alt.nombre}</span>
                            <span className="eq-alt-qty">
                              {raciones ?? 1} × {alt.racion}
                            </span>
                            <button
                              type="button"
                              className="eq-alt-use"
                              onClick={() => pickSubstitute(ing.ingredientId, alt.groupId, alt)}
                            >
                              usar este
                            </button>
                          </li>
                        ))}
                      </ul>
                      <Link to="/equivalencias" state={{ groupIds }} className="ing-picker-more">
                        Ver todos en la tabla de equivalencias →
                      </Link>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>

          <button type="button" className="equivalencias-toggle" onClick={() => setShowEquivalencias((v) => !v)}>
            {showEquivalencias ? 'Ocultar equivalencias' : 'Ver en equivalencias (SMAE)'}
          </button>

          {showEquivalencias && totals && (
            <div className="equivalencias-breakdown">
              <div className="equivalencias-breakdown-totals">
                <span>{totals.kcal} kcal</span>
                <span>{totals.proteina} g prot</span>
                <span>{totals.grasa} g grasa</span>
                <span>{totals.hc} g HC</span>
              </div>
              <ul className="equivalencias-breakdown-list">
                {recipe.equivalencias.map((eq) => {
                  const sub = substitutions[eq.ingredientId];
                  return (
                    <li key={eq.ingredientId}>
                      <span className="eq-name">{sub ? sub.nombre : eq.name}</span>
                      <span className="eq-grupo">{sub ? sub.grupoNombre : eq.grupo}</span>
                      <span className="eq-kcal">{sub ? Math.round(sub.kcal) : eq.kcal} kcal</span>
                    </li>
                  );
                })}
              </ul>
              <p className="equivalencias-breakdown-note">
                Estimado a partir del Sistema Mexicano de Alimentos Equivalentes (SMAE) — no
                sustituye una valoración de tu nutriólogo.
              </p>
            </div>
          )}
        </section>

        <section className="instructions-panel">
          <h2 className="panel-title">Preparación</h2>
          <ol className="instructions-list">
            {recipe.instructions.map((step, i) => (
              <li key={i}>
                <span className="step-number">{i + 1}</span>
                <span className="step-text">{step}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>
    </div>
  );
}

function mealTypeLabel(mealType: string) {
  return { breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena' }[mealType] ?? mealType;
}

function dietTagLabel(tag: string) {
  return { vegetarian: 'vegetariana', vegan: 'vegana' }[tag] ?? tag;
}

function formatQuantity(q: number) {
  return Number.isInteger(q) ? q : Math.round(q * 10) / 10;
}
