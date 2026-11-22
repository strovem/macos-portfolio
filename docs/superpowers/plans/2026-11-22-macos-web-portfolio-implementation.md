# macOS Web OS Personal Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a high-craft, interactive personal web portfolio inspired by `gucduck.com`, featuring a pastel grid canvas with floating bubbles, draggable desktop cards/stickers, a spring-magnified macOS Dock, multi-window management, and core portfolio apps (Finder, Notes, Terminal, Messages, Settings).

**Architecture:** Next.js App Router with TypeScript and Tailwind CSS for structure and styling. Zustand manages the multi-window desktop OS state (`useWindowStore`), active app context, and user settings (`useSettingsStore`). Framer Motion powers distance-based dock magnification physics, draggable windows/stickers, and window open/minimize transitions.

**Tech Stack:** Next.js, React, TypeScript, Tailwind CSS, Framer Motion, Zustand, Lucide-React, Canvas-Confetti (easter eggs).

**Spec:** `docs/superpowers/specs/2026-11-22-macos-web-portfolio-design.md`

## Global Constraints
- Target platform: Modern evergreen web browsers (Desktop & Mobile).
- Styling: Tailwind CSS with custom glassmorphism and pastel palette (`#9BBED5` grid background, frosted glass cards, Apple system fonts).
- Performance: 60fps animations via Framer Motion; avoid blocking main-thread calculations during drag or dock hover.
- Hydration: Handle client-only window measurements and real-time clock without Next.js SSR hydration mismatches (`mounted` check or dynamic import).
- Mobile: Viewports < 768px gracefully adapt into a clean card/sheet modal flow without broken horizontal scroll or unreachable window controls.

## Review Focus
1. **Window Drag Boundary Clamping:** Windows dragged offscreen must remain grabable by their title bars and never become permanently lost.
2. **Dock Magnification Performance:** Fast mouse sweeps over the dock must not cause frame drops or layout thrashing.
3. **Mobile Viewport Usability:** Tapping desktop cards or dock icons on small touchscreens (<768px) must open cleanly centered modal sheets with accessible close buttons.
4. **Z-Index Layering Order:** Clicking any inactive window or desktop sticker must immediately bring it to the foreground above all other elements.
5. **Terminal Command Parsing:** Unrecognized commands, casing differences, and trailing spaces must be handled gracefully with a helpful suggestion list.

---

### Task 1: Project Initialization & Core Scaffolding

**Files:**
- Create: `package.json`, `tsconfig.json`, `tailwind.config.ts`, `postcss.config.mjs`, `next.config.mjs`
- Create: `src/app/layout.tsx`, `src/app/globals.css`, `src/app/page.tsx`
- Create: `src/types/os.ts`

**Interfaces:**
- Produces: Base project structure and core TypeScript interfaces (`WindowState`, `DesktopItemData`, `AppMetadata`).

- [ ] **Step 1: Initialize Next.js project with Tailwind CSS & dependencies**
Initialize project in `c:\Users\Korumtas\Documents\macos-portfolio` with Next.js App Router, Tailwind CSS, TypeScript, Framer Motion, Zustand, and Lucide React.
Dependencies: `framer-motion`, `zustand`, `lucide-react`, `clsx`, `tailwind-merge`.

- [ ] **Step 2: Configure TypeScript, Tailwind, and Apple System Font stack**
Set up `tailwind.config.ts` with custom colors (`macos-blue`, `macos-gray`, `traffic-red`, `traffic-yellow`, `traffic-green`, `pastel-blue`) and backdrop-filter utilities. Configure `globals.css` with font declarations and reset styles.

- [ ] **Step 3: Define OS TypeScript interfaces in `src/types/os.ts`**
Export `WindowState`, `AppId`, `DesktopCardItem`, `ProjectItem`, `SkillCategory`, `NoteEntry`.

- [ ] **Step 4: Verify build and dev compilation**
Run `npm run build` or verify Next.js configuration compiles cleanly with zero TypeScript errors.

---

### Task 2: Wallpaper, Grid Canvas & Floating Ambient Bubbles

**Files:**
- Create: `src/components/desktop/Wallpaper.tsx`
- Create: `src/components/desktop/FloatingBubbles.tsx`
- Modify: `src/app/globals.css`

**Interfaces:**
- Produces: `Wallpaper` component rendering the signature `gucduck.com` sky-blue graph paper grid (`#9BBED5` background with subtle grid lines).
- Produces: `FloatingBubbles` component rendering floating, translucent soap bubbles with organic floating animations.

- [ ] **Step 1: Implement `Wallpaper.tsx` with customizable themes**
Create SVG/CSS grid background matching gucduck's soft grid. Support dark mode and alternative wallpapers stored in settings.

- [ ] **Step 2: Implement `FloatingBubbles.tsx` with Framer Motion**
Generate randomized floating bubble particles with subtle drift, scale wobble, and gradient sheen that float organically behind desktop windows.

- [ ] **Step 3: Test and verify background visual fidelity in `src/app/page.tsx`**
Mount Wallpaper and Bubbles in main page; verify smooth animation and zero CPU spikes.

---

### Task 3: macOS Menubar & System Controls

**Files:**
- Create: `src/components/menubar/Menubar.tsx`
- Create: `src/components/menubar/Clock.tsx`
- Create: `src/components/menubar/ControlCenter.tsx`
- Create: `src/stores/useSettingsStore.ts`

**Interfaces:**
- Consumes: `useSettingsStore` for dark/light mode and audio state.
- Produces: `Menubar` component with Apple icon, active app title, contextual dropdown menus, Weather indicator (`☁ 42°F`), Control Center toggle, and real-time Clock.

- [ ] **Step 1: Create `src/stores/useSettingsStore.ts`**
Zustand store tracking `isDarkMode`, `soundEnabled`, `activeWallpaper`, and actions to toggle them.

- [ ] **Step 2: Implement `Clock.tsx` with hydration safety**
Format current date/time (e.g. `Sun Nov 22 2:15 PM`) using a client-only mount effect to prevent SSR mismatch.

- [ ] **Step 3: Implement `ControlCenter.tsx` and dropdown menus**
Create quick toggles for theme, sound, and display sliders with macOS Big Sur/Sonoma glass styling.

- [ ] **Step 4: Implement `Menubar.tsx` layout and verify in viewport**
Mount Menubar at `top-0 left-0 right-0 z-50` with `backdrop-blur-md bg-white/40 dark:bg-black/40 border-b border-black/5 dark:border-white/10`.

---

### Task 4: Spring-Magnified macOS Dock

**Files:**
- Create: `src/components/dock/Dock.tsx`
- Create: `src/components/dock/DockItem.tsx`
- Create: `src/data/apps.ts`

**Interfaces:**
- Consumes: `useWindowStore` to trigger `openWindow(id)`.
- Produces: `Dock` component with macOS floating pill design, cursor distance-based spring magnification via Framer Motion `useMotionValue` & `useTransform`, and active app indicator dots.

- [ ] **Step 1: Create `src/data/apps.ts` with metadata for all apps**
Define metadata for Finder, Safari, Messages, Notes, Photos, Terminal, Settings, and Trash (IDs, titles, Lucide or custom SVG icons).

- [ ] **Step 2: Implement `DockItem.tsx` with spring magnification physics**
Calculate distance between cursor `mouseX` and dock icon center; dynamically scale icon between `1.0` and `1.6` with spring damping. Add click bounce animation.

- [ ] **Step 3: Implement `Dock.tsx` container**
Center dock at `bottom-4` with frosted glass pill styling, indicator dots for open apps, and tooltips on hover.

- [ ] **Step 4: Verify dock interaction**
Hover across dock items and verify smooth curve scaling without layout stutter.

---

### Task 5: Zustand Window Store & Window Frame Component

**Files:**
- Create: `src/stores/useWindowStore.ts`
- Create: `src/components/window/Window.tsx`
- Create: `src/components/window/WindowHeader.tsx`
- Create: `src/components/window/TrafficLights.tsx`

**Interfaces:**
- Produces: `useWindowStore` handling window states, open/close/minimize/maximize, z-index layering, and viewport bounds.
- Produces: `Window` draggable and resizable window container with traffic light controls.

- [ ] **Step 1: Implement `useWindowStore.ts`**
State containing map of `windows`, `activeWindowId`, `maxZIndex`, with actions: `openWindow`, `closeWindow`, `minimizeWindow`, `maximizeWindow`, `focusWindow`, `updatePosition`, `updateSize`.

- [ ] **Step 2: Implement `TrafficLights.tsx`**
Three interactive buttons (Close `#FF5F56`, Minimize `#FFBD2E`, Maximize `#27C93F`) with hover glyphs (x, -, +).

- [ ] **Step 3: Implement `WindowHeader.tsx`**
Double-click title bar to maximize, drag handle for moving the window.

- [ ] **Step 4: Implement `Window.tsx` with Framer Motion drag and resize**
Wrap content with `motion.div drag`, bind drag constraints to viewport boundaries, handle z-index focus on pointer down, and render traffic lights and children.

- [ ] **Step 5: Verify multi-window interactions**
Open 2+ windows, drag them, minimize one, focus between them, and ensure z-index updates cleanly.

---

### Task 6: Draggable Desktop Playground (gucduck-style Cards & Stickers)

**Files:**
- Create: `src/components/desktop/DesktopItem.tsx`
- Create: `src/components/desktop/widgets/ReadmeSticker.tsx`
- Create: `src/components/desktop/widgets/PolaroidCard.tsx`
- Create: `src/components/desktop/widgets/ProjectPreviewCard.tsx`
- Create: `src/components/desktop/widgets/AwardBadge.tsx`
- Create: `src/components/desktop/widgets/MapWidget.tsx`
- Create: `src/data/desktopItems.ts`

**Interfaces:**
- Consumes: `useWindowStore` to open corresponding apps when cards/stickers are clicked.
- Produces: Scattered, freely draggable desktop playground elements on the canvas.

- [ ] **Step 1: Create `src/data/desktopItems.ts`**
Define desktop items:
  - `README.md` (Yellow sticky note with duck footprints, bio summary, click opens Notes).
  - Polaroid photo cards (e.g. workspace photo, hobby/project moments with tape effect).
  - Award badges (`awwwards honors`, `top hacker / creator`).
  - `tour du mont blanc` (mini map snippet).
  - Interactive project cards (e.g. preview button, greeting card preview).

- [ ] **Step 2: Implement widget components (`ReadmeSticker`, `PolaroidCard`, etc.)**
Style with realistic paper shadows, tape stickers, slight random tilt angles (-4° to +4°), and hover lift.

- [ ] **Step 3: Implement `DesktopItem.tsx` draggable wrapper**
Framer Motion `drag` with cursor pointer/grabbing, double-click or click to open corresponding window modal, z-index elevation on drag.

- [ ] **Step 4: Integrate cards onto desktop canvas and verify layout**
Arrange items across grid with responsive spacing. Verify that dragging works smoothly without interfering with window dragging.

---

### Task 7: Portfolio Applications Implementation

**Files:**
- Create: `src/components/apps/FinderApp.tsx`
- Create: `src/components/apps/NotesApp.tsx`
- Create: `src/components/apps/TerminalApp.tsx`
- Create: `src/components/apps/MessagesApp.tsx`
- Create: `src/components/apps/SettingsApp.tsx`
- Create: `src/data/projects.ts`, `src/data/skills.ts`, `src/data/experience.ts`
- Create: `src/app/api/contact/route.ts`

**Interfaces:**
- Consumes: Data files and `useWindowStore` / `useSettingsStore`.
- Produces: Full interior content for all desktop applications.

- [ ] **Step 1: Implement `FinderApp.tsx` (Projects Showcase)**
macOS Finder layout: left sidebar (Favorites: All, Web, Mobile, Open Source, Experiments), main grid view with project thumbnails, title, description, tech badges, live demo and GitHub buttons.

- [ ] **Step 2: Implement `NotesApp.tsx` (Bio, Skills, Experience)**
macOS Notes layout: sidebar list with notes (`About Me`, `Technical Skills`, `Career Timeline`, `Education`), formatted content view with rich badges and personal narrative.

- [ ] **Step 3: Implement `TerminalApp.tsx` (Interactive CLI & OS Controller)**
macOS Terminal window with prompt `visitor@macbook ~ %`. Implement command parser for `help`, `bio`, `skills`, `projects`, `contact`, `clear`, `theme [dark|light]`, `open [app]`, `sudo rm -rf /`.

- [ ] **Step 4: Implement `MessagesApp.tsx` & `src/app/api/contact/route.ts`**
iMessage interface with conversation thread and interactive contact form (Name, Email, Message). Connect to Next.js API route with validation and graceful simulated fallback.

- [ ] **Step 5: Implement `SettingsApp.tsx`**
macOS System Settings pane: wallpaper picker, dark/light appearance toggle, and audio sound effects toggle.

---

### Task 8: Mobile Adaptation & Polish

**Files:**
- Modify: `src/components/desktop/Desktop.tsx`
- Modify: `src/components/dock/Dock.tsx`
- Modify: `src/components/window/Window.tsx`
- Create: `src/components/mobile/MobileSheet.tsx`

**Interfaces:**
- Adapts desktop OS experience for mobile viewports (<768px).

- [ ] **Step 1: Implement mobile detection hook `useMediaQuery`**
Detect screen width < 768px and touch devices.

- [ ] **Step 2: Adapt Window modals for mobile**
On mobile, open windows as full-screen sliding sheets / bottom sheets with explicit close button, avoiding clipped overflow.

- [ ] **Step 3: Adapt Dock for mobile**
Render compact bottom bar or floating pill with horizontal scroll if needed.

- [ ] **Step 4: Test mobile layout using responsive emulation**
Verify that all stickers, dock icons, and windows are easily tappable and fully legible on small screens.

---

### Task 9: Build Verification, End-to-End Typecheck, and Polish

**Files:**
- Audit all files in `src/`

- [ ] **Step 1: Run TypeScript compiler**
Run `npx tsc --noEmit` to verify 0 type errors.

- [ ] **Step 2: Run Next.js production build**
Run `npm run build` to verify static page generation, bundle optimization, and route compilation.

- [ ] **Step 3: Verify micro-interactions and performance**
Audit drag boundaries, z-index elevation, sound effects, dock magnification speed, and console warnings.
