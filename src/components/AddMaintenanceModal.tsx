import React, { useState, useEffect } from 'react';
import { X, Wrench, Calendar, Gauge, DollarSign, Droplet, Disc, Layers, Battery, ShieldCheck, Check } from 'lucide-react';
import { Vehicle, MaintenanceLog, ServiceType } from '../types';

interface AddMaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle;
  editingLog?: MaintenanceLog | null;
  preselectedType?: ServiceType;
  onSave: (log: MaintenanceLog, updatesVehicleOilStatus?: boolean) => void;
}

const PRESETS: { type: ServiceType; label: string; defaultParts?: string; icon: any }[] = [
  { type: 'oil_change', label: 'Oil & Filter Change', defaultParts: 'Full Synthetic Motor Oil + OEM Filter & Crush Washer', icon: Droplet },
  { type: 'tire_rotation', label: 'Tire Rotation', defaultParts: '4-wheel cross rotation + tire pressure adjusted', icon: Disc },
  { type: 'brake_service', label: 'Brake Service', defaultParts: 'Ceramic brake pads & hardware kit', icon: Disc },
  { type: 'engine_filter', label: 'Engine Air Filter', defaultParts: 'High-flow engine air filter element', icon: Layers },
  { type: 'cabin_filter', label: 'Cabin Air Filter', defaultParts: 'Activated charcoal cabin air filter', icon: Layers },
  { type: 'battery', label: 'Battery Replacement', defaultParts: '12V AGM / Lead-Acid Battery', icon: Battery },
  { type: 'inspection_emissions', label: 'State Safety Inspection', defaultParts: 'Multi-point inspection & OBD scan', icon: ShieldCheck },
  { type: 'transmission_fluid', label: 'Transmission Fluid', defaultParts: 'Genuine ATF/CVT fluid flush', icon: Wrench },
];

export const AddMaintenanceModal: React.FC<AddMaintenanceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  editingLog,
  preselectedType,
  onSave,
}) => {
  const [serviceType, setServiceType] = useState<ServiceType>('oil_change');
  const [customServiceName, setCustomServiceName] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [odometer, setOdometer] = useState<number>(vehicle.currentOdometer);
  const [cost, setCost] = useState<string>('65.00');
  const [serviceProvider, setServiceProvider] = useState<string>('Express Auto Care');
  const [partsReplaced, setPartsReplaced] = useState<string>('Full Synthetic 0W-20 (4.5 qts) + OEM Filter');
  const [notes, setNotes] = useState<string>('Checked all fluids, reset maintenance minder to 100%');
  const [nextDueOdometer, setNextDueOdometer] = useState<number>(vehicle.currentOdometer + (vehicle.oilChangeIntervalDistance || 5000));
  const [nextDueDate, setNextDueDate] = useState<string>('');

  useEffect(() => {
    // Calculate default next due date 6 months from now
    const d = new Date();
    d.setMonth(d.getMonth() + (vehicle.oilChangeIntervalMonths || 6));
    const nextDateStr = d.toISOString().split('T')[0];

    if (editingLog) {
      setServiceType(editingLog.serviceType);
      setCustomServiceName(editingLog.customServiceName || '');
      setDate(editingLog.date);
      setOdometer(editingLog.odometer);
      setCost(String(editingLog.cost));
      setServiceProvider(editingLog.serviceProvider || '');
      setPartsReplaced(editingLog.partsReplaced || '');
      setNotes(editingLog.notes || '');
      setNextDueOdometer(editingLog.nextDueOdometer || (editingLog.odometer + vehicle.oilChangeIntervalDistance));
      setNextDueDate(editingLog.nextDueDate || nextDateStr);
    } else {
      const type = preselectedType || 'oil_change';
      setServiceType(type);
      setCustomServiceName('');
      setDate(new Date().toISOString().split('T')[0]);
      setOdometer(vehicle.currentOdometer);
      
      const preset = PRESETS.find((p) => p.type === type);
      if (type === 'oil_change') {
        setCost('68.50');
        setPartsReplaced(`${vehicle.oilType} Oil + OEM Filter`);
        setNotes('Oil drained, filter replaced, maintenance indicator reset.');
        setNextDueOdometer(vehicle.currentOdometer + (vehicle.oilChangeIntervalDistance || 5000));
        setNextDueDate(nextDateStr);
      } else {
        setCost('45.00');
        setPartsReplaced(preset?.defaultParts || '');
        setNotes('');
        setNextDueOdometer(vehicle.currentOdometer + (vehicle.tireRotationIntervalDistance || 7500));
        setNextDueDate(nextDateStr);
      }
    }
  }, [editingLog, preselectedType, vehicle, isOpen]);

  const handleSelectPreset = (preset: typeof PRESETS[0]) => {
    setServiceType(preset.type);
    if (preset.type === 'oil_change') {
      setPartsReplaced(`${vehicle.oilType} Oil + OEM Filter`);
      setCost('68.50');
      setNextDueOdometer(odometer + (vehicle.oilChangeIntervalDistance || 5000));
    } else {
      setPartsReplaced(preset.defaultParts || '');
      if (preset.type === 'tire_rotation') {
        setCost('25.00');
        setNextDueOdometer(odometer + (vehicle.tireRotationIntervalDistance || 7500));
      } else {
        setCost('50.00');
      }
    }
  };

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const costNum = parseFloat(cost) || 0;

    const isOilChange = serviceType === 'oil_change';

    const log: MaintenanceLog = {
      id: editingLog ? editingLog.id : `maint-${Date.now()}`,
      vehicleId: vehicle.id,
      date,
      odometer: Number(odometer),
      serviceType,
      customServiceName: customServiceName.trim() || undefined,
      cost: costNum,
      serviceProvider: serviceProvider.trim() || 'DIY / Self',
      partsReplaced: partsReplaced.trim() || undefined,
      notes: notes.trim() || undefined,
      isOilChange,
      nextDueOdometer: nextDueOdometer ? Number(nextDueOdometer) : undefined,
      nextDueDate: nextDueDate || undefined,
    };

    onSave(log, isOilChange);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-sm w-full max-w-xl shadow-2xl overflow-hidden">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-white">
                {editingLog ? 'Edit Service Record' : 'Log Maintenance Service'}
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
        <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[82vh] overflow-y-auto">
          
          {/* Preset Chips */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-2">
              Common Service Presets
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PRESETS.map((preset) => {
                const isSelected = serviceType === preset.type;
                const Icon = preset.icon;
                return (
                  <button
                    key={preset.type}
                    type="button"
                    onClick={() => handleSelectPreset(preset)}
                    className={`p-2 rounded-sm border text-xs flex items-center gap-1.5 transition-colors ${
                      isSelected
                        ? 'bg-indigo-950 text-indigo-200 font-bold border-indigo-500 shadow-sm'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5 shrink-0 text-indigo-400" />
                    <span className="truncate text-[11px] font-mono uppercase">{preset.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Oil Change Status Banner Notice */}
          {serviceType === 'oil_change' && (
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/40 rounded-sm flex items-center gap-2.5 text-xs text-indigo-300 font-mono">
              <Droplet className="w-4 h-4 shrink-0 text-indigo-400" />
              <span>
                Logging this oil change will automatically reset the oil life countdown to 100% and reschedule your next reminder!
              </span>
            </div>
          )}

          {/* Row 1: Date & Odometer */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Service Date
              </label>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="date"
                  required
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm pl-9 pr-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none uppercase"
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
                  onChange={(e) => {
                    const newOdo = Number(e.target.value);
                    setOdometer(newOdo);
                    if (serviceType === 'oil_change') {
                      setNextDueOdometer(newOdo + (vehicle.oilChangeIntervalDistance || 5000));
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm pl-9 pr-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Row 2: Cost & Service Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Total Service Cost ($)
              </label>
              <div className="relative">
                <DollarSign className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
                <input
                  type="number"
                  step="0.01"
                  required
                  min="0"
                  placeholder="65.00"
                  value={cost}
                  onChange={(e) => setCost(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm pl-9 pr-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Service Provider / Shop
              </label>
              <input
                type="text"
                placeholder="e.g. Honda Dealership, Jiffy Lube, DIY"
                value={serviceProvider}
                onChange={(e) => setServiceProvider(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-sm text-white font-mono uppercase focus:border-indigo-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Parts Replaced & Specifications */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
              Parts Replaced / Fluid Specs
            </label>
            <input
              type="text"
              placeholder="e.g. Mobil 1 0W-20 (4.5 qts) + OEM filter 15400-PLM-A02"
              value={partsReplaced}
              onChange={(e) => setPartsReplaced(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
            />
          </div>

          {/* Next Scheduled Due (Automatic Reminders Sync) */}
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-sm space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 block">
              SCHEDULED REMINDER SYNC
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Next Due Odometer ({vehicle.distanceUnit.toUpperCase()})
                </label>
                <input
                  type="number"
                  value={nextDueOdometer}
                  onChange={(e) => setNextDueOdometer(Number(e.target.value))}
                  className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-[11px] font-mono uppercase text-slate-300 mb-1">
                  Next Due Date
                </label>
                <input
                  type="date"
                  value={nextDueDate}
                  onChange={(e) => setNextDueDate(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-sm px-3 py-1.5 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none uppercase"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
              Service Notes &amp; Observations (Optional)
            </label>
            <textarea
              rows={2}
              placeholder="e.g. Inspected brake pads (6mm remaining), tire tread at 7/32, battery voltage 12.6V"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs text-white font-mono focus:border-indigo-500 focus:outline-none uppercase"
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
              {editingLog ? 'Update Service Record' : 'Save Maintenance Record'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
