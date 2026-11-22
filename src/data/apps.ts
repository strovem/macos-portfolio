import { AppId } from '@/types/os';

export interface AppMetadata {
  id: AppId;
  title: string;
  category: string;
  description: string;
  iconType: 'finder' | 'safari' | 'messages' | 'mail' | 'notes' | 'photos' | 'terminal' | 'settings' | 'trash' | 'studio';
  gradient: string;
  badge?: string | number;
}

export const APPS: AppMetadata[] = [
  { id: 'finder', title: 'Finder', category: 'System', description: 'Projects & Case Studies', iconType: 'finder', gradient: 'from-blue-400 to-blue-600' },
  { id: 'studio', title: 'Studio', category: 'Audio', description: 'DAW, Stems & Music Lab', iconType: 'studio', gradient: 'from-violet-600 via-indigo-600 to-purple-800' },
  { id: 'safari', title: 'Safari', category: 'Web', description: 'Live Web Projects & Demos', iconType: 'safari', gradient: 'from-cyan-400 to-blue-500' },
  { id: 'messages', title: 'Messages', category: 'Social', description: 'Direct Contact & Chat', iconType: 'messages', gradient: 'from-emerald-400 to-green-600', badge: '1' },
  { id: 'notes', title: 'Notes', category: 'Productivity', description: 'About Me, Skills & Experience', iconType: 'notes', gradient: 'from-amber-200 to-yellow-400' },
  { id: 'photos', title: 'Photos', category: 'Media', description: 'Gallery & Highlights', iconType: 'photos', gradient: 'from-pink-400 via-purple-400 to-indigo-500' },
  { id: 'terminal', title: 'Terminal', category: 'Developer', description: 'Interactive CLI Shell', iconType: 'terminal', gradient: 'from-neutral-800 to-black' },
  { id: 'settings', title: 'Settings', category: 'System', description: 'Preferences & Themes', iconType: 'settings', gradient: 'from-neutral-300 to-neutral-500' },
  { id: 'trash', title: 'Trash', category: 'System', description: 'Deleted items & Easter Eggs', iconType: 'trash', gradient: 'from-neutral-400 to-neutral-600' },
];
