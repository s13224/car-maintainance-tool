import React, { useState, useEffect } from 'react';
import { X, Car, Settings, Check } from 'lucide-react';
import { Vehicle } from '../types';

interface VehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle?: Vehicle | null; // If null, creating new vehicle
  onSave: (vehicle: Vehicle) => void;
  onDelete?: (id: string) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onSave,
  onDelete,
}) => {
  const [make, setMake] = useState('Toyota');
  const [model, setModel] = useState('RAV4');
  const [year, setYear] = useState<number>(2023);
  const [trim, setTrim] = useState('XLE AWD');
  const [licensePlate, setLicensePlate] = useState('');
  const [vin, setVin] = useState('');
  const [currentOdometer, setCurrentOdometer] = useState<number>(24000);
  const [distanceUnit, setDistanceUnit] = useState<'miles' | 'km'>('miles');
  const [fuelVolumeUnit, setFuelVolumeUnit] = useState<'gallons' | 'liters'>('gallons');
  const [oilInterval, setOilInterval] = useState<number>(5000);
  const [oilMonths, setOilMonths] = useState<number>(6);
  const [oilType, setOilType] = useState<Vehicle['oilType']>('Full Synthetic');

  useEffect(() => {
    if (vehicle) {
      setMake(vehicle.make);
      setModel(vehicle.model);
      setYear(vehicle.year);
      setTrim(vehicle.trim || '');
      setLicensePlate(vehicle.licensePlate || '');
      setVin(vehicle.vin || '');
      setCurrentOdometer(vehicle.currentOdometer);
      setDistanceUnit(vehicle.distanceUnit);
      setFuelVolumeUnit(vehicle.fuelVolumeUnit);
      setOilInterval(vehicle.oilChangeIntervalDistance || 5000);
      setOilMonths(vehicle.oilChangeIntervalMonths || 6);
      setOilType(vehicle.oilType || 'Full Synthetic');
    } else {
      setMake('');
      setModel('');
      setYear(2022);
      setTrim('');
      setLicensePlate('');
      setVin('');
      setCurrentOdometer(0);
      setDistanceUnit('miles');
      setFuelVolumeUnit('gallons');
      setOilInterval(5000);
      setOilMonths(6);
      setOilType('Full Synthetic');
    }
  }, [vehicle, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!make.trim() || !model.trim()) {
      alert('Please enter a vehicle make and model.');
      return;
    }

    const savedVehicle: Vehicle = {
      id: vehicle ? vehicle.id : `veh-${Date.now()}`,
      name: `${year} ${make.trim()} ${model.trim()}`,
      make: make.trim(),
      model: model.trim(),
      year: Number(year),
      trim: trim.trim() || undefined,
      licensePlate: licensePlate.trim() || undefined,
      vin: vin.trim() || undefined,
      currentOdometer: Number(currentOdometer),
      distanceUnit,
      fuelVolumeUnit,
      oilChangeIntervalDistance: Number(oilInterval),
      oilChangeIntervalMonths: Number(oilMonths),
      tireRotationIntervalDistance: 7500,
      oilType,
      lastOilChangeOdometer: vehicle?.lastOilChangeOdometer,
      lastOilChangeDate: vehicle?.lastOilChangeDate,
    };

    onSave(savedVehicle);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-sm w-full max-w-lg shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
              <Car className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-white">
                {vehicle ? 'Edit Vehicle Profile' : 'Add New Vehicle'}
              </h2>
              <p className="text-[11px] font-mono text-slate-500 uppercase">
                Configure specs and service intervals
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Year
              </label>
              <input
                type="number"
                required
                min="1950"
                max="2030"
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Make
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Honda, Toyota"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-sm text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Model
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Civic, RAV4"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-sm text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Trim / Engine (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. EX-L, 2.0L Turbo"
                value={trim}
                onChange={(e) => setTrim(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Current Odometer
              </label>
              <input
                type="number"
                required
                min="0"
                value={currentOdometer}
                onChange={(e) => setCurrentOdometer(Number(e.target.value))}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Unit Settings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-slate-950 rounded-sm border border-slate-800">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Distance Unit
              </label>
              <select
                value={distanceUnit}
                onChange={(e) => setDistanceUnit(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-1.5 text-xs text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
              >
                <option value="miles">Miles (mi)</option>
                <option value="km">Kilometers (km)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Fuel Volume Unit
              </label>
              <select
                value={fuelVolumeUnit}
                onChange={(e) => setFuelVolumeUnit(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-1.5 text-xs text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
              >
                <option value="gallons">Gallons (gal)</option>
                <option value="liters">Liters (L)</option>
              </select>
            </div>
          </div>

          {/* Oil Interval & Specs */}
          <div className="space-y-3 p-3.5 bg-slate-950 rounded-sm border border-slate-800">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 block">
              DEFAULT OIL CHANGE RULES
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Change Interval ({distanceUnit.toUpperCase()})
                </label>
                <input
                  type="number"
                  step="500"
                  value={oilInterval}
                  onChange={(e) => setOilInterval(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Time Interval (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={oilMonths}
                  onChange={(e) => setOilMonths(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                Oil Specification
              </label>
              <select
                value={oilType}
                onChange={(e) => setOilType(e.target.value as any)}
                className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-1.5 text-xs text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
              >
                <option value="Full Synthetic">Full Synthetic</option>
                <option value="Synthetic Blend">Synthetic Blend</option>
                <option value="Conventional">Conventional</option>
                <option value="High Mileage">High Mileage</option>
              </select>
            </div>
          </div>

          {/* License plate and VIN */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                License Plate (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. 7ABC123"
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs text-white uppercase font-mono focus:border-indigo-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                VIN (Optional)
              </label>
              <input
                type="text"
                placeholder="17-character VIN"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Footer Buttons */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
            {vehicle && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  if (confirm(`Are you sure you want to delete ${vehicle.name}? All associated fuel logs and maintenance records will be removed.`)) {
                    onDelete(vehicle.id);
                    onClose();
                  }
                }}
                className="text-xs font-mono uppercase tracking-wider text-red-400 hover:text-red-300 underline font-medium"
              >
                Delete Vehicle
              </button>
            ) : (
              <div />
            )}

            <div className="flex items-center gap-3">
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
                {vehicle ? 'Save Vehicle' : 'Add Vehicle'}
              </button>
            </div>
          </div>
        </form>

      </div>
    </div>
  );
};
