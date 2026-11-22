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
    id: 'my-musics-folder',
    type: 'folder',
    title: "My Music's",
    subtitle: '8 items',
    targetAppId: 'finder',
    defaultPosition: { x: 70, y: 350 },
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
    title: 'Sound Studio & Synth',
    subtitle: 'Tactile Audio Synthesizer',
    content:
      'Interactive procedural audio synthesizer with real-time waveform visualization and custom stems.',
    targetAppId: 'finder',
    defaultPosition: { x: 190, y: 340 },
    rotation: 1,
    metadata: {
      tag: 'SOUND STUDIO',
      version: 'v2.4',
      buttonLabel: 'PLAY SYNTH TONES',
      callToAction: 'Open Music ↗',
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
