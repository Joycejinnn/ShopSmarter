import { TransportationMode, OptimizationPriority } from '../types';

export interface DemoScenario {
  id: string;
  name: string;
  tag: string;
  badge: string;
  inputPrompt: string;
  description: string;
  keyFeatures: string[];
  settings: {
    transportMode: TransportationMode;
    optimizationMode: OptimizationPriority;
    originId: string;
    destinationMode: 'return_to_origin' | 'finish_at_last_store';
    excludedStoreIds?: string[];
  };
}

export const DEMO_SCENARIOS: DemoScenario[] = [
  {
    id: 'scenario_a',
    name: 'Scenario A: Cooking Tonight',
    tag: 'Recipe Decomposition & Specialty Store',
    badge: 'Dual Recipe',
    inputPrompt: 'I want to cook mapo tofu and tomato egg stir-fry for two people.',
    description: 'Combines two recipes requiring common staples (eggs, scallions, oil) and authentic specialty items (Pixian doubanjiang, Sichuan peppercorn).',
    keyFeatures: [
      'Decomposes 2 recipes into 10 structured ingredients',
      'Merges shared ingredients (scallions: 2+2=4 pieces, oil: 30+20=50ml)',
      'Deducts available pantry stock (3 eggs, 500ml oil, 2 garlic cloves)',
      'Automatically selects specialty Asian grocery for authentic ingredients'
    ],
    settings: {
      transportMode: 'walking',
      optimizationMode: 'balanced',
      originId: 'meadowmont_apts',
      destinationMode: 'return_to_origin'
    }
  },
  {
    id: 'scenario_b',
    name: 'Scenario B: Everyday Essentials',
    tag: 'Direct Household Purchases & Store Price Comparison',
    badge: 'Household & Staples',
    inputPrompt: 'I need toilet paper, laundry detergent, toothpaste, milk, and eggs.',
    description: 'Pure household & grocery direct purchase intent across multiple departments without recipe decomposition.',
    keyFeatures: [
      'Identifies direct purchase intents without recipe decomposition',
      'Pantry stock is NOT deducted for explicit purchase intents',
      'Compares Target, Walmart, Food Lion, and Harris Teeter prices',
      'Calculates total package weights and whole-carton pricing'
    ],
    settings: {
      transportMode: 'driving',
      optimizationMode: 'money',
      originId: 'unc_campus',
      destinationMode: 'return_to_origin'
    }
  },
  {
    id: 'scenario_c',
    name: 'Scenario C: Shopping Without a Car',
    tag: 'Public Transit & Estimated Weight',
    badge: 'Car-free Shopping',
    inputPrompt: 'I need jasmine rice, soft tofu, dish soap, and laundry detergent. I am taking public transit.',
    description: 'Models a car-free urban shopper traveling via regional transit.',
    keyFeatures: [
      'Simulated transit travel times; routes and fares are not verified',
      'Shows estimated purchase weight',
      'Includes full package weights for rice and detergent',
      'Estimates a multi-stop shopping trip'
    ],
    settings: {
      transportMode: 'transit',
      optimizationMode: 'balanced',
      originId: 'unc_campus',
      destinationMode: 'return_to_origin'
    }
  },
  {
    id: 'scenario_d',
    name: 'Scenario D: Dynamic Need Adjustments',
    tag: 'Interactive Multi-Constraint Dynamic Recalculation',
    badge: 'Live Reactive Updates',
    inputPrompt: 'I want to make fried rice and pancakes for 4 people. Also need paper towels.',
    description: 'Showcases continuous adaptation: scale servings to 4, exclude Walmart, change transport to Walking, and toggle Save Time vs Save Money.',
    keyFeatures: [
      'Scales servings from 2 to 4 (doubles eggs to 10, rice to 600g)',
      'Shows live reactivity when user excludes or includes stores',
      'Switching between Save Money and Save Time dynamically reorders stops',
      'Preserves independent entities when removing or adding items'
    ],
    settings: {
      transportMode: 'walking',
      optimizationMode: 'time',
      originId: 'patterson_place',
      destinationMode: 'finish_at_last_store',
      excludedStoreIds: ['store_walmart']
    }
  }
];
