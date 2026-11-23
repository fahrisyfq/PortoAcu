import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function initProgressBar(): void {
  const bar = document.querySelector<HTMLElement>('[data-scroll-progress]');
  if (!bar) return;

  gsap.set(bar, { scaleX: 0, transformOrigin: '0 50%' });

  ScrollTrigger.create({
    start: 0,
    end: 'max',
    onUpdate: (self) => {
      gsap.set(bar, { scaleX: self.progress });
    },
  });
}

function initHeaderState(): void {
  const header = document.querySelector<HTMLElement>('.site-header');
  if (!header) return;

  let ticking = false;
  const update = (): void => {
    header.classList.toggle('is-scrolled', window.scrollY > 16);
    ticking = false;
  };

  update();
  window.addEventListener(
    'scroll',
    () => {
      if (ticking) return;
      ticking = true;
      window.requestAnimationFrame(update);
    },
    { passive: true },
  );
}

function initCounters(): void {
  const counters = gsap.utils.toArray<HTMLElement>('[data-counter]');

  counters.forEach((element) => {
    const target = Number(element.dataset.counter ?? 0);
    const suffix = element.dataset.counterSuffix ?? '';
    if (!Number.isFinite(target)) return;

    const state = { value: 0 };
    element.textContent = `0${suffix}`;

    gsap.to(state, {
      value: target,
      duration: 1.7,
      ease: 'power2.out',
      snap: { value: 1 },
      onUpdate: () => {
        element.textContent = `${Math.round(state.value)}${suffix}`;
      },
      scrollTrigger: {
        trigger: element,
        start: 'top 92%',
        once: true,
      },
    });
  });
}

function initParallax(): void {
  if (!window.matchMedia('(min-width: 768px)').matches) return;

  gsap.utils.toArray<HTMLElement>('[data-parallax]').forEach((element) => {
    const speed = Number(element.dataset.parallax ?? 0.08);
    const trigger =
      element.closest<HTMLElement>('[data-parallax-scope]') ??
      element.parentElement ??
      element;

    gsap.to(element, {
      yPercent: speed * 100,
      ease: 'none',
      scrollTrigger: {
        trigger,
        start: 'top bottom',
        end: 'bottom top',
        scrub: 0.6,
        invalidateOnRefresh: true,
      },
    });
  });
}

function initMotion(): void {
  const heroTimeline = gsap.timeline({
    defaults: { ease: 'power3.out', duration: 0.9 },
    delay: 0.12,
  });

  heroTimeline.from('[data-hero-item]', {
    y: 24,
    autoAlpha: 0,
    stagger: 0.085,
  });

  // Keep the visual fully opaque so it can paint immediately as the LCP
  // candidate. Only a small translate is animated here.
  heroTimeline.from(
    '[data-hero-visual]',
    { y: 18, duration: 1.1, ease: 'power2.out' },
    0,
  );

  gsap.utils.toArray<HTMLElement>('[data-reveal]').forEach((element) => {
    gsap.from(element, {
      y: 32,
      autoAlpha: 0,
      duration: 0.9,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: element,
        start: 'top 86%',
        once: true,
      },
    });
  });

  gsap.utils.toArray<HTMLElement>('[data-stagger]').forEach((group) => {
    const items = group.querySelectorAll<HTMLElement>('[data-stagger-item]');
    if (!items.length) return;

    gsap.from(items, {
      y: 30,
      autoAlpha: 0,
      duration: 0.8,
      ease: 'power3.out',
      stagger: 0.1,
      scrollTrigger: {
        trigger: group,
        start: 'top 84%',
        once: true,
      },
    });
  });

  initCounters();
  initParallax();
}

export function initAnimations(): void {
  if (typeof window === 'undefined') return;

  initProgressBar();
  initHeaderState();

  const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY).matches;

  if (reducedMotion) {
    // Respect the OS setting: no reveal, counter, or parallax animation.
    return;
  }

  const context = gsap.context(() => {
    initMotion();
  }, document.documentElement);

  const refresh = (): void => {
    ScrollTrigger.refresh();
  };

  window.addEventListener('load', refresh, { once: true });
  document.fonts?.ready.then(refresh).catch(() => {
    // Font loading support is optional; the refresh above is enough.
  });

  const cleanup = (): void => {
    context.revert();
    ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
  };

  window.addEventListener('pagehide', cleanup, { once: true });
  document.addEventListener('astro:before-swap', cleanup, { once: true });
}

initAnimations();
