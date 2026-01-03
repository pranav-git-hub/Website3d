import { useEffect } from 'react';

import { About } from '../components/About';
import { Landing } from '../components/Landing';
import { TopNav } from '../components/TopNav';

export function HomePage() {
  useEffect(() => {
    const base = import.meta.env.BASE_URL || '/';
    document.documentElement.style.setProperty('--site-bg', `url("${base}assets/intro_bg.PNG")`);
  }, []);

  return (
    <>
      <TopNav />
      <Landing />
      <About />
    </>
  );
}


