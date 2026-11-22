import type { CookingStyle, LoggedMeal, MealItem, PortionScale, TurkishDish } from '../types';
import { TURKISH_DISHES } from '../data/turkishCuisine';

export const PORTION_MULTIPLIER: Record<PortionScale, number> = {
  az: 0.72,
  normal: 1.0,
  bol: 1.35,
};

export function dishToMealItem(dish: TurkishDish, quantity = 1): MealItem {
  return {
    id: `${dish.id}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    dishId: dish.id,
    name: dish.name,
    unitLabel: dish.unitLabel,
    quantity,
    baseKcal: dish.kcal,
    baseProtein: dish.protein,
    baseCarbs: dish.carbs,
    baseFat: dish.fat,
    lokantaExtraFatG: dish.lokantaExtraFatG,
  };
}

/**
 * Pure deterministic macro calculator with Ev Yapımı vs Lokanta oil calibration
 * and Az / Normal / Bol portion scaling. Zero drift on live edits.
 */
export function calculateMealMacros(
  items: MealItem[],
  cookingStyle: CookingStyle,
  portionScale: PortionScale
): { kcal: number; protein: number; carbs: number; fat: number; extraOilKcal: number } {
  const scale = PORTION_MULTIPLIER[portionScale];
  let kcal = 0;
  let protein = 0;
  let carbs = 0;
  let fat = 0;
  let extraOilKcal = 0;

  for (const item of items) {
    const qty = Math.max(0.25, item.quantity) * scale;
    const itemExtraFat = cookingStyle === 'lokanta' ? item.lokantaExtraFatG * qty : 0;
    const itemExtraKcal = itemExtraFat * 9;

    kcal += item.baseKcal * qty + itemExtraKcal;
    protein += item.baseProtein * qty;
    carbs += item.baseCarbs * qty;
    fat += item.baseFat * qty + itemExtraFat;
    extraOilKcal += itemExtraKcal;
  }

  return {
    kcal: Math.round(kcal),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    extraOilKcal: Math.round(extraOilKcal),
  };
}

export function sumDayMacros(meals: LoggedMeal[]): {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
} {
  return meals.reduce(
    (acc, meal) => {
      const m = calculateMealMacros(meal.items, meal.cookingStyle, meal.portionScale);
      return {
        kcal: acc.kcal + m.kcal,
        protein: acc.protein + m.protein,
        carbs: acc.carbs + m.carbs,
        fat: acc.fat + m.fat,
      };
    },
    { kcal: 0, protein: 0, carbs: 0, fat: 0 }
  );
}

/**
 * Parses natural Turkish sentences like "1 kase mercimek, 2 dilim ekmek, 1 ayran"
 * or "yarım porsiyon mantı + cacık" into structured Turkish MealItems.
 */
export function parseTurkishMealText(input: string): MealItem[] {
  const segments = input
    .toLocaleLowerCase('tr-TR')
    .split(/[,+\n]|\bve\b/g)
    .map((s) => s.trim())
    .filter(Boolean);

  const parsed: MealItem[] = [];

  for (const seg of segments) {
    let quantity = 1;
    if (seg.includes('yarım') || seg.includes('yarim')) {
      quantity = 0.5;
    } else if (seg.includes('buçuk') || seg.includes('bucuk')) {
      const numMatch = seg.match(/(\d+)/);
      quantity = numMatch ? Number(numMatch[1]) + 0.5 : 1.5;
    } else {
      const numMatch = seg.match(/(\d+(?:[.,]\d+)?)/);
      if (numMatch) {
        const val = Number(numMatch[1].replace(',', '.'));
        if (val > 0 && val <= 10) quantity = val;
      }
    }

    // Find best matching Turkish dish (longest alias match wins)
    let bestDish: TurkishDish | null = null;
    let bestLen = 0;
    for (const dish of TURKISH_DISHES) {
      const candidates = [dish.name.toLocaleLowerCase('tr-TR'), ...dish.aliases];
      for (const alias of candidates) {
        if (seg.includes(alias) && alias.length > bestLen) {
          bestLen = alias.length;
          bestDish = dish;
        }
      }
    }

    if (bestDish) {
      parsed.push(dishToMealItem(bestDish, quantity));
    }
  }

  return parsed;
}

/**
 * Optional live Gemini Vision meal identification when the user supplies their own API key.
 */
export async function analyzePhotoWithGemini(
  apiKey: string,
  base64DataUrl: string
): Promise<string[]> {
  const [header, data] = base64DataUrl.split(',');
  const mimeMatch = header?.match(/data:(.*?);base64/);
  const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: 'Bu fotoğraftaki Türk yemeklerini ve tahmini porsiyonlarını sadece virgülle ayrılmış kısa Türkçe ifadelerle listele. Örnek: "1 kase mercimek çorbası, 1 porsiyon pirinç pilavı, 1 ayran". Başka açıklama yazma.',
              },
              { inline_data: { mime_type: mimeType, data } },
            ],
          },
        ],
      }),
    }
  );

  if (!res.ok) {
    throw new Error('Gemini API isteği başarısız oldu. Anahtarını kontrol et.');
  }

  const json = (await res.json()) as {
    candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  };
  const text = json.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}
