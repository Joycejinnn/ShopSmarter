import { describe, it, expect } from 'vitest';
import { parseNaturalLanguageInput } from '../services/intentParser';
import { getIntentIngredients } from '../services/recipeService';
import { calculateIngredientShortfalls } from '../algorithms/shortfallCalculator';
import { mergeShoppingIntents } from '../services/mergeShoppingIntents';
import { ShoppingIntent } from '../types';

const original = () => parseNaturalLanguageInput('Make mapo tofu for 2').intents[0];
describe('Customized recipe shopping requirements', () => {
  it('uses replacements, removes omitted ingredients, and deducts pantry stock', () => {
    const intent: ShoppingIntent = { ...original(), ingredientOverrides: { servings: 2, ingredients: [
      { ingredientId: 'ing_ground_pork', name: 'Ground Pork', quantity: 300, unit: 'g', category: 'Meat' },
      { ingredientId: 'ing_tomatoes', name: 'Tomatoes', quantity: 2, unit: 'piece', category: 'Vegetables' }
    ] } };
    const requirements = calculateIngredientShortfalls([intent], [{ id: 'p', ingredientId: 'ing_ground_pork', name: 'Ground Pork', quantity: 100, unit: 'g', category: 'Meat', updatedAt: '' }]);
    expect(requirements.map(item => item.ingredientId)).toEqual(['ing_ground_pork', 'ing_tomatoes']);
    expect(requirements[0].shortfall).toBe(200);
    expect(requirements[1].shortfall).toBe(2);
    const merged = mergeShoppingIntents([intent], [original()]);
    expect(getIntentIngredients(merged[0]).map(item => item.quantity)).toEqual([600, 4]);
    expect(getIntentIngredients(intent)[0].quantity).toBe(300);
  });
  it('keeps a deliberately empty recipe empty and restores defaults when reset', () => {
    const intent: ShoppingIntent = { ...original(), ingredientOverrides: { servings: 2, ingredients: [] } };
    expect(calculateIngredientShortfalls([intent], [])).toEqual([]);
    expect(getIntentIngredients({ ...intent, ingredientOverrides: undefined })).toEqual(getIntentIngredients(original()));
  });
});
