'use client';

import React, { useMemo, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';

type Units = 'metric' | 'imperial';

interface Category {
  id: string;
  label: string;
  min: number;
  max: number;
  color: string;
  text: string;
}

const STANDARD: Category[] = [
  { id: 'under', label: 'Underweight', min: 0, max: 18.5, color: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  { id: 'normal', label: 'Healthy weight', min: 18.5, max: 25, color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'over', label: 'Overweight', min: 25, max: 30, color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  { id: 'ob1', label: 'Obesity class I', min: 30, max: 35, color: 'bg-orange-500', text: 'text-orange-600 dark:text-orange-400' },
  { id: 'ob2', label: 'Obesity class II', min: 35, max: 40, color: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
  { id: 'ob3', label: 'Obesity class III', min: 40, max: 100, color: 'bg-rose-700', text: 'text-rose-700 dark:text-rose-400' },
];

// WHO expert consultation public health action points for Asian populations
const ASIAN: Category[] = [
  { id: 'under', label: 'Underweight', min: 0, max: 18.5, color: 'bg-sky-500', text: 'text-sky-600 dark:text-sky-400' },
  { id: 'normal', label: 'Healthy weight', min: 18.5, max: 23, color: 'bg-emerald-500', text: 'text-emerald-600 dark:text-emerald-400' },
  { id: 'over', label: 'Increased risk range', min: 23, max: 27.5, color: 'bg-amber-500', text: 'text-amber-600 dark:text-amber-400' },
  { id: 'high', label: 'High risk range', min: 27.5, max: 100, color: 'bg-red-500', text: 'text-red-600 dark:text-red-400' },
];

const ACTIVITY = [
  { value: '1.2', label: 'Little or no exercise' },
  { value: '1.375', label: 'Light exercise, 1 to 3 days a week' },
  { value: '1.55', label: 'Moderate exercise, 3 to 5 days a week' },
  { value: '1.725', label: 'Hard exercise, 6 to 7 days a week' },
  { value: '1.9', label: 'Very hard exercise or a physical job' },
];

const GAUGE_MIN = 12;
const GAUGE_MAX = 45;

const StatCard: React.FC<{ label: string; value: string; hint?: string }> = ({ label, value, hint }) => (
  <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900/60">
    <span className="block text-[11px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
      {label}
    </span>
    <span className="mt-1 block text-xl font-extrabold text-slate-900 dark:text-white">{value}</span>
    {hint && <span className="mt-0.5 block text-xs text-slate-500 dark:text-slate-400">{hint}</span>}
  </div>
);

function num(value: string): number {
  const n = parseFloat(value);
  return Number.isFinite(n) ? n : NaN;
}

export const BmiCalculator: React.FC = () => {
  const [units, setUnits] = useState<Units>('metric');
  const [heightCm, setHeightCm] = useState('170');
  const [weightKg, setWeightKg] = useState('70');
  const [heightFt, setHeightFt] = useState('5');
  const [heightIn, setHeightIn] = useState('7');
  const [weightLb, setWeightLb] = useState('154');
  const [showMore, setShowMore] = useState(false);
  const [asianCutoffs, setAsianCutoffs] = useState(false);
  const [age, setAge] = useState('30');
  const [sex, setSex] = useState<'male' | 'female'>('male');
  const [waist, setWaist] = useState('');
  const [activity, setActivity] = useState('1.375');

  const calc = useMemo(() => {
    let hCm: number;
    let wKg: number;
    if (units === 'metric') {
      hCm = num(heightCm);
      wKg = num(weightKg);
    } else {
      hCm = (num(heightFt) * 12 + (num(heightIn) || 0)) * 2.54;
      wKg = num(weightLb) * 0.45359237;
    }
    if (!(hCm >= 50 && hCm <= 250) || !(wKg >= 10 && wKg <= 500)) return null;

    const hM = hCm / 100;
    const bmi = wKg / (hM * hM);
    const cats = asianCutoffs ? ASIAN : STANDARD;
    const category = cats.find((c) => bmi >= c.min && bmi < c.max) ?? cats[cats.length - 1];

    const healthyMinKg = 18.5 * hM * hM;
    const healthyMaxKg = (asianCutoffs ? 22.9 : 24.9) * hM * hM;
    const toKg = (kg: number) => (units === 'metric' ? `${kg.toFixed(1)} kg` : `${(kg / 0.45359237).toFixed(1)} lb`);
    let gap = '';
    if (wKg < healthyMinKg) gap = `${toKg(healthyMinKg - wKg)} below the healthy range`;
    else if (wKg > healthyMaxKg) gap = `${toKg(wKg - healthyMaxKg)} above the healthy range`;
    else gap = 'Inside the healthy range';

    const waistRaw = num(waist);
    const waistCm = Number.isFinite(waistRaw) ? (units === 'metric' ? waistRaw : waistRaw * 2.54) : NaN;
    const whtr = waistCm > 0 ? waistCm / hCm : NaN;

    const ageNum = num(age);
    const inchesOver60 = Math.max(0, hCm / 2.54 - 60);
    const devine = (sex === 'male' ? 50 : 45.5) + 2.3 * inchesOver60;
    const bmr = ageNum > 0 ? 10 * wKg + 6.25 * hCm - 5 * ageNum + (sex === 'male' ? 5 : -161) : NaN;
    const tdee = Number.isFinite(bmr) ? bmr * parseFloat(activity) : NaN;

    return {
      bmi,
      category,
      cats,
      hCm,
      wKg,
      prime: bmi / (asianCutoffs ? 23 : 25),
      ponderal: wKg / (hM * hM * hM),
      healthyMinKg,
      healthyMaxKg,
      gap,
      whtr,
      devine,
      bmr,
      tdee,
      toKg,
      ageNum,
    };
  }, [units, heightCm, weightKg, heightFt, heightIn, weightLb, asianCutoffs, waist, age, sex, activity]);

  const markerPct = calc ? Math.min(100, Math.max(0, ((calc.bmi - GAUGE_MIN) / (GAUGE_MAX - GAUGE_MIN)) * 100)) : 0;

  return (
    <div className="space-y-6">
      <Card className="space-y-5">
        <div className="inline-flex rounded-lg border border-slate-300 p-0.5 dark:border-slate-700" role="tablist" aria-label="Units">
          {(['metric', 'imperial'] as Units[]).map((u) => (
            <button
              key={u}
              type="button"
              role="tab"
              aria-selected={units === u}
              onClick={() => setUnits(u)}
              className={`px-4 py-1.5 text-sm font-semibold rounded-md transition-colors ${
                units === u
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white'
              }`}
            >
              {u === 'metric' ? 'Metric (cm, kg)' : 'Imperial (ft, lb)'}
            </button>
          ))}
        </div>

        {units === 'metric' ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input label="Height (cm)" type="number" inputMode="decimal" value={heightCm} onChange={(e) => setHeightCm(e.target.value)} />
            <Input label="Weight (kg)" type="number" inputMode="decimal" value={weightKg} onChange={(e) => setWeightKg(e.target.value)} />
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            <Input label="Height (ft)" type="number" inputMode="numeric" value={heightFt} onChange={(e) => setHeightFt(e.target.value)} />
            <Input label="Height (in)" type="number" inputMode="decimal" value={heightIn} onChange={(e) => setHeightIn(e.target.value)} />
            <Input label="Weight (lb)" type="number" inputMode="decimal" value={weightLb} onChange={(e) => setWeightLb(e.target.value)} />
          </div>
        )}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={showMore}
              onChange={(e) => setShowMore(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Show detailed options (age, sex, waist, activity)
          </label>
          <label className="flex items-center gap-2.5 text-sm text-slate-700 dark:text-slate-300 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={asianCutoffs}
              onChange={(e) => setAsianCutoffs(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
            />
            Use Asian population cutoffs (23 and 27.5)
          </label>
        </div>

        {showMore && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 rounded-xl border border-slate-200 bg-slate-50/60 p-4 dark:border-slate-800 dark:bg-slate-900/40">
            <Input label="Age (years)" type="number" inputMode="numeric" value={age} onChange={(e) => setAge(e.target.value)} />
            <Select
              label="Sex"
              value={sex}
              onChange={(e) => setSex(e.target.value as 'male' | 'female')}
              options={[
                { value: 'male', label: 'Male' },
                { value: 'female', label: 'Female' },
              ]}
            />
            <Input
              label={`Waist (${units === 'metric' ? 'cm' : 'in'}, optional)`}
              type="number"
              inputMode="decimal"
              value={waist}
              onChange={(e) => setWaist(e.target.value)}
            />
            <Select label="Activity level" value={activity} onChange={(e) => setActivity(e.target.value)} options={ACTIVITY} />
          </div>
        )}
      </Card>

      {!calc && (
        <Card className="text-sm text-slate-500 dark:text-slate-400">
          Enter a height between 50 and 250 cm (about 1 ft 8 in to 8 ft 2 in) and a weight between 10 and 500 kg to see
          your BMI.
        </Card>
      )}

      {calc && (
        <>
          <Card className="space-y-5">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                  Your BMI
                </span>
                <p className="text-5xl sm:text-6xl font-extrabold text-slate-900 dark:text-white">{calc.bmi.toFixed(1)}</p>
              </div>
              <div className="text-right">
                <span className={`text-xl sm:text-2xl font-bold ${calc.category.text}`}>{calc.category.label}</span>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">{calc.gap}</p>
              </div>
            </div>

            <div>
              <div className="relative pt-5">
                <div
                  className="absolute top-0 -translate-x-1/2 text-xs font-bold text-slate-900 dark:text-white"
                  style={{ left: `${markerPct}%` }}
                  aria-hidden="true"
                >
                  <span className="block rounded bg-slate-900 px-1.5 py-0.5 text-white dark:bg-white dark:text-slate-900">
                    {calc.bmi.toFixed(1)}
                  </span>
                </div>
                <div
                  className="flex h-4 w-full overflow-hidden rounded-full"
                  role="img"
                  aria-label={`BMI gauge. Your BMI is ${calc.bmi.toFixed(1)}, ${calc.category.label}`}
                >
                  {calc.cats.map((c) => {
                    const lo = Math.max(c.min, GAUGE_MIN);
                    const hi = Math.min(c.max, GAUGE_MAX);
                    if (hi <= lo) return null;
                    return (
                      <div
                        key={c.id}
                        className={c.color}
                        style={{ width: `${((hi - lo) / (GAUGE_MAX - GAUGE_MIN)) * 100}%` }}
                      />
                    );
                  })}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 text-xs text-slate-600 dark:text-slate-300">
                {calc.cats.map((c) => (
                  <div key={c.id} className="flex items-center gap-1.5">
                    <span className={`inline-block h-2.5 w-2.5 rounded-full ${c.color}`} />
                    <span>
                      {c.label} ({c.min === 0 ? `under ${c.max}` : c.max >= 100 ? `${c.min}+` : `${c.min} to ${c.max}`})
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {calc.ageNum > 0 && calc.ageNum < 18 && (
              <p className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300">
                These categories are for adults aged 18 and over. For children and teenagers, BMI is compared with
                growth charts for the same age and sex, so ask a doctor to interpret it.
              </p>
            )}
          </Card>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Healthy weight range"
              value={`${calc.toKg(calc.healthyMinKg).replace(/ (kg|lb)$/, '')} to ${calc.toKg(calc.healthyMaxKg)}`}
              hint={`for your height, BMI 18.5 to ${asianCutoffs ? '22.9' : '24.9'}`}
            />
            <StatCard label="BMI Prime" value={calc.prime.toFixed(2)} hint={`BMI divided by ${asianCutoffs ? '23' : '25'}`} />
            <StatCard label="Ponderal index" value={`${calc.ponderal.toFixed(1)} kg/m3`} hint="weight over height cubed" />
            <StatCard
              label="Your weight"
              value={units === 'metric' ? `${calc.wKg.toFixed(1)} kg` : `${(calc.wKg / 0.45359237).toFixed(1)} lb`}
              hint={units === 'metric' ? `${(calc.wKg / 0.45359237).toFixed(1)} lb` : `${calc.wKg.toFixed(1)} kg`}
            />
          </div>

          {showMore && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Ideal body weight (Devine)"
                value={calc.toKg(calc.devine)}
                hint="one of several estimation formulas"
              />
              <StatCard
                label="Basal metabolic rate"
                value={Number.isFinite(calc.bmr) ? `${Math.round(calc.bmr).toLocaleString()} kcal` : 'Add your age'}
                hint="Mifflin-St Jeor estimate per day at rest"
              />
              <StatCard
                label="Maintenance calories"
                value={Number.isFinite(calc.tdee) ? `${Math.round(calc.tdee).toLocaleString()} kcal` : 'Add your age'}
                hint="estimate to keep the same weight"
              />
              <StatCard
                label="Waist to height ratio"
                value={Number.isFinite(calc.whtr) ? calc.whtr.toFixed(2) : 'Add your waist'}
                hint={
                  Number.isFinite(calc.whtr)
                    ? calc.whtr >= 0.5
                      ? 'at or above 0.5, a common flag for extra central fat'
                      : 'below 0.5'
                    : 'waist divided by height'
                }
              />
            </div>
          )}

          <Card className="space-y-2 text-sm text-slate-600 dark:text-slate-300">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Read this before relying on the number
            </h3>
            <p>
              BMI is a screening tool, not a diagnosis. It does not measure body fat, muscle, bone density, or where fat
              is stored, so muscular people can score high and older adults can score in the healthy range with low
              muscle. Pregnancy, certain medical conditions, and ethnic background also change how the number should be
              read. This calculator gives general information and is not medical advice. Talk to a doctor or dietitian
              about your health and weight.
            </p>
          </Card>
        </>
      )}
    </div>
  );
};
