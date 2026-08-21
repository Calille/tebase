/** Deterministic 0…mod-1 bucket from a string. Does not consume the seed RNG. */
export function stableBucket(input: string, mod: number): number {
  if (mod <= 0) return 0;
  let hash = 2166136261;
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0) % mod;
}
