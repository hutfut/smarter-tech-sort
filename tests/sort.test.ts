import { describe, it, expect } from "vitest";
import {
  sort,
  VOLUME_THRESHOLD,
  DIMENSION_THRESHOLD,
  MASS_THRESHOLD,
} from "../src/sort";

// ---------------------------------------------------------------------------
// Helper — keeps test cases concise
// ---------------------------------------------------------------------------
const pkg = (w: number, h: number, l: number, m: number) => sort(w, h, l, m);

// ---------------------------------------------------------------------------
// 1. STANDARD — neither bulky nor heavy
// ---------------------------------------------------------------------------
describe("STANDARD packages", () => {
  it("small, light package", () => {
    expect(pkg(10, 10, 10, 5)).toBe("STANDARD");
  });

  it("dimensions just under bulky thresholds and mass just under heavy", () => {
    // 149 < 150 (not bulky by dimension)
    // 149 * 44 * 149 = 976_276 < 1_000_000 (not bulky by volume)
    // 19.99 < 20 (not heavy)
    expect(pkg(149, 44, 149, 19.99)).toBe("STANDARD");
  });

  it("volume just under threshold (999,999 cm³)", () => {
    // 99 × 101 × 100.1 ≈ 1,000,899 — too high, use exact factors instead
    // 999 × 1000 × 1 = 999_000 < 1_000_000 and all dims < 150
    expect(pkg(100, 99.99, 100, 10)).toBe("STANDARD"); // 100*99.99*100 = 999_900
  });

  it("mass just under threshold (19 kg)", () => {
    expect(pkg(50, 50, 50, 19)).toBe("STANDARD");
  });

  it("tiny package (1×1×1, 0.01 kg)", () => {
    expect(pkg(1, 1, 1, 0.01)).toBe("STANDARD");
  });

  it("fractional dimensions that stay under thresholds", () => {
    expect(pkg(0.5, 0.5, 0.5, 0.1)).toBe("STANDARD");
  });
});

// ---------------------------------------------------------------------------
// 2. SPECIAL — bulky OR heavy, but not both
// ---------------------------------------------------------------------------
describe("SPECIAL packages", () => {
  describe("bulky by volume only (all dimensions < 150)", () => {
    it("volume exactly at threshold (1,000,000 cm³)", () => {
      // 100 × 100 × 100 = 1_000_000  — all dims < 150
      expect(pkg(100, 100, 100, 10)).toBe("SPECIAL");
    });

    it("volume just over threshold", () => {
      expect(pkg(100, 100, 100.01, 10)).toBe("SPECIAL");
    });
  });

  describe("bulky by single dimension (volume may be under threshold)", () => {
    it("width exactly 150", () => {
      expect(pkg(150, 1, 1, 1)).toBe("SPECIAL");
    });

    it("height exactly 150", () => {
      expect(pkg(1, 150, 1, 1)).toBe("SPECIAL");
    });

    it("length exactly 150", () => {
      expect(pkg(1, 1, 150, 1)).toBe("SPECIAL");
    });

    it("dimension well over 150", () => {
      expect(pkg(300, 1, 1, 1)).toBe("SPECIAL");
    });
  });

  describe("bulky by both volume and dimension simultaneously", () => {
    it("large single dimension pushes volume over too", () => {
      // 200 × 100 × 100 = 2_000_000, dim 200 >= 150
      expect(pkg(200, 100, 100, 10)).toBe("SPECIAL");
    });
  });

  describe("heavy only (not bulky)", () => {
    it("mass exactly at threshold (20 kg)", () => {
      expect(pkg(10, 10, 10, 20)).toBe("SPECIAL");
    });

    it("mass well over threshold", () => {
      expect(pkg(10, 10, 10, 100)).toBe("SPECIAL");
    });

    it("mass just over threshold (20.01 kg)", () => {
      expect(pkg(10, 10, 10, 20.01)).toBe("SPECIAL");
    });
  });
});

// ---------------------------------------------------------------------------
// 3. REJECTED — both bulky AND heavy
// ---------------------------------------------------------------------------
describe("REJECTED packages", () => {
  it("bulky by volume + heavy", () => {
    expect(pkg(100, 100, 100, 20)).toBe("REJECTED");
  });

  it("bulky by dimension + heavy", () => {
    expect(pkg(150, 1, 1, 20)).toBe("REJECTED");
  });

  it("bulky by both volume and dimension + heavy", () => {
    expect(pkg(200, 200, 200, 25)).toBe("REJECTED");
  });

  it("all dimensions at threshold + mass at threshold", () => {
    expect(pkg(150, 150, 150, 20)).toBe("REJECTED");
  });

  it("extreme values — very large and very heavy", () => {
    expect(pkg(1000, 1000, 1000, 500)).toBe("REJECTED");
  });
});

// ---------------------------------------------------------------------------
// 4. Boundary precision — exact threshold transitions
// ---------------------------------------------------------------------------
describe("boundary precision", () => {
  describe("volume threshold (1,000,000 cm³)", () => {
    it("volume = 999,999 → STANDARD", () => {
      // 999 × 1000 × 1 = 999_000
      // Use: 99.9999 × 100 × 100 = 999_999
      expect(pkg(99.9999, 100, 100, 10)).toBe("STANDARD");
    });

    it("volume = 1,000,000 → SPECIAL", () => {
      expect(pkg(100, 100, 100, 10)).toBe("SPECIAL");
    });

    it("volume = 1,000,001 → SPECIAL", () => {
      expect(pkg(100, 100, 100.01, 10)).toBe("SPECIAL");
    });
  });

  describe("dimension threshold (150 cm)", () => {
    it("dimension = 149 → not bulky (STANDARD if also not heavy)", () => {
      expect(pkg(149, 1, 1, 1)).toBe("STANDARD");
    });

    it("dimension = 149.99 → not bulky", () => {
      expect(pkg(149.99, 1, 1, 1)).toBe("STANDARD");
    });

    it("dimension = 150 → bulky (SPECIAL)", () => {
      expect(pkg(150, 1, 1, 1)).toBe("SPECIAL");
    });

    it("dimension = 150.01 → bulky (SPECIAL)", () => {
      expect(pkg(150.01, 1, 1, 1)).toBe("SPECIAL");
    });
  });

  describe("mass threshold (20 kg)", () => {
    it("mass = 19 → not heavy", () => {
      expect(pkg(10, 10, 10, 19)).toBe("STANDARD");
    });

    it("mass = 19.99 → not heavy", () => {
      expect(pkg(10, 10, 10, 19.99)).toBe("STANDARD");
    });

    it("mass = 20 → heavy (SPECIAL)", () => {
      expect(pkg(10, 10, 10, 20)).toBe("SPECIAL");
    });

    it("mass = 20.01 → heavy (SPECIAL)", () => {
      expect(pkg(10, 10, 10, 20.01)).toBe("SPECIAL");
    });
  });

  describe("simultaneous boundary — both thresholds exactly met", () => {
    it("volume exactly 1M + mass exactly 20 → REJECTED", () => {
      expect(pkg(100, 100, 100, 20)).toBe("REJECTED");
    });

    it("dimension exactly 150 + mass exactly 20 → REJECTED", () => {
      expect(pkg(150, 1, 1, 20)).toBe("REJECTED");
    });
  });
});

// ---------------------------------------------------------------------------
// 5. Floating-point edge cases
// ---------------------------------------------------------------------------
describe("floating-point edge cases", () => {
  it("very small fractional dimensions", () => {
    expect(pkg(0.001, 0.001, 0.001, 0.001)).toBe("STANDARD");
  });

  it("large volume from many small multiplications stays accurate", () => {
    // 99.9999 * 100 * 100 = 999_999 (not bulky)
    const result = pkg(99.9999, 100, 100, 10);
    expect(result).toBe("STANDARD");
  });
});

// ---------------------------------------------------------------------------
// 6. Input validation — hardened edge cases
// ---------------------------------------------------------------------------
describe("input validation", () => {
  describe("non-number types", () => {
    it("throws TypeError for string width", () => {
      expect(() => (sort as any)("10", 10, 10, 5)).toThrow(TypeError);
    });

    it("throws TypeError for null height", () => {
      expect(() => (sort as any)(10, null, 10, 5)).toThrow(TypeError);
    });

    it("throws TypeError for undefined length", () => {
      expect(() => (sort as any)(10, 10, undefined, 5)).toThrow(TypeError);
    });

    it("throws TypeError for boolean mass", () => {
      expect(() => (sort as any)(10, 10, 10, true)).toThrow(TypeError);
    });

    it("throws TypeError for object argument", () => {
      expect(() => (sort as any)({ w: 10 }, 10, 10, 5)).toThrow(TypeError);
    });

    it("throws TypeError for array argument", () => {
      expect(() => (sort as any)([10], 10, 10, 5)).toThrow(TypeError);
    });
  });

  describe("non-finite numbers", () => {
    it("throws RangeError for NaN width", () => {
      expect(() => sort(NaN, 10, 10, 5)).toThrow(RangeError);
    });

    it("throws RangeError for Infinity height", () => {
      expect(() => sort(10, Infinity, 10, 5)).toThrow(RangeError);
    });

    it("throws RangeError for -Infinity length", () => {
      expect(() => sort(10, 10, -Infinity, 5)).toThrow(RangeError);
    });

    it("throws RangeError for NaN mass", () => {
      expect(() => sort(10, 10, 10, NaN)).toThrow(RangeError);
    });
  });

  describe("zero and negative values", () => {
    it("throws RangeError for zero width", () => {
      expect(() => sort(0, 10, 10, 5)).toThrow(RangeError);
    });

    it("throws RangeError for negative height", () => {
      expect(() => sort(10, -5, 10, 5)).toThrow(RangeError);
    });

    it("throws RangeError for zero mass", () => {
      expect(() => sort(10, 10, 10, 0)).toThrow(RangeError);
    });

    it("throws RangeError for negative mass", () => {
      expect(() => sort(10, 10, 10, -1)).toThrow(RangeError);
    });

    it("throws RangeError for negative length", () => {
      expect(() => sort(10, 10, -10, 5)).toThrow(RangeError);
    });
  });

  describe("missing arguments", () => {
    it("throws when called with no arguments", () => {
      expect(() => (sort as any)()).toThrow();
    });

    it("throws when called with only three arguments", () => {
      expect(() => (sort as any)(10, 10, 10)).toThrow();
    });
  });

  describe("error messages are descriptive", () => {
    it("includes parameter name in TypeError", () => {
      expect(() => (sort as any)("bad", 10, 10, 5)).toThrow(/width/);
    });

    it("includes parameter name in RangeError for negative value", () => {
      expect(() => sort(10, -3, 10, 5)).toThrow(/height/);
    });

    it("includes the bad value in the error message", () => {
      expect(() => sort(10, 10, 10, NaN)).toThrow(/NaN/);
    });
  });
});

// ---------------------------------------------------------------------------
// 7. Combinatorial coverage — every bulky variant × heavy/not-heavy
// ---------------------------------------------------------------------------
describe("combinatorial coverage", () => {
  // For each way a package can be bulky, verify both SPECIAL and REJECTED

  const bulkyVariants: [string, number, number, number][] = [
    ["volume only (dims < 150)", 100, 100, 100],        // vol = 1M, no dim >= 150
    ["width >= 150 (vol < 1M)", 150, 1, 1],             // dim triggers, vol tiny
    ["height >= 150 (vol < 1M)", 1, 150, 1],
    ["length >= 150 (vol < 1M)", 1, 1, 150],
    ["volume + dimension", 200, 100, 100],               // both triggers
  ];

  for (const [label, w, h, l] of bulkyVariants) {
    it(`bulky (${label}) + light → SPECIAL`, () => {
      expect(sort(w, h, l, 5)).toBe("SPECIAL");
    });

    it(`bulky (${label}) + heavy → REJECTED`, () => {
      expect(sort(w, h, l, 20)).toBe("REJECTED");
    });
  }

  it("not bulky + heavy → SPECIAL", () => {
    expect(sort(10, 10, 10, 25)).toBe("SPECIAL");
  });

  it("not bulky + not heavy → STANDARD", () => {
    expect(sort(10, 10, 10, 5)).toBe("STANDARD");
  });
});
