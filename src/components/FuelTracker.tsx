import React, { useState, useMemo } from 'react';
import { 
  Fuel, 
  TrendingUp, 
  Plus, 
  DollarSign, 
  Gauge, 
  Calendar, 
  MapPin, 
  Trash2, 
  Edit3, 
  Search, 
  ArrowRight,
  Info,
  Sparkles,
  Calculator,
  RotateCcw
} from 'lucide-react';
import { Vehicle, FuelLog, EfficiencyUnit } from '../types';
import { formatEfficiency, recalculateFuelLogs } from '../utils/calculations';

interface FuelTrackerProps {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  onAddFuelLog: (log: Omit<FuelLog, 'id' | 'distanceDelta' | 'calculatedEfficiency' | 'costPerDistance'>) => void;
  onEditFuelLog: (log: FuelLog) => void;
  onDeleteFuelLog: (id: string) => void;
  onOpenAddModal: () => void;
}

export const FuelTracker: React.FC<FuelTrackerProps> = ({
  vehicle,
  fuelLogs,
  onAddFuelLog,
  onEditFuelLog,
  onDeleteFuelLog,
  onOpenAddModal,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<EfficiencyUnit>(
    vehicle.distanceUnit === 'miles' ? 'mpg_us' : 'l_per_100km'
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showTripCalculator, setShowTripCalculator] = useState(false);

  // Trip calculator state
  const [tripDistance, setTripDistance] = useState<number>(250);
  const [customPrice, setCustomPrice] = useState<number>(3.65);

  // Filter fuel logs for current vehicle
  const vehicleLogs = useMemo(() => {
    return fuelLogs.filter((log) => log.vehicleId === vehicle.id);
  }, [fuelLogs, vehicle.id]);

  // Valid efficiencies array for calculations
  const efficiencies = useMemo(() => {
    return vehicleLogs
      .map((l) => l.calculatedEfficiency)
      .filter((e): e is number => typeof e === 'number' && e > 0);
  }, [vehicleLogs]);

  const avgEfficiency = efficiencies.length > 0
    ? efficiencies.reduce((a, b) => a + b, 0) / efficiencies.length
    : undefined;

  const bestEfficiency = efficiencies.length > 0 ? Math.max(...efficiencies) : undefined;
  const worstEfficiency = efficiencies.length > 0 ? Math.min(...efficiencies) : undefined;
  const latestEfficiency = vehicleLogs.find((l) => l.calculatedEfficiency !== undefined)?.calculatedEfficiency;

  const totalFuelCost = vehicleLogs.reduce((sum, l) => sum + (l.totalCost || 0), 0);
  const totalFuelVolume = vehicleLogs.reduce((sum, l) => sum + (l.fuelAmount || 0), 0);
  const totalDistanceTracked = vehicleLogs.reduce((sum, l) => sum + (l.distanceDelta || 0), 0);
  const avgCostPerDist = totalDistanceTracked > 0 ? totalFuelCost / totalDistanceTracked : 0;
  const avgFuelPrice = totalFuelVolume > 0 ? totalFuelCost / totalFuelVolume : 3.65;

  // Search filtered logs
  const filteredLogs = useMemo(() => {
    if (!searchQuery.trim()) return vehicleLogs;
    const q = searchQuery.toLowerCase();
    return vehicleLogs.filter(
      (l) =>
        (l.gasStation && l.gasStation.toLowerCase().includes(q)) ||
        (l.notes && l.notes.toLowerCase().includes(q)) ||
        l.date.includes(q) ||
        String(l.odometer).includes(q)
    );
  }, [vehicleLogs, searchQuery]);

  // Data for chart (in chronological order, earliest to latest)
  const chartData = useMemo(() => {
    return [...vehicleLogs]
      .filter((l) => l.calculatedEfficiency !== undefined)
      .sort((a, b) => a.odometer - b.odometer)
      .map((l) => ({
        date: l.date,
        odometer: l.odometer,
        efficiency: l.calculatedEfficiency!,
        formatted: formatEfficiency(l.calculatedEfficiency, vehicle.distanceUnit, selectedUnit),
        gallons: l.fuelAmount,
        cost: l.totalCost,
      }));
  }, [vehicleLogs, vehicle.distanceUnit, selectedUnit]);

  // SVG Chart Dimensions
  const svgWidth = 640;
  const svgHeight = 220;
  const padding = { top: 20, right: 30, bottom: 35, left: 45 };
  const graphWidth = svgWidth - padding.left - padding.right;
  const graphHeight = svgHeight - padding.top - padding.bottom;

  // Chart min/max
  const effValues = chartData.map((d) => d.efficiency);
  const minEff = effValues.length > 0 ? Math.floor(Math.min(...effValues) * 0.9) : 20;
  const maxEff = effValues.length > 0 ? Math.ceil(Math.max(...effValues) * 1.1) : 40;
  const effRange = maxEff - minEff || 1;

  // Convert datapoints to SVG points
  const points = chartData.map((d, i) => {
    const x = padding.left + (chartData.length > 1 ? (i / (chartData.length - 1)) * graphWidth : graphWidth / 2);
    const y = padding.top + graphHeight - ((d.efficiency - minEff) / effRange) * graphHeight;
    return { x, y, data: d };
  });

  const pathString = points.length > 0
    ? points.reduce((acc, pt, idx) => `${acc} ${idx === 0 ? 'M' : 'L'} ${pt.x.toFixed(1)} ${pt.y.toFixed(1)}`, '')
    : '';

  // Avg line Y coordinate
  const avgY = avgEfficiency
    ? padding.top + graphHeight - ((avgEfficiency - minEff) / effRange) * graphHeight
    : null;

  // Trip calculation results
  const tripEff = avgEfficiency || (vehicle.distanceUnit === 'miles' ? 30 : 12.7);
  const estimatedFuelNeeded = vehicle.distanceUnit === 'miles' 
    ? tripDistance / tripEff 
    : tripDistance / tripEff;
  const estimatedTripCost = estimatedFuelNeeded * (customPrice || avgFuelPrice);

  // Efficiency Area Gradient in SVG
  const strokeColor = "#6366f1"; // Indigo-500 for Geometric Balance

  return (
    <div id="fuel-efficiency-tracker-view" className="space-y-6">
      
      {/* Top Header & Metric Highlights */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold mb-1">
            CONSUMPTION ANALYTICS
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Fuel className="w-6 h-6 text-indigo-400" />
            Fuel Efficiency &amp; Mileage
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Automated consumption telemetry, rolling economy calculations, and cost per {vehicle.distanceUnit} for {vehicle.year} {vehicle.make} {vehicle.model}.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Unit Toggle */}
          <div className="bg-slate-950 border border-slate-800 rounded-sm p-1 flex items-center text-xs font-mono">
            <button
              onClick={() => setSelectedUnit('mpg_us')}
              className={`px-3 py-1 rounded-sm uppercase tracking-wider transition-colors ${
                selectedUnit === 'mpg_us' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              US MPG
            </button>
            <button
              onClick={() => setSelectedUnit('l_per_100km')}
              className={`px-3 py-1 rounded-sm uppercase tracking-wider transition-colors ${
                selectedUnit === 'l_per_100km' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              L/100KM
            </button>
            <button
              onClick={() => setSelectedUnit('km_per_l')}
              className={`px-3 py-1 rounded-sm uppercase tracking-wider transition-colors ${
                selectedUnit === 'km_per_l' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              KM/L
            </button>
          </div>

          <button
            id="btn-open-trip-calculator"
            onClick={() => setShowTripCalculator(!showTripCalculator)}
            className="px-3 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-sm text-xs font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-1.5 transition-colors"
          >
            <Calculator className="w-4 h-4 text-indigo-400" />
            Trip Estimator
          </button>

          <button
            id="btn-add-fuel-entry"
            onClick={onOpenAddModal}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Fill-Up
          </button>
        </div>
      </div>

      {/* KPI Cards Grid - Geometric Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Average Fuel Economy */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-medium">
            <span>Average Economy</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tighter">
              {formatEfficiency(avgEfficiency, vehicle.distanceUnit, selectedUnit).value}
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">
              {formatEfficiency(avgEfficiency, vehicle.distanceUnit, selectedUnit).unit}
            </span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div className="bg-indigo-500 h-full w-[70%]" />
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500 uppercase">
            Across {efficiencies.length} full fill-ups
          </div>
        </div>

        {/* Latest Fill-up */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-medium">
            <span>Latest Fill-up</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-light text-emerald-400 tracking-tighter">
              {formatEfficiency(latestEfficiency, vehicle.distanceUnit, selectedUnit).value}
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">
              {formatEfficiency(latestEfficiency, vehicle.distanceUnit, selectedUnit).unit}
            </span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div className="bg-emerald-500 h-full w-[85%]" />
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500 uppercase">
            {vehicleLogs.length > 0 ? `@ ${vehicleLogs[0].odometer.toLocaleString()} ${vehicle.distanceUnit.toUpperCase()}` : 'NO RECORDS'}
          </div>
        </div>

        {/* Cost Per Distance */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-medium">
            <span>Cost per {vehicle.distanceUnit === 'miles' ? 'Mile' : 'Km'}</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tighter">
              ${avgCostPerDist.toFixed(2)}
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">
              /{vehicle.distanceUnit === 'miles' ? 'MI' : 'KM'}
            </span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div className="bg-amber-500 h-full w-[50%]" />
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500 uppercase">
            Avg Fuel: ${avgFuelPrice.toFixed(2)}/{vehicle.fuelVolumeUnit === 'gallons' ? 'GAL' : 'L'}
          </div>
        </div>

        {/* Total Tracked Fuel Spend */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-medium">
            <span>Total Fuel Spend</span>
            <Fuel className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tighter">
              ${totalFuelCost.toFixed(2)}
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">
              USD
            </span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div className="bg-indigo-500 h-full w-[60%]" />
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500 uppercase">
            {totalFuelVolume.toFixed(1)} {vehicle.fuelVolumeUnit.toUpperCase()} PUMPED
          </div>
        </div>
      </div>

      {/* Trip Fuel Estimator Widget (Collapsible) */}
      {showTripCalculator && (
        <div 
          id="trip-fuel-estimator-card"
          className="bg-indigo-950/20 border border-indigo-500/30 rounded-sm p-5 shadow-sm relative overflow-hidden"
        >
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-indigo-500/20">
            <div className="flex items-center gap-2">
              <Calculator className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-xs uppercase tracking-widest text-indigo-300">Trip Fuel &amp; Cost Forecaster</h3>
            </div>
            <button
              onClick={() => setShowTripCalculator(false)}
              className="text-xs font-mono uppercase text-slate-400 hover:text-white"
            >
              [Dismiss]
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Trip Distance ({vehicle.distanceUnit.toUpperCase()})
              </label>
              <input
                type="number"
                value={tripDistance}
                onChange={(e) => setTripDistance(Math.max(1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                placeholder="e.g. 300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Gas Price (${vehicle.fuelVolumeUnit === 'gallons' ? '/gal' : '/L'})
              </label>
              <input
                type="number"
                step="0.01"
                value={customPrice}
                onChange={(e) => setCustomPrice(Math.max(0.1, Number(e.target.value)))}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div className="bg-slate-950 rounded-sm p-3 border border-slate-800 flex flex-col justify-center">
              <div className="text-[11px] font-mono uppercase text-slate-500">Estimated Requirement:</div>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-xl font-bold font-mono text-emerald-400">
                  ${estimatedTripCost.toFixed(2)}
                </span>
                <span className="text-xs font-mono text-slate-300">
                  ({estimatedFuelNeeded.toFixed(1)} {vehicle.fuelVolumeUnit})
                </span>
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Target economy ({formatEfficiency(avgEfficiency, vehicle.distanceUnit, selectedUnit).value} {formatEfficiency(avgEfficiency, vehicle.distanceUnit, selectedUnit).unit})
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SVG Fuel Efficiency Trend Chart */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-5">
          <div>
            <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold mb-0.5">
              TELEMETRY CURVE
            </div>
            <h2 className="text-base font-bold uppercase tracking-wider text-white flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-400" />
              Efficiency Trend Benchmark
            </h2>
          </div>

          {avgEfficiency && (
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="flex items-center gap-1.5 text-slate-300">
                <span className="w-3 h-0.5 bg-indigo-500" />
                <span>Fill-up Economy</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-400">
                <span className="w-3 h-0.5 bg-emerald-400 border-b border-dashed border-emerald-400" />
                <span>Fleet Benchmark ({formatEfficiency(avgEfficiency, vehicle.distanceUnit, selectedUnit).value})</span>
              </div>
            </div>
          )}
        </div>

        {chartData.length >= 2 ? (
          <div className="w-full overflow-x-auto">
            <svg 
              viewBox={`0 0 ${svgWidth} ${svgHeight}`} 
              className="w-full h-56 select-none"
            >
              {/* Horizontal Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                const y = padding.top + graphHeight * ratio;
                const effVal = maxEff - ratio * effRange;
                return (
                  <g key={ratio}>
                    <line
                      x1={padding.left}
                      y1={y}
                      x2={svgWidth - padding.right}
                      y2={y}
                      stroke="#1e293b"
                      strokeDasharray="2 2"
                      strokeWidth="1"
                    />
                    <text
                      x={padding.left - 8}
                      y={y + 4}
                      textAnchor="end"
                      fill="#64748b"
                      fontSize="10"
                      fontFamily="monospace"
                    >
                      {effVal.toFixed(0)}
                    </text>
                  </g>
                );
              })}

              {/* Benchmark average horizontal line */}
              {avgY !== null && (
                <line
                  x1={padding.left}
                  y1={avgY}
                  x2={svgWidth - padding.right}
                  y2={avgY}
                  stroke="#10b981"
                  strokeWidth="1.5"
                  strokeDasharray="4 4"
                />
              )}

              {/* Efficiency Area Gradient */}
              <defs>
                <linearGradient id="effGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Path area */}
              {points.length > 0 && (
                <path
                  d={`${pathString} L ${points[points.length - 1].x} ${padding.top + graphHeight} L ${points[0].x} ${padding.top + graphHeight} Z`}
                  fill="url(#effGradient)"
                />
              )}

              {/* Primary Trend Line */}
              <path
                d={pathString}
                fill="none"
                stroke={strokeColor}
                strokeWidth="2"
                strokeLinecap="square"
                strokeLinejoin="miter"
              />

              {/* Data points & labels */}
              {points.map((pt, i) => (
                <g key={i} className="group cursor-pointer">
                  <circle
                    cx={pt.x}
                    cy={pt.y}
                    r="4"
                    fill="#020617"
                    stroke="#6366f1"
                    strokeWidth="2"
                    className="transition-transform group-hover:scale-125"
                  />
                  {/* Tooltip / Label */}
                  <text
                    x={pt.x}
                    y={pt.y - 10}
                    textAnchor="middle"
                    fill="#f8fafc"
                    fontSize="11"
                    fontWeight="bold"
                    fontFamily="monospace"
                  >
                    {pt.data.formatted.value}
                  </text>
                  {/* X-axis date / odo */}
                  <text
                    x={pt.x}
                    y={svgHeight - 10}
                    textAnchor="middle"
                    fill="#64748b"
                    fontSize="10"
                    fontFamily="monospace"
                  >
                    {pt.data.date.substring(5)}
                  </text>
                </g>
              ))}
            </svg>
          </div>
        ) : (
          <div className="py-12 text-center text-slate-400 text-xs font-mono uppercase tracking-wider">
            <Fuel className="w-8 h-8 text-slate-700 mx-auto mb-2" />
            <p>Log at least two consecutive fill-ups to display the fuel efficiency trend graph.</p>
            <button
              onClick={onOpenAddModal}
              className="mt-3 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-indigo-400 border border-slate-800 rounded-sm text-xs font-bold uppercase tracking-wider"
            >
              Add First Fill-Up
            </button>
          </div>
        )}
      </div>

      {/* Fuel Log History Table */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-sm shadow-sm overflow-hidden">
        {/* Table Header & Search Filter */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-white">Fuel Fill-Up Ledger</h2>
            <p className="text-[11px] font-mono text-slate-500 mt-0.5">
              Chronological log of gallons pumped, costs, and calculated fuel efficiency.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="SEARCH STATION, NOTES..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-sm text-xs font-mono text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none w-48 sm:w-60 uppercase"
              />
            </div>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] tracking-widest border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Odometer</th>
                <th className="py-3 px-4">Distance</th>
                <th className="py-3 px-4">Fuel Amount</th>
                <th className="py-3 px-4">Unit Price</th>
                <th className="py-3 px-4">Total Cost</th>
                <th className="py-3 px-4">Efficiency</th>
                <th className="py-3 px-4">Station / Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredLogs.map((log) => {
                const effObj = formatEfficiency(log.calculatedEfficiency, vehicle.distanceUnit, selectedUnit);
                const isAboveAvg = avgEfficiency && log.calculatedEfficiency && log.calculatedEfficiency >= avgEfficiency;

                return (
                  <tr key={log.id} className="hover:bg-slate-950/40 transition-colors">
                    <td className="py-3.5 px-4 font-mono text-slate-200 whitespace-nowrap">
                      {log.date}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-medium text-white whitespace-nowrap">
                      {log.odometer.toLocaleString()} <span className="text-slate-500 text-[10px]">{vehicle.distanceUnit}</span>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-300 whitespace-nowrap">
                      {log.distanceDelta ? (
                        <span className="text-indigo-400 font-semibold">+{log.distanceDelta} {vehicle.distanceUnit}</span>
                      ) : (
                        <span className="text-slate-600">--</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono whitespace-nowrap">
                      {log.fuelAmount.toFixed(2)} <span className="text-slate-500 text-[10px]">{vehicle.fuelVolumeUnit}</span>
                      {log.isFullTank && (
                        <span className="ml-1.5 px-1 py-0.2 bg-slate-900 text-slate-300 rounded-sm text-[9px] font-mono uppercase border border-slate-800">
                          FULL
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-slate-400 whitespace-nowrap">
                      ${log.pricePerUnit.toFixed(2)}/{vehicle.fuelVolumeUnit === 'gallons' ? 'gal' : 'L'}
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-white whitespace-nowrap">
                      ${log.totalCost.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.calculatedEfficiency ? (
                        <span className={`inline-flex items-center gap-1 font-mono font-bold px-2 py-0.5 rounded-sm ${
                          isAboveAvg 
                            ? 'bg-indigo-950 text-indigo-300 border border-indigo-800' 
                            : 'bg-slate-900 text-amber-300 border border-slate-800'
                        }`}>
                          {effObj.value} {effObj.unit}
                        </span>
                      ) : (
                        <span className="text-slate-600 text-[11px] font-mono uppercase" title="Calculated from next full tank">
                          Baseline
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 max-w-[200px] truncate text-slate-400">
                      {log.gasStation && <strong className="text-slate-300 block truncate">{log.gasStation}</strong>}
                      {log.notes && <span className="text-[11px] truncate block">{log.notes}</span>}
                      {!log.gasStation && !log.notes && <span className="text-slate-600">--</span>}
                    </td>
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => onEditFuelLog(log)}
                          className="p-1 text-slate-400 hover:text-white rounded-sm hover:bg-slate-800 transition-colors"
                          title="Edit log"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onDeleteFuelLog(log.id)}
                          className="p-1 text-slate-400 hover:text-red-400 rounded-sm hover:bg-slate-800 transition-colors"
                          title="Delete log"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan={9} className="py-8 text-center text-slate-500 font-mono text-xs uppercase tracking-wider">
                    No fuel logs found matching your filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
