// Local food database for quick logging.
//
// Why local: zero cost, instant, works offline, no API key. The trade-off is
// coverage — we ship ~80 of the most common foods/meals. Anything not in the
// list still works via manual entry. Macros are approximate, sourced from
// USDA FoodData Central averages, rounded to whole numbers.
//
// Each entry pairs a name with a *typical serving* and the kcal/protein for
// that serving (not per-100g). This makes the UX tap-to-log: the user picks
// "Egg · 1 large" and the form fills in 78 kcal / 6g protein. If they ate
// two, they double the number in the form afterwards.

export interface FoodItem {
  name: string;
  serving: string;   // human label, e.g. "1 large", "100g cooked", "1 scoop"
  kcal: number;
  protein: number;   // grams
  tags?: string[];   // extra search terms (synonyms / categories)
}

export const FOODS: FoodItem[] = [
  // --- Eggs & dairy ----------------------------------------------------
  { name: "Egg", serving: "1 large", kcal: 78, protein: 6, tags: ["eggs"] },
  { name: "Egg whites", serving: "100g", kcal: 52, protein: 11 },
  { name: "Greek yogurt (plain)", serving: "170g cup", kcal: 100, protein: 17, tags: ["yoghurt"] },
  { name: "Greek yogurt (low-fat)", serving: "170g cup", kcal: 130, protein: 12, tags: ["yoghurt"] },
  { name: "Cottage cheese", serving: "100g", kcal: 98, protein: 11 },
  { name: "Cheddar cheese", serving: "30g slice", kcal: 120, protein: 7 },
  { name: "Mozzarella", serving: "30g", kcal: 90, protein: 7 },
  { name: "Feta", serving: "30g", kcal: 80, protein: 4 },
  { name: "Whole milk", serving: "250ml glass", kcal: 150, protein: 8 },
  { name: "Skim milk", serving: "250ml glass", kcal: 85, protein: 8, tags: ["fat-free"] },
  { name: "Butter", serving: "10g pat", kcal: 72, protein: 0 },

  // --- Meat & fish -----------------------------------------------------
  { name: "Chicken breast", serving: "100g cooked", kcal: 165, protein: 31, tags: ["chicken"] },
  { name: "Chicken thigh", serving: "100g cooked", kcal: 209, protein: 26, tags: ["chicken"] },
  { name: "Turkey breast", serving: "100g cooked", kcal: 135, protein: 30 },
  { name: "Ground beef (5% fat)", serving: "100g cooked", kcal: 175, protein: 26, tags: ["mince", "lean beef"] },
  { name: "Ground beef (20% fat)", serving: "100g cooked", kcal: 254, protein: 26, tags: ["mince"] },
  { name: "Beef steak", serving: "150g cooked", kcal: 360, protein: 38, tags: ["sirloin", "ribeye"] },
  { name: "Pork chop", serving: "150g cooked", kcal: 345, protein: 40 },
  { name: "Bacon", serving: "2 strips", kcal: 80, protein: 6 },
  { name: "Sausage", serving: "1 link", kcal: 200, protein: 11 },
  { name: "Salmon", serving: "150g cooked", kcal: 310, protein: 30 },
  { name: "Tuna (canned in water)", serving: "1 can drained (~85g)", kcal: 100, protein: 22 },
  { name: "Cod", serving: "150g cooked", kcal: 130, protein: 29 },
  { name: "Shrimp", serving: "100g cooked", kcal: 99, protein: 24, tags: ["prawns"] },

  // --- Grains & starches ----------------------------------------------
  { name: "White rice (cooked)", serving: "1 cup (~200g)", kcal: 260, protein: 5, tags: ["rice"] },
  { name: "Brown rice (cooked)", serving: "1 cup (~200g)", kcal: 220, protein: 5, tags: ["rice"] },
  { name: "Pasta (cooked)", serving: "1 cup (~140g)", kcal: 220, protein: 8 },
  { name: "Oats (dry)", serving: "50g", kcal: 195, protein: 8, tags: ["porridge", "oatmeal"] },
  { name: "Bread (whole wheat)", serving: "1 slice", kcal: 80, protein: 4 },
  { name: "Bread (white)", serving: "1 slice", kcal: 75, protein: 3 },
  { name: "Bagel", serving: "1 medium", kcal: 245, protein: 9 },
  { name: "Tortilla wrap", serving: "1 large", kcal: 210, protein: 6 },
  { name: "Potato (baked)", serving: "1 medium (~170g)", kcal: 160, protein: 4 },
  { name: "Sweet potato (baked)", serving: "1 medium (~150g)", kcal: 130, protein: 2 },
  { name: "French fries", serving: "100g", kcal: 312, protein: 3, tags: ["chips"] },
  { name: "Quinoa (cooked)", serving: "1 cup (~185g)", kcal: 220, protein: 8 },

  // --- Legumes & soy ---------------------------------------------------
  { name: "Black beans (cooked)", serving: "1 cup (~170g)", kcal: 225, protein: 15 },
  { name: "Chickpeas (cooked)", serving: "1 cup (~165g)", kcal: 270, protein: 15, tags: ["garbanzo"] },
  { name: "Lentils (cooked)", serving: "1 cup (~200g)", kcal: 230, protein: 18 },
  { name: "Tofu (firm)", serving: "100g", kcal: 144, protein: 17 },
  { name: "Hummus", serving: "2 tbsp (~30g)", kcal: 50, protein: 2 },
  { name: "Peanut butter", serving: "1 tbsp (~16g)", kcal: 95, protein: 4 },

  // --- Vegetables ------------------------------------------------------
  { name: "Broccoli", serving: "1 cup (~90g)", kcal: 30, protein: 2 },
  { name: "Spinach", serving: "1 cup (~30g)", kcal: 7, protein: 1 },
  { name: "Mixed salad", serving: "1 bowl (~100g)", kcal: 20, protein: 1, tags: ["lettuce", "greens"] },
  { name: "Tomato", serving: "1 medium", kcal: 22, protein: 1 },
  { name: "Carrots", serving: "1 medium", kcal: 25, protein: 1 },
  { name: "Avocado", serving: "1/2 medium", kcal: 160, protein: 2 },

  // --- Fruit -----------------------------------------------------------
  { name: "Banana", serving: "1 medium", kcal: 105, protein: 1 },
  { name: "Apple", serving: "1 medium", kcal: 95, protein: 0 },
  { name: "Orange", serving: "1 medium", kcal: 62, protein: 1 },
  { name: "Strawberries", serving: "1 cup (~150g)", kcal: 50, protein: 1 },
  { name: "Blueberries", serving: "1 cup (~150g)", kcal: 85, protein: 1 },
  { name: "Grapes", serving: "1 cup (~150g)", kcal: 100, protein: 1 },
  { name: "Mango", serving: "1 cup chopped (~165g)", kcal: 99, protein: 1 },

  // --- Nuts & snacks ---------------------------------------------------
  { name: "Almonds", serving: "30g (~22 nuts)", kcal: 175, protein: 6 },
  { name: "Walnuts", serving: "30g", kcal: 195, protein: 5 },
  { name: "Cashews", serving: "30g", kcal: 165, protein: 5 },
  { name: "Trail mix", serving: "30g", kcal: 140, protein: 4 },
  { name: "Granola bar", serving: "1 bar", kcal: 130, protein: 3 },
  { name: "Protein bar", serving: "1 bar", kcal: 210, protein: 20 },
  { name: "Rice cake", serving: "1 cake", kcal: 35, protein: 1 },

  // --- Drinks ----------------------------------------------------------
  { name: "Whey protein", serving: "1 scoop (~30g)", kcal: 120, protein: 24, tags: ["protein shake"] },
  { name: "Black coffee", serving: "1 cup", kcal: 2, protein: 0 },
  { name: "Coffee with milk", serving: "1 cup", kcal: 35, protein: 2, tags: ["latte"] },
  { name: "Orange juice", serving: "250ml glass", kcal: 110, protein: 2 },
  { name: "Cola (regular)", serving: "330ml can", kcal: 140, protein: 0, tags: ["coke", "soda"] },
  { name: "Cola (diet)", serving: "330ml can", kcal: 0, protein: 0, tags: ["coke zero", "diet coke"] },
  { name: "Beer", serving: "330ml bottle", kcal: 140, protein: 1 },
  { name: "Red wine", serving: "150ml glass", kcal: 125, protein: 0 },

  // --- Common meals ----------------------------------------------------
  { name: "Pizza slice", serving: "1 slice", kcal: 285, protein: 12 },
  { name: "Burger (fast food)", serving: "1 medium", kcal: 540, protein: 25, tags: ["cheeseburger"] },
  { name: "Chicken Caesar salad", serving: "1 bowl", kcal: 390, protein: 30 },
  { name: "Tuna sandwich", serving: "1 sandwich", kcal: 350, protein: 24 },
  { name: "Burrito", serving: "1 medium", kcal: 520, protein: 25 },
  { name: "Sushi roll", serving: "8 pieces", kcal: 350, protein: 12 },
  { name: "Pad thai", serving: "1 plate", kcal: 600, protein: 25 },
  { name: "Curry with rice", serving: "1 plate", kcal: 550, protein: 25 },
  { name: "Pancakes", serving: "3 pancakes", kcal: 350, protein: 8 },
  { name: "Cereal with milk", serving: "1 bowl", kcal: 250, protein: 8 },
];

// Lowercase-once lookup table for fast fuzzy search.
const HAYSTACK = FOODS.map((f) => ({
  food: f,
  hay: [f.name, ...(f.tags ?? [])].join(" ").toLowerCase(),
}));

/**
 * Token-based substring search. "chick" matches "Chicken breast"; "chic bre"
 * matches it too (every space-separated query token must appear). Sorted
 * with prefix matches first.
 */
export function searchFoods(query: string, limit = 8): FoodItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const tokens = q.split(/\s+/);
  const hits: { food: FoodItem; score: number }[] = [];
  for (const { food, hay } of HAYSTACK) {
    if (!tokens.every((t) => hay.includes(t))) continue;
    // Score: 0 if the name starts with the query, 1 if name contains it,
    // 2 otherwise (matched only via tags). Lower is better.
    const lcName = food.name.toLowerCase();
    let score = 2;
    if (lcName.startsWith(q)) score = 0;
    else if (lcName.includes(q)) score = 1;
    hits.push({ food, score });
  }
  hits.sort((a, b) => a.score - b.score || a.food.name.localeCompare(b.food.name));
  return hits.slice(0, limit).map((h) => h.food);
}
