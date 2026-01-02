function clampSize(n: number) {
  return Math.max(1, Math.floor(n));
}

export function observeElementSize(
  el: HTMLElement,
  onSize: (width: number, height: number) => void
): () => void {
  const emit = () => onSize(clampSize(el.clientWidth), clampSize(el.clientHeight));

  if (typeof ResizeObserver === 'undefined') {
    // Fallback: best-effort initial emit only.
    emit();
    return () => {};
  }

  const ro = new ResizeObserver(() => emit());
  ro.observe(el);
  emit();

  return () => ro.disconnect();
}


