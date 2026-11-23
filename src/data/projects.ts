import { ProjectItem } from '@/types/os';

export const PROJECTS: ProjectItem[] = [
  {
    id: 'case-excalibur',
    title: 'Casper Excalibur — Commercial Launch & Sonic Identity',
    description:
      'Official commercial jingle, sonic mnemonic logo, and cinematic post-production mix for the Casper Excalibur performance gaming series.',
    category: 'web',
    tags: ['Brand Jingle', 'Sound Identity', 'Commercial Music', 'Cinematic Mix'],
    role: 'Creative Producer & Audio Lead',
    date: '2026',
    featured: true,
    color: '#EAB308',
    highlights: [
      'Cinematic taiko percussion and modern analog synthesizer textures symbolizing raw computing power',
      'Broadcast loudness calibration optimized for national television, YouTube, and digital platforms',
      'High-recall 3-second mnemonic signature logo designed for cross-channel brand recognition',
    ],
  },
  {
    id: 'case-tech-house',
    title: 'Tech House — "I AM A LOVER" Club Master',
    description:
      'Hypnotic 126 BPM analog TB-303 bassline, driving percussion polyrhythms, and club-ready vocal hook production.',
    category: 'experiments',
    tags: ['Tech House', 'Club Master', 'Analog 303', 'Vocal Chop'],
    role: 'Music Producer & Mixing Engineer',
    date: '2026',
    featured: true,
    color: '#06B6D4',
    highlights: [
      'Analog synthesizer polyrhythms with dynamic low-end articulation',
      'Analog summing and stereo bus compressor chain tailored for club sound systems',
      'Surgical kick/bass phase alignment meeting modern electronic dance standards',
    ],
  },
  {
    id: 'case-ethnic-garage',
    title: 'Ethnic Garage & Tribal Psy — Cultural Fusion',
    description:
      'Cultural synthesis fusing traditional Middle Eastern instruments (ney, saz) with 2-step UK Garage and 138 BPM Psytrance rhythms.',
    category: 'opensource',
    tags: ['Ethnic Fusion', 'UK Garage', 'Psytrance', 'Acoustic Folk'],
    role: 'Composer & Sound Designer',
    date: '2025',
    featured: false,
    color: '#8B5CF6',
    highlights: [
      'Authentic acoustic folk instrument multi-samples woven over cutting-edge electronic rhythms',
      'Binaural 3D spatial reverberation fields and immersive stereo width',
      'Harmonic arrangements bridging two contrasting musical traditions into a coherent journey',
    ],
  },
];
