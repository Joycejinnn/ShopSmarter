import React, { useState } from 'react';
import { RecipeIngredient, ProductCategory } from '../../types';
import { KNOWN_COOKING_INGREDIENTS } from '../../services/intentParser';
import { ChefHat, Plus, Trash2, X, Sparkles } from 'lucide-react';

interface CustomRecipeModalProps {
  initialDishName?: string;
  isOpen: boolean;
  onClose: () => void;
  onSave: (dishName: string, servings: number, ingredients: RecipeIngredient[]) => void;
}

export const CustomRecipeModal: React.FC<CustomRecipeModalProps> = ({
  initialDishName = '',
  isOpen,
  onClose,
  onSave
}) => {
  const [dishName, setDishName] = useState(initialDishName || '');
  const [servings, setServings] = useState(2);
  const [ingredients, setIngredients] = useState<
    { name: string; quantity: number; unit: string; category: ProductCategory }[]
  >([
    { name: 'Chicken Thighs', quantity: 300, unit: 'g', category: 'Meat' },
    { name: 'Potatoes', quantity: 2, unit: 'piece', category: 'Vegetables' }
  ]);

  if (!isOpen) return null;

  const handleAddRow = () => {
    setIngredients((prev) => [
      ...prev,
      { name: '', quantity: 1, unit: 'piece', category: 'Vegetables' }
    ]);
  };

  const handleRemoveRow = (idx: number) => {
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleUpdateRow = (idx: number, field: string, value: any) => {
    setIngredients((prev) =>
      prev.map((item, i) => {
        if (i !== idx) return item;
        const updated = { ...item, [field]: value };
        // If name matches known ingredient, auto-fill unit & category
        if (field === 'name') {
          const match = KNOWN_COOKING_INGREDIENTS.find((k) =>
            k.keywords.some((kw) => kw.toLowerCase() === String(value).toLowerCase().trim())
          );
          if (match) {
            updated.unit = match.unit;
            updated.category = match.category;
            if (updated.quantity === 1) updated.quantity = match.defaultQty;
          }
        }
        return updated;
      })
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validIngredients: RecipeIngredient[] = ingredients
      .filter((ing) => ing.name.trim().length > 0 && ing.quantity > 0)
      .map((ing) => ({
        ingredientId: ing.name.toLowerCase().replace(/\s+/g, '_'),
        name: ing.name.trim(),
        quantity: Number(ing.quantity),
        unit: ing.unit,
        category: ing.category
      }));

    if (!dishName.trim() || validIngredients.length === 0) return;

    onSave(dishName.trim(), servings, validIngredients);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-floating border border-brand-border space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-brand-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-brand-lightgreen text-brand-darkgreen flex items-center justify-center">
              <ChefHat className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-brand-darkgreen">
                Add Custom Recipe & Ingredients
              </h3>
              <p className="text-[11px] text-brand-muted">
                Manually specify dish requirements with full pantry & store allocation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Dish Name & Servings */}
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 space-y-1">
              <label className="font-semibold text-brand-darkgreen">Dish Name</label>
              <input
                type="text"
                placeholder="e.g. Potato Beef Stew, Ratatouille"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                className="w-full p-2 rounded-xl border border-brand-border focus:outline-none focus:ring-1 focus:ring-brand-primary"
                required
              />
            </div>
            <div className="space-y-1">
              <label className="font-semibold text-brand-darkgreen">Servings</label>
              <input
                type="number"
                min="1"
                max="20"
                value={servings}
                onChange={(e) => setServings(Math.max(1, Number(e.target.value)))}
                className="w-full p-2 rounded-xl border border-brand-border focus:outline-none focus:ring-1 focus:ring-brand-primary text-center font-bold"
                required
              />
            </div>
          </div>

          {/* Ingredient Rows */}
          <div className="space-y-2">
            <div className="flex items-center justify-between font-semibold text-brand-darkgreen">
              <span>Required Ingredients ({ingredients.length}):</span>
              <button
                type="button"
                onClick={handleAddRow}
                className="text-[11px] text-brand-primary hover:text-brand-darkgreen flex items-center gap-1 font-bold"
              >
                <Plus className="w-3 h-3" /> Add Ingredient
              </button>
            </div>

            <div className="space-y-1.5 max-h-52 overflow-y-auto pr-1">
              {ingredients.map((ing, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-brand-canvas p-1.5 rounded-xl border border-brand-border/60">
                  <input
                    type="text"
                    placeholder="Ingredient (e.g. Eggs, Beef)"
                    value={ing.name}
                    onChange={(e) => handleUpdateRow(idx, 'name', e.target.value)}
                    className="flex-1 p-1.5 rounded-lg border border-brand-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                    required
                  />
                  <input
                    type="number"
                    min="0.1"
                    step="any"
                    placeholder="Qty"
                    value={ing.quantity}
                    onChange={(e) => handleUpdateRow(idx, 'quantity', Number(e.target.value))}
                    className="w-16 p-1.5 rounded-lg border border-brand-border text-xs text-center focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
                    required
                  />
                  <select
                    value={ing.unit}
                    onChange={(e) => handleUpdateRow(idx, 'unit', e.target.value)}
                    className="p-1.5 rounded-lg border border-brand-border text-xs bg-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                  >
                    <option value="piece">piece</option>
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="clove">clove</option>
                    <option value="head">head</option>
                    <option value="block">block</option>
                    <option value="pack">pack</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => handleRemoveRow(idx)}
                    disabled={ingredients.length <= 1}
                    className="p-1.5 text-stone-400 hover:text-red-500 disabled:opacity-30"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Quick presets */}
          <div className="pt-2 border-t border-brand-border/60 flex items-center justify-between text-xs">
            <span className="text-[11px] text-brand-muted">
              Auto-links to My Pantry & Store Offers
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-xl border border-brand-border text-stone-600 hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-brand-primary text-white font-bold hover:bg-brand-darkgreen shadow-sm"
              >
                Save to Planned Meals
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
