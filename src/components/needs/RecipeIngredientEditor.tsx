import React, { useId, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
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
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('piece');
  const inputClass = 'min-w-0 w-full rounded-lg border border-brand-border bg-white p-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary';
  const adjustQuantity = (index: number, value: number) =>
    setDraft(items => items.map((item, i) => i === index ? { ...item, quantity: value } : item));
  const closeAddForm = () => { setShowAddForm(false); setName(''); setQuantity('1'); setUnit('piece'); };

  if (editing) return (
    <div className="mt-3 space-y-3">
      <p className="text-[11px] text-brand-muted">Adjust amounts for the current servings. Save to update your shopping list.</p>
      <form className="space-y-3" onSubmit={event => {
        event.preventDefault();
        if (draft.some(item => !Number.isFinite(item.quantity) || item.quantity <= 0)) return;
        onSave(draft.map(item => ({ ...item })));
        closeAddForm();
        setEditing(false);
      }}>
        <div className="divide-y divide-brand-border/60">
          {draft.map((item, index) => {
            const step = item.unit === 'g' || item.unit === 'ml' ? 50 : 1;
            return <div key={index} className="flex flex-wrap items-center justify-between gap-2 py-2 text-xs">
              <div className="min-w-0 flex-1 font-semibold text-brand-darkgreen">
                {item.name}{item.optional && <span className="font-normal text-brand-muted"> (optional)</span>}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button type="button" aria-label={`Decrease ${item.name}`} disabled={!Number.isFinite(item.quantity) || item.quantity <= 0.01}
                  className="h-7 w-7 rounded border border-brand-border bg-brand-canvas font-bold disabled:opacity-30"
                  onClick={() => adjustQuantity(index, Math.max(0.01, Math.round((item.quantity - step) * 100) / 100))}>−</button>
                <input required aria-label={`Amount ${index + 1}`} type="number" min="0.01" step="any"
                  className="w-16 rounded border border-brand-border bg-white p-1 text-center text-xs"
                  value={Number.isNaN(item.quantity) ? '' : item.quantity}
                  onChange={event => adjustQuantity(index, event.target.valueAsNumber)} />
                <span className="text-brand-muted">{item.unit}</span>
                <button type="button" aria-label={`Increase ${item.name}`} disabled={!Number.isFinite(item.quantity)}
                  className="h-7 w-7 rounded border border-brand-border bg-brand-canvas font-bold disabled:opacity-30"
                  onClick={() => adjustQuantity(index, Math.round((item.quantity + step) * 100) / 100)}>+</button>
                <button type="button" className="ml-1 rounded p-1.5 text-stone-400 hover:bg-red-50 hover:text-red-600"
                  aria-label={`Remove ingredient ${index + 1}`} title={`Remove ${item.name}`}
                  onClick={() => setDraft(items => items.filter((_, i) => i !== index))}><Trash2 className="h-3.5 w-3.5" /></button>
              </div>
            </div>;
          })}
        </div>
        {draft.length === 0 && <p className="text-xs text-brand-muted">No ingredients. Add an ingredient below.</p>}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="mr-auto flex items-center gap-1 rounded-lg bg-brand-lightgreen p-2 text-xs font-semibold text-brand-darkgreen"
            onClick={() => setShowAddForm(value => !value)} aria-expanded={showAddForm}><Plus className="h-3.5 w-3.5" />Add ingredient</button>
          <button type="submit" disabled={showAddForm} className="rounded-lg bg-brand-primary px-3 py-2 text-xs font-semibold text-white disabled:opacity-40">Save changes</button>
          <button type="button" className="py-2 text-xs" onClick={() => { closeAddForm(); setEditing(false); }}>Cancel</button>
        </div>
      </form>
      {showAddForm && <form aria-label="Add ingredient to dish" className="space-y-2 rounded-xl border border-brand-border bg-brand-canvas p-3 text-xs"
        onSubmit={event => {
          event.preventDefault();
          const amount = Number(quantity);
          if (!name.trim() || !Number.isFinite(amount) || amount <= 0) return;
          const known = findIngredient(name);
          const ingredient: RecipeIngredient = { ingredientId: known?.ingredientId || normalizeIngredientName(name.trim()),
            name: known?.name || name.trim(), quantity: amount, unit, category: known?.category || 'Cooking ingredients' };
          setDraft(items => {
            const index = items.findIndex(item => item.ingredientId === ingredient.ingredientId && item.unit === ingredient.unit);
            return index === -1 ? [...items, ingredient] : items.map((item, i) => i === index
              ? { ...item, quantity: Math.round((item.quantity + amount) * 100) / 100 } : item);
          });
          closeAddForm();
        }}>
        <div className="font-bold text-brand-darkgreen">Add Ingredient to Dish</div>
        <datalist id={listId}>{names.map(value => <option key={value} value={value} />)}</datalist>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          <input required aria-label="New ingredient name" placeholder="Item name (e.g. Eggs)" list={listId} value={name}
            className={`col-span-2 ${inputClass}`} onChange={event => {
              setName(event.target.value); const known = findIngredient(event.target.value); if (known) setUnit(known.unit);
            }} />
          <input required aria-label="New ingredient quantity" type="number" min="0.01" step="any" placeholder="Qty" value={quantity}
            className={inputClass} onChange={event => setQuantity(event.target.value)} />
          <select aria-label="New ingredient unit" value={unit} className={inputClass} onChange={event => setUnit(event.target.value)}>
            {[['piece','piece(s)'], ['g','grams (g)'], ['ml','milliliters (ml)'], ['clove','clove(s)'], ['head','head(s)'], ['block','block(s)'], ['pack','pack']].map(([value,label]) => <option key={value} value={value}>{label}</option>)}
            {!['piece','g','ml','clove','head','block','pack'].includes(unit) && <option value={unit}>{unit}</option>}
          </select>
        </div>
        <div className="flex justify-end gap-1.5 pt-1">
          <button type="button" onClick={closeAddForm} className="px-2.5 py-1 text-stone-500">Cancel</button>
          <button type="submit" className="rounded-lg bg-brand-primary px-3 py-1 font-semibold text-white">Save Item</button>
        </div>
      </form>}
    </div>
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
