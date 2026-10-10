import React, { useState } from 'react';
import { Search, Plus, Sparkles, ChefHat, Check } from 'lucide-react';
import { PREDEFINED_RECIPES } from '../../data/recipes';

interface NaturalLanguageInputProps {
  onAddInput: (text: string) => { explanation: string };
  lastNotification: string | null;
}

export const NaturalLanguageInput: React.FC<NaturalLanguageInputProps> = ({
  onAddInput,
  lastNotification
}) => {
  const [inputText, setInputText] = useState('');
  const [justAdded, setJustAdded] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    onAddInput(inputText);
    setInputText('');
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  const handleQuickAdd = (text: string) => {
    onAddInput(text);
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 2500);
  };

  return (
    <div className="bg-brand-card p-4 rounded-2xl border border-brand-border shadow-card">
      <div className="flex items-center justify-between mb-2">
        <label htmlFor="shopping-input" className="text-xs font-bold uppercase tracking-wider text-brand-darkgreen flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-brand-orange" />
          What’s on your list?
        </label>

      </div>

      <form onSubmit={handleSubmit} className="relative">
        <textarea
          id="shopping-input"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
          placeholder="e.g. Mapo tofu for two, milk, and laundry detergent"
          rows={2}
          className="w-full text-xs sm:text-sm p-3 pr-24 rounded-xl border border-brand-border bg-brand-canvas focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-sage/50 focus:border-brand-primary resize-none placeholder:text-stone-400 text-brand-text transition-all leading-relaxed"
        />

        <div className="absolute right-2.5 bottom-3">
          <button
            type="submit"
            disabled={!inputText.trim()}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm ${
              inputText.trim()
                ? 'bg-brand-primary text-white hover:bg-brand-darkgreen active:scale-95'
                : 'bg-stone-200 text-stone-400 cursor-not-allowed'
            }`}
          >
            {justAdded ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-300" />
                <span>Added!</span>
              </>
            ) : (
              <>
                <Plus className="w-3.5 h-3.5" />
                <span>Add to list</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Parsing feedback message */}
      {lastNotification && (
        <div className="mt-2 text-[11px] px-2.5 py-1.5 rounded-lg bg-brand-subtle text-brand-darkgreen border border-brand-border/60 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-brand-primary shrink-0"></span>
          <span role="status">{lastNotification}</span>
        </div>
      )}

      {/* Fast preset pills */}
      <details className="quick-add mt-3"><summary>Quick add recipes & essentials</summary>
        <div className="sr-only">
          <ChefHat className="w-3 h-3 text-brand-sage" />
          Quick Add Recipes & Essentials:
        </div>
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickAdd('Make mapo tofu for 2')}
            className="text-[11px] px-2 py-1 rounded-md bg-brand-canvas hover:bg-brand-lightgreen text-brand-text border border-brand-border transition-colors font-medium"
          >
            + Mapo Tofu
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd('Make tomato egg stir-fry for 2')}
            className="text-[11px] px-2 py-1 rounded-md bg-brand-canvas hover:bg-brand-lightgreen text-brand-text border border-brand-border transition-colors font-medium"
          >
            + Tomato Egg
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd('Make fried rice for 2')}
            className="text-[11px] px-2 py-1 rounded-md bg-brand-canvas hover:bg-brand-lightgreen text-brand-text border border-brand-border transition-colors font-medium"
          >
            + Fried Rice
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd('Make spaghetti bolognese for 2')}
            className="text-[11px] px-2 py-1 rounded-md bg-brand-canvas hover:bg-brand-lightgreen text-brand-text border border-brand-border transition-colors font-medium"
          >
            + Spaghetti
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd('I need toilet paper and laundry detergent')}
            className="text-[11px] px-2 py-1 rounded-md bg-brand-canvas hover:bg-brand-peachlight text-brand-text border border-brand-border transition-colors font-medium"
          >
            + Paper & Detergent
          </button>
          <button
            type="button"
            onClick={() => handleQuickAdd('I need milk and eggs')}
            className="text-[11px] px-2 py-1 rounded-md bg-brand-canvas hover:bg-brand-peachlight text-brand-text border border-brand-border transition-colors font-medium"
          >
            + Milk & Eggs
          </button>
        </div>
      </details>
    </div>
  );
};
