'use client';

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card } from '@/components/ui/Card';
import { CopyButton } from '@/components/ui/CopyButton';
import { ArrowLeftRight, Scale, Search, Copy, Check } from 'lucide-react';

type Dimension =
  | 'length'
  | 'weight'
  | 'temperature'
  | 'area'
  | 'volume'
  | 'speed'
  | 'time'
  | 'storage'
  | 'pressure'
  | 'energy';

interface UnitDef {
  id: string;
  name: string;
  symbol: string;
  toBase: (v: number) => number;
  fromBase: (v: number) => number;
}

const CONVERSION_DATA: Record<Dimension, { name: string; units: UnitDef[] }> = {
  length: {
    name: 'Length & Distance',
    units: [
      { id: 'm', name: 'Meters', symbol: 'm', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km', name: 'Kilometers', symbol: 'km', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cm', name: 'Centimeters', symbol: 'cm', toBase: (v) => v / 100, fromBase: (v) => v * 100 },
      { id: 'mm', name: 'Millimeters', symbol: 'mm', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'um', name: 'Micrometers', symbol: 'µm', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
      { id: 'mi', name: 'Miles', symbol: 'mi', toBase: (v) => v * 1609.344, fromBase: (v) => v / 1609.344 },
      { id: 'yd', name: 'Yards', symbol: 'yd', toBase: (v) => v * 0.9144, fromBase: (v) => v / 0.9144 },
      { id: 'ft', name: 'Feet', symbol: 'ft', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'in', name: 'Inches', symbol: 'in', toBase: (v) => v * 0.0254, fromBase: (v) => v / 0.0254 },
      { id: 'nmi', name: 'Nautical Miles', symbol: 'NM', toBase: (v) => v * 1852, fromBase: (v) => v / 1852 },
    ],
  },
  weight: {
    name: 'Weight & Mass',
    units: [
      { id: 'kg', name: 'Kilograms', symbol: 'kg', toBase: (v) => v, fromBase: (v) => v },
      { id: 'g', name: 'Grams', symbol: 'g', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'mg', name: 'Milligrams', symbol: 'mg', toBase: (v) => v / 1000000, fromBase: (v) => v * 1000000 },
      { id: 'lb', name: 'Pounds', symbol: 'lb', toBase: (v) => v * 0.45359237, fromBase: (v) => v / 0.45359237 },
      { id: 'oz', name: 'Ounces', symbol: 'oz', toBase: (v) => v * 0.028349523, fromBase: (v) => v / 0.028349523 },
      { id: 'ton', name: 'Metric Tons', symbol: 't', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'stone', name: 'Stones', symbol: 'st', toBase: (v) => v * 6.35029, fromBase: (v) => v / 6.35029 },
      { id: 'carat', name: 'Carats', symbol: 'ct', toBase: (v) => v * 0.0002, fromBase: (v) => v / 0.0002 },
    ],
  },
  temperature: {
    name: 'Temperature',
    units: [
      { id: 'c', name: 'Celsius', symbol: '°C', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', name: 'Fahrenheit', symbol: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: 'k', name: 'Kelvin', symbol: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
      { id: 'r', name: 'Rankine', symbol: '°R', toBase: (v) => ((v - 491.67) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 491.67 },
    ],
  },
  area: {
    name: 'Area',
    units: [
      { id: 'sq_m', name: 'Square Meters', symbol: 'm²', toBase: (v) => v, fromBase: (v) => v },
      { id: 'sq_km', name: 'Square Kilometers', symbol: 'km²', toBase: (v) => v * 1000000, fromBase: (v) => v / 1000000 },
      { id: 'sq_ft', name: 'Square Feet', symbol: 'ft²', toBase: (v) => v * 0.092903, fromBase: (v) => v / 0.092903 },
      { id: 'sq_yd', name: 'Square Yards', symbol: 'yd²', toBase: (v) => v * 0.836127, fromBase: (v) => v / 0.836127 },
      { id: 'acre', name: 'Acres', symbol: 'ac', toBase: (v) => v * 4046.86, fromBase: (v) => v / 4046.86 },
      { id: 'hectare', name: 'Hectares', symbol: 'ha', toBase: (v) => v * 10000, fromBase: (v) => v / 10000 },
      { id: 'sq_mi', name: 'Square Miles', symbol: 'mi²', toBase: (v) => v * 2589988.11, fromBase: (v) => v / 2589988.11 },
    ],
  },
  volume: {
    name: 'Volume & Capacity',
    units: [
      { id: 'l', name: 'Liters', symbol: 'L', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ml', name: 'Milliliters', symbol: 'mL', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'cu_m', name: 'Cubic Meters', symbol: 'm³', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'gal_us', name: 'US Gallons', symbol: 'gal', toBase: (v) => v * 3.78541, fromBase: (v) => v / 3.78541 },
      { id: 'qt_us', name: 'US Quarts', symbol: 'qt', toBase: (v) => v * 0.946353, fromBase: (v) => v / 0.946353 },
      { id: 'pt_us', name: 'US Pints', symbol: 'pt', toBase: (v) => v * 0.473176, fromBase: (v) => v / 0.473176 },
      { id: 'cup_us', name: 'US Cups', symbol: 'cup', toBase: (v) => v * 0.236588, fromBase: (v) => v / 0.236588 },
      { id: 'fl_oz', name: 'Fluid Ounces', symbol: 'fl oz', toBase: (v) => v * 0.0295735, fromBase: (v) => v / 0.0295735 },
      { id: 'tbsp', name: 'Tablespoons', symbol: 'tbsp', toBase: (v) => v * 0.0147868, fromBase: (v) => v / 0.0147868 },
      { id: 'tsp', name: 'Teaspoons', symbol: 'tsp', toBase: (v) => v * 0.00492892, fromBase: (v) => v / 0.00492892 },
    ],
  },
  speed: {
    name: 'Speed & Velocity',
    units: [
      { id: 'm_s', name: 'Meters per second', symbol: 'm/s', toBase: (v) => v, fromBase: (v) => v },
      { id: 'km_h', name: 'Kilometers per hour', symbol: 'km/h', toBase: (v) => v / 3.6, fromBase: (v) => v * 3.6 },
      { id: 'mph', name: 'Miles per hour', symbol: 'mph', toBase: (v) => v * 0.44704, fromBase: (v) => v / 0.44704 },
      { id: 'knot', name: 'Knots (Nautical)', symbol: 'kn', toBase: (v) => v * 0.514444, fromBase: (v) => v / 0.514444 },
      { id: 'ft_s', name: 'Feet per second', symbol: 'ft/s', toBase: (v) => v * 0.3048, fromBase: (v) => v / 0.3048 },
      { id: 'mach', name: 'Mach (Speed of sound)', symbol: 'Ma', toBase: (v) => v * 343, fromBase: (v) => v / 343 },
    ],
  },
  time: {
    name: 'Time Duration',
    units: [
      { id: 's', name: 'Seconds', symbol: 's', toBase: (v) => v, fromBase: (v) => v },
      { id: 'ms', name: 'Milliseconds', symbol: 'ms', toBase: (v) => v / 1000, fromBase: (v) => v * 1000 },
      { id: 'min', name: 'Minutes', symbol: 'min', toBase: (v) => v * 60, fromBase: (v) => v / 60 },
      { id: 'hr', name: 'Hours', symbol: 'hr', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'day', name: 'Days', symbol: 'd', toBase: (v) => v * 86400, fromBase: (v) => v / 86400 },
      { id: 'wk', name: 'Weeks', symbol: 'wk', toBase: (v) => v * 604800, fromBase: (v) => v / 604800 },
      { id: 'yr', name: 'Years (365.25 days)', symbol: 'yr', toBase: (v) => v * 31557600, fromBase: (v) => v / 31557600 },
    ],
  },
  storage: {
    name: 'Digital Data Storage',
    units: [
      { id: 'b', name: 'Bytes', symbol: 'B', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kb', name: 'Kilobytes (Decimal)', symbol: 'KB', toBase: (v) => v * 1e3, fromBase: (v) => v / 1e3 },
      { id: 'mb', name: 'Megabytes (Decimal)', symbol: 'MB', toBase: (v) => v * 1e6, fromBase: (v) => v / 1e6 },
      { id: 'gb', name: 'Gigabytes (Decimal)', symbol: 'GB', toBase: (v) => v * 1e9, fromBase: (v) => v / 1e9 },
      { id: 'tb', name: 'Terabytes (Decimal)', symbol: 'TB', toBase: (v) => v * 1e12, fromBase: (v) => v / 1e12 },
      { id: 'kib', name: 'Kibibytes (Binary)', symbol: 'KiB', toBase: (v) => v * 1024, fromBase: (v) => v / 1024 },
      { id: 'mib', name: 'Mebibytes (Binary)', symbol: 'MiB', toBase: (v) => v * 1048576, fromBase: (v) => v / 1048576 },
      { id: 'gib', name: 'Gibibytes (Binary)', symbol: 'GiB', toBase: (v) => v * 1073741824, fromBase: (v) => v / 1073741824 },
      { id: 'tib', name: 'Tebibytes (Binary)', symbol: 'TiB', toBase: (v) => v * 1099511627776, fromBase: (v) => v / 1099511627776 },
    ],
  },
  pressure: {
    name: 'Pressure',
    units: [
      { id: 'pa', name: 'Pascals', symbol: 'Pa', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kpa', name: 'Kilopascals', symbol: 'kPa', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'bar', name: 'Bars', symbol: 'bar', toBase: (v) => v * 100000, fromBase: (v) => v / 100000 },
      { id: 'psi', name: 'Pounds per square inch', symbol: 'psi', toBase: (v) => v * 6894.76, fromBase: (v) => v / 6894.76 },
      { id: 'atm', name: 'Standard Atmospheres', symbol: 'atm', toBase: (v) => v * 101325, fromBase: (v) => v / 101325 },
      { id: 'torr', name: 'Torr (mmHg)', symbol: 'Torr', toBase: (v) => v * 133.322, fromBase: (v) => v / 133.322 },
    ],
  },
  energy: {
    name: 'Energy & Work',
    units: [
      { id: 'j', name: 'Joules', symbol: 'J', toBase: (v) => v, fromBase: (v) => v },
      { id: 'kj', name: 'Kilojoules', symbol: 'kJ', toBase: (v) => v * 1000, fromBase: (v) => v / 1000 },
      { id: 'cal', name: 'Calories (Thermochemical)', symbol: 'cal', toBase: (v) => v * 4.184, fromBase: (v) => v / 4.184 },
      { id: 'kcal', name: 'Kilocalories (Food Calories)', symbol: 'kcal', toBase: (v) => v * 4184, fromBase: (v) => v / 4184 },
      { id: 'wh', name: 'Watt-hours', symbol: 'Wh', toBase: (v) => v * 3600, fromBase: (v) => v / 3600 },
      { id: 'kwh', name: 'Kilowatt-hours', symbol: 'kWh', toBase: (v) => v * 3600000, fromBase: (v) => v / 3600000 },
      { id: 'btu', name: 'British Thermal Units', symbol: 'BTU', toBase: (v) => v * 1055.06, fromBase: (v) => v / 1055.06 },
    ],
  },
};

export const UnitConverter: React.FC = () => {
  const [dimension, setDimension] = useState<Dimension>('length');
  const [inputValue, setInputValue] = useState<number>(100);
  const [fromUnitId, setFromUnitId] = useState<string>('m');
  const [toUnitId, setToUnitId] = useState<string>('ft');
  const [searchMatrix, setSearchMatrix] = useState<string>('');

  const currentCategory = CONVERSION_DATA[dimension];

  const handleDimensionChange = (dim: Dimension) => {
    setDimension(dim);
    const newUnits = CONVERSION_DATA[dim].units;
    setFromUnitId(newUnits[0].id);
    setToUnitId(newUnits[1]?.id || newUnits[0].id);
    setSearchMatrix('');
  };

  const fromUnit = currentCategory.units.find((u) => u.id === fromUnitId) || currentCategory.units[0];
  const toUnit = currentCategory.units.find((u) => u.id === toUnitId) || currentCategory.units[1];

  // Convert single
  const baseValue = fromUnit.toBase(inputValue);
  const result = toUnit.fromBase(baseValue);

  const handleSwap = () => {
    const temp = fromUnitId;
    setFromUnitId(toUnitId);
    setToUnitId(temp);
  };

  const formatNumber = (num: number): string => {
    if (isNaN(num)) return '0';
    if (Math.abs(num) === 0) return '0';
    if (Math.abs(num) < 0.00001 || Math.abs(num) >= 100000000) {
      return num.toExponential(5);
    }
    return parseFloat(num.toFixed(6)).toString();
  };

  const formattedResult = formatNumber(result);

  // Compute all conversions for the matrix table
  const allConversions = useMemo(() => {
    return currentCategory.units.map((unit) => {
      const convertedVal = unit.fromBase(baseValue);
      return {
        id: unit.id,
        name: unit.name,
        symbol: unit.symbol,
        value: formatNumber(convertedVal),
        raw: convertedVal,
      };
    });
  }, [currentCategory, baseValue]);

  const filteredMatrix = useMemo(() => {
    if (!searchMatrix.trim()) return allConversions;
    const q = searchMatrix.toLowerCase();
    return allConversions.filter(
      (item) => item.name.toLowerCase().includes(q) || item.symbol.toLowerCase().includes(q)
    );
  }, [allConversions, searchMatrix]);

  const copyAllConversions = () => {
    const text = allConversions
      .map((item) => `${inputValue} ${fromUnit.symbol} = ${item.value} ${item.symbol} (${item.name})`)
      .join('\n');
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-6">
      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/80 rounded-xl">
        {(Object.keys(CONVERSION_DATA) as Dimension[]).map((dim) => (
          <button
            key={dim}
            type="button"
            onClick={() => handleDimensionChange(dim)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
              dimension === dim
                ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            {CONVERSION_DATA[dim].name}
          </button>
        ))}
      </div>

      {/* Primary Interactive Dual Converter */}
      <Card className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
          <div className="md:col-span-2 space-y-3">
            <Input
              label="Input Magnitude"
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(Number(e.target.value))}
              rightAddon={fromUnit.symbol}
            />
            <Select
              label="Source Unit"
              value={fromUnitId}
              onChange={(e) => setFromUnitId(e.target.value)}
              options={currentCategory.units.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.symbol})`,
              }))}
            />
          </div>

          <div className="flex justify-center pb-3">
            <button
              type="button"
              onClick={handleSwap}
              aria-label="Swap source and target units"
              className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition-colors shadow-xs"
            >
              <ArrowLeftRight className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </button>
          </div>

          <div className="md:col-span-2 space-y-3">
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                  Target Converted Result
                </label>
                <CopyButton textToCopy={formattedResult} size="sm" />
              </div>
              <div className="w-full px-3 py-2.5 text-lg font-bold text-blue-600 dark:text-blue-400 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-300 dark:border-slate-700 select-all overflow-x-auto truncate">
                {formattedResult} <span className="text-xs text-slate-500 font-normal">{toUnit.symbol}</span>
              </div>
            </div>
            <Select
              label="Target Unit"
              value={toUnitId}
              onChange={(e) => setToUnitId(e.target.value)}
              options={currentCategory.units.map((u) => ({
                value: u.id,
                label: `${u.name} (${u.symbol})`,
              }))}
            />
          </div>
        </div>

        {/* Quick summary line */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-500 flex justify-between items-center flex-wrap gap-2">
          <span>
            {inputValue} {fromUnit.symbol} = <strong className="text-slate-900 dark:text-white font-mono">{formattedResult} {toUnit.symbol}</strong>
          </span>
          <span className="text-[11px] text-slate-400 font-mono">IEEE 754 High-Precision Double Math</span>
        </div>
      </Card>

      {/* Multi-Unit Conversion Matrix Grid */}
      <Card className="space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800 flex-wrap gap-2">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
              Complete {currentCategory.name} Conversion Matrix
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Simultaneous real-time conversion for {inputValue} {fromUnit.name} across all standard units
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                type="text"
                placeholder="Filter units..."
                value={searchMatrix}
                onChange={(e) => setSearchMatrix(e.target.value)}
                className="pl-7 pr-2.5 py-1 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>

            <Button size="sm" variant="outline" onClick={copyAllConversions} leftIcon={<Copy className="w-3.5 h-3.5" />}>
              Copy All Matrix
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredMatrix.map((item) => {
            const isCurrentSource = item.id === fromUnitId;
            return (
              <div
                key={item.id}
                onClick={() => setToUnitId(item.id)}
                className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center justify-between gap-2 ${
                  item.id === toUnitId
                    ? 'border-blue-500 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30'
                    : isCurrentSource
                    ? 'border-emerald-500 bg-emerald-50/30 dark:border-emerald-800 dark:bg-emerald-950/20'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                }`}
              >
                <div>
                  <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 block">
                    {item.name}
                  </span>
                  <span className="text-sm font-mono font-bold text-slate-900 dark:text-white mt-0.5 block truncate max-w-[170px]">
                    {item.value} <span className="text-[11px] text-slate-400 font-normal">{item.symbol}</span>
                  </span>
                </div>
                <CopyButton textToCopy={item.value} size="sm" />
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
};
