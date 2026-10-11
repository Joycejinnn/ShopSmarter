// Modular API Adapter Interfaces for future live services

export interface LiveProductSearchResult {
  provider: 'kroger' | 'open_food_facts' | 'mock';
  productId: string;
  name: string;
  brand: string;
  priceEstimate?: number;
  currency?: string;
  barcode?: string;
  imageUrl?: string;
  inStock: boolean;
  statusNote: string;
}

export interface LiveRouteDirectionsResult {
  provider: 'openrouteservice' | 'google_routes' | 'simulated_graph';
  totalDistanceMeters: number;
  totalDurationMinutes: number;
  mode: string;
  waypoints: [number, number][];
  isSimulated: boolean;
  transitFare?: number;
}

export interface LiveLLMParseResult {
  provider: 'gemini' | 'openai' | 'rule_based_fallback';
  recognizedRecipes: string[];
  recognizedDirectItems: string[];
  servings: number;
  confidence: number;
  isSimulated: boolean;
}

export class ServiceIntegrationsCatalog {
  public static readonly ADAPTERS_STATUS = [
    {
      id: 'kroger_api',
      name: 'Kroger Store & Product API',
      category: 'Store & Inventory Data',
      status: 'Ready for OAuth2 credentials',
      pricing: 'Free developer tier (requires retailer approval)',
      currentMode: 'Simulated Demo Data (Harris Teeter / Food Lion catalog)'
    },
    {
      id: 'open_food_facts',
      name: 'Open Food Facts Database',
      category: 'Nutrition & Barcodes',
      status: 'Open Source REST Ready',
      pricing: '100% Free Public API',
      currentMode: 'Integrated local product taxonomy'
    },
    {
      id: 'openrouteservice',
      name: 'OpenRouteService / OSRM',
      category: 'Directions & Matrix',
      status: 'Ready for free API key',
      pricing: 'Free tier: 2,000 requests/day',
      currentMode: 'Simulated Multimodal Transit Graph (Zero Paid Calls)'
    },
    {
      id: 'google_places_routes',
      name: 'Google Places & Routes API',
      category: 'Mapping & Routing',
      status: 'Disabled (Requires paid billing approval)',
      pricing: 'Pay-per-use beyond GCP $200 credit',
      currentMode: 'Local Leaflet + OpenStreetMap (100% Free & Open)'
    },
    {
      id: 'llm_assistant',
      name: 'Gemini / LLM Intent Engine',
      category: 'Multimodal Natural Language',
      status: 'Local Parser / Optional AI',
      pricing: 'Optional BYO Key or Free Tier',
      currentMode: 'Local rules by default; optional configured LLM with local fallback'
    }
  ];
}
