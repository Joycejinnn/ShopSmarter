import { Recipe, RecipeIngredient, ShoppingIntent } from '../types';
import { PREDEFINED_RECIPES } from '../data/recipes';

export function getRecipeById(recipeId: string): Recipe | undefined {
  return PREDEFINED_RECIPES.find((r) => r.id === recipeId);
}

export function getAllRecipes(): Recipe[] {
  return PREDEFINED_RECIPES;
}

export function scaleRecipeIngredients(
  recipe: Recipe,
  targetServings: number
): RecipeIngredient[] {
  const scaleRatio = targetServings / recipe.defaultServings;
  return recipe.ingredients.map((ing) => ({
    ...ing,
    quantity: Math.round(ing.quantity * scaleRatio * 100) / 100
  }));
}

// Overrides store the full edited recipe at the serving count when it was saved.
export function getIntentIngredients(intent: ShoppingIntent): RecipeIngredient[] {
  const recipe = intent.recipeId ? getRecipeById(intent.recipeId) : undefined;
  if (!recipe) return [];
  const servings = intent.servings || recipe.defaultServings;
  const source = intent.ingredientOverrides;
  return scaleRecipeIngredients(source ? {
    ...recipe, defaultServings: source.servings, ingredients: source.ingredients
  } : recipe, servings);
}
