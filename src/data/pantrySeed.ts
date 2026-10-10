import { PantryItem } from '../types';

export const INITIAL_PANTRY_ITEMS: PantryItem[] = [
  {
    id: 'pantry_eggs',
    ingredientId: 'ing_eggs',
    name: 'Eggs',
    quantity: 3,
    unit: 'piece',
    category: 'Dairy',
    lowStockThreshold: 4,
    isLowStock: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pantry_rice',
    ingredientId: 'ing_rice',
    name: 'Jasmine Rice',
    quantity: 500,
    unit: 'g',
    category: 'Rice and grains',
    lowStockThreshold: 500,
    isLowStock: false,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pantry_oil',
    ingredientId: 'ing_cooking_oil',
    name: 'Cooking Oil',
    quantity: 500,
    unit: 'ml',
    category: 'Cooking ingredients',
    lowStockThreshold: 200,
    isLowStock: false,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pantry_salt',
    ingredientId: 'ing_salt',
    name: 'Salt',
    quantity: 200,
    unit: 'g',
    category: 'Cooking ingredients',
    lowStockThreshold: 50,
    isLowStock: false,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pantry_garlic',
    ingredientId: 'ing_garlic',
    name: 'Garlic',
    quantity: 2,
    unit: 'clove',
    category: 'Vegetables',
    lowStockThreshold: 4,
    isLowStock: true,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pantry_soy_sauce',
    ingredientId: 'ing_soy_sauce',
    name: 'Soy Sauce',
    quantity: 150,
    unit: 'ml',
    category: 'Cooking ingredients',
    lowStockThreshold: 50,
    isLowStock: false,
    updatedAt: new Date().toISOString()
  },
  {
    id: 'pantry_sugar',
    ingredientId: 'ing_sugar',
    name: 'Sugar',
    quantity: 250,
    unit: 'g',
    category: 'Cooking ingredients',
    lowStockThreshold: 100,
    isLowStock: false,
    updatedAt: new Date().toISOString()
  }
];
