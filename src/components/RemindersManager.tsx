import React, { useState } from 'react';
import { 
  Bell, 
  Droplet, 
  Clock, 
  AlertTriangle, 
  CheckCircle2, 
  Settings, 
  Volume2, 
  Wrench, 
  Calendar, 
  Gauge, 
  ShieldCheck, 
  Info,
  Sparkles,
  RefreshCw,
  Sliders
} from 'lucide-react';
import { Vehicle, AutoReminder, MaintenanceLog } from '../types';

interface RemindersManagerProps {
  vehicle: Vehicle;
  reminders: AutoReminder[];
  onUpdateVehicleIntervals: (
    distanceInterval: number,
    monthsInterval: number,
    oilType: Vehicle['oilType']
  ) => void;
  onLogOilChange: () => void;
  onTriggerTestReminder: (type: 'oil_change' | 'tire_rotation') => void;
  browserNotificationPermission: NotificationPermission | 'unsupported';
  onRequestNotificationPermission: () => void;
}

export const RemindersManager: React.FC<RemindersManagerProps> = ({
  vehicle,
  reminders,
  onUpdateVehicleIntervals,
  onLogOilChange,
  onTriggerTestReminder,
  browserNotificationPermission,
  onRequestNotificationPermission,
}) => {
  const oilReminder = reminders.find((r) => r.type === 'oil_change') || reminders[0];

  // Local state for interval form
  const [distanceInterval, setDistanceInterval] = useState(vehicle.oilChangeIntervalDistance || 5000);
  const [monthsInterval, setMonthsInterval] = useState(vehicle.oilChangeIntervalMonths || 6);
  const [oilType, setOilType] = useState<Vehicle['oilType']>(vehicle.oilType || 'Full Synthetic');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Interval presets
  const INTERVAL_PRESETS = [
    { label: '3,000 mi / 3 mo', dist: 3000, mo: 3, type: 'Conventional' as const, desc: 'Best for older engines or severe city driving' },
    { label: '5,000 mi / 6 mo', dist: 5000, mo: 6, type: 'Synthetic Blend' as const, desc: 'Standard manufacturer interval for most modern vehicles' },
    { label: '7,500 mi / 6 mo', dist: 7500, mo: 6, type: 'Full Synthetic' as const, desc: 'Recommended for high-efficiency modern synthetic oils' },
    { label: '10,000 mi / 12 mo', dist: 10000, mo: 12, type: 'Full Synthetic' as const, desc: 'Extended interval for premium synthetics & highway driving' },
  ];

  const handleSaveIntervals = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateVehicleIntervals(distanceInterval, monthsInterval, oilType);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const lifeRemaining = Math.max(0, 100 - (oilReminder?.percentageUsed || 0));
  const isOverdue = oilReminder?.status === 'overdue';
  const isDueSoon = oilReminder?.status === 'due_soon';

  return (
    <div id="reminders-manager-view" className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold mb-1">
            INTERVAL AUTOMATION
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Bell className="w-6 h-6 text-indigo-400" />
            Automatic Service Reminders &amp; Oil Health
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Automated tracking engine monitors odometer and elapsed calendar time to trigger automatic maintenance alerts before component wear occurs.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="btn-reminders-test-alert"
            onClick={() => onTriggerTestReminder('oil_change')}
            className="px-3.5 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-sm text-xs font-semibold uppercase tracking-wider flex items-center gap-2 transition-colors"
            title="Dispatch a live automatic reminder test"
          >
            <Volume2 className="w-4 h-4 text-indigo-400" />
            <span>Test Alert</span>
          </button>

          <button
            id="btn-reminders-log-oil"
            onClick={onLogOilChange}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-sm flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Wrench className="w-4 h-4" />
            <span>Log Oil Change</span>
          </button>
        </div>
      </div>

      {/* Primary Oil Life Status Card - Geometric Balance */}
      <div className={`rounded-sm border p-6 ${
        isOverdue ? 'bg-red-950/20 border-red-800 shadow-sm' :
        isDueSoon ? 'bg-amber-950/20 border-amber-800 shadow-sm' :
        'bg-slate-900/50 border-slate-800 shadow-sm'
      }`}>
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          
          {/* Left: Radial / Meter Visual */}
          <div className="flex flex-col sm:flex-row items-center gap-6 text-center sm:text-left">
            <div className="relative w-36 h-36 flex items-center justify-center shrink-0">
              {/* SVG Circular Progress Meter */}
              <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 120 120">
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className="text-slate-800"
                  strokeWidth="8"
                  stroke="currentColor"
                  fill="transparent"
                />
                <circle
                  cx="60"
                  cy="60"
                  r="48"
                  className={`transition-all duration-700 ${
                    isOverdue ? 'text-red-500' : isDueSoon ? 'text-amber-400' : 'text-indigo-500'
                  }`}
                  strokeWidth="8"
                  strokeDasharray={2 * Math.PI * 48}
                  strokeDashoffset={2 * Math.PI * 48 * (1 - lifeRemaining / 100)}
                  strokeLinecap="square"
                  stroke="currentColor"
                  fill="transparent"
                />
              </svg>
              <div className="absolute flex flex-col items-center justify-center">
                <Droplet className={`w-5 h-5 mb-0.5 ${
                  isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-indigo-400'
                }`} />
                <span className="text-3xl font-light font-mono text-white tracking-tighter">
                  {lifeRemaining}%
                </span>
                <span className="text-[9px] text-slate-400 font-mono font-bold uppercase tracking-widest">
                  Oil Life
                </span>
              </div>
            </div>

            <div>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <h2 className="text-lg font-bold uppercase tracking-wider text-white">
                  Engine Oil &amp; Filter Telemetry
                </h2>
                <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono font-bold uppercase tracking-widest ${
                  isOverdue ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse' :
                  isDueSoon ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                  'bg-indigo-950 text-indigo-300 border border-indigo-800'
                }`}>
                  {isOverdue ? 'Service Overdue' : isDueSoon ? 'Service Due Soon' : 'Optimal Condition'}
                </span>
              </div>

              <p className="mt-2 text-xs font-mono text-slate-300 max-w-xl">
                {isOverdue ? (
                  <span className="text-red-300">
                    Engine oil renewal is <strong>OVERDUE BY {Math.abs(oilReminder.distanceRemaining).toLocaleString()} {vehicle.distanceUnit.toUpperCase()}</strong>. Extended driving leads to excessive thermal degradation and wear.
                  </span>
                ) : isDueSoon ? (
                  <span className="text-amber-200">
                    Scheduled threshold approaching: <strong>{oilReminder.distanceRemaining.toLocaleString()} {vehicle.distanceUnit.toUpperCase()}</strong> remaining (approx. {oilReminder.daysRemaining} days). We recommend booking workshop service now.
                  </span>
                ) : (
                  <span className="text-slate-300">
                    Telemetry shows <strong>{oilReminder.distanceRemaining.toLocaleString()} {vehicle.distanceUnit.toUpperCase()}</strong> (~{oilReminder.daysRemaining} days) until next scheduled oil &amp; filter renewal.
                  </span>
                )}
              </p>

              <div className="mt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-mono text-slate-400">
                <div>
                  CURRENT ODO: <strong className="text-white font-mono">{vehicle.currentOdometer.toLocaleString()} {vehicle.distanceUnit.toUpperCase()}</strong>
                </div>
                <div>
                  NEXT TARGET: <strong className="text-indigo-400 font-mono">{oilReminder.dueOdometer.toLocaleString()} {vehicle.distanceUnit.toUpperCase()}</strong>
                </div>
                <div>
                  PROJECTED: <strong className="text-white">{oilReminder.dueDate}</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Quick Action Banner */}
          <div className="w-full lg:w-auto bg-slate-950 border border-slate-800 rounded-sm p-4 flex flex-col items-center text-center gap-2 min-w-[220px]">
            <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold">DISPATCH TELEMETRY</span>
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className={`w-2 h-2 rounded-none ${browserNotificationPermission === 'granted' ? 'bg-emerald-400' : 'bg-indigo-400'}`} />
              <span className="text-slate-200">
                {browserNotificationPermission === 'granted' ? 'Desktop Alerts Active' : 'In-App Alerts Active'}
              </span>
            </div>

            {browserNotificationPermission !== 'granted' && (
              <button
                onClick={onRequestNotificationPermission}
                className="mt-1 w-full py-1.5 px-3 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Enable Desktop Alerts
              </button>
            )}

            <button
              onClick={onLogOilChange}
              className="mt-1 w-full py-2 px-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-xs font-bold uppercase tracking-wider transition-colors"
            >
              Reset / Log Oil Change
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Configure Intervals & All Upcoming Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Configure Oil Change Intervals */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-indigo-400" />
              Configure Oil Service Rules
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">Per-Vehicle Config</span>
          </div>

          {/* Presets */}
          <div className="mb-4">
            <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-2">
              OEM Manufacturer Presets
            </label>
            <div className="grid grid-cols-2 gap-2">
              {INTERVAL_PRESETS.map((preset, idx) => {
                const isActive = distanceInterval === preset.dist && monthsInterval === preset.mo;
                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      setDistanceInterval(preset.dist);
                      setMonthsInterval(preset.mo);
                      setOilType(preset.type);
                    }}
                    className={`text-left p-2.5 rounded-sm border text-xs transition-all ${
                      isActive 
                        ? 'bg-indigo-950 border-indigo-500 text-indigo-200 font-bold' 
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="font-mono font-semibold">{preset.label}</div>
                    <div className="text-[10px] font-mono text-slate-500 mt-0.5 truncate uppercase">{preset.type}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSaveIntervals} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Distance Interval ({vehicle.distanceUnit.toUpperCase()})
                </label>
                <input
                  type="number"
                  step="500"
                  min="1000"
                  max="20000"
                  value={distanceInterval}
                  onChange={(e) => setDistanceInterval(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                  Time Interval (Months)
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={monthsInterval}
                  onChange={(e) => setMonthsInterval(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-sm text-white font-mono focus:border-indigo-500 focus:outline-none"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-mono uppercase tracking-wider text-slate-300 mb-1">
                Engine Lubricant Specification
              </label>
              <select
                value={oilType}
                onChange={(e) => setOilType(e.target.value as any)}
                className="w-full bg-slate-950 border border-slate-800 rounded-sm px-3 py-2 text-xs font-mono uppercase text-white focus:border-indigo-500 focus:outline-none"
              >
                <option value="Full Synthetic">Full Synthetic (e.g. 0W-20 / 5W-30)</option>
                <option value="Synthetic Blend">Synthetic Blend</option>
                <option value="Conventional">Conventional Mineral Oil</option>
                <option value="High Mileage">High Mileage Synthetic (75k+ miles)</option>
              </select>
            </div>

            <div className="pt-2 flex items-center justify-between">
              {saveSuccess ? (
                <span className="text-xs font-mono text-emerald-400 font-semibold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Interval updated!
                </span>
              ) : (
                <span className="text-[11px] font-mono text-slate-500 uppercase">
                  Applies to automatic reminders immediately
                </span>
              )}

              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-sm text-xs font-bold uppercase tracking-wider border border-slate-800 transition-colors"
              >
                Save Interval Rules
              </button>
            </div>
          </form>
        </div>

        {/* Right: Scheduled Maintenance Checklist & Active Reminders */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-5 sm:p-6 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <h3 className="font-bold text-sm uppercase tracking-wider text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-400" />
              Active Service Monitors
            </h3>
            <span className="text-[10px] font-mono text-slate-500 uppercase">{reminders.length} Scheduled</span>
          </div>

          <div className="space-y-3">
            {reminders.map((reminder) => {
              const overdue = reminder.status === 'overdue';
              const soon = reminder.status === 'due_soon';

              return (
                <div
                  key={reminder.id}
                  className={`p-4 rounded-sm border transition-colors ${
                    overdue
                      ? 'bg-red-950/20 border-red-800 text-white'
                      : soon
                      ? 'bg-amber-950/20 border-amber-800 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      {overdue ? (
                        <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      ) : soon ? (
                        <Clock className="w-4 h-4 text-amber-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-4 h-4 text-indigo-400 shrink-0" />
                      )}
                      <div>
                        <h4 className="font-bold text-xs uppercase tracking-wider text-white">{reminder.title}</h4>
                        <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                          TARGET: <span className="font-mono text-slate-200 font-semibold">{reminder.dueOdometer.toLocaleString()} {vehicle.distanceUnit.toUpperCase()}</span> ({reminder.dueDate})
                        </div>
                      </div>
                    </div>

                    <span className={`px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-widest shrink-0 ${
                      overdue ? 'bg-red-950 text-red-300 border border-red-800' : soon ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-indigo-950 text-indigo-300 border border-indigo-800'
                    }`}>
                      {overdue ? 'Overdue' : soon ? 'Due Soon' : 'Good'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-400 mt-2 font-mono">
                    {reminder.description}
                  </p>

                  <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs font-mono">
                    <span className="text-slate-500 text-[10px] uppercase">
                      {overdue ? `${Math.abs(reminder.distanceRemaining)} ${vehicle.distanceUnit} past threshold` : `${reminder.distanceRemaining} ${vehicle.distanceUnit} remaining`}
                    </span>
                    <button
                      onClick={() => onTriggerTestReminder(reminder.type)}
                      className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-wider flex items-center gap-1"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                      Simulate Notification
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};
