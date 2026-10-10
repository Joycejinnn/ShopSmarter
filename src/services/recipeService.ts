import { Recipe, RecipeIngredient } from '../types';
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
