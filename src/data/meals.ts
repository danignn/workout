export type MealCategory = 'breakfast' | 'lunch' | 'dinner' | 'snack';
export type Cookware = 'no-cook' | 'stovetop' | 'rice-cooker';

export type Cuisine = 'filipino' | 'international';

export interface Meal {
  id: string;
  name: string;
  category: MealCategory;
  cuisine: Cuisine;
  protein: number; // grams, approximate
  calories: number; // approximate
  minutes: number;
  cookware: Cookware;
  tags: string[];
  ingredients: string[];
  method: string;
  prepAhead?: string;
}

export const MEAL_CATEGORIES: { id: MealCategory; label: string; emoji: string }[] = [
  { id: 'breakfast', label: 'Breakfast', emoji: '🌅' },
  { id: 'lunch', label: 'Lunch', emoji: '🍚' },
  { id: 'dinner', label: 'Dinner', emoji: '🍲' },
  { id: 'snack', label: 'Snacks', emoji: '🍡' },
];

export const COOKWARE_LABEL: Record<Cookware, string> = {
  'no-cook': 'No cooking',
  stovetop: 'Stovetop',
  'rice-cooker': 'Rice cooker',
};

/**
 * Every recipe here is stovetop, rice cooker or no-cook. Nothing needs an oven.
 * Portions assume one person and are built to stack up to roughly 100g of
 * protein a day without eating the same ulam five days running.
 */
export const MEALS: Meal[] = [
  // ---------------- Breakfast ----------------
  {
    id: 'tuna-omelette',
    name: 'Tuna Omelette',
    category: 'breakfast',
    cuisine: 'filipino',
    protein: 32,
    calories: 380,
    minutes: 10,
    cookware: 'stovetop',
    tags: ['fast', 'high protein'],
    ingredients: ['3 eggs', '1 can Century Tuna flakes in oil, drained', '1 tomato, chopped', '1 small onion', 'Salt and pepper'],
    method: 'Sauté onion and tomato, add drained tuna for a minute. Pour in beaten eggs, cook low until set, fold over. Eat with a cup of rice.',
  },
  {
    id: 'corned-beef-scramble',
    name: 'Corned Beef & Egg Scramble',
    category: 'breakfast',
    cuisine: 'filipino',
    protein: 26,
    calories: 400,
    minutes: 8,
    cookware: 'stovetop',
    tags: ['fast', 'easy'],
    ingredients: ['1 can corned beef', '2 eggs', '1 small onion', 'Pepper'],
    method: 'Fry the onion until soft, add the corned beef and break it up, then pour the beaten eggs over and stir until just set.',
  },
  {
    id: 'arroz-caldo-protein',
    name: 'Chicken Arroz Caldo',
    category: 'breakfast',
    cuisine: 'filipino',
    protein: 38,
    calories: 480,
    minutes: 30,
    cookware: 'stovetop',
    tags: ['comfort', 'batch cook'],
    ingredients: ['150g chicken breast, sliced', '3/4 cup rice', 'Ginger, garlic, onion', '1 boiled egg', 'Fish sauce, calamansi, spring onion'],
    method: 'Sauté ginger, garlic, onion. Add chicken and rice, then water, simmer 20 min until porridge-thick. Season with fish sauce, top with boiled egg and calamansi.',
    prepAhead: 'Makes 2 bowls. Keeps 3 days in the fridge, loosen with hot water when reheating.',
  },
  {
    id: 'ground-meat-omelette',
    name: 'Ground Meat Omelette',
    category: 'breakfast',
    cuisine: 'filipino',
    protein: 30,
    calories: 420,
    minutes: 15,
    cookware: 'stovetop',
    tags: ['classic', 'easy'],
    ingredients: ['3 eggs', '100g ground pork or chicken', 'Garlic, onion, tomato', '1 small potato, diced small', 'Salt and pepper'],
    method: 'Fry the diced potato until soft, add garlic, onion, tomato and the ground meat and brown it. Pour the beaten eggs over, cook low until set, then fold.',
  },
  {
    id: 'protein-champorado',
    name: 'Protein Champorado',
    category: 'breakfast',
    cuisine: 'filipino',
    protein: 24,
    calories: 420,
    minutes: 15,
    cookware: 'stovetop',
    tags: ['sweet', 'pre-workout'],
    ingredients: ['1/2 cup glutinous rice or oats', '2 tbsp cocoa powder', '1 cup fresh milk', '1 scoop chocolate whey (optional)', '2 tbsp peanut butter'],
    method: 'Cook the rice or oats until thick, stir in cocoa and milk. Off the heat, stir through the whey and peanut butter so the protein does not curdle.',
  },
  {
    id: 'egg-kamatis-rice',
    name: 'Scrambled Eggs, Tomato & Rice',
    category: 'breakfast',
    cuisine: 'filipino',
    protein: 22,
    calories: 390,
    minutes: 8,
    cookware: 'stovetop',
    tags: ['fastest', 'budget'],
    ingredients: ['3 eggs', '1 tomato', '1 cup rice', 'Salt, pepper, a little oil'],
    method: 'Soft-scramble the eggs, fold the chopped tomato in at the end so it stays fresh. Over rice.',
  },
  {
    id: 'oats-saba',
    name: 'Oats with Saba & Peanut Butter',
    category: 'breakfast',
    cuisine: 'filipino',
    protein: 20,
    calories: 410,
    minutes: 6,
    cookware: 'stovetop',
    tags: ['pre-workout', 'make ahead'],
    ingredients: ['1/2 cup rolled oats', '1 cup fresh milk', '1 saba banana, sliced', '1 tbsp peanut butter', 'Pinch of salt'],
    method: 'Simmer oats in milk 4 min. Top with saba and peanut butter. Eat 1 to 2 hours before a lower body session.',
  },

  // ---------------- Lunch ----------------
  {
    id: 'chicken-adobo-breast',
    name: 'Chicken Adobo (breast)',
    category: 'lunch',
    cuisine: 'filipino',
    protein: 42,
    calories: 480,
    minutes: 30,
    cookware: 'stovetop',
    tags: ['meal prep', 'freezer friendly'],
    ingredients: ['500g chicken breast, cubed', '1/3 cup soy sauce', '1/4 cup vinegar', '1 head garlic, crushed', 'Peppercorns, 3 bay leaves'],
    method: 'Marinate 30 min if you have time. Simmer everything 20 min, uncovered the last 5 so the sauce thickens. Do not boil hard or the breast goes dry.',
    prepAhead: 'Makes 3 to 4 portions. This is the backbone of the week — cook it Sunday.',
  },
  {
    id: 'ginisang-monggo-tinapa',
    name: 'Mung Bean Stew with Smoked Fish',
    category: 'lunch',
    cuisine: 'filipino',
    protein: 26,
    calories: 400,
    minutes: 40,
    cookware: 'stovetop',
    tags: ['budget', 'fibre', 'batch cook'],
    ingredients: ['1 cup mung beans (monggo)', '1 pack smoked fish flakes (tinapa) or 100g pork', 'Garlic, onion, tomato', 'Moringa or water spinach (kangkong)', 'Fish sauce'],
    method: 'Boil the mung beans 30 min until soft. Sauté garlic, onion, tomato, add the smoked fish, then the beans with their water. Simmer, stir in the greens at the very end.',
    prepAhead: 'Makes 4 portions and costs almost nothing. Freezes well.',
  },
  {
    id: 'tuna-guisado',
    name: 'Tuna Guisado',
    category: 'lunch',
    cuisine: 'filipino',
    protein: 30,
    calories: 350,
    minutes: 12,
    cookware: 'stovetop',
    tags: ['packed lunch', 'fast'],
    ingredients: ['2 cans Century Tuna flakes', 'Garlic, onion, tomato', '1 carrot, diced small', 'Green peas', 'Fish sauce, pepper'],
    method: 'Sauté aromatics, add carrot until just soft, then tuna and peas. Two minutes only, tuna is already cooked. Great baon over rice.',
  },
  {
    id: 'chicken-tinola',
    name: 'Chicken Tinola',
    category: 'lunch',
    cuisine: 'filipino',
    protein: 40,
    calories: 420,
    minutes: 35,
    cookware: 'stovetop',
    tags: ['soup', 'light'],
    ingredients: ['400g chicken (thigh and breast)', 'Ginger, garlic, onion', 'Green papaya or chayote', 'Moringa leaves (malunggay)', 'Fish sauce'],
    method: 'Sauté ginger, garlic, onion, brown the chicken, add water and simmer 20 min. Add the papaya until tender, then the leaves off the heat.',
    prepAhead: 'Makes 3 portions.',
  },
  {
    id: 'bistek-tagalog',
    name: 'Bistek Tagalog',
    category: 'lunch',
    cuisine: 'filipino',
    protein: 38,
    calories: 470,
    minutes: 30,
    cookware: 'stovetop',
    tags: ['iron rich', 'leg day'],
    ingredients: ['300g beef sirloin, thin sliced', '3 tbsp soy sauce', 'Calamansi or lime juice', '2 onions, in rings', 'Pepper'],
    method: 'Marinate beef in soy, calamansi and pepper 30 min. Sear hard and fast, remove. Soften the onions in the pan, return the beef with the marinade, simmer 5 min.',
  },
  {
    id: 'ginisang-sardinas',
    name: 'Sardines with Water Spinach',
    category: 'lunch',
    cuisine: 'filipino',
    protein: 24,
    calories: 330,
    minutes: 12,
    cookware: 'stovetop',
    tags: ['budget', 'omega 3'],
    ingredients: ['2 cans sardines in tomato sauce', '1 bundle water spinach (kangkong)', 'Garlic, onion', 'Long green chilli', 'Pepper'],
    method: 'Sauté garlic and onion, add sardines and break them up gently. Add the stems first, then the leaves, cook until just wilted.',
  },
  {
    id: 'chicken-curry-pinoy',
    name: 'Filipino Chicken Curry',
    category: 'lunch',
    cuisine: 'filipino',
    protein: 40,
    calories: 520,
    minutes: 35,
    cookware: 'stovetop',
    tags: ['meal prep', 'creamy'],
    ingredients: ['400g chicken', '1 pack curry powder', '1 can coconut milk', 'Potato, carrot, bell pepper', 'Garlic, onion, ginger'],
    method: 'Sauté aromatics with curry powder, brown the chicken, add coconut milk and vegetables. Simmer 20 min until the potato is soft.',
    prepAhead: 'Makes 3 portions.',
  },
  {
    id: 'pinakbet-tuna',
    name: 'Mixed Vegetables with Tuna',
    category: 'lunch',
    cuisine: 'filipino',
    protein: 26,
    calories: 340,
    minutes: 25,
    cookware: 'stovetop',
    tags: ['veg heavy', 'fibre'],
    ingredients: ['2 cans tuna or 150g pork', 'Squash, string beans, okra, green beans', 'Shrimp paste (bagoong)', 'Garlic, onion, tomato'],
    method: 'Sauté garlic, onion, tomato with the shrimp paste. Add kalabasa first, then the rest, cover and steam in its own liquid 12 min. Fold in the tuna at the end.',
  },

  // ---------------- Dinner ----------------
  {
    id: 'inihaw-bangus',
    name: 'Pan-Grilled Bangus',
    category: 'dinner',
    cuisine: 'filipino',
    protein: 36,
    calories: 400,
    minutes: 20,
    cookware: 'stovetop',
    tags: ['omega 3', 'simple'],
    ingredients: ['1 boneless milkfish belly (bangus)', 'Salt and pepper', 'Calamansi', 'Tomato and onion salsa (ensalada)'],
    method: 'Dry the fish well, salt it, cook skin down in a hot dry non-stick pan 6 min, flip 3 min. Serve with the raw tomato-onion salsa and calamansi.',
  },
  {
    id: 'sinigang-hipon',
    name: 'Shrimp Tamarind Soup',
    category: 'dinner',
    cuisine: 'filipino',
    protein: 34,
    calories: 320,
    minutes: 25,
    cookware: 'stovetop',
    tags: ['soup', 'light dinner'],
    ingredients: ['300g shrimp', '1 sachet tamarind soup mix (sinigang)', 'Water spinach, string beans, radish', 'Tomato and onion', 'Long green chilli'],
    method: 'Boil tomato and onion, add the sinigang mix and vegetables hardest-first. Add shrimp last, they need 3 minutes only or they turn rubbery.',
  },
  {
    id: 'chicken-inasal-pan',
    name: 'Pan-Seared Chicken Inasal',
    category: 'dinner',
    cuisine: 'filipino',
    protein: 44,
    calories: 480,
    minutes: 30,
    cookware: 'stovetop',
    tags: ['high protein', 'meal prep'],
    ingredients: ['400g chicken thigh or breast', 'Calamansi, vinegar, lemongrass', 'Ginger, garlic', 'Annatto oil, salt'],
    method: 'Marinate 30 min in calamansi, vinegar, crushed lemongrass, ginger and garlic. Sear in a covered pan 8 min a side, basting with annatto oil.',
    prepAhead: 'Marinate Sunday, cook fresh in 15 min on the night.',
  },
  {
    id: 'ginataang-tilapia',
    name: 'Coconut Tilapia with Moringa',
    category: 'dinner',
    cuisine: 'filipino',
    protein: 34,
    calories: 420,
    minutes: 25,
    cookware: 'stovetop',
    tags: ['creamy', 'budget'],
    ingredients: ['2 tilapia fillets', '1 can coconut milk', 'Ginger, garlic, onion', 'Moringa leaves (malunggay)', 'Long green chilli'],
    method: 'Simmer coconut milk with ginger, garlic and onion 5 min. Slide in the fish, cover, 8 min. Malunggay at the very end.',
  },
  {
    id: 'pork-sinigang-lean',
    name: 'Pork Tamarind Soup',
    category: 'dinner',
    cuisine: 'filipino',
    protein: 36,
    calories: 450,
    minutes: 45,
    cookware: 'stovetop',
    tags: ['batch cook', 'comfort'],
    ingredients: ['400g lean pork shoulder, trimmed', '1 sachet tamarind soup mix (sinigang)', 'Taro, radish, string beans, water spinach', 'Tomato, onion', 'Long green chilli'],
    method: 'Boil the pork 30 min until tender, skim the foam. Add tomato, onion and the mix, then vegetables hardest-first. Water spinach last.',
    prepAhead: 'Makes 3 to 4 portions. Better on day two.',
  },
  {
    id: 'chopsuey-chicken',
    name: 'Chicken Chopsuey',
    category: 'dinner',
    cuisine: 'filipino',
    protein: 38,
    calories: 400,
    minutes: 22,
    cookware: 'stovetop',
    tags: ['veg heavy', 'one pan'],
    ingredients: ['250g chicken breast, sliced', 'Cabbage, carrot, chayote, green beans', 'Garlic, onion', 'Oyster sauce', 'Cornstarch slurry'],
    method: 'Sear the chicken, remove. Stir fry the vegetables hard and fast so they stay crunchy, return the chicken, oyster sauce and a little slurry to gloss it.',
  },
  {
    id: 'giniling-guisado',
    name: 'Ground Meat & Vegetable Stew',
    category: 'dinner',
    cuisine: 'filipino',
    protein: 34,
    calories: 460,
    minutes: 25,
    cookware: 'stovetop',
    tags: ['packed lunch', 'batch cook'],
    ingredients: ['300g ground pork or chicken', 'Potato and carrot, diced', 'Tomato sauce', 'Garlic, onion', 'Green peas, raisins optional'],
    method: 'Brown the meat, sauté garlic and onion, add potato and carrot with the tomato sauce. Simmer 15 min until soft. Peas at the end.',
    prepAhead: 'Makes 3 portions and reheats perfectly for baon.',
  },
  {
    id: 'sardine-omelette',
    name: 'Sardine Omelette',
    category: 'dinner',
    cuisine: 'filipino',
    protein: 28,
    calories: 380,
    minutes: 12,
    cookware: 'stovetop',
    tags: ['easy', 'budget'],
    ingredients: ['1 can sardines in tomato sauce, drained', '3 eggs', '1 small onion', 'Spring onion', 'Pepper'],
    method: 'Fry the onion, add the drained sardines and break them up. Pour the beaten eggs over, cook low until set, then fold.',
  },
  // ---------------- Snacks ----------------
  {
    id: 'boiled-eggs-snacks',
    name: 'Boiled Eggs with Rock Salt',
    category: 'snack',
    cuisine: 'filipino',
    protein: 13,
    calories: 160,
    minutes: 10,
    cookware: 'stovetop',
    tags: ['batch cook', 'budget'],
    ingredients: ['2 eggs', 'Rock salt'],
    method: 'Boil a dozen on Sunday, keep them in the fridge. Seven minutes gives a jammy yolk, ten gives firm.',
    prepAhead: 'Boil 12 at once on grocery day.',
  },
  {
    id: 'tuna-crackers',
    name: 'Tuna on Skyflakes',
    category: 'snack',
    cuisine: 'filipino',
    protein: 20,
    calories: 240,
    minutes: 3,
    cookware: 'no-cook',
    tags: ['no cook', 'office'],
    ingredients: ['1 can Century Tuna flakes in oil', '4 Skyflakes crackers', 'Calamansi, pepper'],
    method: 'Drain the tuna, squeeze calamansi in, spoon onto crackers.',
  },
  {
    id: 'greek-yog-banana',
    name: 'Yogurt with Saba & Peanut',
    category: 'snack',
    cuisine: 'filipino',
    protein: 15,
    calories: 250,
    minutes: 3,
    cookware: 'no-cook',
    tags: ['sweet fix', 'no cook'],
    ingredients: ['1 cup plain or Greek yogurt', '1 saba banana', '1 tbsp peanuts, crushed'],
    method: 'Layer and eat. Plain yogurt has roughly double the protein of the sweetened flavoured tubs.',
  },
  {
    id: 'protein-shake-ph',
    name: 'Whey Shake',
    category: 'snack',
    cuisine: 'filipino',
    protein: 25,
    calories: 140,
    minutes: 1,
    cookware: 'no-cook',
    tags: ['post workout', 'fastest'],
    ingredients: ['1 scoop whey protein', '300ml water or fresh milk'],
    method: 'Shake. The cheapest way to close a 25g gap on a day the food did not add up.',
  },
  {
    id: 'chicken-sandwich',
    name: 'Chicken Sandwich',
    category: 'snack',
    cuisine: 'filipino',
    protein: 24,
    calories: 290,
    minutes: 5,
    cookware: 'no-cook',
    tags: ['portable', 'uses leftovers'],
    ingredients: ['100g leftover cooked chicken, shredded', '2 slices wholemeal bread', '1 tbsp mayo or yogurt', 'Lettuce or cucumber'],
    method: 'Shred yesterday\u2019s chicken, mix with a spoon of mayo or plain yogurt, and build the sandwich. The best use for leftover adobo or inasal.',
  },
  {
    id: 'peanuts-kamote',
    name: 'Boiled Sweet Potato & Peanuts',
    category: 'snack',
    cuisine: 'filipino',
    protein: 10,
    calories: 280,
    minutes: 20,
    cookware: 'stovetop',
    tags: ['pre-workout', 'budget'],
    ingredients: ['1 medium sweet potato (kamote)', 'A handful of boiled peanuts'],
    method: 'Boil the sweet potato 15 min. Good slow carbs an hour before training.',
  },
  {
    id: 'sikwate-milk-egg',
    name: 'Milk & Boiled Egg Combo',
    category: 'snack',
    cuisine: 'filipino',
    protein: 16,
    calories: 230,
    minutes: 2,
    cookware: 'no-cook',
    tags: ['before bed', 'no cook'],
    ingredients: ['1 glass fresh milk', '1 boiled egg'],
    method: 'The simplest protein top-up before sleep, and it costs about twenty pesos.',
  },

  // ---------------- International & easy ----------------
  {
    id: 'overnight-oats',
    name: 'Protein Overnight Oats',
    category: 'breakfast',
    cuisine: 'international',
    protein: 30,
    calories: 420,
    minutes: 5,
    cookware: 'no-cook',
    tags: ['make ahead', 'no cook', 'fast'],
    ingredients: ['1/2 cup rolled oats', '1 scoop protein powder', '200ml milk', '1 tbsp peanut butter', '1 tbsp chia seeds', 'Banana or mango to top'],
    method: 'Stir the oats, protein powder, milk and chia in a jar. Fridge overnight. Top with fruit and peanut butter in the morning. Make three jars at once on Sunday.',
    prepAhead: 'Three jars on Sunday covers half your breakfasts with zero morning cooking.',
  },
  {
    id: 'pb-banana-smoothie',
    name: 'Peanut Butter Banana Smoothie',
    category: 'breakfast',
    cuisine: 'international',
    protein: 32,
    calories: 400,
    minutes: 3,
    cookware: 'no-cook',
    tags: ['post workout', 'fastest', 'no cook'],
    ingredients: ['1 scoop protein powder', '1 banana', '1 tbsp peanut butter', '250ml milk', 'Ice'],
    method: 'Blend. Best within an hour of finishing a session, and it doubles as breakfast on a rushed morning.',
  },
  {
    id: 'egg-cheese-sandwich',
    name: 'Egg & Cheese Sandwich',
    category: 'breakfast',
    cuisine: 'international',
    protein: 26,
    calories: 400,
    minutes: 8,
    cookware: 'stovetop',
    tags: ['fast', 'easy'],
    ingredients: ['3 eggs', '2 slices wholemeal bread', '1 cheese slice', 'Tomato and lettuce', 'Salt and pepper'],
    method: 'Fry or scramble the eggs, melt the cheese over them in the pan, then build the sandwich with the salad.',
  },
  {
    id: 'yogurt-parfait',
    name: 'Yogurt & Granola Parfait',
    category: 'breakfast',
    cuisine: 'international',
    protein: 24,
    calories: 350,
    minutes: 3,
    cookware: 'no-cook',
    tags: ['no cook', 'sweet fix'],
    ingredients: ['200g plain Greek yogurt', '3 tbsp granola', 'Mango, banana or berries', '1 tsp honey'],
    method: 'Layer yogurt, fruit and granola. Plain yogurt has roughly double the protein of the sweetened cups.',
  },
  {
    id: 'chicken-caesar-wrap',
    name: 'Chicken Caesar Wrap',
    category: 'lunch',
    cuisine: 'international',
    protein: 40,
    calories: 480,
    minutes: 10,
    cookware: 'no-cook',
    tags: ['portable', 'uses leftovers', 'fast'],
    ingredients: ['150g cooked chicken, sliced', '1 large tortilla', 'Lettuce', '2 tbsp Greek yogurt mixed with a little mayo', 'Parmesan or cheese', 'Lemon, pepper'],
    method: 'Toss the chicken and lettuce in the dressing, roll it tightly in the tortilla and slice on the diagonal. Perfect for leftover adobo or inasal chicken.',
  },
  {
    id: 'tuna-pasta-salad',
    name: 'Tuna Pasta Salad',
    category: 'lunch',
    cuisine: 'international',
    protein: 34,
    calories: 480,
    minutes: 15,
    cookware: 'stovetop',
    tags: ['meal prep', 'packed lunch'],
    ingredients: ['80g dry pasta', '1 can tuna in oil, drained', 'Sweetcorn, cucumber, tomato', '2 tbsp Greek yogurt or mayo', 'Lemon, salt, pepper'],
    method: 'Boil the pasta, rinse it cold, then toss everything together. Keeps three days and is eaten cold, so no reheating needed.',
    prepAhead: 'Makes 2 portions.',
  },
  {
    id: 'chicken-fried-rice',
    name: 'Chicken Fried Rice',
    category: 'lunch',
    cuisine: 'international',
    protein: 38,
    calories: 520,
    minutes: 15,
    cookware: 'stovetop',
    tags: ['uses leftovers', 'one pan', 'fast'],
    ingredients: ['150g chicken breast, diced', '1.5 cups day-old rice', '2 eggs', 'Carrot, peas, spring onion', 'Garlic, soy sauce, sesame oil'],
    method: 'Scramble the eggs, set aside. Sear the chicken, add garlic and vegetables, then the cold rice and soy sauce. Fold the egg back in at the end. Day-old rice is the trick — fresh rice goes mushy.',
  },
  {
    id: 'burrito-bowl',
    name: 'Chicken Burrito Bowl',
    category: 'lunch',
    cuisine: 'international',
    protein: 42,
    calories: 550,
    minutes: 20,
    cookware: 'stovetop',
    tags: ['meal prep', 'balanced'],
    ingredients: ['150g chicken breast, diced', '1 cup rice', '1 can black or kidney beans, drained', 'Sweetcorn, tomato, onion', 'Paprika, cumin, lime', 'Cheese or yogurt to top'],
    method: 'Season and pan-fry the chicken with the spices. Build over rice with the beans, corn and a quick tomato-onion salsa. Squeeze lime over.',
    prepAhead: 'Cook double chicken and it is two lunches.',
  },
  {
    id: 'creamy-chicken-pasta',
    name: 'Creamy Chicken & Spinach Pasta',
    category: 'dinner',
    cuisine: 'international',
    protein: 45,
    calories: 600,
    minutes: 25,
    cookware: 'stovetop',
    tags: ['comfort', 'training day'],
    ingredients: ['150g chicken breast, diced', '80g dry pasta', '3 tbsp cream cheese', 'Spinach', 'Garlic', 'Parmesan, pepper'],
    method: 'Cook the pasta, saving a cup of the water. Sear the chicken, add garlic, cream cheese and a splash of pasta water to make the sauce. Toss with the pasta and spinach.',
  },
  {
    id: 'beef-broccoli',
    name: 'Beef & Broccoli Stir Fry',
    category: 'dinner',
    cuisine: 'international',
    protein: 42,
    calories: 500,
    minutes: 20,
    cookware: 'stovetop',
    tags: ['iron rich', 'one pan', 'fast'],
    ingredients: ['250g beef sirloin, thin sliced', 'Broccoli florets', 'Garlic, ginger', 'Soy sauce, oyster sauce, a little honey', 'Cornstarch slurry', 'Rice to serve'],
    method: 'Sear the beef hard and fast, remove it. Stir fry the broccoli with garlic and ginger, add the sauce, return the beef and thicken with a little slurry.',
  },
  {
    id: 'garlic-butter-fish',
    name: 'Garlic Butter Fish & Vegetables',
    category: 'dinner',
    cuisine: 'international',
    protein: 38,
    calories: 430,
    minutes: 20,
    cookware: 'stovetop',
    tags: ['light', 'one pan', 'omega 3'],
    ingredients: ['2 white fish fillets', 'Butter, garlic, parsley', 'Green beans and carrot', 'Lemon, salt, pepper'],
    method: 'Pan-sear the fish 4 minutes a side in butter, basting with the garlic. Steam or pan-cook the vegetables alongside. Squeeze lemon over both.',
  },
  {
    id: 'chicken-quesadilla',
    name: 'Chicken Quesadilla',
    category: 'dinner',
    cuisine: 'international',
    protein: 38,
    calories: 520,
    minutes: 12,
    cookware: 'stovetop',
    tags: ['fast', 'uses leftovers'],
    ingredients: ['150g cooked chicken, shredded', '2 tortillas', 'Cheese', 'Onion and bell pepper', 'Salsa or yogurt to dip'],
    method: 'Fill one tortilla with chicken, cheese and softened onion and pepper, top with the second, and dry-fry in a pan 3 minutes a side until the cheese melts.',
  },
  {
    id: 'cheese-crackers',
    name: 'Cheese & Crackers',
    category: 'snack',
    cuisine: 'international',
    protein: 12,
    calories: 220,
    minutes: 2,
    cookware: 'no-cook',
    tags: ['no cook', 'office'],
    ingredients: ['2 cheese slices or a small block', '4 crackers', 'Cherry tomatoes'],
    method: 'Assemble. A quick 12g when the day is running short on protein.',
  },
  {
    id: 'nuts-chocolate',
    name: 'Nuts & Dark Chocolate',
    category: 'snack',
    cuisine: 'international',
    protein: 9,
    calories: 260,
    minutes: 1,
    cookware: 'no-cook',
    tags: ['no cook', 'sweet fix'],
    ingredients: ['A small handful of mixed nuts', '2 squares dark chocolate'],
    method: 'Portion it into a small bowl rather than eating from the bag, or the handful becomes three.',
  },
];

/* ------------------------------------------------------------------ *
 * Sunday grocery run
 * ------------------------------------------------------------------ */

export interface GroceryItem {
  name: string;
  qty: string;
  /** Approximate peso price. Estimates only — see PRICE_NOTE. */
  price: number;
  note?: string;
  /**
   * True for pantry staples that last well beyond one week. Counting a 5kg
   * sack of rice and a litre of oil as a weekly cost would overstate the
   * shop by well over a thousand pesos.
   */
  staple?: boolean;
}

export interface GrocerySection {
  id: string;
  label: string;
  emoji: string;
  aisle: string;
  items: GroceryItem[];
}

export const PRICE_NOTE =
  'Prices are rough estimates for a Metro Manila supermarket and will not match your receipt exactly. Treat them as a budget guide, not a quote — fresh items especially move week to week. Items marked as staples last a month or more, so you only buy them on the first shop.';

export const GROCERY_LIST: GrocerySection[] = [
  {
    id: 'poultry',
    label: 'Meat & Poultry',
    emoji: '🍗',
    aisle: 'Fresh / chilled section',
    items: [
      { name: 'Chicken breast', qty: '1 kg', price: 300, note: 'The workhorse. Adobo, inasal, chopsuey, arroz caldo.' },
      { name: 'Chicken thigh (bone-in)', qty: '½ kg', price: 130, note: 'For tinola and inasal, more forgiving than breast.' },
      { name: 'Ground pork or chicken', qty: '½ kg', price: 160, note: 'Giniling and torta.' },
      { name: 'Lean pork shoulder', qty: '½ kg', price: 160, note: 'Sinigang. Trim the visible fat.' },
      { name: 'Beef sirloin, sliced thin', qty: '300 g', price: 150, note: 'Bistek. Optional if the budget is tight.' },
    ],
  },
  {
    id: 'fish',
    label: 'Fish & Canned',
    emoji: '🐟',
    aisle: 'Wet section + canned goods aisle',
    items: [
      { name: 'Century Tuna flakes in oil', qty: '6 cans', price: 240, note: 'Buy the multipack, it is cheaper per can.' },
      { name: 'Sardines in tomato sauce', qty: '3 cans', price: 90 },
      { name: 'Milkfish belly (bangus), boneless', qty: '2 pcs', price: 180 },
      { name: 'Tilapia fillet', qty: '2 pcs', price: 160 },
      { name: 'Shrimp', qty: '300 g', price: 220, note: 'For sinigang na hipon.' },
      { name: 'Smoked fish flakes (tinapa)', qty: '1 pack', price: 70 },
    ],
  },
  {
    id: 'eggs',
    label: 'Eggs & Dairy',
    emoji: '🥚',
    aisle: 'Chilled aisle',
    items: [
      { name: 'Eggs', qty: '1 tray (30)', price: 260, note: 'You will get through these. Boil a dozen on Sunday.' },
      { name: 'Fresh milk', qty: '1 L', price: 95 },
      { name: 'Plain or Greek yogurt', qty: '1 tub', price: 150, note: 'Plain has roughly double the protein of the sweet flavoured cups.' },
      { name: 'Corned beef', qty: '2 cans', price: 130 },
      { name: 'Cheese slices or block', qty: '1 pack', price: 120 },
    ],
  },
  {
    id: 'produce',
    label: 'Fruit & Vegetables',
    emoji: '🥬',
    aisle: 'Produce section',
    items: [
      { name: 'Water spinach (kangkong)', qty: '2 bundles', price: 40 },
      { name: 'Moringa or pak choi (pechay)', qty: '2 bundles', price: 45 },
      { name: 'String beans, okra, squash', qty: 'mixed vegetables', price: 120 },
      { name: 'Carrot, chayote, cabbage', qty: 'for chopsuey', price: 120 },
      { name: 'Onion', qty: '½ kg', price: 80 },
      { name: 'Garlic', qty: '¼ kg', price: 50 },
      { name: 'Tomato', qty: '½ kg', price: 60 },
      { name: 'Ginger', qty: 'small pack', price: 20 },
      { name: 'Calamansi', qty: '¼ kg', price: 30 },
      { name: 'Saba banana', qty: '1 kg', price: 70, note: 'Pre-workout carbs and yogurt topping.' },
      { name: 'Sweet potato', qty: '½ kg', price: 45 },
      { name: 'Broccoli or green beans', qty: '½ kg', price: 110 },
      { name: 'Lettuce', qty: '1 head', price: 60 },
      { name: 'Bell pepper', qty: '2 pcs', price: 50 },
      { name: 'Lemon', qty: '2 pcs', price: 30 },
    ],
  },
  {
    id: 'pantry',
    label: 'Rice & Pantry',
    emoji: '🍚',
    aisle: 'Dry goods aisle',
    items: [
      { name: 'Rice', qty: '5 kg', price: 320 , staple: true },
      { name: 'Rolled oats', qty: '800 g', price: 180 , staple: true },
      { name: 'Mung beans (monggo)', qty: '½ kg', price: 60, note: 'Cheapest protein in the store.' },
      { name: 'Soy sauce', qty: '1 bottle', price: 40 , staple: true },
      { name: 'Vinegar', qty: '1 bottle', price: 30 , staple: true },
      { name: 'Fish sauce (patis)', qty: '1 bottle', price: 45 , staple: true },
      { name: 'Cooking oil', qty: '1 L', price: 130 , staple: true },
      { name: 'Coconut milk', qty: '2 cans', price: 90 },
      { name: 'Tamarind soup mix', qty: '3 sachets', price: 45 },
      { name: 'Curry powder', qty: '1 pack', price: 30 , staple: true },
      { name: 'Oyster sauce', qty: '1 bottle', price: 60 , staple: true },
      { name: 'Peanut butter', qty: '1 jar', price: 130 , staple: true },
      { name: 'Skyflakes crackers', qty: '1 pack', price: 60 , staple: true },
      { name: 'Peppercorns and bay leaves', qty: 'small packs', price: 40 , staple: true },
    ],
  },
];

export const OPTIONAL_ITEMS: GroceryItem[] = [
  { name: 'Whey protein', qty: '1 tub (2 lb)', price: 2200, note: 'Optional and the single most expensive item. Lasts about 2 months. Only worth it if you keep missing your protein target from food alone.' },
];

const allItems = () => GROCERY_LIST.flatMap((s) => s.items);

/** What you spend every week: fresh food only, staples already in the cupboard. */
export function weeklyTotal(): number {
  return allItems().filter((i) => !i.staple).reduce((n, i) => n + i.price, 0);
}

/** The first shop, when the pantry is bare and you buy the staples too. */
export function firstShopTotal(): number {
  return allItems().reduce((n, i) => n + i.price, 0);
}

export function stapleTotal(): number {
  return allItems().filter((i) => i.staple).reduce((n, i) => n + i.price, 0);
}

/* ------------------------------------------------------------------ *
 * Sunday prep
 * ------------------------------------------------------------------ */

export interface PrepStep {
  order: number;
  title: string;
  detail: string;
  minutes: number;
}

export const SUNDAY_PREP: PrepStep[] = [
  {
    order: 1,
    title: 'Put the monggo on to boil',
    detail: 'It takes 30 minutes and needs no attention, so start it first and cook everything else around it.',
    minutes: 30,
  },
  {
    order: 2,
    title: 'Boil a dozen eggs',
    detail: 'Ten minutes, then straight into cold water. This is your snacks sorted for the whole week.',
    minutes: 12,
  },
  {
    order: 3,
    title: 'Cook the chicken adobo',
    detail: 'Make the full 500g. Three to four portions of lunch, done in one pot, and it gets better by day two.',
    minutes: 30,
  },
  {
    order: 4,
    title: 'Brown a batch of giniling',
    detail: 'Three portions of baon. Cool it fully before it goes in the fridge or it sweats and spoils faster.',
    minutes: 25,
  },
  {
    order: 5,
    title: 'Marinate the inasal',
    detail: 'Chicken in calamansi, vinegar, lemongrass, ginger and garlic. Fridge it. Cooks in 15 minutes midweek.',
    minutes: 10,
  },
  {
    order: 6,
    title: 'Wash and cut the gulay',
    detail: 'Water spinach (kangkong), sitaw, carrot, sayote into containers. The reason weeknight cooking collapses is the chopping, not the cooking.',
    minutes: 20,
  },
  {
    order: 7,
    title: 'Portion everything out',
    detail: 'Into single-serve containers, labelled with the day. Cooked ulam keeps 3 to 4 days in the fridge, freeze anything for later in the week.',
    minutes: 15,
  },
];

/** Protein guidance for a woman training for glute growth: ~1.6g per kg bodyweight. */
export function proteinTargetFor(bodyweightKg: number): number {
  return Math.round(bodyweightKg * 1.6);
}

export const NUTRITION_NOTES = [
  {
    title: 'Protein is the priority',
    body: 'Aim for roughly 1.6g of protein per kg of bodyweight per day. For most Filipinas that lands between 85g and 110g. Spread it across every meal rather than cramming it into dinner — a cup of rice with a token piece of ulam is where most days quietly fall short.',
  },
  {
    title: 'Fix the rice-to-ulam ratio',
    body: 'The usual Filipino plate is mostly rice. You do not need to give up rice at all, just move the balance: keep your rice, but double the ulam. That one change is usually worth 20 to 30g of protein a day.',
  },
  {
    title: 'Eat before you lift',
    body: 'Rice, oats or saba 1 to 2 hours before training gives you the energy to actually hit your sets. Training on an empty stomach usually means lighter weights, which means less stimulus for the glutes.',
  },
  {
    title: 'The flat tummy comes from here',
    body: 'Not from crunches. Overall body fat is driven by total food intake, sleep and daily movement. Keep protein high, keep the fried and the sweet occasional rather than daily, and stay consistent rather than perfect.',
  },
  {
    title: 'Growth needs fuel',
    body: 'Building glute muscle is easier at maintenance calories or a small surplus. Chronic under-eating is the most common reason a glute programme stops producing results.',
  },
];
