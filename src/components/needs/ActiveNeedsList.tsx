import React from 'react';
import { ShoppingIntent, RecipeIngredient } from '../../types';
import { getRecipeById, getIntentIngredients } from '../../services/recipeService';
import { RecipeIngredientEditor } from './RecipeIngredientEditor';
import { Utensils, Package, Trash2, Users, Minus, Plus } from 'lucide-react';

interface ActiveNeedsListProps {
  intents: ShoppingIntent[];
  onRemoveIntent: (id: string) => void;
  onUpdateServings: (intentId: string, servings: number) => void;
  onClearAll: () => void;
  onUpdateRecipeIngredients: (id: string, ingredients: RecipeIngredient[] | null) => void;
}

export const ActiveNeedsList: React.FC<ActiveNeedsListProps> = ({
  intents,
  onRemoveIntent,
  onUpdateServings,
  onUpdateRecipeIngredients,
  onClearAll
}) => {
  const recipeIntents = intents.filter((i) => i.type === 'recipe');
  const directIntents = intents.filter((i) => i.type === 'direct_item');

  if (intents.length === 0) {
    return (
      <div className="bg-brand-card p-6 rounded-2xl border border-dashed border-brand-border text-center shadow-sm">
        <div className="w-10 h-10 rounded-full bg-brand-lightgreen text-brand-primary flex items-center justify-center mx-auto mb-2">
          <Utensils className="w-5 h-5" />
        </div>
        <h4 className="font-bold text-sm text-brand-darkgreen">No active meals or items yet</h4>
        <p className="text-xs text-brand-muted mt-1 max-w-xs mx-auto">
          Type dishes (e.g. "mapo tofu and spaghetti") or household essentials above, or use Quick add.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-bold uppercase tracking-wider text-brand-darkgreen flex items-center gap-1.5">
          <Utensils className="w-3.5 h-3.5 text-brand-primary" />
          Planned Meals & Essentials ({intents.length})
        </h3>
        <button
          onClick={onClearAll}
          className="text-[11px] text-red-600 hover:text-red-700 font-medium hover:underline flex items-center gap-1"
        >
          <Trash2 className="w-3 h-3" />
          Clear All
        </button>
      </div>

      {/* Planned Recipes */}
      {recipeIntents.length > 0 && (
        <div className="space-y-2">
          <div className="text-[11px] font-semibold text-brand-muted">Dishes to Cook:</div>
          {recipeIntents.map((intent) => {
            const recipe = intent.recipeId ? getRecipeById(intent.recipeId) : null;
            const servings = intent.servings || recipe?.defaultServings || 2;
            const ingredients = getIntentIngredients(intent);

            return (
              <div
                key={intent.id}
                className="bg-brand-card p-3 rounded-xl border border-brand-border shadow-sm hover:border-brand-sage/60 transition-all"
              >
                <div className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs sm:text-sm text-brand-darkgreen break-words">
                      {intent.recipeName}
                    </span>
                  </div>
                  <div className="text-[11px] text-brand-muted flex flex-wrap items-center gap-2 mt-0.5">
                    <span>{recipe?.cuisine}</span>
                    <span>•</span>
                    <span>{ingredients.length} ingredients</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 shrink-0">
                  {/* Serving Counter */}
                  <div className="flex items-center gap-1 bg-brand-canvas px-2 py-1 rounded-lg border border-brand-border">
                    <Users className="w-3 h-3 text-brand-muted mr-0.5" />
                    <button
                      type="button"
                      onClick={() => onUpdateServings(intent.id, servings - 1)}
                      disabled={servings <= 1}
                      className="p-0.5 hover:bg-stone-200 rounded text-brand-text disabled:opacity-30"
                      title="Decrease servings"
                    >
                      <Minus className="w-3 h-3" />
                    </button>
                    <span className="text-xs font-bold w-4 text-center text-brand-darkgreen">
                      {servings}
                    </span>
                    <button
                      type="button"
                      onClick={() => onUpdateServings(intent.id, servings + 1)}
                      className="p-0.5 hover:bg-stone-200 rounded text-brand-text"
                      title="Increase servings"
                    >
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  <button
                    onClick={() => onRemoveIntent(intent.id)}
                    className="p-1.5 rounded-lg text-stone-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                    title="Remove this dish"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                </div>
                {recipe && (
                  <details className="mt-3 border-t border-brand-border pt-2">
                    <summary className="cursor-pointer text-xs font-semibold text-brand-primary rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-primary">
                      Ingredients for {servings} {servings === 1 ? 'serving' : 'servings'}
                    </summary>
                    <RecipeIngredientEditor
                      key={`${intent.id}-${servings}`}
                      ingredients={ingredients}
                      customized={!!intent.ingredientOverrides}
                      onSave={items => onUpdateRecipeIngredients(intent.id, items)}
                      onReset={() => onUpdateRecipeIngredients(intent.id, null)}
                    />
                  </details>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Direct Household & Grocery Purchases */}
      {directIntents.length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="text-[11px] font-semibold text-brand-muted">Household & Direct Essentials:</div>
          <div className="flex flex-wrap gap-2">
            {directIntents.map((intent) => {
              const item = intent.directItem;
              return (
                <div
                  key={intent.id}
                  className="bg-brand-peachlight px-2.5 py-1.5 rounded-xl border border-brand-peach/40 text-xs font-medium text-brand-text flex items-center gap-2 shadow-sm"
                >
                  <Package className="w-3.5 h-3.5 text-brand-orange" />
                  <span>
                    {item?.name} ({item?.quantity} {item?.unit})
                  </span>
                  <button
                    onClick={() => onRemoveIntent(intent.id)}
                    className="text-stone-400 hover:text-red-600 ml-0.5"
                    title="Remove item"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
