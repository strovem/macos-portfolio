import { ProjectItem } from '@/types/os';

export const PROJECTS: ProjectItem[] = [
  {
    id: 'case-1',
    title: 'Kinetic Echoes — Reklam & Sinematografik Film',
    description:
      'Görsel ritim, yüksek tempolu sinematografi ve dinamik ses miksajı ile tasarlanmış ödüllü marka lansman filmi.',
    category: 'web',
    tags: ['Creative Direction', 'Film Production', 'Sound Design', 'Color Grading'],
    role: 'Creative Producer',
    date: '2026',
    featured: true,
    color: '#007AFF',
    highlights: [
      'Konsept aşamasından post-prodüksiyona uçtan uca yapım yönetimi',
      'Özel bestelenmiş 96kHz analog synth ses miksajı',
      'Sinematik ritim ve sahne geçişi koreografisi',
    ],
  },
  {
    id: 'case-2',
    title: 'Aura Spatial — 3D & İnteraktif Mekansal Deneyim',
    description:
      'WebGL ve binaural ses mimarisi birleşimiyle ziyaretçiyi sarmalayan çok duyulu dijital enstalasyon alanı.',
    category: 'mobile',
    tags: ['Spatial Audio', 'Interactive Web', '3D Graphics', 'Creative Tech'],
    role: 'Creative Producer & Audio Lead',
    date: '2025',
    featured: true,
    color: '#8B5CF6',
    highlights: [
      'Mekansal ses ve 3D shader etkileşimlerinin senkronize kurgusu',
      'Fiziksel dokunma hissi uyandıran mikro-etkileşim tasarımı',
      'Farklı cihazlarda 60 FPS akıcı mekansal deneyim optimizasyonu',
    ],
  },
  {
    id: 'case-3',
    title: 'Monolith Archive — Marka Kimliği & Deneyimsel Kurgu',
    description:
      'Monolitik mimari formlar, taktil sergi materyalleri ve minimalist ses atmosferi ile oluşturulan bütünleşik marka deneyimi.',
    category: 'experiments',
    tags: ['Brand Identity', 'Experiential Design', 'Physical Staging', 'Ambient Sound'],
    role: 'Creative Producer',
    date: '2025',
    featured: false,
    color: '#EC4899',
    highlights: [
      'Fiziksel mekan ve dijital dokunmatik panellerin hibrit entegrasyonu',
      'Özgün ambient ses atmosferi bestesi',
      'Baskılı materyaller, tipografi ve mekansal yönlendirme sistemi',
    ],
  },
];
