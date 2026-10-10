export type ProductCategory =
  | 'Vegetables'
  | 'Fruits'
  | 'Dairy'
  | 'Meat'
  | 'Rice and grains'
  | 'Pasta'
  | 'Cooking ingredients'
  | 'Asian specialty ingredients'
  | 'Beverages'
  | 'Cleaning supplies'
  | 'Toiletries'
  | 'Paper products'
  | 'Household essentials';

export type TransportationMode = 'walking' | 'transit' | 'cycling' | 'driving';

export type OptimizationPriority = 'money' | 'time' | 'balanced';

export type CarryingBagType = 'backpack' | 'one_bag' | 'two_bags' | 'custom';

export interface LocationPoint {
  lat: number;
  lng: number;
  label: string;
  source: 'geolocation' | 'manual' | 'demo';
  capturedAt: string;
  accuracyMeters?: number;
}

export interface RecipeIngredient {
  ingredientId: string;
  name: string;
  quantity: number; // For default servings
  unit: string;     // 'piece', 'g', 'ml', 'clove', 'tbsp', etc.
  optional?: boolean;
  category: ProductCategory;
}

export interface Recipe {
  id: string;
  name: string;
  chineseName?: string;
  aliases: string[];
  defaultServings: number;
  description: string;
  cuisine: string;
  ingredients: RecipeIngredient[];
}

export interface DirectItemIntent {
  name: string;
  quantity: number;
  unit: string;
  category?: ProductCategory;
}

export interface ShoppingIntent {
  id: string;
  type: 'recipe' | 'direct_item';
  recipeId?: string;
  recipeName?: string;
  servings?: number;
  directItem?: DirectItemIntent;
  rawText?: string;
  createdAt: string;
}

export interface PantryItem {
  id: string;
  ingredientId: string;
  name: string;
  quantity: number;
  unit: string;
  category: ProductCategory;
  lowStockThreshold?: number;
  isLowStock?: boolean;
  updatedAt: string;
}

export interface IngredientRequirement {
  ingredientId: string;
  name: string;
  category: ProductCategory;
  totalRequired: number;
  unit: string;
  pantryAvailable: number;
  shortfall: number; // max(0, totalRequired - pantryAvailable)
  sourceContributions: {
    sourceId: string;
    sourceName: string;
    quantity: number;
  }[];
  isDirectPurchase: boolean;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  brand: string;
  packageQuantity: number;
  unit: string;
  estimatedWeightKg: number;
  matchedIngredientIds: string[];
  image?: string;
  barcode?: string;
}

export interface ProductOffer {
  offerId: string;
  productId: string;
  storeId: string;
  packQuantity: number;
  unit: string;
  packPrice: number; // Demo estimate
  currency: string;
  carryWeightKg: number;
  availabilityStatus: 'in_stock' | 'low_stock' | 'out_of_stock';
  availablePackCount?: number;
  source: string; // 'Demo estimate'
  updatedAt: string;
}

export interface Store {
  id: string;
  name: string;
  category: 'supermarket' | 'discount' | 'specialty' | 'hypermarket';
  address: string;
  city: string;
  lat: number;
  lng: number;
  openingHours: string;
  demoNote: string;
  color: string;
}

export interface PurchaseOption {
  offer: ProductOffer;
  product: Product;
  packs: number;
  buyQuantity: number;
  surplus: number;
  totalCost: number;
  totalWeightKg: number;
}

export interface StoreAllocationItem {
  requirement: IngredientRequirement;
  option: PurchaseOption;
  shoppingStatus?: 'pending' | 'purchased' | 'out_of_stock' | 'skipped';
}

export interface StoreAllocation {
  store: Store;
  items: StoreAllocationItem[];
  subtotalCost: number;
  totalWeightKg: number;
  packCount: number;
}

export interface RouteSegment {
  fromName: string;
  fromCoords: [number, number];
  toName: string;
  toCoords: [number, number];
  distanceMeters: number;
  durationMinutes: number;
  transportMode: TransportationMode;
  transitFare?: number;
  transitDetails?: string;
  geometry: [number, number][]; // lat/lng path points
}

export interface ShoppingPlan {
  mode: OptimizationPriority;
  storeAllocations: StoreAllocation[];
  unresolvedRequirements: IngredientRequirement[];
  routeStops: Store[];
  routeSegments: RouteSegment[];
  totalGoodsCost: number;
  totalTripCost: number;
  totalCost: number;
  totalTravelMinutes: number;
  totalShoppingMinutes: number;
  totalTripMinutes: number;
  totalWeightKg: number;
  isFeasible: boolean;
  feasibilityIssues: string[];
  explanation: string;
  calculatedAt: string;
  isOptimalWithinScope: boolean;
}

export interface TripContext {
  origin: LocationPoint;
  destinationMode: 'return_to_origin' | 'another_location' | 'finish_at_last_store';
  destinationLocation?: LocationPoint;
  transportMode: TransportationMode;
  maxStops: number; // default 2
  maxBudget?: number;
  carryingCapacityKg: number;
  carryingBagType: CarryingBagType;
  excludedStoreIds: string[];
}

export interface ShoppingSession {
  isActive: boolean;
  currentStopIndex: number;
  purchasedItems: {
    requirement: IngredientRequirement;
    option: PurchaseOption;
    storeId: string;
    purchasedAt: string;
  }[];
  skippedItems: {
    requirement: IngredientRequirement;
    storeId: string;
    reason: 'out_of_stock' | 'skipped';
  }[];
  startedAt: string;
}
