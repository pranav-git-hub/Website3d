export function isMobile(): boolean {
  // Prefer capability-based detection over UA sniffing.
  const coarse = window.matchMedia?.('(pointer: coarse)')?.matches ?? false;
  const narrow = window.matchMedia?.('(max-width: 768px)')?.matches ?? false;
  return coarse || narrow;
}
