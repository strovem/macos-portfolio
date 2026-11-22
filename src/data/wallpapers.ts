export interface WallpaperOption {
  id: string;
  name: string;
  type: 'grid' | 'gradient' | 'image' | 'solid';
  bgColor: string;
  gridColor?: string;
  previewClass: string;
  imageUrl?: string;
}

export const WALLPAPERS: WallpaperOption[] = [
  {
    id: 'gucduck-blue',
    name: 'Sky Blue Grid (Default)',
    type: 'grid',
    bgColor: '#9BBED5',
    gridColor: 'rgba(255, 255, 255, 0.4)',
    previewClass: 'bg-[#9BBED5]',
  },
  {
    id: 'sonoma-dusk',
    name: 'Sonoma Dusk',
    type: 'gradient',
    bgColor: '#1E293B',
    previewClass: 'bg-gradient-to-tr from-slate-900 via-indigo-950 to-blue-900',
  },
  {
    id: 'monterey-purple',
    name: 'Monterey Abstract',
    type: 'gradient',
    bgColor: '#311042',
    previewClass: 'bg-gradient-to-tr from-purple-900 via-pink-900 to-rose-950',
  },
  {
    id: 'sequoia-forest',
    name: 'Sequoia Minimal',
    type: 'gradient',
    bgColor: '#064E3B',
    previewClass: 'bg-gradient-to-tr from-emerald-950 via-teal-900 to-slate-900',
  },
];
