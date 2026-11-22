import { DesktopCardItem } from '@/types/os';

export const DESKTOP_ITEMS: DesktopCardItem[] = [
  {
    id: 'readme',
    type: 'readme',
    title: 'README.md',
    subtitle: 'Hüseyin Korumtaş 👋',
    content: 'Creative Producer — Ideas into experiences. Crafting multidisciplinary productions, spatial interactions, and memorable creative projects.',
    targetAppId: 'notes',
    defaultPosition: { x: 70, y: 90 },
    rotation: -2,
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
    defaultPosition: { x: 340, y: 100 },
    rotation: 1.5,
    metadata: {
      sender: 'Hüseyin Korumtaş',
      handle: 'Creative Producer',
      time: 'Just now',
      bubbles: [
        { text: 'Hey there! Welcome to my interactive workspace 👋', isSender: false },
        { text: 'Turning bold ideas into memorable experiences.', isSender: true },
        { text: 'Feel free to explore or drop a note anytime!', isSender: false },
      ],
      callToAction: 'Reply in Messages ↗',
    },
  },
  {
    id: 'project-cut',
    type: 'project',
    title: 'Soundboard & Cut Button',
    subtitle: 'Tactile Audio Synthesizer',
    content: 'Interactive mechanical push switch with real-time audio synthesis and tactile ripples.',
    targetAppId: 'finder',
    defaultPosition: { x: 160, y: 360 },
    rotation: 1,
    metadata: {
      tag: 'CREATIVE EXPERIMENT',
      version: 'v2.4',
      buttonLabel: 'PUSH TO CUT',
      callToAction: 'View in Finder ↗',
    },
  },
];
