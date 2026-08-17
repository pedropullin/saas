/**
 * Clamped piecewise-linear interpolation — a stand-in for framer-motion's
 * `useTransform(mv, inputRange, outputRange)` array-pair overload, which
 * renders stale/incorrect values on re-render with this framer-motion +
 * React 19 combination (confirmed: the function-callback overload is
 * unaffected). Always drive scroll-linked transforms through this instead:
 * `useTransform(mv, (v) => mapRange(v, IN, OUT))`.
 */
export function mapRange(value: number, input: number[], output: number[]): number {
  if (input.length === 0 || output.length === 0) return value;
  if (input.length === 1) return output[0] ?? value;

  let i = 0;
  while (i < input.length - 2 && value > (input[i + 1] ?? Infinity)) i++;

  const inStart = input[i] ?? 0;
  const inEnd = input[i + 1] ?? inStart + 1;
  const outStart = output[i] ?? 0;
  const outEnd = output[i + 1] ?? outStart;

  const t = inEnd === inStart ? 0 : (value - inStart) / (inEnd - inStart);
  const clampedT = Math.min(1, Math.max(0, t));
  return outStart + clampedT * (outEnd - outStart);
}

/** Same as `mapRange`, but for string outputs that share a single trailing unit ("%", "vh", "vw", "deg" …). */
export function mapRangeUnit(value: number, input: number[], output: string[]): string {
  const first = output[0] ?? "0";
  const unit = first.replace(/-?[\d.]+/, "");
  const nums = output.map((s) => parseFloat(s));
  return `${mapRange(value, input, nums)}${unit}`;
}
