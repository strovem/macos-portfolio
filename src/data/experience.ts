import { ExperienceItem } from '@/types/os';

export const EXPERIENCE: ExperienceItem[] = [
  {
    id: 'exp-gucduck',
    role: 'Lead Frontend & Design Engineer',
    company: 'GucDuck Labs / Studio',
    period: '2024 — Present',
    location: 'San Francisco, CA / Remote',
    description:
      'Directing frontend architecture, design engineering, and spatial interaction models across tactile web experiences, interactive desktop operating systems, and developer tooling.',
    achievements: [
      'Designed and shipped macOS Web OS architecture utilizing Zustand atomic stores and Framer Motion spring physics with 60 FPS fluidity.',
      'Authored open-source library zustand-spatial-sync with 35k monthly downloads across enterprise frontend teams.',
      'Spearheaded design token unification across web and mobile platforms, slashing UI regression tickets by 60%.',
    ],
    technologies: ['Next.js 14', 'TypeScript', 'Tailwind CSS', 'Framer Motion', 'Zustand', 'Three.js'],
    type: 'work',
  },
  {
    id: 'exp-nexus',
    role: 'Senior Software Engineer (UI & Graphics)',
    company: 'Nexus Spatial Labs',
    period: '2022 — 2024',
    location: 'Seattle, WA',
    description:
      'Engineered infinite collaborative canvas platform supporting real-time multiplayer node manipulation, custom WebGL shaders, and high-frequency peer synchronization.',
    achievements: [
      'Engineered quad-tree spatial index offloaded to Web Workers, supporting 10,000+ simultaneous canvas objects at steady 60 FPS.',
      'Implemented conflict-free replicated data types (CRDTs) using Yjs, achieving zero data collision across collaborative sessions.',
      'Mentored 6 junior and mid-level engineers in state machines, browser performance profiling, and accessible DOM structures.',
    ],
    technologies: ['React', 'TypeScript', 'WebGL', 'Yjs / CRDTs', 'WebSockets', 'RxJS'],
    type: 'work',
  },
  {
    id: 'exp-hyperion',
    role: 'Frontend Engineer',
    company: 'Hyperion Digital',
    period: '2020 — 2022',
    location: 'Austin, TX',
    description:
      'Delivered data-intensive SaaS analytics dashboard and component library used by 2M+ active monthly enterprise users.',
    achievements: [
      'Rebuilt monolithic frontend into Next.js App Router architecture, improving Core Web Vitals (LCP reduced from 3.2s to 0.9s).',
      'Created automated visual regression testing suite with Playwright and Storybook, preventing deployment defects.',
      'Integrated real-time streaming charts with dynamic downsampling for million-datapoint telemetry feeds.',
    ],
    technologies: ['React', 'Next.js', 'TypeScript', 'Tailwind CSS', 'Jest', 'Playwright'],
    type: 'work',
  },
  {
    id: 'edu-cs',
    role: 'B.S. in Computer Science & Human-Computer Interaction',
    company: 'University of California, Berkeley',
    period: '2016 — 2020',
    location: 'Berkeley, CA',
    description:
      'Graduated Magna Cum Laude with honors thesis on "Spatial Affordances and Tactile Skeuomorphism in Digital Windowing Environments".',
    achievements: [
      'Dean’s Honors List (all 8 semesters)',
      'Undergraduate Teaching Assistant for CS61B: Data Structures & Algorithms',
      'President of Berkeley Interactive Graphics & Creative Coding Society',
    ],
    technologies: ['Algorithms', 'Computer Graphics', 'Distributed Systems', 'HCI Design'],
    type: 'education',
  },
  {
    id: 'award-awwwards',
    role: 'Site of the Day & Developer Honors',
    company: 'Awwwards Official',
    period: '2026',
    location: 'Global',
    description:
      'Recognized for industry-leading micro-interactions, tactile desktop physics, sub-pixel typography rendering, and responsive spatial layouts.',
    achievements: [
      'Jury score of 8.45/10 across Design, Usability, Creativity, and Content.',
      'Featured in Awwwards Annual Best Web Experiences Showcase.',
    ],
    technologies: ['Creative Coding', 'Tactile Motion', 'UI Engineering'],
    type: 'award',
  },
  {
    id: 'award-hackathon',
    role: '1st Place Grand Winner (Autonomous Systems)',
    company: 'Global AI Web Hackathon / DevPost',
    period: '2025',
    location: 'San Francisco, CA',
    description:
      'Built autonomous coding agent with AST-level refactoring and live sandbox execution out of 1,200+ international engineer submissions.',
    achievements: [
      'Unanimous 1st place vote from industry jury (OpenAI, Vercel, Anthropic).',
      'Over 2,000 GitHub stars within 48 hours of open-sourcing.',
    ],
    technologies: ['Rust', 'AST Parsing', 'LLM Agent Orchestration', 'TypeScript'],
    type: 'award',
  },
];
