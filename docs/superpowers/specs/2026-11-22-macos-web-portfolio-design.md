# macOS Web OS Personal Portfolio — Design Document

## 1. Intent & The Why
The goal is to build an interactive, high-craft personal web portfolio inspired by `gucduck.com`, reimagined as a fully interactive macOS desktop environment in the browser. 

Traditional developer portfolios often rely on static, repetitive card layouts. By translating a portfolio into a living desktop OS (Menubar, Dock with spring magnification, multi-window manager, Terminal, Finder, Notes, and Messages), visitors (hiring managers, recruiters, clients) are invited into a playful yet deeply technical hands-on demonstration of frontend engineering, design systems, and state management.

---

## 2. Target Audience & Core Value
* **Primary Audience:** Engineering leaders, recruiters, clients, and fellow developers looking for exceptional UI/UX craft, system architecture, and attention to detail.
* **Core Value:** Demonstrates mastery over advanced animations, window lifecycle state management, responsive design, and micro-interactions while telling the developer's personal career story.

---

## 3. Goals, Non-Goals & Anti-Goals

### Goals
1. **High-Fidelity macOS Desktop Simulation (gucduck.com Reference):**
   - Signature soft sky-blue grid wallpaper (`#9BBED5` / graph-paper grid lines) with floating translucent soap bubbles / glass spheres drifting organically.
   - Organic, scattered interactive desktop canvas: rich interactive project preview cards, polaroids, stickers, and mini-widgets (e.g. `README.md` duck tile, `top creator` iMessage snippet, `tour du mont blanc` map widget, award badges) scattered across the grid that visitors can freely drag, click, and inspect.
   - Top Menubar with custom brand/handle, active app title, menu dropdowns, control center, weather widget (`☁ 42°F`), and real-time clock.
   - Bottom Dock with distance-based hover magnification (spring physics), active app indicators, and complete app suite (Finder, Safari, Mail, Messages, Notes, Photos, Terminal, Calculator, Trash).
2. **Robust Multi-Window Management:**
   - Draggable, resizable windows with smooth frame rates (60fps).
   - Traffic light controls: Close, Minimize, Maximize/Restore.
   - Dynamic z-index layering (clicking a window brings it to the front).
3. **Core Interactive Portfolio Apps:**
   - **Finder (Projects):** Browse projects categorized by domain/stack with live preview links and GitHub URLs.
   - **Notes (Bio & Experience):** About me, technical skill matrix, and career timeline.
   - **Terminal (Interactive CLI):** Shell interface accepting commands (`help`, `about`, `skills`, `projects`, `contact`, `clear`, easter eggs).
   - **Messages (Contact):** iMessage-style contact form allowing visitors to send a direct message.
   - **Settings:** Customizer for wallpapers, dark/light theme, and sound effects.
4. **Mobile & Tablet Adaptability:**
   - Graceful fallback for mobile viewports (<768px): a responsive macOS/iOS hybrid card/sheet view ensuring 100% usability on phones.
5. **Modern Tech Stack:**
   - Next.js (App Router), TypeScript, Tailwind CSS, Zustand, and Framer Motion.

### Non-Goals
* Building a full OS or virtual file system with local disk writes.
* Emulating low-level kernel routines or file execution.
* Heavy 3D WebGL scenes that cause GPU thermal throttling on low-spec devices.

### Anti-Goals
* Laggy, un-optimized drag-and-drop or jittery dock magnification.
* Clunky mobile experience where desktop windows overflow offscreen and can't be closed.
* Generic boilerplate components that break the native macOS illusion.

---

## 4. Approaches Evaluated

| Approach | Architecture | Pros | Cons | Verdict |
| :--- | :--- | :--- | :--- | :--- |
| **1. Modern macOS (Next.js + Tailwind + Framer Motion + Zustand)** | Next.js App Router, TypeScript, Framer Motion springs, Zustand store | Fast, modular, SEO-ready, native-feeling spring physics, server API routes for contact form | Requires thoughtful mobile responsiveness design | **SELECTED (User approved)** |
| **2. Vite + React SPA** | Pure client SPA with React and Vite | Simpler initial setup, no SSR | Lacks SSR metadata for social cards/SEO, contact form needs external backend | Rejected |
| **3. Retro Mac OS (System 7 / Mac OS 9)** | Retro pixel/90s Mac UI | Novelty, nostalgia | Does not communicate modern frontend engineering craft as effectively | Rejected |

---

## 5. System Architecture & Component Hierarchy

### State Management (`useWindowStore` with Zustand)
```typescript
interface WindowState {
  id: string;
  title: string;
  icon: string;
  isOpen: boolean;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
  defaultSize: { width: number; height: number };
}
```
* **Store Actions:**
  - `openWindow(id: string)`: Opens or restores and focuses the window.
  - `closeWindow(id: string)`: Closes the window and removes it from active focus.
  - `minimizeWindow(id: string)`: Animates window down to the dock.
  - `maximizeWindow(id: string)`: Toggles fullscreen bounds (respecting Menubar and Dock offsets).
  - `focusWindow(id: string)`: Increments max z-index and brings window to front.
  - `updatePosition(id: string, pos: { x: number; y: number })`: Updates window coordinates.
  - `updateSize(id: string, size: { width: number; height: number })`: Updates dimensions.

### Component Structure
```
src/
├── app/
│   ├── layout.tsx             # Root layout with metadata & fonts
│   ├── page.tsx               # Main Desktop environment
│   └── api/contact/route.ts   # Contact message API handler
├── components/
│   ├── desktop/
│   │   ├── Desktop.tsx        # Wallpaper, Desktop canvas, Window container
│   │   ├── DesktopItem.tsx    # Draggable interactive desktop cards, stickers, and mini-widgets
│   │   ├── FloatingBubbles.tsx# Ambient floating translucent bubble physics
│   │   └── Wallpaper.tsx      # Dynamic wallpaper & graph-paper grid manager
│   ├── menubar/
│   │   ├── Menubar.tsx        # Top status bar
│   │   ├── MenuDropdown.tsx   # File, Edit, View menus
│   │   ├── ControlCenter.tsx  # Quick toggles (theme, sound)
│   │   └── Clock.tsx          # Real-time formatted date/time
│   ├── dock/
│   │   ├── Dock.tsx           # Floating dock container
│   │   └── DockItem.tsx       # Magnifying dock icon with Framer Motion
│   ├── window/
│   │   ├── Window.tsx         # Draggable/resizable window wrapper
│   │   ├── WindowHeader.tsx   # Traffic light buttons and title bar
│   │   └── TrafficLights.tsx  # Red/Yellow/Green interactive controls
│   └── apps/
│       ├── FinderApp.tsx      # Projects browser (categories, details, links)
│       ├── NotesApp.tsx       # Bio, skills, experience timeline
│       ├── TerminalApp.tsx    # Interactive CLI command executor
│       ├── MessagesApp.tsx    # iMessage contact form
│       └── SettingsApp.tsx    # Wallpaper & customization panel
├── data/
│   ├── projects.ts            # Project showcase data
│   ├── skills.ts              # Categorized skills data
│   ├── experience.ts          # Career & education milestones
│   └── wallpapers.ts          # Wallpaper options
└── stores/
    ├── useWindowStore.ts      # Window management store
    └── useSettingsStore.ts    # Wallpapers, theme, audio preferences
```

---

## 6. Visual Design Tokens & Styling
* **Typography:** Apple System Font Stack (`-apple-system, BlinkMacSystemFont, "SF Pro Text", "SF Pro Display", sans-serif`) with JetBrains Mono / SF Mono for Terminal.
* **Glassmorphism:**
  - Dark mode: `bg-neutral-900/60 backdrop-blur-2xl border border-white/10 shadow-2xl`
  - Light mode: `bg-white/70 backdrop-blur-2xl border border-black/10 shadow-2xl`
* **Traffic Lights:**
  - Close: `#FF5F56` (hover cross)
  - Minimize: `#FFBD2E` (hover dash)
  - Maximize: `#27C93F` (hover arrows)
* **Dock:**
  - Floating pill: `backdrop-blur-2xl bg-white/20 dark:bg-black/30 border border-white/20 rounded-2xl p-2`
  - Magnification: Math scale function `f(distance) = maxScale - (distance / maxDistance) * (maxScale - 1)` mapped with Framer Motion `useSpring`.

---

## 7. Responsiveness & Mobile Strategy
* When viewport width is `< 768px` (Mobile):
  - Dock transitions into a bottom navigation bar or compact tray.
  - Windows automatically open in a clean full-viewport sheet/card modal with swipe-to-close or close button.
  - Menubar is simplified to status icons and clock.

---

## 8. Builder Review & Clarifications
1. **Menubar Contextual Menus (Resolved):**
   - The Menubar dynamically updates the leading application name to the currently active/focused window (e.g. `Finder`, `Notes`, `Terminal`). The dropdowns (`File`, `Edit`, `View`, `Window`, `Help`) provide relevant shortcuts (e.g. Close Window, Minimize, Zoom, Reload).
2. **Terminal Capabilities (Resolved):**
   - The Terminal functions as both an informative CLI (printing bio, skills, project lists) and a desktop controller (e.g., executing `open finder` or `open projects` opens the Finder window; `theme dark` toggles theme mode).
3. **Contact Delivery (Open choice for user):**
   - `/api/contact` will support standard email dispatch (configured for Resend with `RESEND_API_KEY`) and fallback smoothly to simulated instant confirmation or `mailto:` if unconfigured, ensuring the app works out-of-the-box without deployment friction.
4. **Initial Load Orchestration & Desktop Canvas (Resolved by User Reference):**
   - The desktop loads directly into the signature `gucduck.com` interactive playground layout: a pastel blue grid background with floating ambient bubbles and scattered tactile desktop items (polaroid photos, project preview cards, sticker badges like `README.md`, `awwwards honors`, `top creator` iMessage snippet, `tour du mont blanc` map widget).
   - Rather than forcing an intrusive pop-up window on mount, the rich desktop cards provide immediate visual intrigue and discoverability. Clicking or double-clicking any desktop card or Dock icon opens the respective high-fidelity macOS window modal (Notes, Finder, Messages, Terminal, etc.). All desktop items are freely draggable.

---

## 9. What is Left to the Builder
* Specific default project showcase entries and bio text (placeholder mock data with clean structure for easy user customization).
* Optional sound effects for dock bounce or window closing (respecting user mute preferences).

