/**
 * ============================================================================
 *  macOS PowerPoint — Sunum Veri Modeli & İçerik Kaynağı
 * ============================================================================
 *
 *  Kendi sunumunu 30 saniyede nasıl eklersin?
 *  --------------------------------------------------------------------------
 *  1) PNG / WebP Slayt Görselleri (PowerPoint -> PNG olarak dışa aktar):
 *     - Dosyaları `public/presentations/<slug>/01.png`, `02.png` ... şeklinde koy.
 *     - Aşağıdaki `PRESENTATIONS` dizisine şu şablonla ekle:
 *       {
 *         id: 'yeni-sunum',
 *         slug: 'yeni-sunum',
 *         title: { tr: 'Sunum Başlığı', en: 'Deck Title' },
 *         subtitle: { tr: 'Kısa açıklama', en: 'Short subtitle' },
 *         category: 'campaign', // 'campaign' | 'brand' | 'audio' | 'creative'
 *         date: '2026',
 *         accentColor: '#D24726',
 *         sourceType: 'images',
 *         slides: [
 *           { imageUrl: '/presentations/yeni-sunum/01.png', title: 'Kapak', notes: 'Giriş notu...' },
 *           { imageUrl: '/presentations/yeni-sunum/02.png', title: 'Strateji' },
 *         ],
 *       }
 *
 *  2) Yerel PDF veya Canva / Google Slides Embed:
 *     - PDF'i `public/presentations/sunum.pdf` içine koy veya embed URL'sini al.
 *     - `sourceType: 'pdf'` (veya `'embed'`) ve `embedUrl: '/presentations/sunum.pdf'` yaz.
 *
 *  3) Doğrudan JSON Slaytları (`sourceType: 'slides'`):
 *     - Görsel dosya hazırlamadan `layout: 'cover' | 'split' | 'bullets' | 'quote' | 'showcase'`
 *       düzenleriyle 16:9 slaytlar üret (aşağıdaki 3 örnek sunum gibi).
 * ============================================================================
 */

export type PresentationCategory = 'campaign' | 'brand' | 'audio' | 'creative';

export type LocalizedText = string | { tr: string; en: string };

export interface JsonSlideItem {
  layout: 'cover' | 'split' | 'bullets' | 'quote' | 'showcase';
  title: LocalizedText;
  subtitle?: LocalizedText;
  bullets?: LocalizedText[];
  metric?: string;
  metricLabel?: LocalizedText;
  imageUrl?: string;
  notes?: LocalizedText;
  bgGradient?: string;
}

export interface ImageSlideItem {
  imageUrl: string;
  title?: LocalizedText;
  notes?: LocalizedText;
}

interface PresentationBase {
  id: string;
  slug: string;
  title: LocalizedText;
  subtitle: LocalizedText;
  category: PresentationCategory;
  date: string;
  aspectRatio?: string;
  coverImage?: string;
  coverGradient?: string;
  accentColor: string;
  downloadUrl?: string;
  pinned?: boolean;
}

export type PresentationDeck =
  | (PresentationBase & {
      sourceType: 'slides';
      slides: JsonSlideItem[];
    })
  | (PresentationBase & {
      sourceType: 'images';
      slides: ImageSlideItem[];
    })
  | (PresentationBase & {
      sourceType: 'pdf' | 'embed';
      embedUrl: string;
      slideCountLabel?: LocalizedText;
    });

export function getLocalizedText(
  value: LocalizedText | undefined,
  language: 'tr' | 'en'
): string {
  if (!value) return '';
  if (typeof value === 'string') return value;
  return value[language] || value.tr || value.en;
}

export const PRESENTATIONS: PresentationDeck[] = [
  {
    id: 'marka-kampanya-stratejisi',
    slug: 'marka-kampanya-stratejisi',
    title: {
      tr: 'Marka & Kampanya Stratejisi',
      en: 'Brand & Campaign Strategy',
    },
    subtitle: {
      tr: 'Çok kanallı lansman mimarisi, işitsel kimlik ve ölçülebilir büyüme planı',
      en: 'Multi-channel launch architecture, sonic identity & measurable growth plan',
    },
    category: 'campaign',
    date: '2026',
    aspectRatio: '16/9',
    coverGradient: 'linear-gradient(135deg, #2A120D 0%, #8C2D19 48%, #D24726 100%)',
    accentColor: '#D24726',
    pinned: true,
    sourceType: 'slides',
    slides: [
      {
        layout: 'cover',
        title: {
          tr: 'Marka & Kampanya Stratejisi',
          en: 'Brand & Campaign Strategy',
        },
        subtitle: {
          tr: 'Fikirden deneyime: ses, hareket ve dijital sahneyi tek anlatıda birleştiren lansman çerçevesi',
          en: 'Ideas into experiences: a unified launch framework across sound, motion, and digital stages',
        },
        metric: 'Q4 — 2026',
        metricLabel: {
          tr: 'Yaratıcı Yönetim Sunumu',
          en: 'Creative Direction Deck',
        },
        notes: {
          tr: 'Açılışta kampanyanın tek bir görsel dil yerine görsel + işitsel bir ekosistem olarak kurgulandığını vurgula.',
          en: 'Emphasize in the opening that the campaign is designed as a cohesive audiovisual ecosystem rather than isolated assets.',
        },
        bgGradient: 'linear-gradient(135deg, #1A0B08 0%, #7C2614 55%, #D24726 100%)',
      },
      {
        layout: 'split',
        title: {
          tr: 'Stratejik Konumlandırma & Gerilim',
          en: 'Strategic Positioning & Core Tension',
        },
        subtitle: {
          tr: 'Kalabalık dijital akışlarda yalnızca görünen değil, ilk 1.5 saniyede tanınan bir marka refleksi inşa etmek.',
          en: 'Building brand recall within the first 1.5 seconds across saturated social feeds through distinct audiovisual cues.',
        },
        metric: '1.5 sn',
        metricLabel: {
          tr: 'İşitsel & Görsel Tanınma Eşiği',
          en: 'Audiovisual Recognition Threshold',
        },
        bullets: [
          {
            tr: 'Sosyal video kancalarında imza synth dokusu ve ritmik geçiş',
            en: 'Signature synth texture and rhythmic transition on social video hooks',
          },
          {
            tr: 'Web deneyimi ile kampanya filmleri arasında ortak renk ve tipografi',
            en: 'Shared typography and color system linking campaign films to web touchpoints',
          },
        ],
        notes: {
          tr: 'Kullanıcı araştırmalarında görsel kimliğe eşlik eden tutarlı ses logosunun hatırlanabilirliği belirgin şekilde artırdığını paylaş.',
          en: 'Highlight that pairing visual identity with a consistent sonic signature significantly lifts brand recall.',
        },
      },
      {
        layout: 'bullets',
        title: {
          tr: '3 Fazlı Lansman Yol Haritası',
          en: '3-Phase Launch Roadmap',
        },
        subtitle: {
          tr: 'Merak uyandırma, ana lansman ve topluluk etkileşimi',
          en: 'Teaser buildup, flagship reveal, and community activation',
        },
        bullets: [
          {
            tr: 'Faz 01 — Teaser (Hafta 1-2): 9:16 kısa dikey teaserlar ve ses parçacıklarıyla merak inşası',
            en: 'Phase 01 — Teaser (Weeks 1-2): 9:16 vertical cuts and sonic fragments to build anticipation',
          },
          {
            tr: 'Faz 02 — Ana Film & İnteraktif Alan (Hafta 3-4): 16:9 marka filmi ve web deneyimi eşzamanlı yayını',
            en: 'Phase 02 — Flagship Film & Web Space (Weeks 3-4): Simultaneous release of hero film and interactive web stage',
          },
          {
            tr: 'Faz 03 — Stems & Topluluk (Hafta 5+): İçerik üretici paketleri, remix akışı ve canlı performans klipleri',
            en: 'Phase 03 — Stems & Community (Week 5+): Creator packs, remix loops, and live session highlights',
          },
        ],
        notes: {
          tr: 'Her fazın kendi KPI seti olduğunu; faz 2’de etkileşim süresinin odak metrik seçildiğini belirt.',
          en: 'Point out each phase tracks distinct KPIs, with dwell time as the primary focus in Phase 2.',
        },
      },
      {
        layout: 'showcase',
        title: {
          tr: 'Kampanya Performans Hedefleri',
          en: 'Campaign Performance Targets',
        },
        subtitle: {
          tr: 'Organik erişim, elde tutma ve marka etkileşim dengesi',
          en: 'Balancing organic reach, retention, and brand engagement',
        },
        metric: '3.4x',
        metricLabel: {
          tr: 'Ortalama İzlenme Tamamlama Artışı',
          en: 'Lift in Video Completion Rate',
        },
        bullets: [
          {
            tr: 'İlk 3 saniye tutma oranı hedefi: %68+',
            en: '3-second hook retention target: 68%+',
          },
          {
            tr: 'İnteraktif mikro-site ortalama oturum: 2 dk 40 sn',
            en: 'Interactive microsite avg. session: 2m 40s',
          },
          {
            tr: 'Kampanya ses paketi organik kullanım: 1.2K+ içerik',
            en: 'Organic audio pack adoption: 1.2K+ creator clips',
          },
        ],
        notes: {
          tr: 'Rakamların tarihsel kreatif prodüksiyon benchmarklarına dayandığını netleştir.',
          en: 'Clarify these benchmarks derive from prior creative production rollouts.',
        },
        bgGradient: 'linear-gradient(135deg, #141418 0%, #3D1A12 55%, #B83A1E 100%)',
      },
      {
        layout: 'quote',
        title: {
          tr: 'En güçlü kampanya, kullanıcıya bir mesajı dayatan değil; içine girip dokunabileceği bir dünya kurandır.',
          en: 'The strongest campaign does not shout a message; it builds a tactile world people want to step inside.',
        },
        subtitle: {
          tr: 'Hüseyin Korumtaş — Yaratıcı Yapımcı',
          en: 'Hüseyin Korumtaş — Creative Producer',
        },
        notes: {
          tr: 'Kapanış öncesi kısa bir nefes ve soru-cevap geçişi için güçlü manifesto cümlesi.',
          en: 'Use this manifesto slide as a crisp pause before Q&A.',
        },
        bgGradient: 'linear-gradient(135deg, #1C0D09 0%, #5B1E11 50%, #9E2A12 100%)',
      },
      {
        layout: 'split',
        title: {
          tr: 'Sonraki Adım & Prodüksiyon Takvimi',
          en: 'Next Steps & Production Timeline',
        },
        subtitle: {
          tr: 'Onay sonrası 14 günlük hızlı ön-prodüksiyon ve ses tasarım sprinti.',
          en: '14-day rapid pre-production and sonic prototyping sprint upon sign-off.',
        },
        metric: '14 Gün',
        metricLabel: {
          tr: 'Prototipten Yayına',
          en: 'Prototype to Launch',
        },
        bullets: [
          {
            tr: 'Gün 1-4: Moodboard, ses paleti ve 3 saniyelik kanca demoları',
            en: 'Days 1-4: Moodboard, sonic palette, and 3-second hook demos',
          },
          {
            tr: 'Gün 5-10: Çekim, 3D/hareket tasarımı ve Web Audio miksajı',
            en: 'Days 5-10: Shoot, motion design, and Web Audio mastering',
          },
          {
            tr: 'Gün 11-14: QA, çoklu format dışa aktarım ve yayın',
            en: 'Days 11-14: QA, multi-aspect exports, and go-live',
          },
        ],
        notes: {
          tr: 'İletişim için doğrudan Messages uygulamasından e-posta düşürülebileceğini hatırlat.',
          en: 'Remind viewers they can reach out directly via the Messages app.',
        },
      },
    ],
  },
  {
    id: 'kreatif-produksiyon-ses-vaka',
    slug: 'kreatif-produksiyon-ses-vaka',
    title: {
      tr: 'Kreatif Prodüksiyon & Ses Vaka Çalışması',
      en: 'Creative Production & Sound Case Study',
    },
    subtitle: {
      tr: '126 BPM Tech House prodüksiyonu, akustik tasarım ve gerçek zamanlı Web Audio mühendisliği',
      en: '126 BPM Tech House production, acoustic direction, and real-time Web Audio engineering',
    },
    category: 'audio',
    date: '2026',
    aspectRatio: '16/9',
    coverGradient: 'linear-gradient(135deg, #110B22 0%, #4C1D95 52%, #7C3AED 100%)',
    accentColor: '#8B5CF6',
    pinned: true,
    sourceType: 'slides',
    slides: [
      {
        layout: 'cover',
        title: {
          tr: 'Kreatif Prodüksiyon & Ses Vaka Çalışması',
          en: 'Creative Production & Sound Case Study',
        },
        subtitle: {
          tr: 'Analog kulüp enerjisini tarayıcı tabanlı 60 FPS FFT spektrum analizörüne dönüştüren ses mimarisi',
          en: 'Translating analog club energy into a 60 FPS browser-native FFT spectrum architecture',
        },
        metric: '126 BPM',
        metricLabel: {
          tr: 'Referans Prodüksiyon Temposu',
          en: 'Reference Production Tempo',
        },
        notes: {
          tr: 'Bu sunum Studio (DAW) ve Tone Generator projelerinin arkasındaki ses tasarım yaklaşımını özetler.',
          en: 'This deck summarizes the audio engineering behind Studio (DAW) and Tone Generator.',
        },
        bgGradient: 'linear-gradient(135deg, #0D081D 0%, #3B1675 55%, #7C3AED 100%)',
      },
      {
        layout: 'split',
        title: {
          tr: 'Analog Sıcaklık & Sinyal Zinciri',
          en: 'Analog Warmth & Signal Chain',
        },
        subtitle: {
          tr: 'TB-303 bas hatları, paralel teyp doygunluğu ve mikro zamanlamalı perküsyon katmanları.',
          en: 'TB-303 basslines, parallel tape saturation, and micro-timed percussion layering.',
        },
        metric: '-8.5 LUFS',
        metricLabel: {
          tr: 'Kulüp Mastering Hedefi',
          en: 'Club Mastering Target',
        },
        bullets: [
          {
            tr: 'Sub-bass temizliği: 42 Hz temel frekans ve sidechain nefes alanı',
            en: 'Sub-bass clarity: 42 Hz fundamental with tight sidechain breathing room',
          },
          {
            tr: 'Üst harmonik parlaklık: stereo koro ve soft-clip teyp satürasyonu',
            en: 'Upper harmonic sheen: stereo chorus paired with soft-clip tape saturation',
          },
        ],
        notes: {
          tr: 'Dinleyicilere Studio uygulamasında Teyp Sıcaklığı (Tape Warmth) anahtarını deneyebileceklerini söyle.',
          en: 'Invite viewers to toggle Tape Warmth live inside the Studio app.',
        },
      },
      {
        layout: 'bullets',
        title: {
          tr: 'Web Audio API & 60 FPS Görselleştirme',
          en: 'Web Audio API & 60 FPS Visualization',
        },
        subtitle: {
          tr: 'React state re-render tetiklemeden sıfır gecikmeli görsel geri bildirim',
          en: 'Zero-jank visual feedback without triggering React state re-renders',
        },
        bullets: [
          {
            tr: 'Paylaşımlı AudioContext üzerinde tek AnalyserNode FFT düğümü',
            en: 'Single shared AnalyserNode FFT tap on the Web Audio graph',
          },
          {
            tr: 'requestAnimationFrame içinde doğrudan DOM ref ve Canvas mutasyonu',
            en: 'Direct DOM ref & Canvas mutation inside requestAnimationFrame',
          },
          {
            tr: 'Dinamik MacBook Çentiği (Notch), Menubar ve Wallpaper aurası senkronu',
            en: 'Synchronized with Dynamic Notch, Menubar equalizer, and Wallpaper aura',
          },
        ],
        notes: {
          tr: 'Performans açısından en kritik nokta: her karede React state yerine ref güncellemesi yapılması.',
          en: 'Key engineering takeaway: mutating DOM refs per frame avoids React reconciliation overhead.',
        },
      },
      {
        layout: 'showcase',
        title: {
          tr: 'Prosedürel Arayüz Ses Tasarımı',
          en: 'Procedural UI Sound Design',
        },
        subtitle: {
          tr: 'Hiçbir harici MP3 yüklemeden matematiksel osilatörlerle üretilen macOS dokunsal sesleri',
          en: 'Tactile macOS feedback synthesized purely via oscillators with zero external MP3 assets',
        },
        metric: '0 KB',
        metricLabel: {
          tr: 'Harici SFX Dosya Yükü',
          en: 'External SFX Payload',
        },
        bullets: [
          {
            tr: 'Pencere açılış/kapanış, Spotlight parıltısı ve Dock zıplaması için özel zarflar',
            en: 'Custom ADSR envelopes for window open/close, Spotlight shimmer, and Dock bounce',
          },
          {
            tr: 'Polifonik MPC Beat Pad: aynı anda birden fazla davul katmanı tetikleme',
            en: 'Polyphonic MPC Beat Pad: simultaneous multi-pad drum synthesis',
          },
        ],
        notes: {
          tr: 'Tone Generator ve Beat Pad üzerinden gerçek zamanlı sentezleme örneği ver.',
          en: 'Reference Tone Generator and Beat Pad for live synthesis.',
        },
        bgGradient: 'linear-gradient(135deg, #0E101F 0%, #261C54 55%, #6D28D9 100%)',
      },
      {
        layout: 'quote',
        title: {
          tr: 'Ses tasarımı sadece arka planda çalan bir süs değil; arayüzün ağırlığını ve hızını hissettiren görünmez fiziktir.',
          en: 'Sound design is not background decoration; it is the invisible physics that gives an interface weight and speed.',
        },
        subtitle: {
          tr: 'Ses Yönetimi İlkeleri — Hüseyin Studio',
          en: 'Audio Direction Principles — Hüseyin Studio',
        },
        notes: {
          tr: 'Sessiz mod kullanıcıları ve prefers-reduced-motion tercihlerinin tamamen saygı gördüğünü ekle.',
          en: 'Note that Sound Off mode and prefers-reduced-motion are respected globally.',
        },
        bgGradient: 'linear-gradient(135deg, #120B24 0%, #37186B 50%, #5B21B6 100%)',
      },
    ],
  },
  {
    id: 'interaktif-web-os-tasarim',
    slug: 'interaktif-web-os-tasarim',
    title: {
      tr: 'İnteraktif Web OS Tasarım Süreci',
      en: 'Interactive Web OS Design Process',
    },
    subtitle: {
      tr: 'Liquid Glass estetiği, pencere fiziği ve çok katmanlı macOS portfolyo mimarisi',
      en: 'Liquid Glass aesthetics, window physics, and multi-layered macOS portfolio architecture',
    },
    category: 'creative',
    date: '2026',
    aspectRatio: '16/9',
    coverGradient: 'linear-gradient(135deg, #071926 0%, #0369A1 52%, #38BDF8 100%)',
    accentColor: '#0EA5E9',
    pinned: false,
    sourceType: 'slides',
    slides: [
      {
        layout: 'cover',
        title: {
          tr: 'İnteraktif Web OS Tasarım Süreci',
          en: 'Interactive Web OS Design Process',
        },
        subtitle: {
          tr: 'Klasik kaydırmalı portfolyolar yerine keşfedilebilir bir masaüstü işletim sistemi kurgulamak',
          en: 'Replacing static scroll-down portfolios with an explorable desktop operating system',
        },
        metric: '60 FPS',
        metricLabel: {
          tr: 'Framer Motion & GPU Katmanı',
          en: 'Framer Motion & GPU Layer',
        },
        notes: {
          tr: 'Projenin amacının ziyaretçiye pasif okuma yerine aktif bir oyun alanı sunmak olduğunu anlat.',
          en: 'Explain the goal: giving visitors an interactive playground instead of a passive scroll page.',
        },
        bgGradient: 'linear-gradient(135deg, #06131F 0%, #075985 55%, #0EA5E9 100%)',
      },
      {
        layout: 'bullets',
        title: {
          tr: 'Mimari Omurga & Sistem Katmanları',
          en: 'Architectural Spine & System Layers',
        },
        subtitle: {
          tr: 'Modüler Zustand store yapısı ve katı z-index hiyerarşisi',
          en: 'Modular Zustand store isolation and strict z-index hierarchy',
        },
        bullets: [
          {
            tr: 'Window Manager: 8 yönlü yeniden boyutlandırma, Sequoia kenar yaslama ve Stage Manager',
            en: 'Window Manager: 8-way resize, Sequoia edge snapping, and Stage Manager',
          },
          {
            tr: 'Dinamik Çentik (Live Notch) & Spotlight (⌘K) ile klavye-öncelikli navigasyon',
            en: 'Live Notch & Spotlight (⌘K) for keyboard-first OS navigation',
          },
          {
            tr: 'Open-Meteo canlı hava durumu + gün saatine tepki veren atmosfer motoru',
            en: 'Open-Meteo live weather paired with solar-phase atmosphere lighting',
          },
        ],
        notes: {
          tr: 'Her sistem katmanının birbirini ezmemesi için merkezi Z_INDEX sabiti kullanıldığını belirt.',
          en: 'Highlight the centralized Z_INDEX map preventing modal collision.',
        },
      },
      {
        layout: 'split',
        title: {
          tr: 'Liquid Glass & Apple HIG Detayları',
          en: 'Liquid Glass & Apple HIG Craft',
        },
        subtitle: {
          tr: 'Işık kırılması, ince speküler kenarlıklar ve açık/koyu tema uyumu.',
          en: 'Refraction blur, hairline specular borders, and seamless Light/Dark adaptation.',
        },
        metric: 'TR / EN',
        metricLabel: {
          tr: 'Çift Dilli Anlık Çeviri',
          en: 'Instant Bilingual UI',
        },
        bullets: [
          {
            tr: 'Dock büyütme fiziği: mouseX MotionValue ile Framer Motion yay tepkisi',
            en: 'Dock magnification physics driven by mouseX MotionValue springs',
          },
          {
            tr: 'Mobil ekranlarda iOS benzeri tam ekran sheet ve dokunmatik kart dizilimi',
            en: 'Responsive iOS-like sheets and touch-friendly card stacks on mobile',
          },
        ],
        notes: {
          tr: 'Masaüstü ve mobil deneyimlerin aynı kod tabanında nasıl ayrıştırıldığına değin.',
          en: 'Note how desktop and mobile experiences adapt cleanly within one codebase.',
        },
      },
      {
        layout: 'showcase',
        title: {
          tr: 'Teknoloji Yığını & Performans Disiplini',
          en: 'Tech Stack & Performance Discipline',
        },
        subtitle: {
          tr: 'Ağır uygulamalar için on-demand lazy loading ve minimum ilk yükleme maliyeti',
          en: 'On-demand dynamic imports for heavy apps and lean initial bundle delivery',
        },
        metric: 'Next 14',
        metricLabel: {
          tr: 'App Router + TypeScript',
          en: 'App Router + TypeScript',
        },
        bullets: [
          {
            tr: 'Next.js dynamic({ ssr: false }) ile Studio, Terminal, Safari ve PowerPoint yükleme',
            en: 'Lazy loading Studio, Terminal, Safari, and PowerPoint via dynamic({ ssr: false })',
          },
          {
            tr: 'URL Deep-Linking (?app=powerpoint&deck=...) ile doğrudan slayt paylaşımı',
            en: 'Direct deck sharing via URL Deep-Linking (?app=powerpoint&deck=...)',
          },
        ],
        notes: {
          tr: 'Linki Kopyala butonunun tam olarak bu deep-link mekanizmasını kullandığını göster.',
          en: 'Point out the Copy Link toolbar button leverages this exact deep-link system.',
        },
        bgGradient: 'linear-gradient(135deg, #091522 0%, #0C4A6E 55%, #0284C7 100%)',
      },
      {
        layout: 'quote',
        title: {
          tr: 'İyi mühendislik görünmez kalır; kullanıcının aklında yalnızca dokunduğu arayüzün akıcılığı kalır.',
          en: 'Great engineering stays invisible; what lingers is simply the effortless fluidity of the interface.',
        },
        subtitle: {
          tr: 'Tasarım & Mühendislik Notu',
          en: 'Design & Engineering Note',
        },
        notes: {
          tr: 'Sunumu tamamlarken kullanıcının bu PowerPoint uygulamasına kendi PNG/PDF sunumlarını da ekleyebileceğini hatırlat.',
          en: 'Conclude by noting this PowerPoint app also accepts custom PNG/PDF/Embed decks.',
        },
        bgGradient: 'linear-gradient(135deg, #071926 0%, #164E63 50%, #0369A1 100%)',
      },
    ],
  },
];
