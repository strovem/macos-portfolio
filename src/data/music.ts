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
    id: 'track-1',
    title: 'Rhythm Inside x Mud Blood',
    artist: 'Hüseyin Korumtaş',
    album: 'Sonic Explorations',
    duration: '3:42',
    durationSeconds: 222,
    bpm: 124,
    genre: 'Electronic / Cinematic',
    year: '2026',
    coverGradient: 'from-rose-500 to-indigo-700',
    synthFrequencies: [220, 261.63, 329.63, 392, 440],
    description: 'Enerjik bas yürüyüşleri, hibrit analog synthesizer katmanları ve dinamik perküsyon kurgusu.',
  },
  {
    id: 'track-2',
    title: 'Quiet (Ambient Session)',
    artist: 'Hüseyin Korumtaş',
    album: 'Acoustic Architecture',
    duration: '4:15',
    durationSeconds: 255,
    bpm: 78,
    genre: 'Ambient / Soundscape',
    year: '2026',
    coverGradient: 'from-blue-600 to-cyan-500',
    synthFrequencies: [174.61, 220, 261.63, 349.23, 440],
    description: 'Derin yankılar, minimal piyano akorları ve mekansal hava hissi veren sinematik bir atmosfer.',
  },
  {
    id: 'track-3',
    title: 'Juice (Tactile Bass Mix)',
    artist: 'Hüseyin Korumtaş',
    album: 'Modular Waves',
    duration: '2:58',
    durationSeconds: 178,
    bpm: 118,
    genre: 'Modular Synth / Beat',
    year: '2026',
    coverGradient: 'from-amber-500 to-pink-600',
    synthFrequencies: [130.81, 164.81, 196, 246.94, 293.66],
    description: 'Taktil dokular, modüler osilatör süpürmeleri ve sıcak analog armoniler içeren dinamik yapım.',
  },
  {
    id: 'track-4',
    title: 'My Heart With You',
    artist: 'Hüseyin Korumtaş',
    album: 'Orchestral Stems',
    duration: '3:30',
    durationSeconds: 210,
    bpm: 92,
    genre: 'Melodic / Neo-Classical',
    year: '2026',
    coverGradient: 'from-emerald-500 to-teal-700',
    synthFrequencies: [196, 246.94, 293.66, 392, 493.88],
    description: 'Duygusal yaylı armonileri ve zarif piyano geçişleriyle kurgulanmış hikaye odaklı beste.',
  },
];
