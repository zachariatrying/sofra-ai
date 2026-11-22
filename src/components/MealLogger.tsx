import { useState, type ChangeEvent, type FormEvent } from 'react';
import { Camera, Sparkles, Plus, Minus, Trash2, UtensilsCrossed, Home, Store } from 'lucide-react';
import type { CookingStyle, LoggedMeal, MealItem, MealSlot, PortionScale } from '../types';
import { TURKISH_DISHES } from '../data/turkishCuisine';
import {
  analyzePhotoWithGemini,
  calculateMealMacros,
  dishToMealItem,
  parseTurkishMealText,
} from '../utils/mealParser';

interface MealLoggerProps {
  geminiApiKey: string;
  onSaveMeal: (meal: Omit<LoggedMeal, 'id' | 'dateKey' | 'timeLabel'>) => void;
}

const SLOTS: MealSlot[] = ['Kahvaltı', 'Öğle', 'Akşam', 'Ara Öğün'];

const QUICK_CHIPS = ['mercimek', 'kuru-fasulye', 'pirinc-pilavi', 'manti', 'menemen', 'simit', 'lahmacun', 'ayran'];

export function MealLogger({ geminiApiKey, onSaveMeal }: MealLoggerProps) {
  const [slot, setSlot] = useState<MealSlot>('Öğle');
  const [cookingStyle, setCookingStyle] = useState<CookingStyle>('ev');
  const [portionScale, setPortionScale] = useState<PortionScale>('normal');
  const [naturalText, setNaturalText] = useState('');
  const [draftItems, setDraftItems] = useState<MealItem[]>([
    dishToMealItem(TURKISH_DISHES[0], 1),
    dishToMealItem(TURKISH_DISHES[9], 1),
  ]);
  const [photoPreview, setPhotoPreview] = useState<string | undefined>(undefined);
  const [visionStatus, setVisionStatus] = useState<string | null>(null);
  const [dishSearch, setDishSearch] = useState('');

  const liveTotals = calculateMealMacros(draftItems, cookingStyle, portionScale);

  const handleParseText = (e: FormEvent) => {
    e.preventDefault();
    if (!naturalText.trim()) return;
    const found = parseTurkishMealText(naturalText);
    if (found.length > 0) {
      setDraftItems((prev) => [...prev, ...found]);
      setNaturalText('');
      setVisionStatus(`${found.length} Türk yemeği cümlenden çözümlendi ve tabağına eklendi.`);
    } else {
      setVisionStatus('Cümlede tanımlı yemek bulunamadı; aşağıdaki hızlı listeden tek tıkla ekleyebilirsin.');
    }
  };

  const handlePhotoUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = String(reader.result);
      setPhotoPreview(dataUrl);
      if (geminiApiKey.trim()) {
        setVisionStatus('Gemini Vision tabağındaki Türk yemeklerini tanıyor...');
        try {
          const detectedNames = await analyzePhotoWithGemini(geminiApiKey.trim(), dataUrl);
          const matched = parseTurkishMealText(detectedNames.join(', '));
          if (matched.length > 0) {
            setDraftItems(matched);
            setVisionStatus(`Fotoğraftan tanındı: ${detectedNames.join(', ')}`);
          } else {
            setVisionStatus(`Tanınan metin: "${detectedNames.join(', ')}" — aşağıdan tabağı düzenleyebilirsin.`);
          }
        } catch (err) {
          setVisionStatus(err instanceof Error ? err.message : 'Fotoğraf analizi başarısız oldu.');
        }
      } else {
        setVisionStatus(
          'Fotoğraf yüklendi! Sağ üstten kendi Gemini API anahtarını eklersen otomatik fotoğraf tanıma açılır; ya da hemen aşağıdan yemekleri seçip Ev/Lokanta kalibrasyonu yapabilirsin.'
        );
      }
    };
    reader.readAsDataURL(file);
  };

  const addDishById = (dishId: string) => {
    const dish = TURKISH_DISHES.find((d) => d.id === dishId);
    if (!dish) return;
    setDraftItems((prev) => [...prev, dishToMealItem(dish, 1)]);
  };

  const updateItemQty = (itemId: string, delta: number) => {
    setDraftItems((prev) =>
      prev.map((item) =>
        item.id === itemId
          ? { ...item, quantity: Math.max(0.5, Math.round((item.quantity + delta) * 2) / 2) }
          : item
      )
    );
  };

  const removeItem = (itemId: string) => {
    setDraftItems((prev) => prev.filter((item) => item.id !== itemId));
  };

  const handleCommitMeal = () => {
    if (draftItems.length === 0) return;
    const title =
      draftItems.length === 1
        ? draftItems[0].name
        : `${draftItems[0].name} + ${draftItems.length - 1} eşlikçi`;

    onSaveMeal({
      slot,
      title,
      cookingStyle,
      portionScale,
      photoDataUrl: photoPreview,
      items: draftItems,
    });
    setDraftItems([]);
    setPhotoPreview(undefined);
    setVisionStatus('Öğünün günlüğe eklendi ve makro halkaların güncellendi!');
  };

  const searchResults = dishSearch.trim()
    ? TURKISH_DISHES.filter((d) =>
        d.name.toLocaleLowerCase('tr-TR').includes(dishSearch.toLocaleLowerCase('tr-TR'))
      ).slice(0, 6)
    : [];

  return (
    <section
      aria-label="Hızlı Türk mutfağı öğün kaydedici"
      className="rounded-3xl border border-[#E6E2D9] bg-white p-5 shadow-[0_10px_28px_-18px_rgba(28,35,31,0.18)] space-y-4"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="font-display-sofra text-lg font-bold text-[#1C231F] flex items-center gap-2">
          <UtensilsCrossed className="w-5 h-5 text-[#C84B31]" />
          3 Saniyede Öğün Ekle
        </h2>

        <div className="flex items-center gap-1">
          {SLOTS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => setSlot(s)}
              className={`rounded-full px-2.5 py-1 text-xs font-semibold cursor-pointer ${
                slot === s ? 'bg-[#1C231F] text-[#F7F5F0]' : 'bg-[#F3EFE8] text-[#5D6660]'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Natural Turkish Input + Photo Upload */}
      <form onSubmit={handleParseText} className="flex flex-col sm:flex-row gap-2">
        <input
          type="text"
          value={naturalText}
          onChange={(e) => setNaturalText(e.target.value)}
          placeholder='Yazarak ekle: "1 kase mercimek, 2 dilim ekmek, 1 ayran"...'
          className="flex-1 rounded-xl border border-[#DDD7CB] bg-[#F7F5F0] px-3.5 py-2.5 text-sm text-[#1C231F] focus:border-[#C84B31] focus:bg-white focus:outline-none"
        />
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#1C231F] px-4 py-2.5 text-sm font-semibold text-[#F7F5F0] hover:bg-[#313B35] cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          Çözümle
        </button>
        <label className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#C84B31] bg-[#FDF1EE] px-4 py-2.5 text-sm font-semibold text-[#C84B31] hover:bg-[#FAE3DD] cursor-pointer">
          <Camera className="w-4 h-4" />
          Fotoğraf
          <input type="file" accept="image/*" onChange={handlePhotoUpload} className="hidden" />
        </label>
      </form>

      {visionStatus && (
        <div className="rounded-xl bg-[#F7F5F0] border border-[#E6E2D9] px-3.5 py-2 text-xs text-[#1C231F]">
          {visionStatus}
        </div>
      )}

      {photoPreview && (
        <div className="flex items-center gap-3 rounded-2xl border border-[#E6E2D9] bg-[#F7F5F0] p-2.5">
          <img src={photoPreview} alt="Yüklenen yemek tabağı" className="w-16 h-16 rounded-xl object-cover" />
          <div className="flex-1 text-xs text-[#5D6660]">
            Tabak fotoğrafı öğüne eklendi. Aşağıdan Ev/Lokanta ve porsiyon kalibrasyonunu seç.
          </div>
          <button
            type="button"
            onClick={() => setPhotoPreview(undefined)}
            className="text-xs font-semibold text-[#C84B31] px-2 cursor-pointer"
          >
            Kaldır
          </button>
        </div>
      )}

      {/* Quick Search & Popular Turkish Dishes */}
      <div className="space-y-2">
        <input
          type="text"
          value={dishSearch}
          onChange={(e) => setDishSearch(e.target.value)}
          placeholder="36 Türk yemeğinde ara (mantı, karnıyarık, iskender, sarma, börek)..."
          className="w-full rounded-xl border border-[#E6E2D9] bg-white px-3.5 py-2 text-xs text-[#1C231F]"
        />

        {searchResults.length > 0 ? (
          <div className="flex flex-wrap gap-1.5">
            {searchResults.map((dish) => (
              <button
                key={dish.id}
                type="button"
                onClick={() => {
                  addDishById(dish.id);
                  setDishSearch('');
                }}
                className="inline-flex items-center gap-1 rounded-full border border-[#C84B31]/40 bg-[#FDF1EE] px-3 py-1 text-xs font-semibold text-[#A3361F] hover:bg-[#FADFD8] cursor-pointer"
              >
                <Plus className="w-3 h-3" />
                {dish.name} ({dish.kcal} kcal)
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {QUICK_CHIPS.map((id) => {
              const dish = TURKISH_DISHES.find((d) => d.id === id);
              if (!dish) return null;
              return (
                <button
                  key={dish.id}
                  type="button"
                  onClick={() => addDishById(dish.id)}
                  className="inline-flex items-center gap-1 rounded-full border border-[#E6E2D9] bg-[#F7F5F0] px-2.5 py-1 text-xs font-medium text-[#1C231F] hover:border-[#C84B31] cursor-pointer"
                >
                  <Plus className="w-3 h-3 text-[#C84B31]" />
                  {dish.name}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* 2-Tap Local Calibration (The Turkey Wedge!) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 rounded-2xl bg-[#F7F5F0] border border-[#E6E2D9] p-3.5">
        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wide text-[#5D6660] mb-1.5">
            1. Pişirme Tarzı (Yağ Kalibrasyonu)
          </span>
          <div className="grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => setCookingStyle('ev')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold cursor-pointer ${
                cookingStyle === 'ev'
                  ? 'border-[#1C231F] bg-[#1C231F] text-white'
                  : 'border-[#DDD7CB] bg-white text-[#5D6660]'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              Ev Yapımı
            </button>
            <button
              type="button"
              onClick={() => setCookingStyle('lokanta')}
              className={`inline-flex items-center justify-center gap-1.5 rounded-xl border py-2 text-xs font-bold cursor-pointer ${
                cookingStyle === 'lokanta'
                  ? 'border-[#C84B31] bg-[#C84B31] text-white'
                  : 'border-[#DDD7CB] bg-white text-[#5D6660]'
              }`}
            >
              <Store className="w-3.5 h-3.5" />
              Lokanta / Dışarı
            </button>
          </div>
        </div>

        <div>
          <span className="block text-[11px] font-bold uppercase tracking-wide text-[#5D6660] mb-1.5">
            2. Porsiyon Boyu
          </span>
          <div className="grid grid-cols-3 gap-1.5">
            {(
              [
                { id: 'az', label: 'Az (0.7x)' },
                { id: 'normal', label: 'Normal' },
                { id: 'bol', label: 'Bol (1.35x)' },
              ] as Array<{ id: PortionScale; label: string }>
            ).map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => setPortionScale(p.id)}
                className={`rounded-xl border py-2 text-xs font-bold cursor-pointer ${
                  portionScale === p.id
                    ? 'border-[#1C231F] bg-[#1C231F] text-white'
                    : 'border-[#DDD7CB] bg-white text-[#5D6660]'
                }`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Live Editable Plate Tray */}
      {draftItems.length > 0 && (
        <div className="rounded-2xl border border-[#E6E2D9] bg-[#FCFBF8] p-4 space-y-3">
          <ul className="space-y-2">
            {draftItems.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between gap-2 text-xs bg-white border border-[#ECE8DF] rounded-xl px-3 py-2"
              >
                <div className="min-w-0">
                  <div className="font-semibold text-[#1C231F] truncate">{item.name}</div>
                  <div className="text-[11px] text-[#5D6660]">{item.unitLabel}</div>
                </div>
                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => updateItemQty(item.id, -0.5)}
                    aria-label="Miktar azalt"
                    className="rounded-md border border-[#E6E2D9] p-1 hover:bg-[#F7F5F0] cursor-pointer"
                  >
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-8 text-center font-bold tabular-nums">{item.quantity}x</span>
                  <button
                    type="button"
                    onClick={() => updateItemQty(item.id, 0.5)}
                    aria-label="Miktar artır"
                    className="rounded-md border border-[#E6E2D9] p-1 hover:bg-[#F7F5F0] cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    aria-label="Sil"
                    className="ml-1 rounded-md p-1 text-[#888] hover:text-[#C84B31] cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-[#ECE8DF]">
            <div className="text-xs space-x-2 tabular-nums">
              <strong className="text-base text-[#1C231F]">{liveTotals.kcal} kcal</strong>
              <span className="text-[#2563EB] font-semibold">P {liveTotals.protein}g</span>
              <span className="text-[#D97706] font-semibold">K {liveTotals.carbs}g</span>
              <span className="text-[#7C3AED] font-semibold">Y {liveTotals.fat}g</span>
              {liveTotals.extraOilKcal > 0 && (
                <span className="text-[11px] text-[#C84B31]">
                  (+{liveTotals.extraOilKcal} kcal lokanta yağı)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={handleCommitMeal}
              className="rounded-xl bg-[#C84B31] px-5 py-2.5 text-sm font-bold text-white hover:bg-[#AD3D26] transition-colors cursor-pointer"
            >
              {slot} Olarak Kaydet
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
