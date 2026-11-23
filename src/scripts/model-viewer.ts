const MODEL_VIEWER_CDN =
  'https://cdn.jsdelivr.net/npm/@google/model-viewer@4.4.0/dist/model-viewer.min.js';

const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(
      window.WebGLRenderingContext &&
        (canvas.getContext('webgl2') || canvas.getContext('webgl')),
    );
  } catch {
    return false;
  }
}

function withTimeout<T>(promise: Promise<T>, milliseconds: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const timer = window.setTimeout(
      () => reject(new Error('Timed out waiting for model-viewer.')),
      milliseconds,
    );
    promise.then(
      (value) => {
        window.clearTimeout(timer);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timer);
        reject(error);
      },
    );
  });
}

function initModelViewer(): void {
  const stage = document.querySelector<HTMLElement>('[data-model-stage]');
  if (!stage) return;

  const viewer = stage.querySelector<HTMLElement>('model-viewer');
  const fallback = stage.querySelector<HTMLElement>('[data-model-fallback]');

  const showFallback = (): void => {
    stage.classList.add('is-fallback');
    stage.classList.remove('is-ready');
    fallback?.removeAttribute('hidden');
  };

  if (!viewer) {
    showFallback();
    return;
  }

  if (!supportsWebGL()) {
    showFallback();
    return;
  }

  const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
  let loaded = false;

  const syncAutoRotate = (visible: boolean): void => {
    if (motionQuery.matches) {
      viewer.removeAttribute('auto-rotate');
      return;
    }
    if (visible) {
      viewer.setAttribute('auto-rotate', '');
    } else {
      viewer.removeAttribute('auto-rotate');
    }
  };

  // Pause auto-rotation when the model is off-screen to save battery/GPU.
  const visibilityObserver = new IntersectionObserver(
    ([entry]) => syncAutoRotate(Boolean(entry?.isIntersecting)),
    { threshold: 0.05 },
  );
  visibilityObserver.observe(stage);

  motionQuery.addEventListener('change', () => syncAutoRotate(true));

  viewer.addEventListener('load', () => {
    loaded = true;
    stage.classList.add('is-ready');
    stage.classList.remove('is-fallback');
  });

  viewer.addEventListener('error', showFallback);

  const loadScript = (): void => {
    const existing = document.querySelector<HTMLScriptElement>(
      'script[data-model-viewer-loader]',
    );

    const afterLoaded = async (): Promise<void> => {
      try {
        await withTimeout(
          customElements.whenDefined('model-viewer') as Promise<unknown>,
          15000,
        );
        if (!loaded) {
          // The element now upgrades and starts loading its poster/model.
          stage.classList.remove('is-fallback');
        }
      } catch {
        showFallback();
      }
    };

    if (existing) {
      void afterLoaded();
      return;
    }

    const script = document.createElement('script');
    script.type = 'module';
    script.src = MODEL_VIEWER_CDN;
    script.crossOrigin = 'anonymous';
    script.dataset.modelViewerLoader = 'true';
    script.addEventListener('load', () => void afterLoaded());
    script.addEventListener('error', showFallback);
    document.head.append(script);
  };

  if ('IntersectionObserver' in window) {
    const loadObserver = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          loadScript();
          loadObserver.disconnect();
        }
      },
      { rootMargin: '700px 0px' },
    );
    loadObserver.observe(stage);
  } else {
    loadScript();
  }
}

initModelViewer();
