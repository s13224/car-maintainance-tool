import React, { useState, useEffect } from 'react';
import { X, Gauge, AlertTriangle, CheckCircle2, ArrowRight } from 'lucide-react';
import { Vehicle } from '../types';

interface UpdateOdometerModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  onSave: (newOdometer: number) => void;
}

export const UpdateOdometerModal: React.FC<UpdateOdometerModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSave,
}) => {
  const [newOdometer, setNewOdometer] = useState<number>(vehicle.currentOdometer);

  useEffect(() => {
    setNewOdometer(vehicle.currentOdometer);
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newOdometer < vehicle.currentOdometer) {
      if (!confirm(`The entered odometer (${newOdometer.toLocaleString()}) is lower than current (${vehicle.currentOdometer.toLocaleString()}). Are you sure you want to reduce the odometer?`)) {
        return;
      }
    }
    onSave(newOdometer);
    onClose();
  };

  const delta = newOdometer - vehicle.currentOdometer;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-sm w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
              <Gauge className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-white">Update Odometer</h2>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
              Current Recorded Reading
            </label>
            <div className="text-lg font-mono font-light text-slate-400 bg-slate-950 p-3 rounded-sm border border-slate-800">
              {vehicle.currentOdometer.toLocaleString()} {vehicle.distanceUnit.toUpperCase()}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
              New Odometer Reading ({vehicle.distanceUnit.toUpperCase()})
            </label>
            <input
              type="number"
              required
              min="0"
              value={newOdometer}
              onChange={(e) => setNewOdometer(Number(e.target.value))}
              className="w-full bg-slate-950 border border-slate-800 rounded-sm px-4 py-3 text-lg text-white font-mono font-bold focus:border-indigo-500 focus:outline-none"
              autoFocus
            />
            {delta > 0 && (
              <span className="text-xs font-mono text-emerald-400 mt-1.5 block font-semibold">
                +{delta.toLocaleString()} {vehicle.distanceUnit.toUpperCase()} DRIVEN SINCE LAST LOG
              </span>
            )}
          </div>

          {/* Quick mileage increment buttons */}
          <div>
            <span className="block text-[10px] font-mono uppercase tracking-wider text-slate-400 mb-1.5 font-bold">
              QUICK INCREMENTS:
            </span>
            <div className="flex items-center gap-2">
              {[50, 150, 300, 500].map((inc) => (
                <button
                  key={inc}
                  type="button"
                  onClick={() => setNewOdometer((prev) => prev + inc)}
                  className="flex-1 py-1.5 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 rounded-sm text-xs font-mono font-semibold transition-colors"
                >
                  +{inc}
                </button>
              ))}
            </div>
          </div>

          <p className="text-[11px] font-mono text-slate-400 leading-relaxed pt-1">
            Updating the odometer recalculates remaining distance until next engine oil renewal and scheduled service milestones.
          </p>

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
              Update Mileage
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
