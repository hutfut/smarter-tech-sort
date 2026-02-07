/** Classification stacks for package dispatch. */
export type Stack = "STANDARD" | "SPECIAL" | "REJECTED";

// Threshold constants
export const VOLUME_THRESHOLD = 1_000_000; // cm³
export const DIMENSION_THRESHOLD = 150;     // cm
export const MASS_THRESHOLD = 20;           // kg

/**
 * Asserts that `value` is a finite, positive number.
 * Throws an error identifying the parameter on failure.
 */
function assertPositiveFinite(name: string, value: unknown): asserts value is number {
  if (typeof value !== "number") {
    throw new TypeError(
      `Invalid ${name}: expected a number but received ${typeof value} (${String(value)})`
    );
  }
  if (!Number.isFinite(value)) {
    throw new RangeError(
      `Invalid ${name}: expected a finite number but received ${value}`
    );
  }
  if (value <= 0) {
    throw new RangeError(
      `Invalid ${name}: expected a positive number but received ${value}`
    );
  }
}

/**
 * Dispatches a package to the correct stack based on its dimensions and mass.
 *
 * @param width  — package width in centimeters  (must be > 0, finite)
 * @param height — package height in centimeters (must be > 0, finite)
 * @param length — package length in centimeters (must be > 0, finite)
 * @param mass   — package mass in kilograms     (must be > 0, finite)
 * @returns The target stack: "STANDARD", "SPECIAL", or "REJECTED".
 *
 * @throws {TypeError}  if any argument is not a number.
 * @throws {RangeError} if any argument is non-finite, zero, or negative.
 */
export function sort(
  width: number,
  height: number,
  length: number,
  mass: number,
): Stack {
  // --- Guard against bad sensor data ---
  assertPositiveFinite("width", width);
  assertPositiveFinite("height", height);
  assertPositiveFinite("length", length);
  assertPositiveFinite("mass", mass);

  // --- Classification ---
  const volume = width * height * length;

  const isBulky =
    volume >= VOLUME_THRESHOLD ||
    width >= DIMENSION_THRESHOLD ||
    height >= DIMENSION_THRESHOLD ||
    length >= DIMENSION_THRESHOLD;

  const isHeavy = mass >= MASS_THRESHOLD;

  // --- Dispatch ---
  if (isBulky && isHeavy) return "REJECTED";
  if (isBulky || isHeavy) return "SPECIAL";
  return "STANDARD";
}
