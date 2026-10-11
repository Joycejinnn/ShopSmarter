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
    name: 'Scenario A: Weeknight Dinner & Essentials',
    tag: 'Recipe Decomposition & Multi-Category Optimization',
    badge: 'Dinner + Essentials',
    inputPrompt: 'I want to cook spaghetti bolognese for two people and I need paper towels.',
    description: 'Combines a classic Italian dinner recipe (pasta, ground beef, tomatoes, onion) with household paper products across supermarkets and retail stores.',
    keyFeatures: [
      'Decomposes Spaghetti Bolognese into structured ingredients',
      'Merges recipe shortfalls with direct household purchase (paper towels)',
      'Deducts available pantry stock (garlic, cooking oil, salt)',
      'Demonstrates sharp distinction between Save Time (single-stop) and Save Money (multi-stop value split)'
    ],
    settings: {
      transportMode: 'driving',
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
  },
  {
    id: 'scenario_e',
    name: 'Scenario E: Specialty Asian Cooking',
    tag: 'Recipe Decomposition & Specialty Store',
    badge: 'Dual Recipe',
    inputPrompt: 'I want to cook mapo tofu and tomato egg stir-fry for two people.',
    description: 'Combines two recipes requiring common staples (eggs, scallions, oil) and authentic specialty items (Pixian doubanjiang, Sichuan peppercorn).',
    keyFeatures: [
      'Decomposes 2 recipes into 10 structured ingredients',
      'Merges shared ingredients (scallions, oil)',
      'Deducts available pantry stock',
      'Automatically selects specialty Asian grocery for authentic items'
    ],
    settings: {
      transportMode: 'driving',
      optimizationMode: 'balanced',
      originId: 'meadowmont_apts',
      destinationMode: 'return_to_origin'
    }
  }
];
