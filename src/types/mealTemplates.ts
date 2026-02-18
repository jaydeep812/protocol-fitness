/* ============================================
   Protocol - Meal Template Definitions
   Fixed meal templates for one-tap logging
   ============================================ */

// ============================================
// Types
// ============================================

export type MealCategory = 'Breakfast' | 'Lunch' | 'Dinner' | 'Snack';

export interface Macros {
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  calories: number;
}

export interface MealTemplate {
  id: string;
  name: string;
  category: MealCategory;
  items: string[];
  macros: Macros;
}

export interface MealLogEntry {
  id: string;
  date: string;
  templateId: string;
  templateName: string;
  category: MealCategory;
  macros: Macros;
  loggedAt: string;
}

export interface NutritionTargets {
  protein: number;
  calories: number;
}

export const DEFAULT_NUTRITION_TARGETS: NutritionTargets = {
  protein: 180,
  calories: 2300,
};

// ============================================
// Meal Templates Data
// ============================================

export const MEAL_TEMPLATES: MealTemplate[] = [
  // Breakfast
  {
    id: 'breakfast-egg-protocol',
    name: 'Egg Protocol',
    category: 'Breakfast',
    items: ['4 whole eggs', '2 egg whites', '1 guava'],
    macros: {
      protein: 42,
      carbs: 20,
      fat: 25,
      fiber: 8,
      calories: 480,
    },
  },
  
  // Lunch Options
  {
    id: 'lunch-chicken-bowl',
    name: 'Chicken Bowl',
    category: 'Lunch',
    items: ['180g chicken', '150g rice', '1 bowl dal', 'Salad'],
    macros: {
      protein: 55,
      carbs: 75,
      fat: 12,
      fiber: 8,
      calories: 650,
    },
  },
  {
    id: 'lunch-soya-bowl',
    name: 'Soya Bowl',
    category: 'Lunch',
    items: ['100g dry soya chunks', '150g rice', 'Salad'],
    macros: {
      protein: 50,
      carbs: 70,
      fat: 8,
      fiber: 12,
      calories: 600,
    },
  },
  
  // Dinner Options
  {
    id: 'dinner-paneer-meal',
    name: 'Paneer Meal',
    category: 'Dinner',
    items: ['150g paneer', 'Veg sabzi', '1 chapati'],
    macros: {
      protein: 40,
      carbs: 35,
      fat: 22,
      fiber: 7,
      calories: 550,
    },
  },
  {
    id: 'dinner-chicken',
    name: 'Chicken Dinner',
    category: 'Dinner',
    items: ['150g chicken', 'Veg', 'Small carb portion'],
    macros: {
      protein: 45,
      carbs: 25,
      fat: 10,
      fiber: 6,
      calories: 450,
    },
  },
  
  // Snack
  {
    id: 'snack-whey-banana',
    name: 'Whey + Banana',
    category: 'Snack',
    items: ['1 scoop whey', '1 banana'],
    macros: {
      protein: 24,
      carbs: 27,
      fat: 2,
      fiber: 3,
      calories: 210,
    },
  },
];

// ============================================
// Helper Functions
// ============================================

/**
 * Get templates by category
 */
export function getTemplatesByCategory(category: MealCategory): MealTemplate[] {
  return MEAL_TEMPLATES.filter(t => t.category === category);
}

/**
 * Get template by ID
 */
export function getTemplateById(id: string): MealTemplate | undefined {
  return MEAL_TEMPLATES.find(t => t.id === id);
}

/**
 * Calculate total macros from meal logs
 */
export function calculateTotalMacros(logs: MealLogEntry[]): Macros {
  return logs.reduce(
    (total, log) => ({
      protein: total.protein + log.macros.protein,
      carbs: total.carbs + log.macros.carbs,
      fat: total.fat + log.macros.fat,
      fiber: total.fiber + log.macros.fiber,
      calories: total.calories + log.macros.calories,
    }),
    { protein: 0, carbs: 0, fat: 0, fiber: 0, calories: 0 }
  );
}

/**
 * Get category icon
 */
export function getCategoryEmoji(category: MealCategory): string {
  switch (category) {
    case 'Breakfast': return '🍳';
    case 'Lunch': return '🍱';
    case 'Dinner': return '🍽️';
    case 'Snack': return '🍌';
  }
}
