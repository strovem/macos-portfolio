export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  duration: string;
  durationSeconds: number;
  bpm: number;
  genre: string;
  year: string;
  coverGradient: string;
  src?: string; // Path to public/music/track.mp3
  synthFrequencies: number[]; // Frequencies for procedural audio playback if file not yet uploaded
  description: string;
}

export const ORIGINAL_TRACKS: MusicTrack[] = [
  {
    id: 'track-tech-house-lover',
    title: 'Tech House — I AM A LOVER',
    artist: 'Hüseyin Korumtaş',
    album: 'Club Masters',
    duration: '3:45',
    durationSeconds: 225,
    bpm: 126,
    genre: 'Tech House / Vocal Club',
    year: '2026',
    coverGradient: 'from-cyan-500 via-blue-700 to-slate-900',
    src: '/music/tech house I AM A LOVER.wav',
    synthFrequencies: [130.81, 164.81, 196, 246.94],
    description: 'Hypnotic vocal hook, driving analog TB-303 bassline, and floor-focused syncopated percussion.',
  },
  {
    id: 'track-dark-elektro',
    title: 'Dark Elektro',
    artist: 'Hüseyin Korumtaş',
    album: 'Underground Electronic',
    duration: '3:12',
    durationSeconds: 192,
    bpm: 126,
    genre: 'Dark Electro / Industrial',
    year: '2026',
    coverGradient: 'from-purple-900 via-indigo-950 to-neutral-900',
    src: '/music/dark elektro.mp3',
    synthFrequencies: [220, 261.63, 329.63, 392],
    description: 'Distorted Moog basslines, industrial synth textures, and dark cinematic nocturnal atmospheres.',
  },
  {
    id: 'track-ethnic-garage',
    title: 'Ethnic Garage',
    artist: 'Hüseyin Korumtaş',
    album: 'Sonic Explorations',
    duration: '3:35',
    durationSeconds: 215,
    bpm: 132,
    genre: 'UK Garage / Ethnic Fusion',
    year: '2026',
    coverGradient: 'from-amber-600 via-orange-700 to-stone-900',
    src: '/music/ethnic garage.mp3',
    synthFrequencies: [174.61, 220, 261.63, 349.23],
    description: 'Organic Middle Eastern acoustics and ney melodies woven over swinging 2-step UK Garage rhythms.',
  },
  {
    id: 'track-ethnic-psy',
    title: 'Ethnic Psy',
    artist: 'Hüseyin Korumtaş',
    album: 'Tribal Frequencies',
    duration: '4:20',
    durationSeconds: 260,
    bpm: 138,
    genre: 'Psytrance / Organic Psy',
    year: '2026',
    coverGradient: 'from-emerald-600 via-teal-800 to-indigo-950',
    src: '/music/ethnic psy.mp3',
    synthFrequencies: [146.83, 196, 220, 293.66],
    description: 'Rapid-fire rolling basslines, tribal percussions, and mind-expanding spatial reverberation fields.',
  },
  {
    id: 'track-guitar-house',
    title: 'Guitar House',
    artist: 'Hüseyin Korumtaş',
    album: 'Melodic Sunsets',
    duration: '3:18',
    durationSeconds: 198,
    bpm: 122,
    genre: 'Deep House / Acoustic',
    year: '2026',
    coverGradient: 'from-rose-500 via-pink-600 to-purple-900',
    src: '/music/guitar house.mp3',
    synthFrequencies: [196, 246.94, 293.66, 392],
    description: 'Warm live Stratocaster riffs, organic acoustic plucks, and uplifting sunset Deep House grooves.',
  },
  {
    id: 'track-tech-house-club',
    title: 'Tech House (Club Mix)',
    artist: 'Hüseyin Korumtaş',
    album: 'Modular Waves',
    duration: '3:30',
    durationSeconds: 210,
    bpm: 125,
    genre: 'Tech House / Minimal',
    year: '2026',
    coverGradient: 'from-blue-600 via-indigo-800 to-neutral-950',
    src: '/music/tech house.mp3',
    synthFrequencies: [130.81, 164.81, 196, 246.94],
    description: 'Minimalist tech rhythm, modular filter sweeps, and tightly synchronized analog kick-bass synergy.',
  },
  {
    id: 'track-excalibur',
    title: 'Excalibur Jingle',
    artist: 'Hüseyin Korumtaş',
    album: 'Commercial & Sound Branding',
    duration: '0:45',
    durationSeconds: 45,
    bpm: 110,
    genre: 'Cinematic Jingle / Brand Identity',
    year: '2026',
    coverGradient: 'from-yellow-500 via-amber-600 to-neutral-900',
    src: '/music/EXCALIBUR JINGLE.wav',
    synthFrequencies: [261.63, 329.63, 392, 523.25],
    description: 'High-impact cinematic mnemonic logo and trailer theme composed for Casper Excalibur.',
  },
];
