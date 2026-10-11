import React, { useId, useState } from 'react';
import { RecipeIngredient } from '../../types';
import { getAllRecipes } from '../../services/recipeService';
import { normalizeIngredientName } from '../../services/ingredientNormalizer';

const catalog = getAllRecipes().flatMap(recipe => recipe.ingredients);
const findIngredient = (name: string) => catalog.find(item => item.name.toLowerCase() === name.trim().toLowerCase()) || catalog.find(item => item.ingredientId === normalizeIngredientName(name));
const names = [...new Set(catalog.map(item => item.name))].sort();

interface Props {
  ingredients: RecipeIngredient[];
  customized: boolean;
  onSave: (items: RecipeIngredient[]) => void;
  onReset: () => void;
}

export function RecipeIngredientEditor({ ingredients, customized, onSave, onReset }: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<RecipeIngredient[]>([]);
  const listId = useId();
  const update = (index: number, patch: Partial<RecipeIngredient>) =>
    setDraft(items => items.map((item, i) => i === index ? { ...item, ...patch } : item));
  const inputClass = 'min-w-0 w-full rounded border border-brand-border bg-white p-2 text-xs';

  if (editing) return (
    <form className="mt-3 space-y-3" onSubmit={event => {
      event.preventDefault();
      const cleaned = draft.map(item => {
        const name = item.name.trim();
        const known = findIngredient(name);
        return { ...item, name, unit: known?.unit || item.unit.trim(),
          ingredientId: known?.ingredientId || normalizeIngredientName(name),
          category: known?.category || item.category };
      });
      if (cleaned.some(item => !item.name || !item.unit || !Number.isFinite(item.quantity) || item.quantity <= 0)) return;
      onSave(cleaned);
      setEditing(false);
    }}>
      <p className="text-[11px] text-brand-muted">Amounts are for the current servings. Save to update your shopping list. Known ingredients use their standard units.</p>
      <datalist id={listId}>{names.map(name => <option key={name} value={name} />)}</datalist>
      {draft.map((item, index) => (
        <div key={index} className="space-y-2 border-b border-brand-border pb-3">
          <label className="block text-xs">Ingredient
            <input required aria-label={`Ingredient ${index + 1}`} list={listId} className={inputClass} value={item.name}
              onChange={event => update(index, { name: event.target.value, unit: findIngredient(event.target.value)?.unit || item.unit })} />
          </label>
          <div className="flex items-end gap-2">
            <label className="min-w-0 flex-1 text-xs">Amount
              <input required aria-label={`Amount ${index + 1}`} type="number" min="0.01" step="0.01" className={inputClass}
                value={Number.isNaN(item.quantity) ? '' : item.quantity}
                onChange={event => update(index, { quantity: event.target.valueAsNumber })} />
            </label>
            <label className="min-w-0 flex-1 text-xs">Unit
              <input required aria-label={`Unit ${index + 1}`} className={inputClass} readOnly={!!findIngredient(item.name)} value={item.unit}
                onChange={event => update(index, { unit: event.target.value })} />
            </label>
            <button type="button" className="p-2 text-xs text-red-600" aria-label={`Remove ingredient ${index + 1}`}
              onClick={() => setDraft(items => items.filter((_, i) => i !== index))}>Remove</button>
          </div>
        </div>
      ))}
      <button type="button" className="text-xs font-semibold text-brand-primary" onClick={() => setDraft(items => [...items,
        { ingredientId: '', name: '', quantity: 1, unit: 'g', category: 'Cooking ingredients' }
      ])}>+ Add ingredient</button>
      <div className="flex gap-3">
        <button type="submit" className="rounded-lg bg-brand-primary px-3 py-2 text-xs font-semibold text-white">Save changes</button>
        <button type="button" className="px-3 py-2 text-xs" onClick={() => setEditing(false)}>Cancel</button>
      </div>
    </form>
  );

  return <div className="mt-2 space-y-2">
    <p className="text-[11px] text-brand-muted">Full recipe amounts, before pantry deductions. Amounts scale with servings.</p>
    {ingredients.length === 0 && <p className="text-xs text-brand-muted">No ingredients. Add ingredients to include this dish in your shopping list.</p>}
    <ul className="space-y-2" aria-label="Recipe ingredients">
      {ingredients.map((item, index) => <li key={`${item.ingredientId}-${index}`} className="flex items-start justify-between gap-3 text-xs">
        <span className="min-w-0">{item.name}{item.optional && <span className="text-brand-muted"> (optional)</span>}</span>
        <span className="shrink-0 font-medium tabular-nums">{item.quantity} {item.unit}</span>
      </li>)}
    </ul>
    <div className="flex flex-wrap gap-3 pt-2">
      <button type="button" className="text-xs font-semibold text-brand-primary" onClick={() => { setDraft(ingredients.map(item => ({ ...item }))); setEditing(true); }}>Edit ingredients</button>
      {customized && <button type="button" className="text-xs text-brand-muted underline" onClick={onReset}>Reset recipe</button>}
    </div>
  </div>;
}
