import { Droplets, Plus, Minus } from 'lucide-react';
import type { DailyTargets } from '../types';

interface MacroRingsProps {
  consumed: { kcal: number; protein: number; carbs: number; fat: number };
  targets: DailyTargets;
  waterCount: number;
  onChangeWater: (delta: number) => void;
}

export function MacroRings({ consumed, targets, waterCount, onChangeWater }: MacroRingsProps) {
  const remaining = Math.max(0, targets.kcal - consumed.kcal);
  const kcalPct = Math.min(100, Math.round((consumed.kcal / Math.max(1, targets.kcal)) * 100));
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference * (1 - kcalPct / 100);

  const macroBars = [
    { label: 'Protein', val: consumed.protein, target: targets.protein, color: '#2563EB', unit: 'g' },
    { label: 'Karbonhidrat', val: consumed.carbs, target: targets.carbs, color: '#D97706', unit: 'g' },
    { label: 'Yağ', val: consumed.fat, target: targets.fat, color: '#7C3AED', unit: 'g' },
  ];

  return (
    <section
      aria-label="Günlük kalori ve makro özeti"
      className="rounded-3xl border border-[#E6E2D9] bg-white p-5 shadow-[0_10px_28px_-18px_rgba(28,35,31,0.18)]"
    >
      <div className="flex flex-col sm:flex-row items-center gap-6">
        {/* SVG Calorie Ring */}
        <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
          <svg viewBox="0 0 140 140" className="w-full h-full -rotate-90">
            <circle cx="70" cy="70" r={radius} fill="none" stroke="#EFECE5" strokeWidth="12" />
            <circle
              cx="70"
              cy="70"
              r={radius}
              fill="none"
              stroke={consumed.kcal > targets.kcal ? '#C84B31' : '#1C231F'}
              strokeWidth="12"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="transition-all duration-500"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="font-display-sofra text-2xl font-bold tabular-nums text-[#1C231F]">
              {remaining}
            </span>
            <span className="text-[11px] font-medium text-[#5D6660]">kcal kaldı</span>
          </div>
        </div>

        {/* Macro Progress Bars */}
        <div className="flex-1 w-full space-y-3">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display-sofra text-lg font-bold text-[#1C231F]">Bugünün Dengesi</h2>
            <span className="text-xs font-semibold tabular-nums text-[#5D6660]">
              {consumed.kcal} / {targets.kcal} kcal
            </span>
          </div>

          {macroBars.map((m) => {
            const pct = Math.min(100, Math.round((m.val / Math.max(1, m.target)) * 100));
            return (
              <div key={m.label}>
                <div className="flex items-center justify-between text-xs font-semibold mb-1">
                  <span className="text-[#1C231F]">{m.label}</span>
                  <span className="tabular-nums text-[#5D6660]">
                    {m.val} / {m.target}
                    {m.unit}
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EFECE5] overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: m.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Water Tracker Strip */}
      <div className="mt-5 pt-4 border-t border-[#F0ECE4] flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-[#1C231F]">
          <Droplets className="w-4 h-4 text-[#2563EB]" />
          <span>Su Takibi</span>
          <span className="rounded-full bg-[#EFF5FF] px-2.5 py-0.5 text-[#2563EB] tabular-nums">
            {waterCount} / {targets.waterGlasses} bardak
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => onChangeWater(-1)}
            aria-label="Bir bardak azalt"
            className="rounded-lg border border-[#E6E2D9] bg-[#F7F5F0] p-1.5 text-[#1C231F] hover:bg-[#ECE8DF] cursor-pointer"
          >
            <Minus className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => onChangeWater(1)}
            aria-label="Bir bardak ekle"
            className="inline-flex items-center gap-1 rounded-lg bg-[#2563EB] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1D4ED8] cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />1 Bardak
          </button>
        </div>
      </div>
    </section>
  );
}
