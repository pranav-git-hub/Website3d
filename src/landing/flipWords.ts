export function initFlipWords(root: ParentNode) {
  const el = root.querySelector<HTMLElement>('[data-flip-words]');
  if (!el) return () => {};

  const raw = el.dataset.flipWords ?? '';
  const words = raw
    .split(',')
    .map((w) => w.trim())
    .filter(Boolean);
  if (words.length <= 1) return () => {};

  const duration = Number(el.dataset.flipDuration ?? '3000') || 3000;
  const exitMs = 520; // keep in sync with CSS animation durations
  const wordDelay = 300; // matches the framer-motion word stagger intent
  const letterDelay = 50;

  let currentWord = words[0];
  let isAnimating = false;
  let timeout = 0;
  let exitTimeout = 0;
  let disposed = false;

  const buildWordNode = (text: string) => {
    const node = document.createElement('span');
    node.className = 'flipword-word is-entering';

    // Support multi-word phrases by splitting on spaces first.
    const parts = text.split(' ');
    parts.forEach((part, wordIndex) => {
      // Each “word”
      const wordSpan = document.createElement('span');
      wordSpan.style.whiteSpace = 'nowrap';
      wordSpan.style.display = 'inline-block';
      wordSpan.style.marginRight = wordIndex === parts.length - 1 ? '0' : '0.35ch';

      [...part].forEach((letter, letterIndex) => {
        const letterSpan = document.createElement('span');
        letterSpan.className = 'flipword-letter';
        letterSpan.style.animationDelay = `${wordIndex * wordDelay + letterIndex * letterDelay}ms`;
        letterSpan.textContent = letter;
        wordSpan.appendChild(letterSpan);
      });
      node.appendChild(wordSpan);
    });

    return node;
  };

  const renderInitial = () => {
    el.textContent = '';
    const node = buildWordNode(currentWord);
    el.appendChild(node);
  };

  const startAnimation = () => {
    if (disposed) return;
    if (isAnimating) return;
    isAnimating = true;

    const next = words[words.indexOf(currentWord) + 1] || words[0];
    currentWord = next;

    const exiting = el.firstElementChild as HTMLElement | null;
    if (exiting) {
      exiting.classList.remove('is-entering');
      exiting.classList.add('is-exiting');
    }

    const entering = buildWordNode(currentWord);
    el.appendChild(entering);

    // remove old after exit completes
    exitTimeout = window.setTimeout(() => {
      if (disposed) return;
      exiting?.remove();
      isAnimating = false;
      schedule();
    }, exitMs);
  };

  const schedule = () => {
    window.clearTimeout(timeout);
    if (!isAnimating) {
      timeout = window.setTimeout(startAnimation, duration);
    }
  };

  renderInitial();
  schedule();
  return () => {
    disposed = true;
    window.clearTimeout(timeout);
    window.clearTimeout(exitTimeout);
  };
}


