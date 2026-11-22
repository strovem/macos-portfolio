import { ExperienceItem } from '@/types/os';

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: 'exp-creative-producer',
    role: 'Lead Creative Producer & Audio Director',
    company: 'Hüseyin Korumtaş Studio / Bağımsız Yapım',
    period: '2023 — Günümüz',
    location: 'İstanbul, TR / Hibrit',
    description:
      'Marka lansmanları, ticari reklam jingle\'ları, kulüp müzik parçaları ve çok duyulu interaktif deneyimlerin uçtan uca kreatif yapımcılığı ve ses direktörlüğü.',
    achievements: [
      'Casper Excalibur oyuncu ve performans serisi için dinamik sinematik jingle ve resmi ses kimliği (sound branding) bestelendi.',
      'Tech House ("I AM A LOVER") ve Hoodtrap ("Bangır Bangır") gibi yüksek enerjili club parçalarının aranjman, miksaj ve analog mastering süreçleri yönetildi.',
      'Kreatif vizyon ile dijital teknolojiyi birleştiren macOS interaktif portfolyo işletim sistemi mimarisi hayata geçirildi.',
    ],
    technologies: ['Ableton Live 12', 'Logic Pro 11', 'Analog Synths', 'Sound Branding', 'Creative Direction'],
    type: 'work',
  },
  {
    id: 'exp-sound-producer',
    role: 'Senior Music Producer & Sound Designer',
    company: 'Sonic Lab Productions',
    period: '2021 — 2023',
    location: 'İstanbul, TR',
    description:
      'Ticari markalar, reklam filmleri ve bağımsız sanatçılar için özgün müzik besteleri, ses tasarımı, analog donanım miksajı ve vokal editörlüğü.',
    achievements: [
      'Orta Doğu ve Anadolu geleneksel yaylı/üflemeli tınılarının modern 2-step UK Garage ritimleriyle buluştuğu melez "Ethnic Garage" projesi üretildi.',
      'Çeşitli marka tanıtım filmlerinde sinematik ses miksajı, foley kayıtları ve spatial reverb kurguları tamamlandı.',
      'FabFilter, SSL G-Bus ve Manley analog modellemeleriyle radyo/kulüp standartlarında loudness ve dinamik aralık mastering zinciri kuruldu.',
    ],
    technologies: ['Mixing & Mastering', 'Foley & Sound Design', 'Synthesizer Patching', 'Vocal Production'],
    type: 'work',
  },
  {
    id: 'exp-media-director',
    role: 'Creative Media Producer & Director',
    company: 'Vortex Media Collective',
    period: '2019 — 2021',
    location: 'İstanbul, TR',
    description:
      'Görsel ritim, müzik videosu prodüksiyonu, sahne kurgusu ve dijital lansman içeriklerinin konseptten yayına kadar yönetilmesi.',
    achievements: [
      'Yüksek tempolu video kurguları ve ritmik ses miksajları ile sosyal medya ve dijital platformlarda viral lansman videoları yönetildi.',
      'Görsel hikaye anlatımı ile müzikal drop/build-up anlarının milisaniyelik senkronizasyonu sağlandı.',
      'Stüdyo çekim ekipmanları, aydınlatma ve renk derecelendirme (color grading) kurgusu yönetildi.',
    ],
    technologies: ['DaVinci Resolve', 'Video Production', 'Visual Rhythm', 'Storyboarding'],
    type: 'work',
  },
  {
    id: 'edu-sound',
    role: 'Ses Mühendisliği & Müzik Teknolojileri',
    company: 'Akademi & İleri Düzey Stüdyo Eğitimi',
    period: '2018 — 2022',
    location: 'İstanbul, TR',
    description:
      'Akustik prensipler, psikoakustik, analog devre modelleme, çok kanallı kayıt teknikleri ve dijital sinyal işleme (DSP) alanında derinlemesine uzmanlaşma.',
    achievements: [
      'Analog synthesizer modülleri (Sub 37, TB-303, Juno) üzerinde ses sentezi (subtractive/FM/wavetable) uzmanlık sertifikası.',
      'Stereo görüntüleme, faz korelasyonu ve bas frekans yönetimi üzerine uygulamalı stüdyo bitirme projesi.',
    ],
    technologies: ['Acoustics', 'Audio DSP', 'Psychoacoustics', 'Analog Electronics'],
    type: 'education',
  },
  {
    id: 'award-excalibur',
    role: 'Resmi Kampanya ve Marka Sesi Başarısı',
    company: 'Casper Excalibur & Ticari Lansmanlar',
    period: '2026',
    location: 'Türkiye',
    description:
      'Casper Excalibur performans bilgisayarları reklam kampanyası için bestelenen özgün jingle ve ses logosunun ulusal medya mecralarında yayını.',
    achievements: [
      'Milyonlarca izlenmeye ulaşan reklam ve dijital kampanyalarda marka akılda kalıcılığını artıran dinamik ses kimliği.',
      'Yüksek frekans netliği ve bas vuruş gücüyle takdir toplayan profesyonel prodüksiyon.',
    ],
    technologies: ['Commercial Jingle', 'Brand Identity', 'Broadcast Loudness'],
    type: 'award',
  },
  {
    id: 'award-club-selection',
    role: 'Electronic Club Master & Dancefloor Hit',
    company: 'Club Masters & Bass Lab',
    period: '2026',
    location: 'Global',
    description:
      '"I AM A LOVER" Tech House ve "Bangır Bangır" Hoodtrap prodüksiyonlarının kulüp DJ\'leri ve dinleyiciler tarafından öne çıkarılması.',
    achievements: [
      'Dans pistinde maksimum enerji üreten groove ve sub-bass dinamizmi.',
    ],
    technologies: ['Tech House', 'Hoodtrap', 'Club Mastering'],
    type: 'award',
  },
];
