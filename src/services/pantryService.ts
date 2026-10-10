import { PantryItem, PurchaseOption, IngredientRequirement } from '../types';
import { INITIAL_PANTRY_ITEMS } from '../data/pantrySeed';

const PANTRY_STORAGE_KEY = 'shopsmarter_pantry_v1';

export function loadPantryFromStorage(): PantryItem[] {
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(PANTRY_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    }
  } catch (e) {
    console.warn('Failed to load pantry from localStorage, falling back to seed', e);
  }
  return INITIAL_PANTRY_ITEMS;
}

export function savePantryToStorage(items: PantryItem[]): void {
  try {
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(PANTRY_STORAGE_KEY, JSON.stringify(items));
    }
  } catch (e) {
    console.error('Failed to save pantry to localStorage', e);
  }
}

export function resetPantryToDefault(): PantryItem[] {
  savePantryToStorage(INITIAL_PANTRY_ITEMS);
  return INITIAL_PANTRY_ITEMS;
}

export function addOrUpdatePantryItem(
  currentPantry: PantryItem[],
  newItem: Omit<PantryItem, 'id' | 'updatedAt'> & { id?: string }
): PantryItem[] {
  const existingIndex = currentPantry.findIndex(
    (item) => item.ingredientId === newItem.ingredientId || (newItem.id && item.id === newItem.id)
  );

  let updatedList: PantryItem[];
  if (existingIndex >= 0) {
    updatedList = [...currentPantry];
    updatedList[existingIndex] = {
      ...updatedList[existingIndex],
      ...newItem,
      id: updatedList[existingIndex].id,
      updatedAt: new Date().toISOString()
    };
  } else {
    const id = newItem.id || `pantry_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    updatedList = [
      ...currentPantry,
      {
        ...newItem,
        id,
        updatedAt: new Date().toISOString()
      }
    ];
  }

  savePantryToStorage(updatedList);
  return updatedList;
}

export function removePantryItem(currentPantry: PantryItem[], itemId: string): PantryItem[] {
  const updatedList = currentPantry.filter((item) => item.id !== itemId);
  savePantryToStorage(updatedList);
  return updatedList;
}

// Incorporate purchased items into pantry inventory upon trip completion
export function incorporatePurchasedItemsIntoPantry(
  currentPantry: PantryItem[],
  purchases: { requirement: IngredientRequirement; option: PurchaseOption }[]
): PantryItem[] {
  let updatedPantry = [...currentPantry];

  for (const { requirement, option } of purchases) {
    const matchIndex = updatedPantry.findIndex(
      (p) => p.ingredientId === requirement.ingredientId
    );

    if (matchIndex >= 0) {
      const existing = updatedPantry[matchIndex];
      updatedPantry[matchIndex] = {
        ...existing,
        quantity: existing.quantity + option.buyQuantity,
        isLowStock: false,
        updatedAt: new Date().toISOString()
      };
    } else {
      updatedPantry.push({
        id: `pantry_${requirement.ingredientId}_${Date.now()}`,
        ingredientId: requirement.ingredientId,
        name: requirement.name,
        quantity: option.buyQuantity,
        unit: option.offer.unit,
        category: requirement.category,
        lowStockThreshold: Math.max(1, Math.floor(option.buyQuantity * 0.2)),
        isLowStock: false,
        updatedAt: new Date().toISOString()
      });
    }
  }

  savePantryToStorage(updatedPantry);
  return updatedPantry;
}
