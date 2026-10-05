'use client';

import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Calculator, AlertCircle, Info, Download, Sparkles, ArrowLeftRight, TrendingDown } from 'lucide-react';

const CURRENCIES = [
  { value: 'PKR', label: 'PKR - Pakistani Rupee (Rs)' },
  { value: 'USD', label: 'USD - US Dollar ($)' },
  { value: 'EUR', label: 'EUR - Euro (€)' },
  { value: 'GBP', label: 'GBP - British Pound (£)' },
  { value: 'AED', label: 'AED - UAE Dirham (د.إ)' },
  { value: 'SAR', label: 'SAR - Saudi Riyal (﷼)' },
  { value: 'CAD', label: 'CAD - Canadian Dollar ($)' },
];

export const LoanEmiCalculator: React.FC = () => {
  const [currency, setCurrency] = useState('PKR');
  const [principal, setPrincipal] = useState<number>(5000000);
  const [interestRate, setInterestRate] = useState<number>(16);
  const [tenureYears, setTenureYears] = useState<number>(5);

  // Prepayment / Extra payment feature
  const [extraMonthlyPayment, setExtraMonthlyPayment] = useState<number>(0);
  const [oneTimeLumpSum, setOneTimeLumpSum] = useState<number>(0);

  // Schedule View Mode: Annual vs Monthly
  const [scheduleView, setScheduleView] = useState<'annual' | 'monthly'>('annual');

  // Comparison Loan B
  const [showComparison, setShowComparison] = useState<boolean>(false);
  const [compRate, setCompRate] = useState<number>(14);
  const [compYears, setCompYears] = useState<number>(4);

  // Primary Loan Calculations
  const p = Math.max(0, principal);
  const annualR = Math.max(0, interestRate);
  const n = Math.max(1, tenureYears * 12);
  const monthlyR = annualR / 12 / 100;

  let emi = 0;
  if (monthlyR > 0) {
    emi = (p * monthlyR * Math.pow(1 + monthlyR, n)) / (Math.pow(1 + monthlyR, n) - 1);
  } else {
    emi = p / n;
  }

  // Monthly amortization schedule calculation with prepayments
  const { schedule, totalPaidWithPrepay, totalInterestWithPrepay, monthsToPayoff } = useMemo(() => {
    const list: {
      month: number;
      year: number;
      principalPaid: number;
      interestPaid: number;
      extraPaid: number;
      balance: number;
    }[] = [];

    let currentBal = p;
    let totPaid = 0;
    let totInt = 0;
    let payoffMonth = n;

    for (let m = 1; m <= n; m++) {
      if (currentBal <= 0) {
        payoffMonth = m - 1;
        break;
      }

      const mInterest = currentBal * monthlyR;
      let mPrincipal = emi - mInterest;

      // Apply extra payments
      let extra = extraMonthlyPayment;
      if (m === 1 && oneTimeLumpSum > 0) {
        extra += oneTimeLumpSum;
      }

      let totalPrincipalThisMonth = mPrincipal + extra;
      if (totalPrincipalThisMonth > currentBal) {
        totalPrincipalThisMonth = currentBal;
        mPrincipal = Math.max(0, currentBal - extra);
      }

      currentBal = Math.max(0, currentBal - totalPrincipalThisMonth);
      totPaid += mInterest + totalPrincipalThisMonth;
      totInt += mInterest;

      list.push({
        month: m,
        year: Math.ceil(m / 12),
        principalPaid: mPrincipal,
        interestPaid: mInterest,
        extraPaid: extra,
        balance: currentBal,
      });

      if (currentBal === 0) {
        payoffMonth = m;
        break;
      }
    }

    return {
      schedule: list,
      totalPaidWithPrepay: totPaid,
      totalInterestWithPrepay: totInt,
      monthsToPayoff: payoffMonth,
    };
  }, [p, monthlyR, emi, n, extraMonthlyPayment, oneTimeLumpSum]);

  // Standard without prepayment
  const standardTotalPayment = emi * n;
  const standardTotalInterest = Math.max(0, standardTotalPayment - p);

  // Savings from prepayment
  const interestSaved = Math.max(0, standardTotalInterest - totalInterestWithPrepay);
  const monthsSaved = Math.max(0, n - monthsToPayoff);

  // Annual schedule rollup
  const annualSchedule = useMemo(() => {
    const map = new Map<number, { year: number; principal: number; interest: number; balance: number }>();
    schedule.forEach((row) => {
      const existing = map.get(row.year) || {
        year: row.year,
        principal: 0,
        interest: 0,
        balance: row.balance,
      };
      existing.principal += row.principalPaid + row.extraPaid;
      existing.interest += row.interestPaid;
      existing.balance = row.balance;
      map.set(row.year, existing);
    });
    return Array.from(map.values());
  }, [schedule]);

  // Comparison Loan B Calculations
  const compMonthlyR = Math.max(0, compRate) / 12 / 100;
  const compN = Math.max(1, compYears * 12);
  let compEmi = 0;
  if (compMonthlyR > 0) {
    compEmi = (p * compMonthlyR * Math.pow(1 + compMonthlyR, compN)) / (Math.pow(1 + compMonthlyR, compN) - 1);
  } else {
    compEmi = p / compN;
  }
  const compTotalPayment = compEmi * compN;
  const compTotalInterest = Math.max(0, compTotalPayment - p);

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      maximumFractionDigits: 0,
    }).format(Math.round(val));
  };

  const setPkrExample = () => {
    setCurrency('PKR');
    setPrincipal(5000000);
    setInterestRate(16);
    setTenureYears(5);
    setExtraMonthlyPayment(0);
    setOneTimeLumpSum(0);
  };

  const handleExportCsv = () => {
    const headers = ['Month', 'Year', 'Principal Paid', 'Interest Paid', 'Extra Payment', 'Remaining Balance'];
    const rows = schedule.map((r) => [
      r.month,
      r.year,
      r.principalPaid.toFixed(2),
      r.interestPaid.toFixed(2),
      r.extraPaid.toFixed(2),
      r.balance.toFixed(2),
    ]);
    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `amortization_schedule_${currency}_${Date.now()}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Quick Example Banner */}
      <div className="flex items-center justify-between text-xs bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 p-3 rounded-xl flex-wrap gap-2">
        <div className="flex items-center gap-2 text-blue-900 dark:text-blue-300">
          <Info className="w-4 h-4 shrink-0 text-blue-600 dark:text-blue-400" />
          <span>Need a reference? Load the standard 5,000,000 PKR auto/home loan example at 16% markup.</span>
        </div>
        <button
          type="button"
          onClick={setPkrExample}
          className="font-semibold text-blue-700 dark:text-blue-400 hover:underline shrink-0"
        >
          Load PKR Preset (Rs 5,000,000)
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calculator className="w-4 h-4 text-blue-600" />
              <span>Loan Parameters</span>
            </h2>

            <Select
              label="Currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              options={CURRENCIES}
            />

            <Input
              label="Loan Amount (Principal)"
              type="number"
              min={1}
              value={principal}
              onChange={(e) => setPrincipal(Number(e.target.value))}
              rightAddon={currency}
            />

            <Input
              label="Annual Markup / Interest Rate (%)"
              type="number"
              step="0.1"
              min={0}
              max={100}
              value={interestRate}
              onChange={(e) => setInterestRate(Number(e.target.value))}
              rightAddon="%"
            />

            <Input
              label="Loan Tenure (Years)"
              type="number"
              min={1}
              max={40}
              value={tenureYears}
              onChange={(e) => setTenureYears(Number(e.target.value))}
              rightAddon={`${tenureYears * 12} Months`}
            />

            {/* Prepayment feature */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                Accelerated Prepayment (Optional)
              </span>

              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Extra Monthly Payment"
                  type="number"
                  min={0}
                  value={extraMonthlyPayment}
                  onChange={(e) => setExtraMonthlyPayment(Number(e.target.value))}
                  rightAddon={currency}
                />
                <Input
                  label="One-Time Lump Sum (Month 1)"
                  type="number"
                  min={0}
                  value={oneTimeLumpSum}
                  onChange={(e) => setOneTimeLumpSum(Number(e.target.value))}
                  rightAddon={currency}
                />
              </div>
            </div>

            {/* Financial Disclaimer */}
            <div className="flex items-start gap-2 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500 mt-0.5" />
              <span>
                Disclaimer: All figures are mathematical estimates. Official bank repayments may differ due to floating KIBOR/prime benchmark adjustments, documentation fees, and mandatory takaful/insurance premiums.
              </span>
            </div>
          </Card>
        </div>

        {/* Right Summary */}
        <div className="lg:col-span-6 space-y-4">
          <Card className="space-y-5 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Monthly Equated Installment (EMI)
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 mt-1">
                {currency} {formatCurrency(emi)}
                <span className="text-xs font-normal text-slate-400 ml-1.5">/ month</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-slate-800 text-xs">
              <div>
                <span className="text-slate-400 block">Total Interest Payable:</span>
                <span className="text-base font-bold text-slate-200 mt-0.5 block">
                  {currency} {formatCurrency(totalInterestWithPrepay)}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Total Overall Payment:</span>
                <span className="text-base font-bold text-slate-200 mt-0.5 block">
                  {currency} {formatCurrency(totalPaidWithPrepay)}
                </span>
              </div>
            </div>

            {/* Prepayment Savings Badge */}
            {(extraMonthlyPayment > 0 || oneTimeLumpSum > 0) && (
              <div className="p-3 rounded-xl bg-emerald-950/70 border border-emerald-800/80 text-xs text-emerald-200 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>
                    Early Payoff! You save <strong>{currency} {formatCurrency(interestSaved)}</strong> in interest and pay off loan <strong>{monthsSaved} months earlier</strong>.
                  </span>
                </div>
              </div>
            )}

            {/* Visual ratio bar */}
            <div>
              <div className="flex justify-between text-[11px] text-slate-400 mb-1.5">
                <span>Principal: {Math.round((p / totalPaidWithPrepay) * 100)}%</span>
                <span>Interest: {Math.round((totalInterestWithPrepay / totalPaidWithPrepay) * 100)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden flex">
                <div
                  className="bg-blue-500 h-full"
                  style={{ width: `${(p / totalPaidWithPrepay) * 100}%` }}
                />
                <div
                  className="bg-amber-500 h-full"
                  style={{ width: `${(totalInterestWithPrepay / totalPaidWithPrepay) * 100}%` }}
                />
              </div>
            </div>
          </Card>

          {/* Loan Comparison Mode Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Side-by-Side Loan Option Comparison
            </span>
            <button
              type="button"
              onClick={() => setShowComparison(!showComparison)}
              className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
            >
              {showComparison ? 'Hide Comparison' : 'Compare Loan Offers'}
            </button>
          </div>

          {showComparison && (
            <Card className="space-y-4 border-blue-200 dark:border-blue-900/60 bg-blue-50/30 dark:bg-blue-950/20">
              <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 dark:text-blue-300">
                Alternative Offer (Loan B)
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Alternative Rate (%)"
                  type="number"
                  step="0.1"
                  value={compRate}
                  onChange={(e) => setCompRate(Number(e.target.value))}
                  rightAddon="%"
                />
                <Input
                  label="Alternative Tenure (Yrs)"
                  type="number"
                  value={compYears}
                  onChange={(e) => setCompYears(Number(e.target.value))}
                  rightAddon="Years"
                />
              </div>

              <div className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-xs space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Loan B Monthly EMI:</span>
                  <span className="font-bold text-slate-900 dark:text-white">{currency} {formatCurrency(compEmi)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Loan B Total Interest:</span>
                  <span className="font-bold text-amber-600 dark:text-amber-400">{currency} {formatCurrency(compTotalInterest)}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-100 dark:border-slate-800 font-semibold">
                  <span>Interest Delta (Loan A vs B):</span>
                  <span className={standardTotalInterest > compTotalInterest ? 'text-emerald-600' : 'text-rose-600'}>
                    {standardTotalInterest > compTotalInterest ? 'Save ' : 'Pay '}
                    {currency} {formatCurrency(Math.abs(standardTotalInterest - compTotalInterest))}
                  </span>
                </div>
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* Amortization Schedule Table */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Amortization Schedule Breakdown
            </h3>
            <div className="flex items-center p-0.5 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs">
              <button
                type="button"
                onClick={() => setScheduleView('annual')}
                className={`px-2.5 py-1 rounded font-semibold ${
                  scheduleView === 'annual' ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600' : 'text-slate-500'
                }`}
              >
                Annual Summary
              </button>
              <button
                type="button"
                onClick={() => setScheduleView('monthly')}
                className={`px-2.5 py-1 rounded font-semibold ${
                  scheduleView === 'monthly' ? 'bg-white dark:bg-slate-900 shadow-xs text-blue-600' : 'text-slate-500'
                }`}
              >
                Monthly Details
              </button>
            </div>
          </div>

          <Button size="sm" variant="outline" onClick={handleExportCsv} leftIcon={<Download className="w-3.5 h-3.5" />}>
            Export Schedule (.CSV)
          </Button>
        </div>

        <div className="overflow-x-auto max-h-80">
          <table className="w-full text-xs text-left">
            <thead className="sticky top-0 bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 text-slate-500">
              <tr>
                <th className="py-2.5 px-3">{scheduleView === 'annual' ? 'Year' : 'Month'}</th>
                <th className="py-2.5 px-3">Principal Paid</th>
                <th className="py-2.5 px-3">Interest Paid</th>
                {scheduleView === 'monthly' && extraMonthlyPayment > 0 && (
                  <th className="py-2.5 px-3">Extra Paid</th>
                )}
                <th className="py-2.5 px-3 text-right">Remaining Balance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-slate-700 dark:text-slate-300">
              {scheduleView === 'annual'
                ? annualSchedule.map((row) => (
                    <tr key={row.year} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-semibold">Year {row.year}</td>
                      <td className="py-2.5 px-3">{currency} {formatCurrency(row.principal)}</td>
                      <td className="py-2.5 px-3 text-amber-600 dark:text-amber-400 font-medium">
                        {currency} {formatCurrency(row.interest)}
                      </td>
                      <td className="py-2.5 px-3 text-right font-medium">
                        {currency} {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))
                : schedule.map((row) => (
                    <tr key={row.month} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                      <td className="py-2 px-3 font-mono">Month {row.month} (Yr {row.year})</td>
                      <td className="py-2 px-3">{currency} {formatCurrency(row.principalPaid)}</td>
                      <td className="py-2 px-3 text-amber-600 dark:text-amber-400">
                        {currency} {formatCurrency(row.interestPaid)}
                      </td>
                      {extraMonthlyPayment > 0 && (
                        <td className="py-2 px-3 text-emerald-600 font-mono">
                          +{currency} {formatCurrency(row.extraPaid)}
                        </td>
                      )}
                      <td className="py-2 px-3 text-right font-medium">
                        {currency} {formatCurrency(row.balance)}
                      </td>
                    </tr>
                  ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
