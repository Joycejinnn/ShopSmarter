import { PRODUCTS } from '../data/products';
import { ProductCategory } from '../types';

export interface EssentialSuggestion {
  id: string;
  name: string;
  unit: string;
  category: ProductCategory;
}
const choices: Array<EssentialSuggestion & { aliases: string[] }> = [
  { id: 'ing_dish_soap', name: 'Dish Soap', unit: 'bottle', category: 'Cleaning supplies', aliases: ['soap', 'dish soap', 'dishwashing liquid', 'detergent', 'washing up liquid'] },
  { id: 'ing_hand_soap', name: 'Hand Soap', unit: 'bottle', category: 'Toiletries', aliases: ['soap', 'hand soap', 'liquid soap'] },
  { id: 'ing_bar_soap', name: 'Bar Soap', unit: 'piece', category: 'Toiletries', aliases: ['soap', 'bar soap', 'bath soap'] },
  { id: 'ing_body_wash', name: 'Body Wash', unit: 'bottle', category: 'Toiletries', aliases: ['soap', 'body wash', 'shower gel', 'bath soap'] },
  { id: 'ing_laundry_detergent', name: 'Laundry Detergent', unit: 'bottle', category: 'Cleaning supplies', aliases: ['detergent', 'laundry detergent'] },
  { id: 'ing_toilet_paper', name: 'Toilet Paper', unit: 'roll', category: 'Paper products', aliases: ['paper', 'tissue', 'toilet paper', 'bath tissue'] },
  { id: 'ing_paper_towels', name: 'Paper Towels', unit: 'roll', category: 'Paper products', aliases: ['paper', 'towel', 'towels', 'paper towels', 'kitchen towel'] },
  { id: 'ing_cleaning_wipes', name: 'Disinfecting Wipes', unit: 'canister', category: 'Cleaning supplies', aliases: ['wipes', 'cleaning wipes', 'disinfecting wipes'] },
  { id: 'ing_trash_bags', name: 'Trash Bags', unit: 'bag', category: 'Cleaning supplies', aliases: ['bags', 'trash bags', 'garbage bags'] }
];
const clean = (value: string) => value.trim().toLowerCase().replace(/\s+/g, ' ');

/** Local names and catalog search only. Never invent prices or stock for missing options. */
export function getEssentialSuggestions(query: string): EssentialSuggestion[] {
  const term = clean(query);
  if (term.length < 2) return [];
  const catalogChoices = choices.filter(choice => PRODUCTS.some(product => product.matchedIngredientIds.includes(choice.id)));
  const exact = catalogChoices.find(choice => clean(choice.name) === term);
  const matched = exact ? [exact] : catalogChoices.filter(choice => choice.aliases.includes(term));
  if (matched.length) return matched.map(({ aliases, ...choice }) => choice);
  const tokens = term.split(' ');
  const matches = PRODUCTS.filter(product => tokens.every(token => clean(product.name).includes(token)));
  return matches.map(product => ({ id: product.id, name: product.name, unit: product.unit,
    category: product.category }));
}
