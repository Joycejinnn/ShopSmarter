import { ShoppingIntent } from '../types';

/** Coalesce recipes by canonical ID while preserving direct purchases and row identity. */
export function mergeShoppingIntents(existing: ShoppingIntent[], incoming: ShoppingIntent[]): ShoppingIntent[] {
  const result: ShoppingIntent[] = [];
  const recipes = new Map<string, ShoppingIntent>();
  for (const intent of [...existing, ...incoming]) {
    if (intent.type !== 'recipe' || !intent.recipeId) { result.push({...intent}); continue; }
    const previous = recipes.get(intent.recipeId);
    if (previous) previous.servings = (previous.servings ?? 2) + (intent.servings ?? 2);
    else { const copy = {...intent}; recipes.set(intent.recipeId, copy); result.push(copy); }
  }
  return result;
}
