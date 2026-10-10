import { Recipe } from '../types';

export const PREDEFINED_RECIPES: Recipe[] = [
  {
    id: 'recipe_mapo_tofu',
    name: 'Mapo Tofu',
    chineseName: '麻婆豆腐',
    aliases: ['mapo tofu', 'ma po tofu', 'mapo doufu', '麻婆豆腐', 'tofu pork spicy'],
    defaultServings: 2,
    description: 'Sichuan classic dish of soft tofu in a spicy, numbing chili-bean sauce with minced pork.',
    cuisine: 'Sichuan / Chinese',
    ingredients: [
      {
        ingredientId: 'ing_tofu',
        name: 'Soft Tofu',
        quantity: 1, // 1 block ~ 400g
        unit: 'block',
        category: 'Asian specialty ingredients'
      },
      {
        ingredientId: 'ing_ground_pork',
        name: 'Ground Pork',
        quantity: 150,
        unit: 'g',
        category: 'Meat'
      },
      {
        ingredientId: 'ing_doubanjiang',
        name: 'Pixian Doubanjiang (Chili Bean Paste)',
        quantity: 30,
        unit: 'g',
        category: 'Asian specialty ingredients'
      },
      {
        ingredientId: 'ing_sichuan_peppercorn',
        name: 'Sichuan Peppercorns',
        quantity: 5,
        unit: 'g',
        category: 'Asian specialty ingredients'
      },
      {
        ingredientId: 'ing_garlic',
        name: 'Garlic',
        quantity: 3,
        unit: 'clove',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_scallions',
        name: 'Green Onions (Scallions)',
        quantity: 2,
        unit: 'piece',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_cooking_oil',
        name: 'Cooking Oil',
        quantity: 30,
        unit: 'ml',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_soy_sauce',
        name: 'Soy Sauce',
        quantity: 15,
        unit: 'ml',
        optional: true,
        category: 'Cooking ingredients'
      }
    ]
  },
  {
    id: 'recipe_tomato_egg',
    name: 'Tomato Egg Stir-Fry',
    chineseName: '西红柿炒鸡蛋',
    aliases: ['tomato egg', 'tomato egg stir-fry', 'tomato and eggs', '西红柿炒鸡蛋', '番茄炒蛋'],
    defaultServings: 2,
    description: 'Comforting home-style stir-fry featuring sweet, juicy tomatoes and fluffy scrambled eggs.',
    cuisine: 'Chinese Home Cooking',
    ingredients: [
      {
        ingredientId: 'ing_eggs',
        name: 'Eggs',
        quantity: 4,
        unit: 'piece',
        category: 'Dairy'
      },
      {
        ingredientId: 'ing_tomatoes',
        name: 'Tomatoes',
        quantity: 3,
        unit: 'piece',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_scallions',
        name: 'Green Onions (Scallions)',
        quantity: 2,
        unit: 'piece',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_cooking_oil',
        name: 'Cooking Oil',
        quantity: 20,
        unit: 'ml',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_salt',
        name: 'Salt',
        quantity: 5,
        unit: 'g',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_sugar',
        name: 'Sugar',
        quantity: 5,
        unit: 'g',
        optional: true,
        category: 'Cooking ingredients'
      }
    ]
  },
  {
    id: 'recipe_fried_rice',
    name: 'Fried Rice',
    chineseName: '蛋炒饭',
    aliases: ['fried rice', 'egg fried rice', 'yangzhou fried rice', '蛋炒饭', '炒饭'],
    defaultServings: 2,
    description: 'Golden wok-tossed jasmine rice with eggs, green onions, and savory seasoning.',
    cuisine: 'Chinese',
    ingredients: [
      {
        ingredientId: 'ing_rice',
        name: 'Jasmine Rice',
        quantity: 300,
        unit: 'g',
        category: 'Rice and grains'
      },
      {
        ingredientId: 'ing_eggs',
        name: 'Eggs',
        quantity: 3,
        unit: 'piece',
        category: 'Dairy'
      },
      {
        ingredientId: 'ing_scallions',
        name: 'Green Onions (Scallions)',
        quantity: 2,
        unit: 'piece',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_cooking_oil',
        name: 'Cooking Oil',
        quantity: 20,
        unit: 'ml',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_soy_sauce',
        name: 'Soy Sauce',
        quantity: 15,
        unit: 'ml',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_salt',
        name: 'Salt',
        quantity: 3,
        unit: 'g',
        category: 'Cooking ingredients'
      }
    ]
  },
  {
    id: 'recipe_spaghetti',
    name: 'Spaghetti Bolognese',
    chineseName: '意式肉酱面',
    aliases: ['spaghetti', 'spaghetti bolognese', 'pasta bolognese', 'italian pasta', '意面', '意大利面', '肉酱面'],
    defaultServings: 2,
    description: 'Al dente spaghetti smothered in rich tomato-beef meat sauce and herbs.',
    cuisine: 'Italian',
    ingredients: [
      {
        ingredientId: 'ing_pasta',
        name: 'Spaghetti Pasta',
        quantity: 200,
        unit: 'g',
        category: 'Pasta'
      },
      {
        ingredientId: 'ing_ground_beef',
        name: 'Ground Beef',
        quantity: 250,
        unit: 'g',
        category: 'Meat'
      },
      {
        ingredientId: 'ing_tomatoes',
        name: 'Tomatoes',
        quantity: 2,
        unit: 'piece',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_onion',
        name: 'Yellow Onion',
        quantity: 1,
        unit: 'piece',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_garlic',
        name: 'Garlic',
        quantity: 2,
        unit: 'clove',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_cooking_oil',
        name: 'Olive Oil / Cooking Oil',
        quantity: 15,
        unit: 'ml',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_salt',
        name: 'Salt',
        quantity: 5,
        unit: 'g',
        category: 'Cooking ingredients'
      }
    ]
  },
  {
    id: 'recipe_chicken_curry',
    name: 'Chicken Curry',
    chineseName: '咖喱鸡肉',
    aliases: ['chicken curry', 'curry chicken', 'japanese curry', '咖喱鸡', '咖喱鸡肉'],
    defaultServings: 2,
    description: 'Hearty simmered tender chicken thighs, potatoes, and carrots in aromatic curry sauce.',
    cuisine: 'Asian / Fusion',
    ingredients: [
      {
        ingredientId: 'ing_chicken_thighs',
        name: 'Chicken Thighs',
        quantity: 350,
        unit: 'g',
        category: 'Meat'
      },
      {
        ingredientId: 'ing_potatoes',
        name: 'Potatoes',
        quantity: 2,
        unit: 'piece',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_onion',
        name: 'Yellow Onion',
        quantity: 1,
        unit: 'piece',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_curry_powder',
        name: 'Curry Sauce Mix / Powder',
        quantity: 50,
        unit: 'g',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_rice',
        name: 'Jasmine Rice',
        quantity: 250,
        unit: 'g',
        category: 'Rice and grains'
      },
      {
        ingredientId: 'ing_cooking_oil',
        name: 'Cooking Oil',
        quantity: 15,
        unit: 'ml',
        category: 'Cooking ingredients'
      }
    ]
  },
  {
    id: 'recipe_pancakes',
    name: 'Fluffy Pancakes',
    chineseName: '美式薄饼松饼',
    aliases: ['pancakes', 'pancake', 'fluffy pancakes', '松饼', '美式松饼'],
    defaultServings: 2,
    description: 'Golden breakfast pancakes served with maple syrup and melted butter.',
    cuisine: 'American Breakfast',
    ingredients: [
      {
        ingredientId: 'ing_flour',
        name: 'All-Purpose Flour',
        quantity: 200,
        unit: 'g',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_milk',
        name: 'Whole Milk',
        quantity: 250,
        unit: 'ml',
        category: 'Dairy'
      },
      {
        ingredientId: 'ing_eggs',
        name: 'Eggs',
        quantity: 2,
        unit: 'piece',
        category: 'Dairy'
      },
      {
        ingredientId: 'ing_sugar',
        name: 'Sugar',
        quantity: 20,
        unit: 'g',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_cooking_oil',
        name: 'Butter / Cooking Oil',
        quantity: 20,
        unit: 'ml',
        category: 'Cooking ingredients'
      }
    ]
  },
  {
    id: 'recipe_vegetable_salad',
    name: 'Fresh Garden Salad',
    chineseName: '蔬菜沙拉',
    aliases: ['vegetable salad', 'garden salad', 'salad', 'green salad', '蔬菜沙拉', '沙拉'],
    defaultServings: 2,
    description: 'Crisp romaine lettuce, cherry tomatoes, cucumbers, and olive oil dressing.',
    cuisine: 'Western',
    ingredients: [
      {
        ingredientId: 'ing_lettuce',
        name: 'Romaine Lettuce',
        quantity: 1,
        unit: 'head',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_tomatoes',
        name: 'Tomatoes',
        quantity: 2,
        unit: 'piece',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_cucumber',
        name: 'Cucumber',
        quantity: 1,
        unit: 'piece',
        category: 'Vegetables'
      },
      {
        ingredientId: 'ing_cooking_oil',
        name: 'Extra Virgin Olive Oil',
        quantity: 20,
        unit: 'ml',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_salt',
        name: 'Salt',
        quantity: 2,
        unit: 'g',
        category: 'Cooking ingredients'
      }
    ]
  },
  {
    id: 'recipe_scrambled_eggs',
    name: 'Classic Scrambled Eggs',
    chineseName: '美式炒蛋',
    aliases: ['scrambled eggs', 'scrambled egg', 'eggs scrambled', '炒鸡蛋', '美式炒蛋'],
    defaultServings: 2,
    description: 'Buttery, soft-curd scrambled eggs seasoned with salt and black pepper.',
    cuisine: 'Breakfast',
    ingredients: [
      {
        ingredientId: 'ing_eggs',
        name: 'Eggs',
        quantity: 4,
        unit: 'piece',
        category: 'Dairy'
      },
      {
        ingredientId: 'ing_milk',
        name: 'Whole Milk',
        quantity: 30,
        unit: 'ml',
        category: 'Dairy'
      },
      {
        ingredientId: 'ing_cooking_oil',
        name: 'Butter / Cooking Oil',
        quantity: 15,
        unit: 'ml',
        category: 'Cooking ingredients'
      },
      {
        ingredientId: 'ing_salt',
        name: 'Salt',
        quantity: 2,
        unit: 'g',
        category: 'Cooking ingredients'
      }
    ]
  }
];
