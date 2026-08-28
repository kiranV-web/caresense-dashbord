/** Deterministic PRNG (linear congruential) so mock data is stable across renders. */
export function createSeededRandom(seed: number) {
  let state = seed;
  return () => {
    state = (state * 9301 + 49297) % 233280;
    return state / 233280;
  };
}
