export type Theme = 'dark' | 'light';

const STORAGE_KEY = 'porto-theme';
const THEME_COLORS: Record<Theme, string> = {
  dark: '#0a0c10',
  light: '#f7f8fa',
};

export const THEME_EVENT = 'porto-theme-change';

export function isTheme(value: unknown): value is Theme {
  return value === 'dark' || value === 'light';
}

export function getStoredTheme(): Theme | null {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    return isTheme(stored) ? stored : null;
  } catch {
    return null;
  }
}

export function getSystemTheme(): Theme {
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export function getCurrentTheme(): Theme {
  const current = document.documentElement.dataset.theme;
  return isTheme(current) ? current : getSystemTheme();
}

export function applyTheme(
  theme: Theme,
  options: { persist?: boolean; emit?: boolean } = {},
): void {
  const { persist = false, emit = true } = options;
  const root = document.documentElement;

  root.dataset.theme = theme;
  root.style.colorScheme = theme;

  const themeColor = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
  if (themeColor) {
    themeColor.content = THEME_COLORS[theme];
  }

  if (persist) {
    try {
      window.localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      // Storage can be unavailable in private browsing; the theme still works
      // for the current session.
    }
  }

  if (emit) {
    window.dispatchEvent(
      new CustomEvent<Theme>(THEME_EVENT, { detail: theme }),
    );
  }
}

export function toggleTheme(): Theme {
  const next: Theme = getCurrentTheme() === 'dark' ? 'light' : 'dark';
  applyTheme(next, { persist: true });
  return next;
}

/**
 * Keeps the document theme in sync with other tabs and with the OS preference
 * (only while the visitor has not chosen a theme explicitly).
 */
export function initTheme(): void {
  const media = window.matchMedia('(prefers-color-scheme: light)');

  if (!getStoredTheme()) {
    applyTheme(media.matches ? 'light' : 'dark', { emit: false });
  }

  const onSystemChange = (event: MediaQueryListEvent): void => {
    if (!getStoredTheme()) {
      applyTheme(event.matches ? 'light' : 'dark', { emit: true });
    }
  };

  const onStorage = (event: StorageEvent): void => {
    if (event.key !== STORAGE_KEY) return;
    if (isTheme(event.newValue)) {
      applyTheme(event.newValue, { emit: true });
    } else if (event.newValue === null) {
      applyTheme(getSystemTheme(), { emit: true });
    }
  };

  media.addEventListener('change', onSystemChange);
  window.addEventListener('storage', onStorage);
}
