'use client';

import React, { useState } from 'react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Percent, ArrowRight, Tag, Layers, RefreshCcw, Table } from 'lucide-react';

export const PercentageDiscountCalculator: React.FC = () => {
  const [mode, setMode] = useState<
    'discount' | 'stacked' | 'reverse' | 'percent_of' | 'change' | 'is_what_percent' | 'bulk'
  >('discount');

  // Mode 1: Retail Discount with Sales Tax
  const [originalPrice, setOriginalPrice] = useState<number>(120);
  const [discountPercent, setDiscountPercent] = useState<number>(25);
  const [salesTaxPercent, setSalesTaxPercent] = useState<number>(8.25);
  const [applyTaxAfterDiscount, setApplyTaxAfterDiscount] = useState<boolean>(true);

  // Mode 2: Double / Stacked Discounts (Sale + Coupon)
  const [stackedOriginal, setStackedOriginal] = useState<number>(200);
  const [discountA, setDiscountA] = useState<number>(20);
  const [discountB, setDiscountB] = useState<number>(15);

  // Mode 3: Reverse Discount
  const [paidPrice, setPaidPrice] = useState<number>(75);
  const [reverseDiscountPct, setReverseDiscountPct] = useState<number>(25);

  // Mode 4: X% of Y
  const [percentVal, setPercentVal] = useState<number>(15);
  const [totalVal, setTotalVal] = useState<number>(250);

  // Mode 5: Percentage Change (From X to Y)
  const [fromVal, setFromVal] = useState<number>(80);
  const [toVal, setToVal] = useState<number>(110);

  // Mode 6: What % is X of Y?
  const [partVal, setPartVal] = useState<number>(35);
  const [wholeVal, setWholeVal] = useState<number>(140);

  // Mode 7: Bulk Quantity Tier Discount
  const [unitBasePrice, setUnitBasePrice] = useState<number>(45);
  const [quantity, setQuantity] = useState<number>(25);

  return (
    <div className="space-y-6">
      {/* Mode Navigation Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        {[
          { id: 'discount', label: 'Sale Discount & Tax' },
          { id: 'stacked', label: 'Double / Stacked Coupons' },
          { id: 'reverse', label: 'Reverse Discount Finder' },
          { id: 'bulk', label: 'Bulk Tier Pricing' },
          { id: 'percent_of', label: 'Calculate X% of Y' },
          { id: 'change', label: '% Increase / Decrease' },
          { id: 'is_what_percent', label: 'What % is X of Y?' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setMode(tab.id as any)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              mode === tab.id
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Mode 1: Retail Discount with Optional Sales Tax */}
      {mode === 'discount' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Retail Sale Parameters
            </h2>
            <Input
              label="Original Sticker Price ($)"
              type="number"
              min={0}
              value={originalPrice}
              onChange={(e) => setOriginalPrice(Number(e.target.value))}
            />
            <Input
              label="Primary Discount (%)"
              type="number"
              min={0}
              max={100}
              value={discountPercent}
              onChange={(e) => setDiscountPercent(Number(e.target.value))}
              rightAddon="%"
            />
            <Input
              label="Sales Tax / VAT (%) (Optional)"
              type="number"
              min={0}
              max={50}
              step="0.01"
              value={salesTaxPercent}
              onChange={(e) => setSalesTaxPercent(Number(e.target.value))}
              rightAddon="%"
            />

            <div className="pt-2 text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-slate-700 dark:text-slate-300">
                <input
                  type="checkbox"
                  checked={applyTaxAfterDiscount}
                  onChange={(e) => setApplyTaxAfterDiscount(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Apply sales tax to discounted price (Standard retail practice)</span>
              </label>
            </div>
          </Card>

          {/* Results */}
          {(() => {
            const discountDollars = (originalPrice * discountPercent) / 100;
            const discountedPrice = Math.max(0, originalPrice - discountDollars);
            const taxBase = applyTaxAfterDiscount ? discountedPrice : originalPrice;
            const taxDollars = (taxBase * salesTaxPercent) / 100;
            const finalTotal = discountedPrice + taxDollars;

            return (
              <Card className="space-y-5 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Final Out-of-Pocket Price
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-1">
                    ${finalTotal.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Total You Save:</span>
                    <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                      ${discountDollars.toFixed(2)} ({discountPercent}%)
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tax / VAT Added:</span>
                    <span className="text-base font-bold text-slate-200 mt-0.5 block">
                      ${taxDollars.toFixed(2)} ({salesTaxPercent}%)
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 text-[11px] text-slate-300 font-mono space-y-1">
                  <div>Subtotal after {discountPercent}% off: ${discountedPrice.toFixed(2)}</div>
                  <div>Tax: ${taxDollars.toFixed(2)} → Total: ${finalTotal.toFixed(2)}</div>
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* Mode 2: Double / Stacked Discounts */}
      {mode === 'stacked' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <Layers className="w-4 h-4 text-blue-600" />
              <span>Stacked Discount Coupons</span>
            </h2>
            <Input
              label="Original Retail Price ($)"
              type="number"
              min={0}
              value={stackedOriginal}
              onChange={(e) => setStackedOriginal(Number(e.target.value))}
            />
            <Input
              label="First Sale Discount (%)"
              type="number"
              min={0}
              max={100}
              value={discountA}
              onChange={(e) => setDiscountA(Number(e.target.value))}
              rightAddon="%"
            />
            <Input
              label="Second Extra Promo Coupon (%)"
              type="number"
              min={0}
              max={100}
              value={discountB}
              onChange={(e) => setDiscountB(Number(e.target.value))}
              rightAddon="%"
            />
          </Card>

          {(() => {
            const step1Price = stackedOriginal * (1 - discountA / 100);
            const step2Price = step1Price * (1 - discountB / 100);
            const totalSaved = stackedOriginal - step2Price;
            const effectiveCombinedPercent = (totalSaved / stackedOriginal) * 100;

            return (
              <Card className="space-y-4 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Final Stacked Price
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-1">
                    ${step2Price.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Total Savings:</span>
                    <span className="text-base font-bold text-slate-200 mt-0.5 block">
                      ${totalSaved.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Effective Combined %:</span>
                    <span className="text-base font-bold text-blue-400 mt-0.5 block">
                      {effectiveCombinedPercent.toFixed(1)}% Off
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 text-[11px] text-slate-300 font-mono space-y-1">
                  <p>Step 1 ({discountA}% off ${stackedOriginal}): ${step1Price.toFixed(2)}</p>
                  <p>Step 2 ({discountB}% off ${step1Price.toFixed(2)}): ${step2Price.toFixed(2)}</p>
                  <p className="text-slate-400 text-[10px]">
                    Note: Stacked discounts apply sequentially, so {discountA}% + {discountB}% ={' '}
                    {effectiveCombinedPercent.toFixed(1)}% (not {discountA + discountB}%).
                  </p>
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* Mode 3: Reverse Discount Finder */}
      {mode === 'reverse' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
              <RefreshCcw className="w-4 h-4 text-blue-600" />
              <span>Reverse Discount Finder</span>
            </h2>
            <Input
              label="Final Price Paid ($)"
              type="number"
              min={0}
              value={paidPrice}
              onChange={(e) => setPaidPrice(Number(e.target.value))}
            />
            <Input
              label="Discount Percentage That Was Applied (%)"
              type="number"
              min={0}
              max={99}
              value={reverseDiscountPct}
              onChange={(e) => setReverseDiscountPct(Number(e.target.value))}
              rightAddon="%"
            />
          </Card>

          {(() => {
            const originalCalculated = reverseDiscountPct < 100 ? paidPrice / (1 - reverseDiscountPct / 100) : 0;
            const savings = originalCalculated - paidPrice;

            return (
              <Card className="space-y-4 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
                <div>
                  <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                    Original Pre-Discount Price
                  </span>
                  <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 mt-1">
                    ${originalCalculated.toFixed(2)}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                  <div>
                    <span className="text-slate-400 block">Amount Discounted:</span>
                    <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                      ${savings.toFixed(2)}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Price Paid:</span>
                    <span className="text-base font-bold text-slate-200 mt-0.5 block">
                      ${paidPrice.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-slate-800/80 text-[11px] text-slate-300 font-mono">
                  Formula: ${paidPrice} ÷ (1 - {reverseDiscountPct}/100) = ${originalCalculated.toFixed(2)}
                </div>
              </Card>
            );
          })()}
        </div>
      )}

      {/* Mode 4: Bulk Quantity Tier Pricing */}
      {mode === 'bulk' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            <Card className="space-y-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
                <Table className="w-4 h-4 text-blue-600" />
                <span>Bulk Tier Pricing Config</span>
              </h2>
              <Input
                label="Base Unit Price ($)"
                type="number"
                min={0}
                value={unitBasePrice}
                onChange={(e) => setUnitBasePrice(Number(e.target.value))}
              />
              <Input
                label="Order Quantity (Units)"
                type="number"
                min={1}
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
              />
            </Card>

            {(() => {
              const tiers = [
                { min: 1, max: 9, discount: 0, label: '1 - 9 units' },
                { min: 10, max: 49, discount: 10, label: '10 - 49 units (10% off)' },
                { min: 50, max: 99, discount: 20, label: '50 - 99 units (20% off)' },
                { min: 100, max: Infinity, discount: 30, label: '100+ units (30% off)' },
              ];

              const currentTier = tiers.find((t) => quantity >= t.min && quantity <= t.max) || tiers[0];
              const effectiveUnitPrice = unitBasePrice * (1 - currentTier.discount / 100);
              const orderTotal = effectiveUnitPrice * quantity;
              const totalSaved = unitBasePrice * quantity - orderTotal;

              return (
                <Card className="space-y-4 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
                  <div>
                    <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                      Total Order Cost ({quantity} Units @ {currentTier.discount}% Tier Discount)
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-emerald-400 mt-1">
                      ${orderTotal.toFixed(2)}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800 text-xs">
                    <div>
                      <span className="text-slate-400 block">Unit Cost:</span>
                      <span className="text-base font-bold text-slate-200 mt-0.5 block">
                        ${effectiveUnitPrice.toFixed(2)} / unit
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Bulk Savings:</span>
                      <span className="text-base font-bold text-emerald-400 mt-0.5 block">
                        ${totalSaved.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </Card>
              );
            })()}
          </div>
        </div>
      )}

      {/* Mode 5: X% of Y */}
      {mode === 'percent_of' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Calculate X% of Total
            </h2>
            <Input
              label="Percentage (X%)"
              type="number"
              value={percentVal}
              onChange={(e) => setPercentVal(Number(e.target.value))}
              rightAddon="%"
            />
            <Input
              label="Base Total (Y)"
              type="number"
              value={totalVal}
              onChange={(e) => setTotalVal(Number(e.target.value))}
            />
          </Card>

          <Card className="space-y-4 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Result ({percentVal}% of {totalVal})
              </span>
              <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 mt-1">
                {((percentVal / 100) * totalVal).toFixed(2)}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-800/80 text-[11px] text-slate-300 font-mono">
              Formula: ({percentVal} ÷ 100) × {totalVal} = {((percentVal / 100) * totalVal).toFixed(2)}
            </div>
          </Card>
        </div>
      )}

      {/* Mode 6: Percentage Increase / Decrease */}
      {mode === 'change' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Initial & Final Values
            </h2>
            <Input
              label="Initial Value (From)"
              type="number"
              value={fromVal}
              onChange={(e) => setFromVal(Number(e.target.value))}
            />
            <Input
              label="Final Value (To)"
              type="number"
              value={toVal}
              onChange={(e) => setToVal(Number(e.target.value))}
            />
          </Card>

          <Card className="space-y-4 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Relative Percentage Variance
              </span>
              {fromVal !== 0 ? (
                <div
                  className={`text-3xl sm:text-4xl font-extrabold mt-1 ${
                    toVal >= fromVal ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {toVal >= fromVal ? '+' : ''}
                  {(((toVal - fromVal) / Math.abs(fromVal)) * 100).toFixed(2)}%
                  <span className="text-xs font-normal text-slate-400 ml-2">
                    {toVal >= fromVal ? 'Increase' : 'Decrease'}
                  </span>
                </div>
              ) : (
                <div className="text-sm text-slate-400 mt-1">Cannot divide by initial zero</div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-800/80 text-[11px] text-slate-300 font-mono">
              Formula: [({toVal} - {fromVal}) ÷ |{fromVal}|] × 100 ={' '}
              {fromVal !== 0 ? (((toVal - fromVal) / Math.abs(fromVal)) * 100).toFixed(2) : 0}%
            </div>
          </Card>
        </div>
      )}

      {/* Mode 7: What % is X of Y? */}
      {mode === 'is_what_percent' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          <Card className="space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Proportion Values
            </h2>
            <Input
              label="Numerator / Partial Value (X)"
              type="number"
              value={partVal}
              onChange={(e) => setPartVal(Number(e.target.value))}
            />
            <Input
              label="Denominator / Whole Value (Y)"
              type="number"
              value={wholeVal}
              onChange={(e) => setWholeVal(Number(e.target.value))}
            />
          </Card>

          <Card className="space-y-4 bg-linear-to-br from-slate-900 to-slate-950 text-white border-slate-800">
            <div>
              <span className="text-xs uppercase tracking-wider text-slate-400 font-semibold">
                Calculated Percentage
              </span>
              {wholeVal !== 0 ? (
                <div className="text-3xl sm:text-4xl font-extrabold text-blue-400 mt-1">
                  {((partVal / wholeVal) * 100).toFixed(2)}%
                </div>
              ) : (
                <div className="text-sm text-slate-400 mt-1">Denominator cannot be zero</div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-800/80 text-[11px] text-slate-300 font-mono">
              Formula: ({partVal} ÷ {wholeVal}) × 100 ={' '}
              {wholeVal !== 0 ? ((partVal / wholeVal) * 100).toFixed(2) : 0}%
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
