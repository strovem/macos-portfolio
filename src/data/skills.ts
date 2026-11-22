import { SkillCategory } from '@/types/os';

export const SKILL_CATEGORIES: SkillCategory[] = [
  {
    name: 'Frontend Engineering',
    skills: [
      { name: 'TypeScript', level: 98, years: '6+ yrs', highlight: 'Strict type safety & AST metaprogramming' },
      { name: 'React & React 19', level: 96, years: '6+ yrs', highlight: 'Server Components, Suspense, custom hooks' },
      { name: 'Next.js 14 / 15', level: 95, years: '4+ yrs', highlight: 'App Router, SSR/ISR, dynamic routing' },
      { name: 'Tailwind CSS', level: 96, years: '5+ yrs', highlight: 'Custom plugin design & design tokens' },
      { name: 'WebGL & Three.js', level: 82, years: '3+ yrs', highlight: 'Interactive 3D shaders & physics simulations' },
      { name: 'HTML5 / CSS3 / Canvas', level: 98, years: '7+ yrs', highlight: 'Pixel-perfect semantic DOM & sub-pixel rendering' },
    ],
  },
  {
    name: 'Architecture & State Management',
    skills: [
      { name: 'Zustand', level: 95, years: '4+ yrs', highlight: 'Atomic state slices & multi-window persistence' },
      { name: 'TanStack React Query', level: 92, years: '4+ yrs', highlight: 'Optimistic caching & background invalidation' },
      { name: 'Design Systems & Tokens', level: 94, years: '5+ yrs', highlight: 'Aura architecture, Radix UI & Headless primitives' },
      { name: 'WebSockets & CRDTs', level: 85, years: '2+ yrs', highlight: 'Real-time collaborative Yjs synchronization' },
      { name: 'REST & GraphQL APIs', level: 90, years: '5+ yrs', highlight: 'Schema contract generation & edge endpoints' },
    ],
  },
  {
    name: 'UI/UX Craft & Motion',
    skills: [
      { name: 'Framer Motion', level: 96, years: '4+ yrs', highlight: 'Spring physics, layout animations & gestures' },
      { name: 'GSAP (GreenSock)', level: 88, years: '3+ yrs', highlight: 'Complex timeline sequencing & SVG animations' },
      { name: 'Figma to Code', level: 94, years: '5+ yrs', highlight: 'Auto-layout fidelity, component sets & variables' },
      { name: 'Accessibility (WCAG 2.2)', level: 92, years: '4+ yrs', highlight: 'Screen reader optimization & keyboard trap prevention' },
      { name: 'Spatial & Tactile UX', level: 95, years: '3+ yrs', highlight: 'Haptic audio synthesis & physical card elevation' },
    ],
  },
  {
    name: 'Backend, Cloud & Tooling',
    skills: [
      { name: 'Node.js & Bun', level: 90, years: '5+ yrs', highlight: 'Event loop tuning & microservice architectures' },
      { name: 'Python & FastAPI', level: 84, years: '3+ yrs', highlight: 'Async endpoints & LLM inference pipelines' },
      { name: 'PostgreSQL & Prisma', level: 86, years: '4+ yrs', highlight: 'Index optimization & connection pooling' },
      { name: 'Docker & CI/CD', level: 85, years: '4+ yrs', highlight: 'Multi-stage builds & GitHub Actions automation' },
      { name: 'Vercel & AWS Edge', level: 90, years: '4+ yrs', highlight: 'Edge middleware, serverless functions & global CDNs' },
      { name: 'Git & Monorepos', level: 94, years: '6+ yrs', highlight: 'Turborepo, atomic commits & trunk-based development' },
    ],
  },
];
