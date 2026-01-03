import { useEffect, useRef } from 'react';
import { initLandingParallax } from '../landing/parallax';
import { initFlipWords } from '../landing/flipWords';
import { DarkstarCanvas } from './DarkstarCanvas';

export function Landing() {
  const parallaxRootRef = useRef<HTMLDivElement | null>(null);

  const scrollHalfScreen = () => {
    const startY = window.scrollY || window.pageYOffset;
    const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
    const delta = window.innerHeight * 0.5;
    const targetY = Math.min(maxY, startY + delta);
    const durationMs = 1100; // slower than native smooth scroll

    const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

    const startTime = performance.now();
    const tick = (now: number) => {
      const elapsed = now - startTime;
      const t = Math.min(1, elapsed / durationMs);
      const eased = easeInOutCubic(t);
      const nextY = startY + (targetY - startY) * eased;
      window.scrollTo({ top: nextY });
      if (t < 1) requestAnimationFrame(tick);
    };

    requestAnimationFrame(tick);
  };

  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';

    const disposers: Array<() => void> = [];
    if (parallaxRootRef.current) {
      disposers.push(
        initLandingParallax(parallaxRootRef.current, {
          sky: `${base}assets/sky.jpg`,
          m1: `${base}assets/mountain-1.png`,
          m2: `${base}assets/mountain-2.png`,
          m3: `${base}assets/mountain-3.png`,
          planets: `${base}assets/planets.png`,
        })
      );
    }

    disposers.push(initFlipWords(document));

    return () => {
      for (const d of disposers.splice(0).reverse()) d();
    };
  }, []);

  return (
    <section id="home" className="landing-section" aria-label="Landing">
      <div ref={parallaxRootRef} className="landing-parallax" data-parallax-root>
        <div className="parallax-layer parallax-sky" data-parallax-layer data-layer="sky" />
        <div className="parallax-layer parallax-m3" data-parallax-layer data-layer="m3" />
        <div
          className="parallax-layer parallax-planets"
          data-parallax-layer
          data-layer="planets"
        />
        <div className="parallax-layer parallax-m2" data-parallax-layer data-layer="m2" />
        <div className="parallax-layer parallax-m1" data-parallax-layer data-layer="m1" />
      </div>

      {/* 3D canvas overlay (foreground) */}
      <div id="darkstar-container" className="canvas-host canvas-host--overlay" aria-label="3D Model">
        <DarkstarCanvas />
      </div>

      <div className="landing-content">
        <div className="hero">
          <h1 className="hero-hi">Pranav Arvind Bhile</h1>
          <p className="hero-line">
          Worked with Fortune 500 teams
          <br />
          MIT-published researcher
          <br />
          B.E. in Computer Science, BITS Pilani
          <br />
            
          </p>
          <div className="hero-flip">
            <span className="landing-flip" data-flip-words="ML / AI, Gen AI" data-flip-duration="3000">
              Secure
            </span>
          </div>
          <p className="hero-sub">Engineer</p>
          <div className="hero-socials" aria-label="Social links">
            <a
              className="hero-socials__link"
              href="https://www.linkedin.com/in/pranavbhile/"
              target="_blank"
              rel="noreferrer"
              aria-label="LinkedIn"
              title="LinkedIn"
            >
              <svg
                className="hero-socials__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M19 0H5C2.24 0 0 2.24 0 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5V5c0-2.76-2.24-5-5-5ZM8 19H5V9h3v10ZM6.5 7.73c-.97 0-1.75-.79-1.75-1.76 0-.97.78-1.76 1.75-1.76s1.75.79 1.75 1.76c0 .97-.78 1.76-1.75 1.76ZM20 19h-3v-5.6c0-3.37-4-3.11-4 0V19h-3V9h3v1.53c1.4-2.59 7-2.78 7 2.48V19Z"
                />
              </svg>
            </a>
            <a
              className="hero-socials__link"
              href="mailto:pranavbhile1@gmail.com"
              aria-label="Email"
              title="Email"
            >
              <svg
                className="hero-socials__icon"
                viewBox="0 0 24 24"
                aria-hidden="true"
                focusable="false"
              >
                <path
                  fill="currentColor"
                  d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2Zm0 4-8 5-8-5V6l8 5 8-5v2Z"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>

      <button
        type="button"
        className="hero-scroll"
        onClick={scrollHalfScreen}
        aria-label="Scroll down"
      >
        <span className="hero-scroll__mouse" aria-hidden="true">
          <span className="hero-scroll__wheel" />
        </span>
        <span className="hero-scroll__chevron" aria-hidden="true">
          <svg viewBox="0 0 24 24" focusable="false" aria-hidden="true">
            <path
              fill="currentColor"
              d="M12 16.5a1 1 0 0 1-.7-.29l-6-6a1 1 0 1 1 1.4-1.42L12 14.08l5.3-5.29a1 1 0 1 1 1.4 1.42l-6 6a1 1 0 0 1-.7.29Z"
            />
          </svg>
        </span>
        <span className="hero-scroll__label">Scroll</span>
      </button>
    </section>
  );
}


