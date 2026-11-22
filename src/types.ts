export type CookingStyle = 'ev' | 'lokanta';

export type PortionScale = 'az' | 'normal' | 'bol';

export type MealSlot = 'Kahvaltı' | 'Öğle' | 'Akşam' | 'Ara Öğün';

export interface TurkishDish {
  id: string;
  name: string;
  aliases: string[];
  category: 'Çorba' | 'Kahvaltı' | 'Ev Yemeği' | 'Izgara & Kebap' | 'Hamur İşi' | 'Yan & İçecek' | 'Tatlı';
  unitLabel: string;
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  /** Extra fat/oil factor when ordered at a restaurant instead of home-cooked */
  lokantaExtraFatG: number;
}

export interface MealItem {
  id: string;
  dishId: string;
  name: string;
  unitLabel: string;
  quantity: number;
  baseKcal: number;
  baseProtein: number;
  baseCarbs: number;
  baseFat: number;
  lokantaExtraFatG: number;
}

export interface LoggedMeal {
  id: string;
  dateKey: string;
  timeLabel: string;
  slot: MealSlot;
  title: string;
  cookingStyle: CookingStyle;
  portionScale: PortionScale;
  photoDataUrl?: string;
  items: MealItem[];
}

export interface DailyTargets {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
  waterGlasses: number;
}

export interface SofraState {
  targets: DailyTargets;
  meals: LoggedMeal[];
  waterByDate: Record<string, number>;
  geminiApiKey: string;
}
