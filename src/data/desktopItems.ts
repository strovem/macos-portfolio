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
    defaultPosition: { x: 60, y: 80 },
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
    defaultPosition: { x: 330, y: 90 },
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
    id: 'my-musics',
    type: 'music',
    title: "My Music's",
    subtitle: 'Hüseyin Korumtaş • 8 Tracks',
    content:
      'Özgün yapımlar, kulüp miksleri ve ses tasarımı çalışmaları. Doğrudan masaüstünden dinleyebilir veya Finder klasöründe inceleyebilirsiniz.',
    targetAppId: 'finder',
    defaultPosition: { x: 90, y: 350 },
    rotation: 1,
    metadata: {
      tag: "MY MUSIC'S",
      version: '8 Tracks',
      callToAction: "Open Music's ↗",
    },
  },
  {
    id: 'polaroid-showreel',
    type: 'polaroid',
    title: 'Featured Production',
    subtitle: 'Showreel 2026',
    targetAppId: 'finder',
    defaultPosition: { x: 390, y: 330 },
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
