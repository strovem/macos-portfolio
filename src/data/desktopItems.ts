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
      handle: 'Creative Producer & Audio Lead',
      time: 'Just now',
      bubbles: [
        {
          text: 'Hey there! Welcome to my creative space. 👋\nFeel free to send a direct message for music production, commercial jingles, or new creative projects.',
          isSender: false,
        },
        {
          text: 'All messages are instantly delivered directly to my inbox at korumtashuseyin@gmail.com!',
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
    defaultPosition: { x: 660, y: 65 },
    rotation: 0,
    metadata: {
      tag: 'FOLDER',
      itemCount: 8,
      section: 'music',
    },
  },
  {
    id: 'cosmic-calendar-widget',
    type: 'numerology',
    title: 'Numerology Calendar',
    subtitle: 'Cosmic Numbers & Astrology',
    alignRight: true,
    rightOffset: 24,
    defaultPosition: { x: 0, y: 70 },
    rotation: 0,
    metadata: {
      tag: 'CALENDAR',
      version: 'v1.0',
    },
  },
];
