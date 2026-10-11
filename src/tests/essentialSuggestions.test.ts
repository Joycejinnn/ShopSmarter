import { describe, expect, it } from 'vitest';
import { getEssentialSuggestions } from '../services/essentialSuggestions';
import { calculateIngredientShortfalls, getAvailablePurchaseOptions } from '../algorithms/shortfallCalculator';

describe('Local essential disambiguation', () => {
  it('lists only soap meanings present in the catalog', () => {
    const choices = getEssentialSuggestions(' SOAP ');
    expect(choices.map(choice => choice.name)).toEqual(['Dish Soap', 'Body Wash']);
    expect(getEssentialSuggestions('hand soap')).toEqual([]);
    expect(getEssentialSuggestions('bar soap')).toEqual([]);
  });
  it('keeps exact names unambiguous and supports other broad names', () => {
    expect(getEssentialSuggestions('dish   soap')).toHaveLength(1);
    expect(getEssentialSuggestions('detergent')).toHaveLength(2);
    expect(getEssentialSuggestions('paper')).toHaveLength(2);
    expect(getEssentialSuggestions('honey')).toEqual([]);
    expect(getEssentialSuggestions('')).toEqual([]);
  });
  it('selected dish soap matches offers without a parser', () => {
    const option = getEssentialSuggestions('soap')[0];
    const requirements = calculateIngredientShortfalls([{ id: 'manual', type: 'direct_item',
      directItem: { name: option.name, unit: option.unit, quantity: 2, category: option.category }, createdAt: '' }], []);
    const offers = getAvailablePurchaseOptions(requirements[0]);
    expect(offers.length).toBeGreaterThan(0);
    expect(offers.every(offer => offer.product.id === 'prod_dish_soap_bottle')).toBe(true);
  });
});
