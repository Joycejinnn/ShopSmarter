import { describe, it, expect } from 'vitest';
import { mergeShoppingIntents } from '../services/mergeShoppingIntents';
import { parseNaturalLanguageInput } from '../services/intentParser';
import { calculateIngredientShortfalls } from '../algorithms/shortfallCalculator';
const parse = (text: string) => parseNaturalLanguageInput(text).intents;
describe('Repeated dish additions', () => {
 it('merges quick adds and manual additions, retaining the original row ID', () => {
  const original = parse('Make mapo tofu for 2');
  const twice = mergeShoppingIntents(original, parse('Make mapo tofu for 2'));
  const result = mergeShoppingIntents(twice, parse('Make mapo tofu for 3'));
  const recipes = result.filter(i=>i.type==='recipe');
  expect(recipes).toHaveLength(1); expect(recipes[0].servings).toBe(7);
  expect(recipes[0].id).toBe(original[0].id); expect(original[0].servings).toBe(2);
  const pork = calculateIngredientShortfalls(result, []).find(r=>r.ingredientId==='ing_ground_pork');
  expect(pork?.shortfall).toBe(525);
 });
 it('merges aliases and existing duplicate dishes without losing other needs', () => {
  const existing = [...parse('Make mapo tofu for 2'), ...parse('Make mapo tofu for 4'), ...parse('buy milk')];
  const result = mergeShoppingIntents(existing, parse('麻婆豆腐 for 3').filter(i=>i.type==='recipe'));
  expect(result.filter(i=>i.type==='recipe')).toHaveLength(1);
  expect(result.find(i=>i.type==='recipe')?.servings).toBe(9);
  expect(result.filter(i=>i.type==='direct_item')).toEqual(existing.filter(i=>i.type==='direct_item'));
 });
 it('keeps different dishes separate', () => {
  const result=mergeShoppingIntents(parse('Make mapo tofu for 2'),parse('Make tomato egg stir-fry for 4'));
  expect(result.filter(i=>i.type==='recipe').map(i=>i.servings)).toEqual([2,4]);
 });
});
