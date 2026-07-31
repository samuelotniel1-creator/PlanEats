import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { equivalencias, FUENTE, type FoodGroup } from '../data/equivalencias';
import { getRecipeCatalog } from '../lib/api';
import type { Recipe } from '../types';
import './EquivalenciasPage.css';

interface RecipeMatch {
  recipe: Recipe;
  have: string[];
  missing: string[];
  coverage: number;
}

const MEAL_LABEL: Record<string, string> = { breakfast: 'Desayuno', lunch: 'Almuerzo', dinner: 'Cena' };

/** ¿El alimento marcado en la despensa corresponde a este ingrediente de receta?
 * Los nombres no siempre coinciden exactamente (SMAE dice "Jitomate bola",
 * la receta dice "jitomate"), así que se acepta que uno contenga al otro. */
function namesMatch(pantryNombre: string, ingredientName: string) {
  const a = pantryNombre.toLowerCase();
  const b = ingredientName.toLowerCase();
  return a.includes(b) || b.includes(a);
}

interface CartLine {
  key: string; // groupId::nombre
  groupId: string;
  groupNombre: string;
  nombre: string;
  racion: string;
  raciones: number;
  kcal: number;
  proteina: number;
  grasa: number;
  hc: number;
}

// Distribución orientativa (no clínica) para sugerir cuántas raciones de cada
// categoría conviene incluir en un platillo, dado un objetivo de kcal.
const PLATO_TEMPLATE: { categoria: string; groupIds: string[]; porcentaje: number; kcalPorRacion: number }[] = [
  { categoria: 'Cereales', groupIds: ['cereales-sin-grasa', 'cereales-con-grasa'], porcentaje: 30, kcalPorRacion: 90 },
  { categoria: 'Verduras', groupIds: ['verduras-1', 'verduras-2'], porcentaje: 15, kcalPorRacion: 25 },
  { categoria: 'Frutas', groupIds: ['frutas'], porcentaje: 15, kcalPorRacion: 60 },
  { categoria: 'Alimento de origen animal', groupIds: ['aoa-muy-bajo', 'aoa-bajo', 'aoa-moderado', 'aoa-alto'], porcentaje: 20, kcalPorRacion: 67 },
  { categoria: 'Leche y sustitutos', groupIds: ['leche-descremada', 'leche-entera'], porcentaje: 10, kcalPorRacion: 120 },
  { categoria: 'Grasas', groupIds: ['grasas-mono', 'grasas-poli'], porcentaje: 10, kcalPorRacion: 55 },
];

export default function EquivalenciasPage() {
  const location = useLocation();
  const [query, setQuery] = useState('');
  const [groupFilter, setGroupFilter] = useState<string[] | null>(null);
  const [pantryMode, setPantryMode] = useState(false);
  const [pantry, setPantry] = useState<Set<string>>(new Set());
  const [cart, setCart] = useState<Record<string, number>>({});
  const [targetKcal, setTargetKcal] = useState<number | ''>(500);
  const [recipeCatalog, setRecipeCatalog] = useState<Recipe[] | null>(null);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const [catalogError, setCatalogError] = useState<string | null>(null);
  const [openRecipeId, setOpenRecipeId] = useState<string | null>(null);

  // Si llegamos aquí desde "ver sustitutos" en una receta, arrancamos ya
  // filtrados al grupo de ese ingrediente.
  useEffect(() => {
    const state = location.state as { groupIds?: string[] } | null;
    if (state?.groupIds?.length) setGroupFilter(state.groupIds);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredGroups = useMemo(() => {
    const q = query.trim().toLowerCase();
    return equivalencias
      .filter((group) => !groupFilter || groupFilter.includes(group.id))
      .map((group) => ({
        ...group,
        alimentos: group.alimentos.filter((a) => {
          const matchesQuery = !q || a.nombre.toLowerCase().includes(q);
          const matchesPantry = !pantryMode || pantry.has(itemKey(group.id, a.nombre));
          return matchesQuery && matchesPantry;
        }),
      }))
      .filter((group) => group.alimentos.length > 0);
  }, [query, groupFilter, pantryMode, pantry]);

  const totalMatches = filteredGroups.reduce((sum, g) => sum + g.alimentos.length, 0);

  const cartLines: CartLine[] = useMemo(() => {
    const lines: CartLine[] = [];
    for (const group of equivalencias) {
      for (const alimento of group.alimentos) {
        const key = itemKey(group.id, alimento.nombre);
        const raciones = cart[key];
        if (!raciones) continue;
        lines.push({
          key,
          groupId: group.id,
          groupNombre: group.nombre,
          nombre: alimento.nombre,
          racion: alimento.racion,
          raciones,
          kcal: group.kcal * raciones,
          proteina: group.proteina * raciones,
          grasa: group.grasa * raciones,
          hc: group.hc * raciones,
        });
      }
    }
    return lines;
  }, [cart]);

  const cartTotals = cartLines.reduce(
    (acc, l) => ({
      kcal: acc.kcal + l.kcal,
      proteina: acc.proteina + l.proteina,
      grasa: acc.grasa + l.grasa,
      hc: acc.hc + l.hc,
    }),
    { kcal: 0, proteina: 0, grasa: 0, hc: 0 }
  );

  const platoSugerido = useMemo(() => {
    if (!targetKcal || targetKcal <= 0) return [];
    return PLATO_TEMPLATE.map((t) => {
      const kcalAsignadas = (targetKcal * t.porcentaje) / 100;
      const raciones = Math.max(0.5, Math.round((kcalAsignadas / t.kcalPorRacion) * 2) / 2);
      return { ...t, raciones };
    });
  }, [targetKcal]);

  function addToCart(groupId: string, nombre: string, delta: number) {
    const key = itemKey(groupId, nombre);
    setCart((prev) => {
      const next = { ...prev };
      const value = Math.max(0, Math.round(((next[key] ?? 0) + delta) * 2) / 2);
      if (value === 0) delete next[key];
      else next[key] = value;
      return next;
    });
  }

  function togglePantry(groupId: string, nombre: string) {
    const key = itemKey(groupId, nombre);
    setPantry((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  function enablePantryMode() {
    setPantryMode(true);
    if (!recipeCatalog && !catalogLoading) {
      setCatalogLoading(true);
      setCatalogError(null);
      getRecipeCatalog()
        .then(setRecipeCatalog)
        .catch((err) => setCatalogError(err.message))
        .finally(() => setCatalogLoading(false));
    }
  }

  const pantryNombres = useMemo(
    () => [...pantry].map((key) => key.split('::')[1]).filter(Boolean),
    [pantry]
  );

  const recipeMatches: RecipeMatch[] = useMemo(() => {
    if (!recipeCatalog || pantryNombres.length === 0) return [];
    return recipeCatalog
      .map((recipe) => {
        const have: string[] = [];
        const missing: string[] = [];
        for (const ing of recipe.ingredients) {
          const found = pantryNombres.some((p) => namesMatch(p, ing.name));
          if (found) have.push(ing.name);
          else missing.push(ing.name);
        }
        return { recipe, have, missing, coverage: have.length / recipe.ingredients.length };
      })
      .filter((m) => m.coverage > 0)
      .sort((a, b) => b.coverage - a.coverage || a.missing.length - b.missing.length)
      .slice(0, 6);
  }, [recipeCatalog, pantryNombres]);

  return (
    <div className="page equivalencias-page">
      <p className="page-eyebrow">Referencia nutricional</p>
      <h1 className="page-title">Tabla de equivalencias (SMAE)</h1>
      <p className="page-subtitle">
        Cada alimento en la medida indicada aporta aproximadamente lo mismo que los demás de
        su mismo grupo. Arma un platillo agregando alimentos al carrito, marca lo que ya
        tienes en casa, o pide una sugerencia de raciones por objetivo de calorías.
      </p>

      <p className="equivalencias-source equivalencias-source-top">Fuente: {FUENTE}</p>

      <div className="equivalencias-toolbar">
        <input
          type="search"
          className="equivalencias-search"
          placeholder="Buscar un alimento (ej. tortilla, pollo, aguacate)…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button
          type="button"
          className={`toolbar-toggle ${pantryMode ? 'toolbar-toggle-active' : ''}`}
          onClick={() => (pantryMode ? setPantryMode(false) : enablePantryMode())}
        >
          {pantryMode ? 'Modo despensa: activo' : 'Modo despensa'}
        </button>
      </div>

      {pantryMode && (
        <section className="pantry-recipes">
          <h2 className="panel-heading">Recetas con lo que tienes</h2>
          {pantry.size === 0 && (
            <p className="pantry-recipes-empty">
              Marca alimentos con la casilla ✓ en la tabla de abajo — en cuanto tengas algo
              marcado, te mostramos aquí qué recetas de PlanEats puedes armar.
            </p>
          )}
          {pantry.size > 0 && catalogLoading && <p className="pantry-recipes-empty">Buscando recetas…</p>}
          {catalogError && <p className="pantry-recipes-empty">No pudimos cargar las recetas: {catalogError}</p>}
          {pantry.size > 0 && !catalogLoading && recipeMatches.length === 0 && (
            <p className="pantry-recipes-empty">
              Con lo que marcaste todavía no completas ninguna receta de PlanEats. Marca más
              alimentos o revisa qué te falta abajo en la tabla.
            </p>
          )}
          <ul className="pantry-recipes-list">
            {recipeMatches.map(({ recipe, have, missing, coverage }) => {
              const isOpen = openRecipeId === recipe.id;
              return (
                <li key={recipe.id} className="pantry-recipe-card">
                  <button
                    type="button"
                    className="pantry-recipe-header"
                    onClick={() => setOpenRecipeId(isOpen ? null : recipe.id)}
                  >
                    <div>
                      <span className="pantry-recipe-name">{recipe.name}</span>
                      <span className="pantry-recipe-meal">{MEAL_LABEL[recipe.mealType] ?? recipe.mealType}</span>
                    </div>
                    <span className={`pantry-recipe-coverage ${coverage === 1 ? 'pantry-recipe-coverage-full' : ''}`}>
                      {Math.round(coverage * 100)}% listo
                    </span>
                  </button>
                  {isOpen && (
                    <div className="pantry-recipe-body">
                      <div className="pantry-recipe-cols">
                        <div>
                          <p className="pantry-recipe-col-title">Ya tienes</p>
                          <ul className="pantry-recipe-ing-list pantry-recipe-have">
                            {have.map((n) => <li key={n}>{n}</li>)}
                          </ul>
                        </div>
                        {missing.length > 0 && (
                          <div>
                            <p className="pantry-recipe-col-title">Te falta</p>
                            <ul className="pantry-recipe-ing-list pantry-recipe-missing">
                              {missing.map((n) => <li key={n}>{n}</li>)}
                            </ul>
                          </div>
                        )}
                      </div>
                      <ol className="pantry-recipe-instructions">
                        {recipe.instructions.map((step, i) => <li key={i}>{step}</li>)}
                      </ol>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          <p className="pantry-recipes-note">
            El emparejamiento es por nombre (ej. "jitomate" con "Jitomate bola") y puede no
            ser exacto — revisa la lista antes de cocinar.
          </p>
        </section>
      )}

      {groupFilter && (
        <button type="button" className="group-filter-chip" onClick={() => setGroupFilter(null)}>
          Mostrando solo:{' '}
          {equivalencias
            .filter((g) => groupFilter.includes(g.id))
            .map((g) => g.nombre)
            .join(', ')}{' '}
          ✕
        </button>
      )}

      {query && (
        <p className="equivalencias-count">
          {totalMatches} resultado{totalMatches === 1 ? '' : 's'} para "{query}"
        </p>
      )}

      <section className="plato-sugerido">
        <h2 className="panel-heading">Arma tu plato por objetivo de calorías</h2>
        <div className="plato-sugerido-input">
          <label htmlFor="target-kcal">¿Cuántas kcal buscas en esta comida?</label>
          <input
            id="target-kcal"
            type="number"
            min={100}
            max={1500}
            step={50}
            className="text-input target-kcal-input"
            value={targetKcal}
            onChange={(e) => setTargetKcal(e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>
        {platoSugerido.length > 0 && (
          <>
            <ul className="plato-sugerido-list">
              {platoSugerido.map((t) => (
                <li key={t.categoria}>
                  <span className="plato-categoria">{t.categoria}</span>
                  <span className="plato-raciones">{t.raciones} ración{t.raciones === 1 ? '' : 'es'}</span>
                  <button
                    type="button"
                    className="plato-jump"
                    onClick={() => setGroupFilter(t.groupIds)}
                  >
                    ver alimentos
                  </button>
                </li>
              ))}
            </ul>
            <p className="plato-sugerido-note">
              Sugerencia orientativa basada en una distribución típica de grupos SMAE — no
              sustituye un plan hecho por tu nutriólogo.
            </p>
          </>
        )}
      </section>

      <div className="equivalencias-layout">
        <div className="equivalencias-groups">
          {filteredGroups.map((group) => (
            <GroupSection
              key={group.id}
              group={group}
              cart={cart}
              pantry={pantry}
              pantryMode={pantryMode}
              onAdd={addToCart}
              onTogglePantry={togglePantry}
              onFilterGroup={() => setGroupFilter(group.id)}
            />
          ))}
          {filteredGroups.length === 0 && (
            <p className="equivalencias-empty">No encontramos ningún alimento con ese nombre.</p>
          )}
        </div>

        <aside className="mi-platillo">
          <h2 className="panel-heading">Mi platillo</h2>
          {cartLines.length === 0 ? (
            <p className="mi-platillo-empty">
              Agrega alimentos con el botón "+" para armar un platillo y ver su total
              nutrimental aquí.
            </p>
          ) : (
            <>
              <ul className="mi-platillo-list">
                {cartLines.map((l) => (
                  <li key={l.key}>
                    <div className="mi-platillo-line-main">
                      <span className="mi-platillo-name">{l.nombre}</span>
                      <span className="mi-platillo-raciones">
                        {l.raciones} × {l.racion}
                      </span>
                    </div>
                    <div className="mi-platillo-line-actions">
                      <button type="button" onClick={() => addToCart(l.groupId, l.nombre, -0.5)}>−</button>
                      <button type="button" onClick={() => addToCart(l.groupId, l.nombre, 0.5)}>+</button>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mi-platillo-totals">
                <div className="mi-platillo-total-row mi-platillo-total-kcal">
                  <span>Total</span>
                  <span>{Math.round(cartTotals.kcal)} kcal</span>
                </div>
                <div className="mi-platillo-total-row">
                  <span>Proteína</span>
                  <span>{Math.round(cartTotals.proteina * 10) / 10} g</span>
                </div>
                <div className="mi-platillo-total-row">
                  <span>Grasa</span>
                  <span>{Math.round(cartTotals.grasa * 10) / 10} g</span>
                </div>
                <div className="mi-platillo-total-row">
                  <span>Hidratos de carbono</span>
                  <span>{Math.round(cartTotals.hc * 10) / 10} g</span>
                </div>
              </div>
            </>
          )}
        </aside>
      </div>

      <p className="equivalencias-source">Fuente: {FUENTE}</p>
    </div>
  );
}

function GroupSection({
  group,
  cart,
  pantry,
  pantryMode,
  onAdd,
  onTogglePantry,
  onFilterGroup,
}: {
  group: FoodGroup;
  cart: Record<string, number>;
  pantry: Set<string>;
  pantryMode: boolean;
  onAdd: (groupId: string, nombre: string, delta: number) => void;
  onTogglePantry: (groupId: string, nombre: string) => void;
  onFilterGroup: () => void;
}) {
  const [equivalentOpenFor, setEquivalentOpenFor] = useState<string | null>(null);
  // Lista completa del grupo (sin el filtro de búsqueda/despensa que pueda
  // traer `group` desde el padre), para que "ver equivalente" siempre
  // muestre TODAS las alternativas aunque estés buscando algo específico.
  const fullGroup = equivalencias.find((g) => g.id === group.id) ?? group;

  return (
    <section className="equivalencias-group">
      <div className="equivalencias-group-header">
        <h2 className="equivalencias-group-title">{group.nombre}</h2>
        <div className="equivalencias-group-header-right">
          <div className="equivalencias-macros">
            <span>{group.kcal} kcal</span>
            <span>{group.proteina} g prot</span>
            <span>{group.grasa} g grasa</span>
            <span>{group.hc} g HC</span>
          </div>
          <button type="button" className="group-only-button" onClick={onFilterGroup}>
            ver solo este grupo
          </button>
        </div>
      </div>
      {group.nota && <p className="equivalencias-nota">{group.nota}</p>}
      <ul className="equivalencias-list">
        {group.alimentos.map((a) => {
          const key = itemKey(group.id, a.nombre);
          const raciones = cart[key] ?? 0;
          const inPantry = pantry.has(key);
          const isEquivalentOpen = equivalentOpenFor === a.nombre;
          const equivalentOptions = fullGroup.alimentos.filter((other) => other.nombre !== a.nombre);

          return (
            <li key={a.nombre} className="equivalencias-item-wrap">
              <div className="equivalencias-item">
                {pantryMode && (
                  <button
                    type="button"
                    className={`pantry-checkbox ${inPantry ? 'pantry-checkbox-checked' : ''}`}
                    onClick={() => onTogglePantry(group.id, a.nombre)}
                    aria-pressed={inPantry}
                  >
                    {inPantry && '✓'}
                  </button>
                )}
                <span className="equivalencias-item-name">{a.nombre}</span>
                <span className="equivalencias-item-racion">{a.racion}</span>
                <div className="equivalencias-item-cart">
                  {raciones > 0 && (
                    <>
                      <button type="button" onClick={() => onAdd(group.id, a.nombre, -0.5)}>−</button>
                      <span className="equivalencias-item-qty">{raciones}</span>
                    </>
                  )}
                  <button type="button" className="add-button" onClick={() => onAdd(group.id, a.nombre, 0.5)}>
                    +
                  </button>
                  <button
                    type="button"
                    className={`equivalent-button ${isEquivalentOpen ? 'equivalent-button-active' : ''}`}
                    title="Ver equivalente"
                    aria-label="Ver equivalente"
                    onClick={() => setEquivalentOpenFor(isEquivalentOpen ? null : a.nombre)}
                  >
                    ⇄
                  </button>
                </div>
              </div>

              {isEquivalentOpen && (
                <div className="equivalent-panel">
                  <p className="equivalent-panel-label">
                    En vez de <strong>{a.racion}</strong> de {a.nombre}, puedes usar cualquiera de
                    estos (misma ración = mismo aporte nutrimental):
                  </p>
                  <ul className="equivalent-panel-list">
                    {equivalentOptions.map((opt) => (
                      <li key={opt.nombre}>
                        <span className="equivalent-panel-name">{opt.nombre}</span>
                        <span className="equivalent-panel-racion">{opt.racion}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

function itemKey(groupId: string, nombre: string) {
  return `${groupId}::${nombre}`;
}
