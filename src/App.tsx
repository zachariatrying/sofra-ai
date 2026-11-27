import { useEffect, useMemo, useState, type ChangeEvent } from 'react';
import { GuideWidget } from './components/GuideWidget';
import { Settings, Trash2, Home, Store, X, Download, Upload, ShieldCheck, BarChart3, ImageDown } from 'lucide-react';
import type { LoggedMeal, SofraState } from './types';
import { TURKISH_DISHES } from './data/turkishCuisine';
import { calculateMealMacros, dishToMealItem, sumDayMacros } from './utils/mealParser';
import { downloadSofraCardPng } from './utils/storyCard';
import { MacroRings } from './components/MacroRings';
import { MealLogger } from './components/MealLogger';

const STORAGE_KEY = 'sofra_ai_state_v1';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function createInitialState(): SofraState {
  const today = todayKey();
  return {
    targets: {
      kcal: 2100,
      protein: 130,
      carbs: 220,
      fat: 70,
      waterGlasses: 8,
    },
    meals: [
      {
        id: 'm-sample-1',
        dateKey: today,
        timeLabel: '09:15',
        slot: 'Kahvaltı',
        title: 'Menemen + Beyaz Peynir + Tam Buğday',
        cookingStyle: 'ev',
        portionScale: 'normal',
        items: [
          dishToMealItem(TURKISH_DISHES[3], 1),
          dishToMealItem(TURKISH_DISHES[5], 1),
          dishToMealItem(TURKISH_DISHES[31], 2),
        ],
      },
    ],
    waterByDate: { [today]: 3 },
    geminiApiKey: '',
  };
}

function loadState(): SofraState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as SofraState) : createInitialState();
  } catch {
    return createInitialState();
  }
}

export default function App() {
  const [state, setState] = useState<SofraState>(() => loadState());
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [backupNotice, setBackupNotice] = useState<string | null>(null);

  const today = todayKey();

  const last7Days = useMemo(() => {
    const days: { dateKey: string; label: string; kcal: number; protein: number }[] = [];
    for (let i = 6; i >= 0; i -= 1) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayMeals = state.meals.filter((m) => m.dateKey === dateKey);
      const totals = sumDayMacros(dayMeals);
      days.push({
        dateKey,
        label: d.toLocaleDateString('tr-TR', { weekday: 'short' }),
        kcal: totals.kcal,
        protein: totals.protein,
      });
    }
    return days;
  }, [state.meals]);

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sofraai-yedek-${today}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setBackupNotice('Tüm öğün ve hedef verilerin JSON olarak indirildi.');
  };

  const handleImportJson = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<SofraState>;
        if (!parsed.targets || !Array.isArray(parsed.meals)) {
          throw new Error('Geçersiz SofraAI yedek dosyası.');
        }
        setState({
          targets: parsed.targets,
          meals: parsed.meals,
          waterByDate: parsed.waterByDate ?? {},
          geminiApiKey: typeof parsed.geminiApiKey === 'string' ? parsed.geminiApiKey : '',
        });
        setBackupNotice('JSON yedeği başarıyla geri yüklendi.');
      } catch (err) {
        setBackupNotice(err instanceof Error ? err.message : 'Yedek dosyası okunamadı.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleDeleteAllData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(createInitialState());
    setConfirmReset(false);
    setBackupNotice('Tüm yerel veriler kalıcı olarak temizlendi ve sıfırlandı.');
  };

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore quota errors
    }
  }, [state]);

  const todaysMeals = useMemo(
    () => state.meals.filter((m) => m.dateKey === today),
    [state.meals, today]
  );

  const consumed = useMemo(() => sumDayMacros(todaysMeals), [todaysMeals]);
  const waterCount = state.waterByDate[today] ?? 0;

  const handleSaveMeal = (meal: Omit<LoggedMeal, 'id' | 'dateKey' | 'timeLabel'>) => {
    const now = new Date();
    const timeLabel = now.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' });
    setState((prev) => ({
      ...prev,
      meals: [
        {
          ...meal,
          id: `meal-${Date.now()}`,
          dateKey: today,
          timeLabel,
        },
        ...prev.meals,
      ],
    }));
  };

  const handleToggleMealCookingStyle = (mealId: string) => {
    setState((prev) => ({
      ...prev,
      meals: prev.meals.map((m) =>
        m.id === mealId ? { ...m, cookingStyle: m.cookingStyle === 'ev' ? 'lokanta' : 'ev' } : m
      ),
    }));
  };

  const handleDeleteMeal = (mealId: string) => {
    setState((prev) => ({
      ...prev,
      meals: prev.meals.filter((m) => m.id !== mealId),
    }));
  };

  const handleChangeWater = (delta: number) => {
    setState((prev) => ({
      ...prev,
      waterByDate: {
        ...prev.waterByDate,
        [today]: Math.max(0, Math.min(20, (prev.waterByDate[today] ?? 0) + delta)),
      },
    }));
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF7F0] text-[#231F1D]">
      <header className="mx-auto max-w-6xl w-full px-4 sm:px-6 pt-5 pb-4 border-b-2 border-[#231F1D]/15">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}store-assets/sofraai_icon.png`}
              alt="SofraAI"
              className="w-10 h-10 rounded-full border border-[#E4DDD0] object-cover"
            />
            <div>
              <h1 className="font-display-sofra text-2xl sm:text-3xl font-bold text-[#231F1D] leading-none">
                SofraAI
              </h1>
              <p className="hidden sm:block text-xs text-[#5D5752] mt-1">
                Türk mutfağı ve ev yemekleri için günlük mutfak defteri
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => downloadSofraCardPng(consumed, state.targets, waterCount, todaysMeals.length)}
              className="inline-flex items-center gap-1.5 rounded-full border border-[#231F1D]/20 bg-[#FFFDF8] px-3.5 py-2 text-xs font-semibold text-[#231F1D] hover:border-[#B83B24] cursor-pointer"
            >
              <ImageDown className="w-4 h-4 text-[#B83B24]" />
              <span className="hidden sm:inline">Günün Kartı</span>
            </button>

            <button
              type="button"
              onClick={() => setSettingsOpen(true)}
              className="inline-flex items-center gap-1.5 rounded-full bg-[#B83B24] px-4 py-2 text-xs font-semibold text-white hover:bg-[#9B2F1B] cursor-pointer"
            >
              <Settings className="w-4 h-4" />
              Hedef &amp; KVKK
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-6xl px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Calorie Ring + Meal History */}
          <div className="lg:col-span-5 space-y-5">
            <MacroRings
              consumed={consumed}
              targets={state.targets}
              waterCount={waterCount}
              onChangeWater={handleChangeWater}
            />

            <section className="rounded-3xl border border-[#E6E2D9] bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display-sofra text-sm font-bold text-[#1C231F] flex items-center gap-1.5">
                  <BarChart3 className="w-4 h-4 text-[#C84B31]" />
                  7 Günlük Kalori & Protein Trendi
                </h2>
                <span className="text-[11px] tabular-nums text-[#5D6660]">
                  Hedef: {state.targets.kcal} kcal
                </span>
              </div>
              <div className="grid grid-cols-7 gap-2 items-end h-24 pt-2">
                {last7Days.map((day) => {
                  const ratio = Math.min(100, Math.round((day.kcal / Math.max(1, state.targets.kcal)) * 100));
                  const barH = Math.max(8, Math.round(ratio * 0.72));
                  return (
                    <div key={day.dateKey} className="flex flex-col items-center gap-1" title={`${day.label}: ${day.kcal} kcal · ${day.protein}g protein`}>
                      <span className="text-[10px] font-semibold tabular-nums text-[#5D6660]">
                        {day.kcal > 0 ? day.kcal : '—'}
                      </span>
                      <div className="w-full max-w-[26px] rounded-t-md bg-[#EFECE5] h-16 flex items-end overflow-hidden">
                        <div
                          className={`w-full rounded-t-md transition-all ${day.kcal > state.targets.kcal ? 'bg-[#C84B31]' : 'bg-[#2563EB]'}`}
                          style={{ height: `${day.kcal > 0 ? barH : 4}px` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-[#1C231F]">{day.label}</span>
                    </div>
                  );
                })}
              </div>
            </section>

            <section className="rounded-3xl border border-[#E6E2D9] bg-white p-5">
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display-sofra text-base font-bold text-[#1C231F]">
                  Bugünkü Öğünlerin ({todaysMeals.length})
                </h2>
                <span className="text-[11px] text-[#5D6660]">Canlı Ev/Lokanta geçişi</span>
              </div>

              {todaysMeals.length === 0 ? (
                <p className="rounded-2xl border border-dashed border-[#DDD7CB] p-6 text-center text-xs text-[#5D6660]">
                  Henüz öğün eklemedin. Sağdan yazarak veya seçerek ilk öğününü kaydet.
                </p>
              ) : (
                <ul className="space-y-2.5">
                  {todaysMeals.map((meal) => {
                    const totals = calculateMealMacros(meal.items, meal.cookingStyle, meal.portionScale);
                    return (
                      <li
                        key={meal.id}
                        className="rounded-2xl border border-[#ECE8DF] bg-[#FAF8F4] p-3.5"
                      >
                        <div className="flex items-baseline justify-between gap-2">
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2 text-[11px] font-semibold text-[#5D5752]">
                              <span className="rounded-full bg-white border border-[#E4DDD0] px-2 py-0.5 text-[#231F1D]">
                                {meal.slot}
                              </span>
                              <span className="tabular-nums">{meal.timeLabel}</span>
                              <span>·</span>
                              <span className="uppercase">{meal.portionScale}</span>
                            </div>
                            <div className="flex items-baseline gap-2 mt-1.5 min-w-0">
                              <h3 className="font-display-sofra text-sm font-bold text-[#231F1D] truncate">{meal.title}</h3>
                              <span className="flex-1 min-w-[12px] border-b border-dotted border-[#231F1D]/25" />
                              <span className="text-sm font-extrabold tabular-nums text-[#B83B24] shrink-0">
                                {totals.kcal} kcal
                              </span>
                            </div>
                            <div className="text-[11px] tabular-nums text-[#5D5752] mt-0.5">
                              P{totals.protein} · K{totals.carbs} · Y{totals.fat}
                            </div>
                          </div>
                        </div>

                        <div className="mt-2.5 pt-2 border-t border-[#ECE8DF] flex items-center justify-between">
                          <button
                            type="button"
                            onClick={() => handleToggleMealCookingStyle(meal.id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[#DDD7CB] bg-white px-2.5 py-1 text-[11px] font-semibold text-[#1C231F] hover:border-[#C84B31] cursor-pointer"
                            title="Ev Yapımı ve Lokanta yağ kalibrasyonu arasında anında geçiş yap"
                          >
                            {meal.cookingStyle === 'ev' ? (
                              <>
                                <Home className="w-3 h-3 text-[#2563EB]" /> Ev Yapımı
                              </>
                            ) : (
                              <>
                                <Store className="w-3 h-3 text-[#C84B31]" /> Lokanta (+{totals.extraOilKcal} kcal)
                              </>
                            )}
                          </button>

                          <button
                            type="button"
                            onClick={() => handleDeleteMeal(meal.id)}
                            aria-label="Öğünü sil"
                            className="rounded-lg p-1.5 text-[#888] hover:text-[#C84B31] cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </section>
          </div>

          {/* Right: Meal Logger & Calibration */}
          <div className="lg:col-span-7">
            <MealLogger geminiApiKey={state.geminiApiKey} onSaveMeal={handleSaveMeal} />
          </div>
        </div>
      </main>

      <footer className="border-t border-[#E6E2D9] py-4 text-center text-xs text-[#6B726D] px-4">
        SofraAI beslenme farkındalığı sunar; tıbbi teşhis veya klinik diyetisyen tavsiyesi değildir. Veriler yerel tarayıcında tutulur.
      </footer>

      {/* Targets & Optional Gemini Vision API Modal */}
      {settingsOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-[#1C231F]/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Günlük hedefler ve API ayarları"
        >
          <div className="w-full max-w-md rounded-3xl border border-[#E6E2D9] bg-[#F7F5F0] p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-display-sofra text-lg font-bold text-[#1C231F]">
                Günlük Hedefler & Vision AI
              </h2>
              <button
                type="button"
                onClick={() => setSettingsOpen(false)}
                aria-label="Kapat"
                className="rounded-full p-1.5 text-[#5D6660] hover:bg-[#E8E4DC] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-[#5D6660] mb-1">Kalori (kcal)</label>
                <input
                  type="number"
                  value={state.targets.kcal}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      targets: { ...prev.targets, kcal: Math.max(1000, Number(e.target.value) || 2000) },
                    }))
                  }
                  className="w-full rounded-xl border border-[#DDD7CB] bg-white px-3 py-2 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5D6660] mb-1">Protein (g)</label>
                <input
                  type="number"
                  value={state.targets.protein}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      targets: { ...prev.targets, protein: Math.max(30, Number(e.target.value) || 120) },
                    }))
                  }
                  className="w-full rounded-xl border border-[#DDD7CB] bg-white px-3 py-2 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5D6660] mb-1">Karbonhidrat (g)</label>
                <input
                  type="number"
                  value={state.targets.carbs}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      targets: { ...prev.targets, carbs: Math.max(50, Number(e.target.value) || 200) },
                    }))
                  }
                  className="w-full rounded-xl border border-[#DDD7CB] bg-white px-3 py-2 text-sm tabular-nums"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-[#5D6660] mb-1">Yağ (g)</label>
                <input
                  type="number"
                  value={state.targets.fat}
                  onChange={(e) =>
                    setState((prev) => ({
                      ...prev,
                      targets: { ...prev.targets, fat: Math.max(20, Number(e.target.value) || 65) },
                    }))
                  }
                  className="w-full rounded-xl border border-[#DDD7CB] bg-white px-3 py-2 text-sm tabular-nums"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#5D6660] mb-1">
                Opsiyonel Gemini API Anahtarı (Canlı Fotoğraftan Yemek Tanıma)
              </label>
              <input
                type="password"
                value={state.geminiApiKey}
                onChange={(e) => setState((prev) => ({ ...prev, geminiApiKey: e.target.value }))}
                placeholder="AIza... (boş bırakırsan tamamen yerel çalışır)"
                className="w-full rounded-xl border border-[#DDD7CB] bg-white px-3 py-2 text-sm"
              />
              <p className="text-[11px] text-[#5D6660] mt-1">
                Anahtar sadece bu tarayıcının yerel deposunda saklanır.
              </p>
              {state.geminiApiKey.trim().length > 0 && (
                <p className="mt-2 rounded-lg border border-[#F59E0B]/40 bg-[#FFFBEB] px-2.5 py-2 text-[11px] text-[#78350F]">
                  <strong>Harici Yapay Zeka Bildirimi:</strong> Fotoğraf analizi özelliğini kullandığınızda yüklediğiniz
                  yemek görseli analiz için doğrudan <strong>Google LLC (Google Gemini API)</strong> sunucularına iletilir.{' '}
                  <a href="./privacy.html" className="underline font-bold">
                    Gizlilik Politikası
                  </a>
                </p>
              )}
            </div>

            <button
              type="button"
              onClick={() => setSettingsOpen(false)}
              className="w-full rounded-xl bg-[#1C231F] py-2.5 text-sm font-semibold text-white hover:bg-[#2F3A34] cursor-pointer"
            >
              Ayarları Kaydet
            </button>

            <div className="border-t border-[#E6E2D9] pt-4 space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#1C231F]">
                <ShieldCheck className="w-4 h-4 text-[#16A34A]" />
                KVKK & Yerel Veri Kontrolü (Cihaz İçi)
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={handleExportJson}
                  className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DDD7CB] bg-white py-2 text-xs font-semibold text-[#1C231F] hover:border-[#C84B31] cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  JSON Yedek İndir
                </button>
                <label className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-[#DDD7CB] bg-white py-2 text-xs font-semibold text-[#1C231F] hover:border-[#C84B31] cursor-pointer">
                  <Upload className="w-3.5 h-3.5" />
                  JSON Yükle
                  <input type="file" accept="application/json" onChange={handleImportJson} className="hidden" />
                </label>
              </div>
              {!confirmReset ? (
                <button
                  type="button"
                  onClick={() => setConfirmReset(true)}
                  className="w-full rounded-xl border border-[#FECACA] bg-[#FEF2F2] py-2 text-xs font-semibold text-[#B91C1C] hover:bg-[#FEE2E2] cursor-pointer"
                >
                  Tüm Yerel Verileri Kalıcı Olarak Sil
                </button>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleDeleteAllData}
                    className="flex-1 rounded-xl bg-[#DC2626] py-2 text-xs font-bold text-white hover:bg-[#B91C1C] cursor-pointer"
                  >
                    Evet, Kalıcı Sil
                  </button>
                  <button
                    type="button"
                    onClick={() => setConfirmReset(false)}
                    className="rounded-xl border border-[#DDD7CB] bg-white px-3 py-2 text-xs font-semibold text-[#1C231F] cursor-pointer"
                  >
                    Vazgeç
                  </button>
                </div>
              )}
              {backupNotice && (
                <p className="rounded-xl bg-[#ECFDF5] border border-[#A7F3D0] px-3 py-2 text-[11px] font-medium text-[#047857]">
                  {backupNotice}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <GuideWidget />
    </div>
  );
}
