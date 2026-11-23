import { useEffect, useRef, useState } from 'react';
import { site } from '../../data/site';
import {
  getCurrentTheme,
  THEME_EVENT,
  toggleTheme,
  type Theme,
} from '../../scripts/theme';
import {
  MoonIcon,
  SunIcon,
  socialIcon,
} from './Icons';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState('');
  const [theme, setTheme] = useState<Theme>('dark');
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTheme(getCurrentTheme());

    const onThemeChange = (event: Event) => {
      const detail = (event as CustomEvent<Theme>).detail;
      if (detail === 'dark' || detail === 'light') {
        setTheme(detail);
      }
    };

    window.addEventListener(THEME_EVENT, onThemeChange);
    return () => window.removeEventListener(THEME_EVENT, onThemeChange);
  }, []);

  useEffect(() => {
    const sections = site.nav
      .map((item) => document.querySelector<HTMLElement>(item.href))
      .filter((section): section is HTMLElement => Boolean(section));

    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActive(`#${entry.target.id}`);
          }
        });
      },
      { rootMargin: '-32% 0px -58% 0px', threshold: 0 },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!open) return;

    document.body.classList.add('nav-locked');
    const firstLink = menuRef.current?.querySelector<HTMLAnchorElement>('a');
    const focusTimer = window.setTimeout(() => firstLink?.focus(), 60);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        toggleRef.current?.focus();
      }
    };

    const onResize = () => {
      if (window.innerWidth >= 1024) setOpen(false);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);

    return () => {
      window.clearTimeout(focusTimer);
      document.body.classList.remove('nav-locked');
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  const handleTheme = () => {
    setTheme(toggleTheme());
  };

  const closeMenu = () => setOpen(false);

  return (
    <header className="site-header">
      <div className="container nav">
        <a
          className="brand"
          href="#top"
          onClick={closeMenu}
        >
          <span className="brand__mark" aria-hidden="true">
            {site.initials}
          </span>
          <span className="brand__text">
            <span className="brand__name">{site.name}</span>
            <span className="brand__meta">Portofolio / 2026</span>
          </span>
        </a>

        <nav className="nav__desktop" aria-label="Navigasi utama">
          {site.nav.map((item) => {
            const isActive = active === item.href;
            return (
              <a
                key={item.href}
                className={`nav__link${isActive ? ' is-active' : ''}`}
                href={item.href}
                aria-current={isActive ? 'true' : undefined}
              >
                {item.label}
              </a>
            );
          })}
        </nav>

        <div className="nav__actions">
          <button
            type="button"
            className="theme-toggle"
            onClick={handleTheme}
            aria-label={
              theme === 'dark' ? 'Aktifkan mode terang' : 'Aktifkan mode gelap'
            }
            title={theme === 'dark' ? 'Mode terang' : 'Mode gelap'}
          >
            <SunIcon className="theme-toggle__sun" />
            <MoonIcon className="theme-toggle__moon" />
          </button>

          <button
            ref={toggleRef}
            type="button"
            className="nav__toggle"
            aria-expanded={open}
            aria-controls="mobile-navigation"
            aria-label={open ? 'Tutup menu' : 'Buka menu'}
            onClick={() => setOpen((value) => !value)}
          >
            <span aria-hidden="true" />
            <span aria-hidden="true" />
            <span aria-hidden="true" />
          </button>
        </div>
      </div>

      <div
        ref={menuRef}
        id="mobile-navigation"
        className={`nav-mobile${open ? ' is-open' : ''}`}
        aria-hidden={!open}
      >
        <nav aria-label="Navigasi seluler">
          <ul className="nav-mobile__links">
            {site.nav.map((item, index) => (
              <li key={item.href}>
                <a
                  className="nav-mobile__link"
                  href={item.href}
                  onClick={closeMenu}
                >
                  <span aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {item.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="nav-mobile__foot">
          <p className="nav-mobile__note">{site.status}</p>
          <ul className="nav-mobile__socials">
            {site.socials.map((social) => {
              const Icon = socialIcon(social.icon);
              return (
                <li key={social.label}>
                  <a
                    className="icon-btn"
                    href={social.href}
                    aria-label={social.label}
                    target={social.href.startsWith('http') ? '_blank' : undefined}
                    rel={
                      social.href.startsWith('http')
                        ? 'noopener noreferrer'
                        : undefined
                    }
                  >
                    <Icon />
                  </a>
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    </header>
  );
}
