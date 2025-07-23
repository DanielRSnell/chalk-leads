/**
 * Application constants and configuration
 */

// Mapbox Configuration
export const MAPBOX_TOKEN = 'pk.eyJ1IjoidW1icmFsLWFpIiwiYSI6ImNtZGc1OGdlYTBrbWgyaXB0bnM4a3l4dWcifQ.FqroeYg9fv49gSa2JPWKRQ';

export const PANEL_POSITIONS = {
  LEFT: 'left',
  RIGHT: 'right',
  CENTER: 'center'
};

export const THEMES = {
  DARK: 'dark',
  LIGHT: 'light',
  AUTO: 'auto'
};

export const KEYBOARD_SHORTCUTS = {
  TOGGLE_PANEL: 'cmd+`',
  CLOSE_PANEL: 'escape',
  NAVIGATE_UP: 'arrowup',
  NAVIGATE_DOWN: 'arrowdown',
  SELECT_COMMAND: 'enter'
};

export const DEMO_COMMANDS = [
  {
    id: 'working',
    title: 'Shadow Plugin Boilerplate is Working! 🎉',
    description: 'The React Shadow DOM architecture is successfully loaded',
    icon: '✅',
    keywords: ['working', 'react', 'shadow', 'dom'],
    category: 'status'
  },
  {
    id: 'zustand',
    title: 'Zustand State Management Active',
    description: 'State is persisted to localStorage and synced across tabs',
    icon: '🐻',
    keywords: ['zustand', 'state', 'management', 'localStorage'],
    category: 'status'
  },
  {
    id: 'tailwind',
    title: 'Tailwind CSS API Integration',
    description: 'Styles are loaded dynamically from WordPress API into Shadow DOM',
    icon: '🎨',
    keywords: ['tailwind', 'css', 'api', 'styles'],
    category: 'status'
  },
  {
    id: 'radix',
    title: 'Radix UI Components Active',
    description: 'Dialog, Tabs, Switch components loaded and accessible',
    icon: '⚡',
    keywords: ['radix', 'ui', 'components', 'accessibility'],
    category: 'ui'
  },
  {
    id: 'isolation',
    title: 'Style Isolation Working',
    description: 'Shadow DOM prevents WordPress style conflicts',
    icon: '🛡️',
    keywords: ['isolation', 'shadow', 'dom', 'styles'],
    category: 'technical'
  },
  {
    id: 'api',
    title: 'WordPress API Ready',
    description: 'REST endpoints configured and ready for data exchange',
    icon: '🔌',
    keywords: ['api', 'wordpress', 'rest', 'endpoints'],
    category: 'wordpress'
  },
  {
    id: 'settings',
    title: 'Open Settings Panel',
    description: 'Configure plugin preferences and demo options',
    icon: '⚙️',
    keywords: ['settings', 'preferences', 'config'],
    category: 'action',
    action: 'open-settings'
  },
  {
    id: 'export',
    title: 'Export Settings',
    description: 'Download current settings as JSON file',
    icon: '📤',
    keywords: ['export', 'download', 'settings', 'json'],
    category: 'action',
    action: 'export-settings'
  },
  {
    id: 'reload',
    title: 'Reload Tailwind Styles',
    description: 'Refresh CSS from the WordPress API',
    icon: '🔄',
    keywords: ['reload', 'refresh', 'tailwind', 'css'],
    category: 'action',
    action: 'reload-styles'
  }
];

export const PANEL_ANIMATIONS = {
  SLIDE: {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: 100 },
    transition: { type: 'spring', damping: 25, stiffness: 200 }
  },
  FADE: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
    transition: { duration: 0.2 }
  },
  SCALE: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  }
};

export const API_ENDPOINTS = {
  DATA: 'data',
  TAILWIND_STYLES: 'tailwind-styles'
};

export const STORAGE_KEYS = {
  PLUGIN_SETTINGS: 'shadow-plugin-storage',
  TEMP_DATA: 'shadow-plugin-temp'
};

export const DEFAULT_SETTINGS = {
  enableNotifications: false,
  theme: THEMES.DARK,
  enableKeyboardShortcuts: true,
  autoOpenPanel: true,
  panelWidth: 500,
  enableAnimations: true
};