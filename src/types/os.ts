export type AppId =
  | 'finder'
  | 'safari'
  | 'messages'
  | 'instagram'
  | 'notes'
  | 'photos'
  | 'terminal'
  | 'settings'
  | 'trash'
  | 'tonegenerator'
  | 'studio';

export type TilePosition = 'left' | 'right' | 'full' | null;

export interface WindowState {
  id: AppId;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  tilePosition?: TilePosition;
  previousBounds?: {
    position: { x: number; y: number };
    size: { width: number; height: number };
  };
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  defaultSize: { width: number; height: number };
}

export type DesktopCardType =
  | 'readme'
  | 'polaroid'
  | 'award'
  | 'project'
  | 'map'
  | 'message'
  | 'music'
  | 'folder'
  | 'numerology';

export interface DesktopCardItem {
  id: string;
  type: DesktopCardType;
  title: string;
  subtitle?: string;
  content?: string;
  image?: string;
  link?: string;
  targetAppId?: AppId;
  defaultPosition: { x: number; y: number };
  alignRight?: boolean;
  rightOffset?: number;
  rotation?: number; // e.g. -3 to 3 degrees
  metadata?: Record<string, any>;
}

export interface ProjectItem {
  id: string;
  title: string;
  description: string;
  category: 'web' | 'mobile' | 'ai' | 'experiments' | 'opensource';
  tags: string[];
  image?: string;
  demoUrl?: string;
  githubUrl?: string;
  featured?: boolean;
  color?: string;
  icon?: string;
  date?: string;
  highlights?: string[];
  role?: string;
  stats?: { stars?: number; forks?: number; users?: string };
}

export interface SkillItem {
  name: string;
  level: number;
  icon?: string;
  category?: string;
  years?: string;
  highlight?: string;
}

export interface SkillCategory {
  name: string;
  skills: SkillItem[];
}

export interface NoteEntry {
  id: string;
  title: string;
  date: string;
  category: string;
  content: string;
  icon?: string;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
  type: 'work' | 'education' | 'award';
}

export interface ContextMenuItem {
  label: string;
  icon?: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  variant?: 'default' | 'danger';
  separator?: false;
}

export interface ContextMenuSeparator {
  separator: true;
}

export type ContextMenuEntry = ContextMenuItem | ContextMenuSeparator;

