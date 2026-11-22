import { DesktopCardItem } from '@/types/os';

export const DESKTOP_ITEMS: DesktopCardItem[] = [
  {
    id: 'readme',
    type: 'readme',
    title: 'README.md',
    subtitle: 'Hüseyin Korumtaş 👋',
    content:
      'Creative Producer — Ideas into experiences. Crafting multidisciplinary productions, spatial interactions, original audio, and memorable creative projects.',
    targetAppId: 'notes',
    defaultPosition: { x: 50, y: 70 },
    rotation: -1.5,
    metadata: {
      tag: 'PINNED',
      author: 'Hüseyin Korumtaş',
      lines: [
        '💡 Ideas into experiences',
        '🎬 Creative Production & Direction',
        '🎵 Sound, Tactile Media & Web Spaces',
      ],
      callToAction: 'Open Notes ↗',
    },
  },
  {
    id: 'message-bubble',
    type: 'message',
    title: 'Messages',
    subtitle: 'Hüseyin Korumtaş',
    targetAppId: 'messages',
    defaultPosition: { x: 330, y: 75 },
    rotation: 1.5,
    metadata: {
      sender: 'Hüseyin Korumtaş',
      handle: 'Creative Producer',
      time: 'Just now',
      bubbles: [
        {
          text: 'Hey there! Welcome to my creative space. 👋\nA collection of ideas, experiments, and projects. Feel free to explore.',
          isSender: false,
        },
        {
          text: "Curious about something? Drop me a message. I'd love to hear from you!",
          isSender: false,
        },
      ],
      callToAction: 'Reply in Messages ↗',
    },
  },
  {
    id: 'my-musics-folder',
    type: 'folder',
    title: "My Music's",
    subtitle: '8 items',
    targetAppId: 'finder',
    defaultPosition: { x: 660, y: 80 },
    rotation: 0,
    metadata: {
      tag: 'FOLDER',
      itemCount: 8,
      section: 'music',
    },
  },
  {
    id: 'project-cut',
    type: 'project',
    title: 'Tone Generator',
    subtitle: 'Sine Wave Synthesizer',
    content:
      'Web Audio API ile gerçek zamanlı saf sinüs dalgası (sine wave) frekans sentezleyici. İstediğiniz Hz değerini girin ve saf tonu dinleyin.',
    targetAppId: 'finder',
    defaultPosition: { x: 640, y: 195 },
    rotation: 0.5,
    metadata: {
      tag: 'TONE GEN',
      version: 'v3.0',
      callToAction: "Open Music's ↗",
    },
  },
  {
    id: 'polaroid-showreel',
    type: 'polaroid',
    title: 'Featured Production',
    subtitle: 'Showreel 2026',
    targetAppId: 'finder',
    defaultPosition: { x: 380, y: 340 },
    rotation: -2,
    metadata: {
      scene: 'workspace',
      caption: 'Kinetic Echoes • Creative Production',
      date: '2026 Showreel',
      tag: 'FEATURED WORK',
      callToAction: 'View in Finder ↗',
    },
  },
];
