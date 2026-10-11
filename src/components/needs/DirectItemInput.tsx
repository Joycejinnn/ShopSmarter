import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { DirectItemIntent } from '../../types';
import { getEssentialSuggestions } from '../../services/essentialSuggestions';

export function DirectItemInput({ onAdd }: { onAdd: (item: DirectItemIntent) => void }) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [unit, setUnit] = useState('pack');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const suggestions = getEssentialSuggestions(name);
  const selected = suggestions.find(option => option.id === selectedId) || (suggestions.length === 1 ? suggestions[0] : undefined);
  const needsChoice = suggestions.length > 1 && !selected;
  const reset = () => { setOpen(false); setName(''); setQuantity('1'); setUnit('pack'); setSelectedId(null); };
  const inputClass = 'min-w-0 w-full rounded-lg border border-brand-border bg-white p-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary';
  return <div>
    <button type="button" aria-expanded={open} onClick={() => setOpen(value => !value)}
      className="flex items-center gap-1 rounded-lg bg-brand-lightgreen px-2.5 py-1.5 text-xs font-semibold text-brand-darkgreen">
      <Plus className="h-3.5 w-3.5" />Add essential
    </button>
    {open && <form aria-label="Add household essential" className="mt-2 space-y-2 rounded-xl border border-brand-border bg-brand-canvas p-3 text-xs" onSubmit={event => {
      event.preventDefault();
      const amount = Number(quantity);
      if (!name.trim() || !Number.isFinite(amount) || amount <= 0 || needsChoice) return;
      onAdd({ name: selected?.name || name.trim(), quantity: amount, unit, category: selected?.category || 'Household essentials' });
      reset();
    }}>
      <div className="font-bold text-brand-darkgreen">Add Household Essential</div>
      <p className="text-[11px] text-brand-muted">Enter one item at a time. Added directly to your shopping list.</p>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <label className="col-span-2">Item name
          <input required value={name} onChange={event => {
            setName(event.target.value); setSelectedId(null);
            const matches = getEssentialSuggestions(event.target.value);
            if (matches.length === 1) setUnit(matches[0].unit);
          }} placeholder="e.g. Toilet paper" className={inputClass} />
        </label>
        <label>Quantity
          <input required type="number" min="0.01" step="any" value={quantity} onChange={event => setQuantity(event.target.value)} className={inputClass} />
        </label>
        <label>Unit
          <select aria-label="Unit" value={unit} onChange={event => setUnit(event.target.value)} className={inputClass}>
            {['pack', 'piece', 'bottle', 'box', 'roll', 'tube', 'canister', 'bag', 'head', 'block', 'clove', 'g', 'ml'].map(value => <option key={value} value={value}>{value}</option>)}
          </select>
        </label>
      </div>
      {suggestions.length > 0 && <fieldset className="space-y-2">
        <legend className="mb-1 font-semibold text-brand-darkgreen">{suggestions.length > 1 ? 'Which item do you mean?' : 'Matching item'}</legend>
        {suggestions.map(option => <label key={option.id} className="flex cursor-pointer items-start gap-2 rounded-lg border border-brand-border bg-white p-2">
          <input type="radio" name="essential-choice" checked={selected?.id === option.id} onChange={() => { setSelectedId(option.id); setUnit(option.unit); }} className="mt-0.5" />
          <span className="font-semibold">{option.name}</span>
        </label>)}
      </fieldset>}
      {name.trim().length >= 2 && suggestions.length === 0 && <p className="text-[11px] text-brand-muted">No matching catalog item. You can still add it to your list.</p>}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" className="px-2.5 py-1 text-stone-500" onClick={reset}>Cancel</button>
        <button type="submit" disabled={needsChoice} className="rounded-lg bg-brand-primary px-3 py-1 font-semibold text-white disabled:opacity-40">Add item</button>
      </div>
    </form>}
  </div>;
}
