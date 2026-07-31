import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { getMealPlan } from '../lib/api';
import type { MealPlanRecord, ShoppingItem } from '../types';
import './ShoppingListPage.css';

const DAY_LABEL = ['Día 1', 'Día 2', 'Día 3', 'Día 4', 'Día 5', 'Día 6', 'Día 7'];

export default function ShoppingListPage() {
  const { planId } = useParams();
  const [record, setRecord] = useState<MealPlanRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [checked, setChecked] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!planId) return;
    getMealPlan(planId)
      .then(setRecord)
      .catch((err) => setError(err.message));
  }, [planId]);

  const groupedPerishables = useMemo(() => {
    if (!record) return [];
    const groups = new Map<number, ShoppingItem[]>();
    for (const item of record.shoppingList.perishables) {
      const list = groups.get(item.firstDayIndex) ?? [];
      list.push(item);
      groups.set(item.firstDayIndex, list);
    }
    return [...groups.entries()].sort((a, b) => a[0] - b[0]);
  }, [record]);

  function toggle(key: string) {
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }

  if (error) return <p className="page-error">{error}</p>;
  if (!record) return <p className="page-loading">Cargando tu lista de compras…</p>;

  return (
    <div className="page">
      <p className="page-eyebrow">Tu plan · {record.params.days} días</p>
      <h1 className="page-title">Lista de compras</h1>
      <p className="page-subtitle">
        Compra los no perecederos de una vez. Los perecederos están agrupados por el día en que
        los necesitas, para que lleguen frescos a la mesa.
      </p>

      <section className="shopping-section">
        <h2 className="shopping-section-title">
          <span className="dot dot-olive" /> No perecederos — comprar al inicio
        </h2>
        <ul className="item-list">
          {record.shoppingList.nonPerishables.map((item) => {
            const key = `np-${item.ingredientId}`;
            return (
              <ShoppingRow key={key} item={item} checked={checked.has(key)} onToggle={() => toggle(key)} />
            );
          })}
        </ul>
      </section>

      {groupedPerishables.map(([dayIndex, items]) => (
        <section className="shopping-section" key={dayIndex}>
          <h2 className="shopping-section-title">
            <span className="dot dot-terracotta" /> Perecederos — comprar antes de{' '}
            {DAY_LABEL[dayIndex] ?? `Día ${dayIndex + 1}`}
          </h2>
          <ul className="item-list">
            {items.map((item) => {
              const key = `p-${dayIndex}-${item.ingredientId}`;
              return (
                <ShoppingRow key={key} item={item} checked={checked.has(key)} onToggle={() => toggle(key)} />
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}

function ShoppingRow({
  item,
  checked,
  onToggle,
}: {
  item: ShoppingItem;
  checked: boolean;
  onToggle: () => void;
}) {
  return (
    <li className={`item-row ${checked ? 'item-row-checked' : ''}`}>
      <button type="button" className="item-row-button" onClick={onToggle} aria-pressed={checked}>
        <span className="item-checkbox">{checked && '✓'}</span>
        <span className="item-name">{item.name}</span>
        <span className="item-quantity">
          {formatQuantity(item.quantity)} {item.unit}
        </span>
      </button>
    </li>
  );
}

function formatQuantity(q: number) {
  return Number.isInteger(q) ? q : Math.round(q * 10) / 10;
}
