const rawBase = import.meta.env.BASE_URL || '/';
const base = rawBase === '/' ? '' : rawBase.replace(/\/$/, '');

/**
 * Prefixes a public asset path with Astro's configured base path.
 * Works for both root deployments and GitHub Pages project sites.
 */
export function asset(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${base}${normalized}`;
}

export const basePath = base;
