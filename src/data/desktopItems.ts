import { DesktopCardItem } from '@/types/os';

export const DESKTOP_ITEMS: DesktopCardItem[] = [
  {
    id: 'readme',
    type: 'readme',
    title: 'README.md',
    subtitle: 'Hello World! 👋',
    content: 'Senior Software & Design Engineer crafting tactile web experiences, spatial systems & macOS Web OS clones.',
    targetAppId: 'notes',
    defaultPosition: { x: 70, y: 90 },
    rotation: -2,
    metadata: {
      tag: 'PINNED',
      author: 'gucduck',
      lines: [
        '✨ Crafting playful interactions',
        '⚡ TypeScript • Next.js • React',
        '🦆 Duck-first design philosophy',
      ],
      callToAction: 'Open Notes ↗',
    },
  },
  {
    id: 'message-bubble',
    type: 'message',
    title: 'Messages',
    subtitle: 'Design Partner',
    targetAppId: 'messages',
    defaultPosition: { x: 340, y: 100 },
    rotation: 1.5,
    metadata: {
      sender: 'Sarah Jenkins',
      handle: 'Design Lead',
      time: '10:42 AM',
      bubbles: [
        { text: 'Hey! Loved the new tactile desktop release 🔥', isSender: false },
        { text: 'Thanks! The physics & stickers feel super organic.', isSender: true },
        { text: 'Can we collaborate on the next spatial canvas?', isSender: false },
      ],
      callToAction: 'Reply in Messages ↗',
    },
  },
  {
    id: 'project-cut',
    type: 'project',
    title: 'Soundboard & Cut Button',
    subtitle: 'Interactive Tactile Module',
    content: 'Physics-based mechanical switch with reactive sound synthesis and tactile ripples.',
    targetAppId: 'finder',
    defaultPosition: { x: 160, y: 360 },
    rotation: 1,
    metadata: {
      tag: 'TACTILE EXPERIMENT',
      version: 'v2.4',
      buttonLabel: 'PUSH TO CUT',
      callToAction: 'View in Finder ↗',
    },
  },
];
