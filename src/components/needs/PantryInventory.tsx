import React, { useState } from 'react';
import { PantryItem, ProductCategory } from '../../types';
import { Archive, Plus, Trash2, AlertCircle, RotateCcw, Edit2, Check, X } from 'lucide-react';

interface PantryInventoryProps {
  pantryItems: PantryItem[];
  onUpdatePantry: (item: Omit<PantryItem, 'id' | 'updatedAt'> & { id?: string }) => void;
  onDeleteItem: (id: string) => void;
  onResetPantry: () => void;
}

export const PantryInventory: React.FC<PantryInventoryProps> = ({
  pantryItems,
  onUpdatePantry,
  onDeleteItem,
  onResetPantry
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [quantity, setQuantity] = useState<number>(1);
  const [unit, setUnit] = useState('piece');
  const [category, setCategory] = useState<ProductCategory>('Cooking ingredients');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editQty, setEditQty] = useState<number>(0);

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onUpdatePantry({
      ingredientId: name.toLowerCase().replace(/\s+/g, '_'),
      name: name.trim(),
      quantity: Number(quantity),
      unit: unit.trim(),
      category,
      isLowStock: quantity <= 1
    });

    setName('');
    setQuantity(1);
    setShowAddForm(false);
  };

  const startEdit = (item: PantryItem) => {
    setEditingId(item.id);
    setEditQty(item.quantity);
  };

  const saveEdit = (item: PantryItem) => {
    onUpdatePantry({
      id: item.id,
      ingredientId: item.ingredientId,
      name: item.name,
      quantity: Number(editQty),
      unit: item.unit,
      category: item.category,
      isLowStock: Number(editQty) <= (item.lowStockThreshold || 1)
    });
    setEditingId(null);
  };

  const quickAdjust = (item: PantryItem, delta: number) => {
    const newQty = Math.max(0, item.quantity + delta);
    onUpdatePantry({
      id: item.id,
      ingredientId: item.ingredientId,
      name: item.name,
      quantity: newQty,
      unit: item.unit,
      category: item.category,
      isLowStock: newQty <= (item.lowStockThreshold || 1)
    });
  };

  return (
    <div className="bg-brand-card p-4 rounded-2xl border border-brand-border shadow-card space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xs font-bold uppercase tracking-wider text-brand-darkgreen flex items-center gap-1.5">
            <Archive className="w-3.5 h-3.5 text-brand-primary" />
            My Pantry Inventory ({pantryItems.length})
          </h3>
          <p className="text-[11px] text-brand-muted">
            Auto-deducted from recipe needs: shortfall = max(0, need - pantry)
          </p>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="p-1.5 rounded-lg bg-brand-lightgreen text-brand-darkgreen hover:bg-brand-sage hover:text-white transition-colors text-xs font-semibold flex items-center gap-1"
            title="Add item to pantry"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Add</span>
          </button>
          <button
            onClick={onResetPantry}
            className="p-1.5 rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-subtle transition-colors text-xs"
            title="Reset to default seed inventory"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Add Item Form */}
      {showAddForm && (
        <form onSubmit={handleAddSubmit} className="p-3 bg-brand-canvas rounded-xl border border-brand-border space-y-2 text-xs">
          <div className="font-bold text-brand-darkgreen">Add Ingredient to Pantry</div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <input
              type="text"
              placeholder="Item name (e.g. Eggs)"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="col-span-2 p-1.5 rounded-lg border border-brand-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
              required
            />
            <input
              type="number"
              placeholder="Qty"
              min="0"
              step="any"
              value={quantity}
              onChange={(e) => setQuantity(Number(e.target.value))}
              className="p-1.5 rounded-lg border border-brand-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary"
              required
            />
            <select
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="p-1.5 rounded-lg border border-brand-border text-xs focus:outline-none focus:ring-1 focus:ring-brand-primary bg-white"
            >
              <option value="piece">piece(s)</option>
              <option value="g">grams (g)</option>
              <option value="ml">milliliters (ml)</option>
              <option value="clove">clove(s)</option>
              <option value="head">head(s)</option>
              <option value="block">block(s)</option>
              <option value="pack">pack</option>
            </select>
          </div>
          <div className="flex justify-end gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-2.5 py-1 text-stone-500 hover:text-stone-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-3 py-1 bg-brand-primary text-white rounded-lg font-semibold hover:bg-brand-darkgreen"
            >
              Save Item
            </button>
          </div>
        </form>
      )}

      {/* Pantry Items List */}
      <div className="divide-y divide-brand-border/60 max-h-[280px] overflow-y-auto pr-1">
        {pantryItems.map((item) => (
          <div key={item.id} className="py-2 flex items-center justify-between gap-2 text-xs">
            <div className="min-w-0">
              <div className="font-semibold text-brand-darkgreen truncate flex items-center gap-1.5">
                <span>{item.name}</span>
                {item.isLowStock && (
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-800 font-medium flex items-center gap-0.5">
                    <AlertCircle className="w-2.5 h-2.5" /> Low Stock
                  </span>
                )}
              </div>
              <div className="text-[11px] text-brand-muted">{item.category}</div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {editingId === item.id ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editQty}
                    onChange={(e) => setEditQty(Number(e.target.value))}
                    className="w-16 p-1 border border-brand-primary rounded text-xs text-center"
                  />
                  <button onClick={() => saveEdit(item)} className="p-1 text-emerald-600 hover:bg-emerald-50 rounded">
                    <Check className="w-3.5 h-3.5" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="p-1 text-stone-400 hover:bg-stone-100 rounded">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => quickAdjust(item, item.unit === 'g' || item.unit === 'ml' ? -50 : -1)}
                    className="w-5 h-5 rounded bg-brand-canvas hover:bg-stone-200 border border-brand-border flex items-center justify-center font-bold text-stone-600"
                  >
                    -
                  </button>
                  <span
                    onClick={() => startEdit(item)}
                    className="font-bold text-brand-darkgreen px-1.5 py-0.5 rounded hover:bg-brand-canvas cursor-pointer min-w-[50px] text-center"
                    title="Click to edit quantity"
                  >
                    {item.quantity} {item.unit}
                  </span>
                  <button
                    onClick={() => quickAdjust(item, item.unit === 'g' || item.unit === 'ml' ? 50 : 1)}
                    className="w-5 h-5 rounded bg-brand-canvas hover:bg-stone-200 border border-brand-border flex items-center justify-center font-bold text-stone-600"
                  >
                    +
                  </button>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-1 text-stone-300 hover:text-red-500 rounded ml-1"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
