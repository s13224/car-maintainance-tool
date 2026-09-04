import React, { useState, useEffect } from 'react';
import { X, Fuel, DollarSign, Calendar, Gauge, Info, Check } from 'lucide-react';
import { Vehicle, FuelLog } from '../types';

interface AddFuelModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  editingLog?: FuelLog | null;
  onSave: (log: Omit<FuelLog, 'distanceDelta' | 'calculatedEfficiency' | 'costPerDistance'>) => void;
}

export const AddFuelModal: React.FC<AddFuelModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  editingLog,
  onSave,
}) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number>(vehicle.currentOdometer);
  const [fuelAmount, setFuelAmount] = useState<string>('10.5');
  const [pricePerUnit, setPricePerUnit] = useState<string>('3.59');
  const [totalCost, setTotalCost] = useState<string>('37.70');
  const [isFullTank, setIsFullTank] = useState<boolean>(true);
  const [missedPrevious, setMissedPrevious] = useState<boolean>(false);
  const [gasStation, setGasStation] = useState<string>('');
  const [fuelGrade, setFuelGrade] = useState<FuelLog['fuelGrade']>('Regular 87');
  const [notes, setNotes] = useState<string>('');

  useEffect(() => {
    if (editingLog) {
      setDate(editingLog.date);
      setOdometer(editingLog.odometer);
      setFuelAmount(String(editingLog.fuelAmount));
      setPricePerUnit(String(editingLog.pricePerUnit));
      setTotalCost(String(editingLog.totalCost));
      setIsFullTank(editingLog.isFullTank);
      setMissedPrevious(Boolean(editingLog.missedPreviousFillUp));
      setGasStation(editingLog.gasStation || '');
      setFuelGrade(editingLog.fuelGrade || 'Regular 87');
      setNotes(editingLog.notes || '');
    } else {
      setDate(new Date().toISOString().split('T')[0]);
      setOdometer(vehicle.currentOdometer);
      setFuelAmount('10.5');
      setPricePerUnit('3.59');
      setTotalCost((10.5 * 3.59).toFixed(2));
      setIsFullTank(true);
      setMissedPrevious(false);
      setGasStation('');
      setFuelGrade('Regular 87');
      setNotes('');
    }
  }, [editingLog, vehicle, isOpen]);

  // Handle amount or price change -> auto-calculate total cost
  const handleAmountChange = (val: string) => {
    setFuelAmount(val);
    const amt = parseFloat(val);
    const prc = parseFloat(pricePerUnit);
    if (!isNaN(amt) && !isNaN(prc)) {
      setTotalCost((amt * prc).toFixed(2));
    }
  };

  const handlePriceChange = (val: string) => {
    setPricePerUnit(val);
    const amt = parseFloat(fuelAmount);
    const prc = parseFloat(val);
    if (!isNaN(amt) && !isNaN(prc)) {
      setTotalCost((amt * prc).toFixed(2));
    }
  };

  const handleTotalCostChange = (val: string) => {
    setTotalCost(val);
    const tot = parseFloat(val);
    const amt = parseFloat(fuelAmount);
    if (!isNaN(tot) && !isNaN(amt) && amt > 0) {
      setPricePerUnit((tot / amt).toFixed(3));
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(fuelAmount);
    const priceNum = parseFloat(pricePerUnit);
    const totalNum = parseFloat(totalCost);

    if (isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid fuel amount.');
      return;
    }
    if (isNaN(odometer) || odometer < 0) {
      alert('Please enter a valid odometer reading.');
      return;
    }

    onSave({
      id: editingLog ? editingLog.id : `fuel-${Date.now()}`,
      vehicleId: vehicle.id,
      date,
      odometer: Number(odometer),
      fuelAmount: amountNum,
      pricePerUnit: !isNaN(priceNum) ? priceNum : totalNum / amountNum,
      totalCost: !isNaN(totalNum) ? totalNum : amountNum * priceNum,
      isFullTank,
      missedPreviousFillUp: missedPrevious,
      gasStation: gasStation.trim() || undefined,
      fuelGrade,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-sm w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
              <Fuel className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-white">
                {editingLog ? 'Edit Fuel Fill-Up' : 'Log Fuel Fill-Up'}
              </h2>
              <p className="text-[11px] font-mono text-slate-500 uppercase">
                {vehicle.year} {vehicle.make} {vehicle.model}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-sm hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Row 1: Date & Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Fill-Up Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm pl-9 pr-3 py-2 text-sm font-mono text-white focus:border-indigo-500 focus:outline-none uppercase"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Odometer Reading ({vehicle.distanceUnit.toUpperCase()})
              </label>
              <div className="relative">
                <Gauge className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  required
                  min="0"
                  value={odometer}
                  onChange={(e) => setOdometer(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm pl-9 pr-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <span className="text-[10px] font-mono text-slate-500 mt-1 block uppercase">
                Current vehicle odo: {vehicle.currentOdometer.toLocaleString()} {vehicle.distanceUnit}
              </span>
            </div>
          </div>

          {/* Row 2: Fuel Amount & Price Per Unit & Total Cost */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Fuel Amount ({vehicle.fuelVolumeUnit.toUpperCase()})
              </label>
              <input
                type="number"
                step="0.01"
                required
                min="0.1"
                placeholder="10.5"
                value={fuelAmount}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Price / {vehicle.fuelVolumeUnit === 'gallons' ? 'GAL' : 'LITER'}
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3 top-2 text-sm font-mono">$</span>
                <input
                  type="number"
                  step="0.001"
                  required
                  placeholder="3.59"
                  value={pricePerUnit}
                  onChange={(e) => handlePriceChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm pl-7 pr-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Total Cost
              </label>
              <div className="relative">
                <span className="text-slate-500 absolute left-3 top-2 text-sm font-mono">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="37.70"
                  value={totalCost}
                  onChange={(e) => handleTotalCostChange(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm pl-7 pr-3 py-2 text-sm text-white font-mono font-bold focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Fill-up options toggles */}
          <div className="p-3 bg-slate-950 rounded-sm border border-slate-800 space-y-2.5">
            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200">
              <input
                type="checkbox"
                checked={isFullTank}
                onChange={(e) => setIsFullTank(e.target.checked)}
                className="w-4 h-4 rounded-none text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
              />
              <span className="font-semibold uppercase tracking-wide text-[11px]">Filled to full tank (Recommended)</span>
            </label>
            <p className="text-[10px] font-mono text-slate-500 pl-6">
              Essential for precise fuel economy calculations. Delta distance will be computed from previous fill-up.
            </p>

            <label className="flex items-center gap-2.5 cursor-pointer text-xs text-slate-200 pt-1 border-t border-slate-800">
              <input
                type="checkbox"
                checked={missedPrevious}
                onChange={(e) => setMissedPrevious(e.target.checked)}
                className="w-4 h-4 rounded-none text-indigo-600 bg-slate-900 border-slate-700 focus:ring-0"
              />
              <span className="text-[11px] text-slate-400">Missed previous fill-up (Resets efficiency baseline)</span>
            </label>
          </div>

          {/* Row 3: Fuel Grade & Gas Station */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Fuel Grade
              </label>
              <select
                value={fuelGrade}
                onChange={(e) => setFuelGrade(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs font-mono uppercase text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Regular 87">Regular (87 Octane)</option>
                <option value="Midgrade 89">Midgrade (89 Octane)</option>
                <option value="Premium 91-93">Premium (91-93 Octane)</option>
                <option value="Diesel">Diesel</option>
                <option value="E85">E85 Flex Fuel</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Gas Station (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Costco, Shell, Chevron"
                value={gasStation}
                onChange={(e) => setGasStation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none uppercase"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
              Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Highway trip, heavy traffic, cold weather"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs font-mono text-white focus:border-indigo-500 focus:outline-none uppercase"
            />
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-sm text-xs font-mono uppercase tracking-wider text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm transition-colors"
            >
              {editingLog ? 'Update Fill-Up' : 'Save Fill-Up Record'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
