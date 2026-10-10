import { Product } from '../types';

export const PRODUCTS: Product[] = [
  // --- Vegetables ---
  {
    id: 'prod_tomatoes_pack',
    name: 'Fresh Vine Tomatoes (4-pack)',
    category: 'Vegetables',
    brand: 'NatureSweet',
    packageQuantity: 4,
    unit: 'piece',
    estimatedWeightKg: 0.5,
    matchedIngredientIds: ['ing_tomatoes']
  },
  {
    id: 'prod_scallions_bunch',
    name: 'Fresh Green Onions / Scallions',
    category: 'Vegetables',
    brand: 'Farm Fresh',
    packageQuantity: 4,
    unit: 'piece',
    estimatedWeightKg: 0.15,
    matchedIngredientIds: ['ing_scallions']
  },
  {
    id: 'prod_garlic_bulb',
    name: 'Organic Whole Garlic (3 bulbs)',
    category: 'Vegetables',
    brand: 'Christopher Ranch',
    packageQuantity: 12, // approx 12 cloves
    unit: 'clove',
    estimatedWeightKg: 0.2,
    matchedIngredientIds: ['ing_garlic']
  },
  {
    id: 'prod_yellow_onion_bag',
    name: 'Yellow Onions (3 lb bag)',
    category: 'Vegetables',
    brand: 'Produce Pride',
    packageQuantity: 4,
    unit: 'piece',
    estimatedWeightKg: 1.36,
    matchedIngredientIds: ['ing_onion']
  },
  {
    id: 'prod_potatoes_bag',
    name: 'Russet Baking Potatoes (5 lb bag)',
    category: 'Vegetables',
    brand: 'Green Giant',
    packageQuantity: 6,
    unit: 'piece',
    estimatedWeightKg: 2.27,
    matchedIngredientIds: ['ing_potatoes']
  },
  {
    id: 'prod_romaine_hearts',
    name: 'Romaine Lettuce Hearts (3-pack)',
    category: 'Vegetables',
    brand: 'Fresh Express',
    packageQuantity: 3,
    unit: 'head',
    estimatedWeightKg: 0.6,
    matchedIngredientIds: ['ing_lettuce']
  },
  {
    id: 'prod_cucumber_english',
    name: 'Seedless English Cucumber',
    category: 'Vegetables',
    brand: 'Sunset',
    packageQuantity: 1,
    unit: 'piece',
    estimatedWeightKg: 0.35,
    matchedIngredientIds: ['ing_cucumber']
  },
  {
    id: 'prod_carrots_bag',
    name: 'Whole Carrots (2 lb bag)',
    category: 'Vegetables',
    brand: 'Bolthouse Farms',
    packageQuantity: 5,
    unit: 'piece',
    estimatedWeightKg: 0.9,
    matchedIngredientIds: ['ing_carrots']
  },

  // --- Fruits ---
  {
    id: 'prod_bananas_bunch',
    name: 'Organic Fresh Bananas (bunch of 5)',
    category: 'Fruits',
    brand: 'Chiquita',
    packageQuantity: 5,
    unit: 'piece',
    estimatedWeightKg: 0.8,
    matchedIngredientIds: ['ing_bananas']
  },
  {
    id: 'prod_fuji_apples',
    name: 'Crisp Fuji Apples (3 lb bag)',
    category: 'Fruits',
    brand: 'Stemilt',
    packageQuantity: 6,
    unit: 'piece',
    estimatedWeightKg: 1.36,
    matchedIngredientIds: ['ing_apples']
  },
  {
    id: 'prod_strawberries_box',
    name: 'Fresh Strawberries (1 lb clamshell)',
    category: 'Fruits',
    brand: 'Driscoll\'s',
    packageQuantity: 450,
    unit: 'g',
    estimatedWeightKg: 0.48,
    matchedIngredientIds: ['ing_strawberries']
  },

  // --- Dairy ---
  {
    id: 'prod_eggs_carton_12',
    name: 'Grade A Large White Eggs (12-ct)',
    category: 'Dairy',
    brand: 'Eggland\'s Best',
    packageQuantity: 12,
    unit: 'piece',
    estimatedWeightKg: 0.72,
    matchedIngredientIds: ['ing_eggs']
  },
  {
    id: 'prod_eggs_carton_6',
    name: 'Large Brown Free-Range Eggs (6-ct)',
    category: 'Dairy',
    brand: 'Vital Farms',
    packageQuantity: 6,
    unit: 'piece',
    estimatedWeightKg: 0.38,
    matchedIngredientIds: ['ing_eggs']
  },
  {
    id: 'prod_whole_milk_gallon',
    name: 'Whole Milk (1 Gallon)',
    category: 'Dairy',
    brand: 'Horizon Organic',
    packageQuantity: 3785,
    unit: 'ml',
    estimatedWeightKg: 3.85,
    matchedIngredientIds: ['ing_milk']
  },
  {
    id: 'prod_whole_milk_quart',
    name: 'Whole Milk (1 Quart / 946 ml)',
    category: 'Dairy',
    brand: 'Organic Valley',
    packageQuantity: 946,
    unit: 'ml',
    estimatedWeightKg: 1.0,
    matchedIngredientIds: ['ing_milk']
  },
  {
    id: 'prod_unsalted_butter',
    name: 'Unsalted Butter (4 sticks, 1 lb)',
    category: 'Dairy',
    brand: 'Land O\'Lakes',
    packageQuantity: 450,
    unit: 'g',
    estimatedWeightKg: 0.46,
    matchedIngredientIds: ['ing_butter']
  },
  {
    id: 'prod_cheddar_cheese',
    name: 'Sharp Cheddar Cheese Block (8 oz)',
    category: 'Dairy',
    brand: 'Cabot',
    packageQuantity: 226,
    unit: 'g',
    estimatedWeightKg: 0.25,
    matchedIngredientIds: ['ing_cheese']
  },

  // --- Meat ---
  {
    id: 'prod_ground_pork_pack',
    name: 'Fresh Ground Pork (1 lb / 454g)',
    category: 'Meat',
    brand: 'Smithfield',
    packageQuantity: 454,
    unit: 'g',
    estimatedWeightKg: 0.48,
    matchedIngredientIds: ['ing_ground_pork']
  },
  {
    id: 'prod_ground_beef_pack',
    name: 'Lean Ground Beef 85/15 (1 lb)',
    category: 'Meat',
    brand: 'Certified Angus Beef',
    packageQuantity: 454,
    unit: 'g',
    estimatedWeightKg: 0.48,
    matchedIngredientIds: ['ing_ground_beef']
  },
  {
    id: 'prod_chicken_thighs_pack',
    name: 'Boneless Skinless Chicken Thighs (1.5 lb)',
    category: 'Meat',
    brand: 'Perdue Fresh',
    packageQuantity: 680,
    unit: 'g',
    estimatedWeightKg: 0.72,
    matchedIngredientIds: ['ing_chicken_thighs']
  },
  {
    id: 'prod_bacon_pack',
    name: 'Thick Cut Applewood Bacon (12 oz)',
    category: 'Meat',
    brand: 'Wright Brand',
    packageQuantity: 340,
    unit: 'g',
    estimatedWeightKg: 0.38,
    matchedIngredientIds: ['ing_bacon']
  },

  // --- Rice and grains ---
  {
    id: 'prod_jasmine_rice_bag_2lb',
    name: 'Thai Jasmine Fragrant Rice (2 lb / 907g)',
    category: 'Rice and grains',
    brand: 'Three Ladies',
    packageQuantity: 907,
    unit: 'g',
    estimatedWeightKg: 0.95,
    matchedIngredientIds: ['ing_rice']
  },
  {
    id: 'prod_jasmine_rice_bag_5lb',
    name: 'Royal Jasmine Rice (5 lb bag)',
    category: 'Rice and grains',
    brand: 'Royal',
    packageQuantity: 2268,
    unit: 'g',
    estimatedWeightKg: 2.3,
    matchedIngredientIds: ['ing_rice']
  },
  {
    id: 'prod_quinoa_pack',
    name: 'Organic Tricolor Quinoa (1 lb)',
    category: 'Rice and grains',
    brand: 'Simple Truth',
    packageQuantity: 454,
    unit: 'g',
    estimatedWeightKg: 0.48,
    matchedIngredientIds: ['ing_quinoa']
  },

  // --- Pasta ---
  {
    id: 'prod_spaghetti_box',
    name: 'Traditional Spaghetti No. 5 (1 lb / 454g)',
    category: 'Pasta',
    brand: 'Barilla',
    packageQuantity: 454,
    unit: 'g',
    estimatedWeightKg: 0.48,
    matchedIngredientIds: ['ing_pasta']
  },
  {
    id: 'prod_penne_box',
    name: 'Rigati Penne Pasta (1 lb)',
    category: 'Pasta',
    brand: 'De Cecco',
    packageQuantity: 454,
    unit: 'g',
    estimatedWeightKg: 0.48,
    matchedIngredientIds: ['ing_penne']
  },

  // --- Cooking ingredients ---
  {
    id: 'prod_canola_oil_bottle',
    name: 'Pure Canola Cooking Oil (32 fl oz / 946ml)',
    category: 'Cooking ingredients',
    brand: 'Crisco',
    packageQuantity: 946,
    unit: 'ml',
    estimatedWeightKg: 0.92,
    matchedIngredientIds: ['ing_cooking_oil']
  },
  {
    id: 'prod_olive_oil_bottle',
    name: 'Extra Virgin Olive Oil (16.9 fl oz / 500ml)',
    category: 'Cooking ingredients',
    brand: 'Bertolli',
    packageQuantity: 500,
    unit: 'ml',
    estimatedWeightKg: 0.55,
    matchedIngredientIds: ['ing_cooking_oil']
  },
  {
    id: 'prod_iodized_salt_canister',
    name: 'Iodized Fine Table Salt (26 oz / 737g)',
    category: 'Cooking ingredients',
    brand: 'Morton',
    packageQuantity: 737,
    unit: 'g',
    estimatedWeightKg: 0.78,
    matchedIngredientIds: ['ing_salt']
  },
  {
    id: 'prod_granulated_sugar_bag',
    name: 'Pure Cane Granulated Sugar (4 lb / 1.8kg)',
    category: 'Cooking ingredients',
    brand: 'Domino',
    packageQuantity: 1814,
    unit: 'g',
    estimatedWeightKg: 1.85,
    matchedIngredientIds: ['ing_sugar']
  },
  {
    id: 'prod_all_purpose_flour_bag',
    name: 'Unbleached All-Purpose Flour (5 lb)',
    category: 'Cooking ingredients',
    brand: 'King Arthur',
    packageQuantity: 2268,
    unit: 'g',
    estimatedWeightKg: 2.3,
    matchedIngredientIds: ['ing_flour']
  },
  {
    id: 'prod_curry_sauce_mix',
    name: 'Golden Curry Sauce Mix Medium Hot (7.8 oz)',
    category: 'Cooking ingredients',
    brand: 'S&B Golden Curry',
    packageQuantity: 220,
    unit: 'g',
    estimatedWeightKg: 0.25,
    matchedIngredientIds: ['ing_curry_powder']
  },
  {
    id: 'prod_regular_soy_sauce',
    name: 'Naturally Brewed Soy Sauce (15 fl oz / 444ml)',
    category: 'Cooking ingredients',
    brand: 'Kikkoman',
    packageQuantity: 444,
    unit: 'ml',
    estimatedWeightKg: 0.55,
    matchedIngredientIds: ['ing_soy_sauce']
  },

  // --- Asian specialty ingredients ---
  {
    id: 'prod_soft_tofu_block',
    name: 'Organic Soft Silken Tofu (16 oz / 454g)',
    category: 'Asian specialty ingredients',
    brand: 'House Foods',
    packageQuantity: 1,
    unit: 'block',
    estimatedWeightKg: 0.5,
    matchedIngredientIds: ['ing_tofu']
  },
  {
    id: 'prod_firm_tofu_block',
    name: 'Premium Firm Tofu (16 oz)',
    category: 'Asian specialty ingredients',
    brand: 'Morinaga',
    packageQuantity: 1,
    unit: 'block',
    estimatedWeightKg: 0.5,
    matchedIngredientIds: ['ing_tofu']
  },
  {
    id: 'prod_pixian_doubanjiang',
    name: 'Authentic Pixian Bean Paste (Doubanjiang 500g)',
    category: 'Asian specialty ingredients',
    brand: 'Juan Cheng Brand (鹃城牌)',
    packageQuantity: 500,
    unit: 'g',
    estimatedWeightKg: 0.55,
    matchedIngredientIds: ['ing_doubanjiang']
  },
  {
    id: 'prod_sichuan_peppercorns_pack',
    name: 'Sichuan Red Peppercorns Premium (4 oz / 113g)',
    category: 'Asian specialty ingredients',
    brand: 'The Mala Market',
    packageQuantity: 113,
    unit: 'g',
    estimatedWeightKg: 0.13,
    matchedIngredientIds: ['ing_sichuan_peppercorn']
  },
  {
    id: 'prod_chinkiang_vinegar',
    name: 'Chinkiang Black Rice Vinegar (550ml)',
    category: 'Asian specialty ingredients',
    brand: 'Gold Plum',
    packageQuantity: 550,
    unit: 'ml',
    estimatedWeightKg: 0.65,
    matchedIngredientIds: ['ing_black_vinegar']
  },
  {
    id: 'prod_sesame_oil_bottle',
    name: 'Pure Roasted Sesame Oil (5 fl oz / 150ml)',
    category: 'Asian specialty ingredients',
    brand: 'Kadoya',
    packageQuantity: 150,
    unit: 'ml',
    estimatedWeightKg: 0.2,
    matchedIngredientIds: ['ing_sesame_oil']
  },

  // --- Beverages ---
  {
    id: 'prod_orange_juice_bottle',
    name: 'Pure Premium Orange Juice No Pulp (52 fl oz)',
    category: 'Beverages',
    brand: 'Tropicana',
    packageQuantity: 1537,
    unit: 'ml',
    estimatedWeightKg: 1.6,
    matchedIngredientIds: ['ing_orange_juice']
  },
  {
    id: 'prod_sparkling_water_pack',
    name: 'Sparkling Mineral Water 12-Pack Cans',
    category: 'Beverages',
    brand: 'LaCroix',
    packageQuantity: 12,
    unit: 'can',
    estimatedWeightKg: 4.3,
    matchedIngredientIds: ['ing_sparkling_water']
  },
  {
    id: 'prod_green_tea_box',
    name: 'Organic Jasmine Green Tea (20 bags)',
    category: 'Beverages',
    brand: 'Twinings',
    packageQuantity: 20,
    unit: 'bag',
    estimatedWeightKg: 0.1,
    matchedIngredientIds: ['ing_green_tea']
  },

  // --- Cleaning supplies ---
  {
    id: 'prod_laundry_detergent_liquid',
    name: 'Liquid Laundry Detergent Eco-Pack (64 loads, 92 oz)',
    category: 'Cleaning supplies',
    brand: 'Tide Original',
    packageQuantity: 1,
    unit: 'bottle',
    estimatedWeightKg: 2.9,
    matchedIngredientIds: ['ing_laundry_detergent']
  },
  {
    id: 'prod_dish_soap_bottle',
    name: 'Ultra Platinum Dishwashing Liquid (24 oz)',
    category: 'Cleaning supplies',
    brand: 'Dawn',
    packageQuantity: 1,
    unit: 'bottle',
    estimatedWeightKg: 0.75,
    matchedIngredientIds: ['ing_dish_soap']
  },
  {
    id: 'prod_disinfecting_wipes',
    name: 'Disinfecting Surface Wipes Lemon Scent (75 wipes)',
    category: 'Cleaning supplies',
    brand: 'Clorox',
    packageQuantity: 1,
    unit: 'canister',
    estimatedWeightKg: 0.65,
    matchedIngredientIds: ['ing_cleaning_wipes']
  },
  {
    id: 'prod_trash_bags_box',
    name: 'Flex Drawstring Tall Kitchen Trash Bags 13 Gal (40 ct)',
    category: 'Cleaning supplies',
    brand: 'Glad ForceFlex',
    packageQuantity: 40,
    unit: 'bag',
    estimatedWeightKg: 1.1,
    matchedIngredientIds: ['ing_trash_bags']
  },

  // --- Toiletries ---
  {
    id: 'prod_toothpaste_tube',
    name: 'Total Clean Mint Fluoride Toothpaste (4.8 oz)',
    category: 'Toiletries',
    brand: 'Colgate',
    packageQuantity: 1,
    unit: 'tube',
    estimatedWeightKg: 0.16,
    matchedIngredientIds: ['ing_toothpaste']
  },
  {
    id: 'prod_body_wash_bottle',
    name: 'Deep Moisture Body Wash Pump (22 oz)',
    category: 'Toiletries',
    brand: 'Dove',
    packageQuantity: 1,
    unit: 'bottle',
    estimatedWeightKg: 0.7,
    matchedIngredientIds: ['ing_body_wash']
  },
  {
    id: 'prod_shampoo_bottle',
    name: 'Moisture Rich Daily Shampoo (28 oz)',
    category: 'Toiletries',
    brand: 'TRESemmé',
    packageQuantity: 1,
    unit: 'bottle',
    estimatedWeightKg: 0.88,
    matchedIngredientIds: ['ing_shampoo']
  },

  // --- Paper products ---
  {
    id: 'prod_toilet_paper_pack_12',
    name: 'Ultra Soft Comfort Cushion Toilet Paper (12 Mega Rolls)',
    category: 'Paper products',
    brand: 'Charmin',
    packageQuantity: 12,
    unit: 'roll',
    estimatedWeightKg: 1.6,
    matchedIngredientIds: ['ing_toilet_paper']
  },
  {
    id: 'prod_toilet_paper_pack_4',
    name: 'Everyday Bath Tissue (4 Double Rolls)',
    category: 'Paper products',
    brand: 'Cottonelle',
    packageQuantity: 4,
    unit: 'roll',
    estimatedWeightKg: 0.55,
    matchedIngredientIds: ['ing_toilet_paper']
  },
  {
    id: 'prod_paper_towels_pack_6',
    name: 'Select-A-Size Paper Towels (6 Double Rolls)',
    category: 'Paper products',
    brand: 'Bounty',
    packageQuantity: 6,
    unit: 'roll',
    estimatedWeightKg: 1.3,
    matchedIngredientIds: ['ing_paper_towels']
  },
  {
    id: 'prod_facial_tissues_3pack',
    name: 'Ultra Soft Facial Tissues (3 Pack Cubes)',
    category: 'Paper products',
    brand: 'Kleenex',
    packageQuantity: 3,
    unit: 'box',
    estimatedWeightKg: 0.6,
    matchedIngredientIds: ['ing_facial_tissues']
  },

  // --- Household essentials ---
  {
    id: 'prod_aluminum_foil_roll',
    name: 'Standard Aluminum Baking Foil (75 sq ft)',
    category: 'Household essentials',
    brand: 'Reynolds Wrap',
    packageQuantity: 1,
    unit: 'roll',
    estimatedWeightKg: 0.35,
    matchedIngredientIds: ['ing_aluminum_foil']
  },
  {
    id: 'prod_ziploc_storage_bags',
    name: 'Grip\'n Seal Gallon Storage Bags (38 ct)',
    category: 'Household essentials',
    brand: 'Ziploc',
    packageQuantity: 38,
    unit: 'bag',
    estimatedWeightKg: 0.45,
    matchedIngredientIds: ['ing_ziploc_bags']
  },
  {
    id: 'prod_aa_batteries_pack',
    name: 'Coppertop AA Alkaline Batteries 8-Pack',
    category: 'Household essentials',
    brand: 'Duracell',
    packageQuantity: 8,
    unit: 'piece',
    estimatedWeightKg: 0.22,
    matchedIngredientIds: ['ing_batteries']
  }
];
