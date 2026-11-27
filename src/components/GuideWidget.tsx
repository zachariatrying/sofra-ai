import { useEffect, useState } from 'react';
import { BookOpen, Camera, PieChart, Utensils, UtensilsCrossed, X } from 'lucide-react';

const GUIDE_STEPS = [
  {
    icon: UtensilsCrossed,
    badge: '01 · DOĞAL TÜRKÇE GİRİŞ',
    title: 'Yediğini Günlük Dille Yaz',
    desc: '"1 kase mercimek çorbası, 4 köfte, 1 bardak ayran" gibi günlük ifadelerle öğününü gir; porsiyon ve makrolar otomatik hesaplansın.',
  },
  {
    icon: Utensils,
    badge: '02 · YÖRESEL MUTFAK KATALOĞU',
    title: 'Ev Yemekleri & Kahvaltılıklardan Seç',
    desc: 'Türk mutfağına özel hazırlanmış tencere yemekleri, zeytinyağlılar, börek ve tatlı porsiyonlarını tek tıkla tabağına ekle.',
  },
  {
    icon: PieChart,
    badge: '03 · MAKRO HALKALARI & HEDEFLER',
    title: 'Kalori, Protein, Karbonhidrat & Yağ',
    desc: 'Günlük hedeflerini belirle; öğün ekledikçe canlı makro halkalarından dengeni ve kalan ihtiyacını takip et.',
  },
  {
    icon: Camera,
    badge: '04 · OPSİYONEL FOTOĞRAF ANALİZİ',
    title: 'Tabak Fotoğrafından Yapay Zekâ Tahmini',
    desc: 'İstersen ayarlar bölümüne kendi Gemini API anahtarını ekleyerek tabak fotoğrafından içerik tahmini alabilirsin (anahtar cihazında kalır).',
  },
];

export function GuideWidget() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false;
    const params = new URLSearchParams(window.location.search);
    return params.get('rehber') === '1' || window.location.hash === '#rehber';
  });

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="SofraAI kullanım rehberini aç"
        className="fixed bottom-5 right-5 z-40 inline-flex items-center gap-2 rounded-full bg-[#B83B24] hover:bg-[#992F1C] text-[#FFFDF8] px-4 py-2.5 text-xs font-bold shadow-md cursor-pointer transition-colors focus-visible:ring-2 focus-visible:ring-[#B83B24] focus-visible:ring-offset-2"
      >
        <BookOpen className="w-4 h-4" />
        <span>Rehber</span>
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50 bg-black/45 flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="app-guide-title"
        >
          <div
            className="w-full max-w-lg max-h-[88vh] overflow-y-auto rounded-2xl border border-[#E4DDD0] bg-[#FFFDF8] text-[#231F1D] shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#E4DDD0] bg-[#FBF7F0] px-5 py-4 rounded-t-2xl">
              <div>
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#B83B24]">
                  SofraAI Mutfak Defteri Rehberi
                </div>
                <h2 id="app-guide-title" className="font-display-sofra text-xl font-bold">
                  Öğün &amp; Makro Takibi Nasıl Çalışır?
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Rehberi kapat"
                className="rounded-lg p-1.5 border border-[#E4DDD0] bg-white hover:bg-[#FBF7F0] cursor-pointer focus-visible:ring-2 focus-visible:ring-[#B83B24]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-3">
              {GUIDE_STEPS.map((step) => {
                const Icon = step.icon;
                return (
                  <div
                    key={step.badge}
                    className="rounded-xl border border-[#E4DDD0] bg-white p-3.5 flex items-start gap-3"
                  >
                    <div className="shrink-0 rounded-lg bg-[#FDF1EE] text-[#B83B24] p-2">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="space-y-1">
                      <div className="text-[10px] font-bold tracking-wider text-[#B83B24]">
                        {step.badge}
                      </div>
                      <h3 className="text-sm font-bold">{step.title}</h3>
                      <p className="text-xs text-[#5D5752] leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                );
              })}

              <div className="rounded-xl border border-[#E4DDD0] bg-[#FBF7F0] px-3.5 py-2.5 text-[11px] text-[#5D5752]">
                Besin değerleri bilgilendirme amaçlıdır ve günlük kayıtlarınız yalnızca cihazınızda saklanır.
              </div>
            </div>

            <div className="border-t border-[#E4DDD0] px-5 py-3 flex justify-end bg-[#FBF7F0] rounded-b-2xl">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-xl bg-[#B83B24] hover:bg-[#992F1C] text-[#FFFDF8] px-4 py-2 text-xs font-bold cursor-pointer focus-visible:ring-2 focus-visible:ring-[#231F1D]"
              >
                Anladım
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
