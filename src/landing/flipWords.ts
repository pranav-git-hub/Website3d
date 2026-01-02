export function initFlipWords(root: ParentNode) {
  const el = root.querySelector<HTMLElement>('[data-flip-words]');
  if (!el) return () => {};

  const raw = el.dataset.flipWords ?? '';
  const words = raw
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);
  if (words.length <= 1) return () => {};

  let i = 0;
  let timer = 0;

  const tick = () => {
    i = (i + 1) % words.length;
    el.animate(
      [
        { opacity: 0, transform: 'translateY(8px)' },
        { opacity: 1, transform: 'translateY(0px)' },
      ],
      { duration: 280, easing: 'ease-out' }
    );
    el.textContent = words[i];
  };

  timer = window.setInterval(tick, 1600);
  return () => window.clearInterval(timer);
}


