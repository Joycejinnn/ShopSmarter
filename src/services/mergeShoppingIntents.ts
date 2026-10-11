import { ShoppingIntent } from '../types';
import { getAllRecipes } from './recipeService';

/** Coalesce recipes by canonical ID while preserving direct purchases and row identity. */
export function mergeShoppingIntents(existing: ShoppingIntent[], incoming: ShoppingIntent[]): ShoppingIntent[] {
  const result: ShoppingIntent[] = [];
  const recipes = new Map<string, ShoppingIntent>();
  for (const intent of [...existing, ...incoming]) {
    if (intent.type !== 'recipe') { result.push({...intent}); continue; }
    const name = intent.recipeName?.trim().toLowerCase().replace(/\s+/g, ' ') || '';
    const catalogRecipe = getAllRecipes().find(recipe => recipe.name.toLowerCase() === name || recipe.aliases.some(alias => alias.toLowerCase() === name));
    const key = intent.recipeId || catalogRecipe?.id || `custom:${name}`;
    const previous = recipes.get(key);
    if (previous) previous.servings = (previous.servings ?? 2) + (intent.servings ?? 2);
    else { const copy = {...intent}; recipes.set(key, copy); result.push(copy); }
  }
  return result;
}
