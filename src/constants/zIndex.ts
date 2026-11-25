/**
 * Central macOS Operating System Z-Index Hierarchy.
 * Strictly guarantees modal layering, pointer interception, and overlay priority.
 */
export const Z_INDEX = {
  // Desktop Layer
  WALLPAPER: 0,
  WEATHER_ATMOSPHERE: 2,
  FLOATING_BUBBLES: 3,
  DESKTOP_CANVAS: 15,
  WINDOWS_BASE: 20, // Windows dynamically elevate between 20 and 39
  WINDOWS_MAX: 39,

  // Hardware & Shell
  BRIGHTNESS_OVERLAY: 40,
  STAGE_MANAGER_STRIP: 42,
  DOCK: 45,
  MENUBAR: 50,
  DYNAMIC_NOTCH: 52,
  MENUBAR_POPOVER: 55, // Dropdowns, ControlCenter, NowPlayingPopover, WeatherPopover

  // System Overlays
  MISSION_CONTROL: 60,
  NOTIFICATION_CENTER_BACKDROP: 65,
  NOTIFICATION_CENTER: 70,
  NOTIFICATION_STACK: 75, // Toast banners

  // Interactive System Modals & Dragging
  QUICK_LOOK: 80,
  DRAG_PILL: 85,
  APP_SWITCHER: 90,
  SPOTLIGHT: 100,
  CONTEXT_MENU: 110,
  PRESENTATION_FULLSCREEN: 150,

  // Ultimate Security Layer (Blocks everything else when locked or sleeping)
  LOCK_SCREEN: 200,
  SLEEP_SCREEN: 210,
} as const;
