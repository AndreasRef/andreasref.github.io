/**
 * Loads Danish demographic CSV data (names by birth year, income by age+gender)
 * and provides life expectancy lookups from hardcoded actuarial tables.
 *
 * Usage:
 *   const demo = new DemographicLookup();
 *   await demo.init();
 *   const { name, income, yearsLeft } = demo.lookup(age, genderMale);
 */
export class DemographicLookup {
  constructor() {
    this.names = {};    // { year: { male: 'Lars', female: 'Hanne' } }
    this.incomes = {};  // { age: { male: 408700, female: 351600 } }
    this.ready = false;
  }

  async init() {
    const [namesText, incomeText] = await Promise.all([
      fetch('data/danish_top1_names_1926-2025.csv').then(r => r.text()),
      fetch('data/denmark_median_income_by_age_gender_2024.csv').then(r => r.text()),
    ]);

    // Parse names CSV
    for (const line of namesText.trim().split('\n').slice(1)) {
      const [year, male, female] = line.split(',');
      const y = parseInt(year, 10);
      if (!isNaN(y) && male !== 'N/A') {
        this.names[y] = { male: male.trim(), female: female.trim() };
      }
    }

    // Parse income CSV
    for (const line of incomeText.trim().split('\n').slice(1)) {
      const [age, maleInc, femaleInc] = line.split(',');
      const a = parseInt(age, 10);
      if (!isNaN(a)) {
        this.incomes[a] = {
          male: parseInt(maleInc, 10) || 0,
          female: parseInt(femaleInc, 10) || 0,
        };
      }
    }

    this.ready = true;
  }

  /**
   * Look up demographic data for a given age and gender.
   * @param {number} age - estimated age (continuous float)
   * @param {number} genderMale - male probability (0-1, >0.5 = male)
   * @returns {{ name: string, income: string, yearsLeft: string }}
   */
  lookup(age, genderMale) {
    if (!this.ready) return { name: '\u2014', income: '\u2014', yearsLeft: '\u2014' };

    const isMale = genderMale > 0.5;
    const gKey = isMale ? 'male' : 'female';
    const clampedAge = Math.max(0, Math.min(100, age));

    // Name: birth year = 2026 - age, clamped to CSV range
    const birthYear = Math.max(1926, Math.min(2024, 2026 - Math.round(clampedAge)));
    const nameEntry = this.names[birthYear];
    const name = nameEntry ? nameEntry[gKey] : '\u2014';

    // Income: interpolated between floor/ceil ages
    const aLo = Math.floor(clampedAge);
    const aHi = Math.min(100, aLo + 1);
    const frac = clampedAge - aLo;
    const incLo = this.incomes[aLo] ? this.incomes[aLo][gKey] : 0;
    const incHi = this.incomes[aHi] ? this.incomes[aHi][gKey] : incLo;
    const dkkAnnual = incLo + frac * (incHi - incLo);
    const dkkMonthly = dkkAnnual / 12;
    const income = (dkkMonthly / 1000).toFixed(1) + ' k';

    // Years left: interpolated life expectancy - continuous age
    const le = isMale ? LIFE_EXPECTANCY_MALE : LIFE_EXPECTANCY_FEMALE;
    const leLo = le[aLo];
    const leHi = le[aHi];
    const totalLE = leLo + frac * (leHi - leLo);
    const yearsLeft = Math.max(0, totalLE - clampedAge).toFixed(1);

    return { name, income, yearsLeft };
  }
}

// --- Life expectancy at age X (total expected lifespan), Denmark 2024 ---
// Linearly interpolated from reference points:
//   Age 0: M=80.6, F=84.2 | Age 20: M=80.9, F=84.5
//   Age 40: M=81.4, F=84.7 | Age 60: M=83.1, F=85.9
//   Age 80: M=88.5, F=90.0 | Age 100: M=101.8, F=102.2

function buildLifeExpectancy(stops) {
  const le = new Float32Array(101);
  for (let i = 0; i < stops.length - 1; i++) {
    const [a0, v0] = stops[i];
    const [a1, v1] = stops[i + 1];
    for (let age = a0; age <= a1; age++) {
      const t = (age - a0) / (a1 - a0);
      le[age] = v0 + t * (v1 - v0);
    }
  }
  return le;
}

const LIFE_EXPECTANCY_MALE = buildLifeExpectancy([
  [0, 80.6], [20, 80.9], [40, 81.4], [60, 83.1], [80, 88.5], [100, 101.8],
]);

const LIFE_EXPECTANCY_FEMALE = buildLifeExpectancy([
  [0, 84.2], [20, 84.5], [40, 84.7], [60, 85.9], [80, 90.0], [100, 102.2],
]);
