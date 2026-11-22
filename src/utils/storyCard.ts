import type { DailyTargets } from '../types';

export interface ConsumedTotals {
  kcal: number;
  protein: number;
  carbs: number;
  fat: number;
}

/**
 * Generates an editorial 1080x1350 PNG daily nutrition card for SofraAI.
 */
export function downloadSofraCardPng(
  consumed: ConsumedTotals,
  targets: DailyTargets,
  waterCount: number,
  mealCount: number
): void {
  const w = 1080;
  const h = 1350;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  // Stone-white editorial background
  ctx.fillStyle = '#F7F5F0';
  ctx.fillRect(0, 0, w, h);

  // Subtle top accent band
  ctx.fillStyle = '#C84B31';
  ctx.fillRect(0, 0, w, 18);

  // Outer editorial frame
  ctx.strokeStyle = '#DDD7CB';
  ctx.lineWidth = 3;
  ctx.strokeRect(48, 56, w - 96, h - 112);

  // Brand header
  ctx.fillStyle = '#C84B31';
  ctx.font = '700 28px Inter, system-ui, sans-serif';
  ctx.fillText('SOFRAAI · GÜNLÜK MAKRO KARTI', 96, 130);

  const todayStr = new Date().toLocaleDateString('tr-TR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  ctx.fillStyle = '#5D6660';
  ctx.font = '600 24px Inter, system-ui, sans-serif';
  ctx.fillText(todayStr, 96, 172);

  // Calorie Hero Card
  ctx.fillStyle = '#FFFFFF';
  ctx.beginPath();
  ctx.roundRect(96, 224, w - 192, 340, 32);
  ctx.fill();
  ctx.strokeStyle = '#E6E2D9';
  ctx.lineWidth = 2;
  ctx.stroke();

  const pct = Math.min(100, Math.round((consumed.kcal / Math.max(1, targets.kcal)) * 100));
  ctx.fillStyle = '#1C231F';
  ctx.font = '800 104px Inter, system-ui, sans-serif';
  ctx.fillText(`${consumed.kcal}`, 144, 365);

  ctx.fillStyle = '#5D6660';
  ctx.font = '600 32px Inter, system-ui, sans-serif';
  ctx.fillText(`/ ${targets.kcal} kcal (%${pct})`, 144, 420);

  // Progress bar
  ctx.fillStyle = '#EFECE5';
  ctx.beginPath();
  ctx.roundRect(144, 468, w - 288, 28, 14);
  ctx.fill();

  ctx.fillStyle = consumed.kcal > targets.kcal ? '#DC2626' : '#C84B31';
  const fillWidth = Math.max(24, Math.min(w - 288, ((w - 288) * pct) / 100));
  ctx.beginPath();
  ctx.roundRect(144, 468, fillWidth, 28, 14);
  ctx.fill();

  // Three Macro Cards
  const macros = [
    { label: 'PROTEİN', val: `${consumed.protein}g`, target: `${targets.protein}g`, color: '#2563EB' },
    { label: 'KARBONHİDRAT', val: `${consumed.carbs}g`, target: `${targets.carbs}g`, color: '#D97706' },
    { label: 'YAĞ', val: `${consumed.fat}g`, target: `${targets.fat}g`, color: '#C84B31' },
  ];
  const cardW = (w - 192 - 48) / 3;
  macros.forEach((m, idx) => {
    const x = 96 + idx * (cardW + 24);
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(x, 608, cardW, 250, 28);
    ctx.fill();
    ctx.strokeStyle = '#E6E2D9';
    ctx.stroke();

    ctx.fillStyle = m.color;
    ctx.font = '700 22px Inter, system-ui, sans-serif';
    ctx.fillText(m.label, x + 28, 666);

    ctx.fillStyle = '#1C231F';
    ctx.font = '800 60px Inter, system-ui, sans-serif';
    ctx.fillText(m.val, x + 28, 752);

    ctx.fillStyle = '#5D6660';
    ctx.font = '500 24px Inter, system-ui, sans-serif';
    ctx.fillText(`Hedef: ${m.target}`, x + 28, 808);
  });

  // Habits summary box
  ctx.fillStyle = '#1C231F';
  ctx.beginPath();
  ctx.roundRect(96, 902, w - 192, 220, 32);
  ctx.fill();

  ctx.fillStyle = '#E6E2D9';
  ctx.font = '600 26px Inter, system-ui, sans-serif';
  ctx.fillText('GÜNLÜK DENGE ÖZETİ', 144, 968);

  ctx.fillStyle = '#FFFFFF';
  ctx.font = '700 44px Inter, system-ui, sans-serif';
  ctx.fillText(`${mealCount} Öğün · ${waterCount}/${targets.waterGlasses} Bardak Su`, 144, 1044);

  // Footer
  ctx.fillStyle = '#5D6660';
  ctx.font = '600 24px Inter, system-ui, sans-serif';
  ctx.fillText('Türk Mutfağı & Ev/Lokanta Kalibrasyonu · SofraAI', 96, 1236);

  const link = document.createElement('a');
  link.download = `sofraai-gunun-karti-${new Date().toISOString().slice(0, 10)}.png`;
  link.href = canvas.toDataURL('image/png');
  link.click();
}
