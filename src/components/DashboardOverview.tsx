import React from 'react';
import { 
  Car, 
  Fuel, 
  Wrench, 
  Gauge, 
  Droplet, 
  TrendingUp, 
  DollarSign, 
  Calendar, 
  Clock, 
  Plus, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight,
  Disc,
  Calculator,
  RotateCcw
} from 'lucide-react';
import { Vehicle, FuelLog, MaintenanceLog, AutoReminder } from '../types';
import { formatEfficiency, getVehicleStats } from '../utils/calculations';

interface DashboardOverviewProps {
  vehicle: Vehicle;
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];
  reminders: AutoReminder[];
  onNavigateTab: (tab: 'dashboard' | 'fuel' | 'maintenance' | 'reminders') => void;
  onOpenAddFuel: () => void;
  onOpenAddMaintenance: () => void;
  onOpenUpdateOdometer: () => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  vehicle,
  fuelLogs,
  maintenanceLogs,
  reminders,
  onNavigateTab,
  onOpenAddFuel,
  onOpenAddMaintenance,
  onOpenUpdateOdometer,
}) => {
  const stats = getVehicleStats(vehicle, fuelLogs, maintenanceLogs);
  const oilReminder = reminders.find((r) => r.type === 'oil_change') || reminders[0];

  const vehicleFuel = fuelLogs.filter((f) => f.vehicleId === vehicle.id);
  const vehicleMaint = maintenanceLogs.filter((m) => m.vehicleId === vehicle.id);

  const formattedAvgEff = formatEfficiency(stats.averageEfficiency, vehicle.distanceUnit, 'mpg_us');

  return (
    <div id="dashboard-overview-container" className="space-y-6">
      
      {/* Vehicle Hero Card */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-sm p-6 shadow-sm relative overflow-hidden">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[10px] uppercase font-mono tracking-widest text-indigo-400 font-bold px-2 py-0.5 bg-indigo-950/60 border border-indigo-500/30 rounded-sm">
                PRIMARY TELEMETRY
              </span>
              {vehicle.trim && (
                <span className="text-[11px] font-mono text-slate-500 uppercase tracking-wider">
                  {vehicle.trim}
                </span>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-black tracking-tighter text-white mt-1">
              {vehicle.year} {vehicle.make} {vehicle.model}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-1.5 text-xs font-mono text-slate-400">
              {vehicle.licensePlate && (
                <span>PLATE: <strong className="text-slate-200">{vehicle.licensePlate}</strong></span>
              )}
              {vehicle.vin && (
                <span>VIN: <strong className="text-slate-200">{vehicle.vin}</strong></span>
              )}
              <span>LUBRICANT: <strong className="text-indigo-300">{vehicle.oilType}</strong></span>
              <span>INTERVAL: <strong className="text-slate-200">{vehicle.oilChangeIntervalDistance.toLocaleString()} {vehicle.distanceUnit}</strong></span>
            </div>
          </div>

          {/* Odometer Display & Quick Update */}
          <div className="w-full lg:w-auto bg-slate-950 border border-slate-800 rounded-sm p-4 flex items-center justify-between lg:justify-end gap-6">
            <div>
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block font-bold">
                CURRENT ODOMETER
              </span>
              <div className="text-3xl font-black font-mono tracking-tight text-white mt-0.5">
                {vehicle.currentOdometer.toLocaleString()}{' '}
                <span className="text-xs text-indigo-400 font-medium uppercase">{vehicle.distanceUnit}</span>
              </div>
            </div>

            <button
              id="btn-dashboard-update-odometer"
              onClick={onOpenUpdateOdometer}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-indigo-300 border border-slate-800 hover:border-slate-700 rounded-sm text-xs uppercase font-bold tracking-wider transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span>Update</span>
            </button>
          </div>
        </div>

        {/* Quick Action Buttons Row */}
        <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-wrap items-center gap-3">
          <button
            id="btn-quick-log-fuel"
            onClick={onOpenAddFuel}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Log Fuel Fill-Up</span>
          </button>

          <button
            id="btn-quick-log-service"
            onClick={onOpenAddMaintenance}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-sm transition-colors"
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>Log Maintenance</span>
          </button>

          <button
            onClick={() => onNavigateTab('fuel')}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-slate-300 rounded-sm text-xs font-semibold uppercase tracking-wider border border-slate-800 flex items-center gap-2 transition-colors"
          >
            <Fuel className="w-3.5 h-3.5 text-indigo-400" />
            <span>Fuel Economy Trend</span>
          </button>

          <button
            onClick={() => onNavigateTab('reminders')}
            className="px-3.5 py-2 bg-slate-950 hover:bg-slate-900 text-slate-300 rounded-sm text-xs font-semibold uppercase tracking-wider border border-slate-800 flex items-center gap-2 transition-colors"
          >
            <Clock className="w-3.5 h-3.5 text-amber-400" />
            <span>Reminders Hub</span>
          </button>
        </div>
      </div>

      {/* 4 Core Summary Metrics Grid - Geometric Balance Style */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Average Fuel Efficiency */}
        <div 
          onClick={() => onNavigateTab('fuel')}
          className="bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-sm flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Avg Fuel Efficiency</span>
            <Fuel className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tighter">
              {formattedAvgEff.value}
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">
              {formattedAvgEff.unit}
            </span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div 
              className="bg-emerald-500 h-full transition-all duration-500" 
              style={{ width: `${Math.min(100, Math.max(10, (stats.averageEfficiency || 25) * 2.5))}%` }} 
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>{vehicleFuel.length} FILL-UPS LOGGED</span>
            <span className="text-indigo-400 group-hover:underline flex items-center gap-0.5">
              TELEMETRY <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Operating Cost Per Distance */}
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">
              Fuel Cost / {vehicle.distanceUnit === 'miles' ? 'Mile' : 'Km'}
            </span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tighter">
              ${stats.fuelCostPerDistance.toFixed(2)}
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">
              /{vehicle.distanceUnit === 'miles' ? 'MI' : 'KM'}
            </span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div 
              className="bg-amber-500 h-full" 
              style={{ width: `${Math.min(100, Math.max(15, stats.fuelCostPerDistance * 250))}%` }} 
            />
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500">
            TRACKED {stats.totalTrackedDistance.toLocaleString()} {vehicle.distanceUnit.toUpperCase()}
          </div>
        </div>

        {/* Oil Life Status with 10-Block Health Indicator */}
        <div 
          onClick={() => onNavigateTab('reminders')}
          className="bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-sm flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Lubricant Condition</span>
            <Droplet className={`w-4 h-4 ${
              oilReminder?.status === 'overdue' ? 'text-red-400' :
              oilReminder?.status === 'due_soon' ? 'text-amber-400' :
              'text-emerald-400'
            }`} />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className={`text-4xl sm:text-5xl font-light tracking-tighter ${
              oilReminder?.status === 'overdue' ? 'text-red-400 font-semibold' :
              oilReminder?.status === 'due_soon' ? 'text-amber-400 font-semibold' :
              'text-white'
            }`}>
              {Math.max(0, 100 - (oilReminder?.percentageUsed || 0))}%
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">
              HEALTH
            </span>
          </div>
          
          {/* 10-Segment Geometric Health Block Bar */}
          <div className="mt-4 grid grid-cols-10 gap-1 h-1.5">
            {Array.from({ length: 10 }).map((_, i) => {
              const activeSegments = Math.round((Math.max(0, 100 - (oilReminder?.percentageUsed || 0))) / 10);
              const isLit = i < activeSegments;
              const barColor = oilReminder?.status === 'overdue' ? 'bg-red-500' : oilReminder?.status === 'due_soon' ? 'bg-amber-500' : 'bg-emerald-500';
              return (
                <div 
                  key={i} 
                  className={`h-full ${isLit ? barColor : 'bg-slate-800'}`} 
                />
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-between text-[11px] font-mono">
            <span className={oilReminder?.status === 'overdue' ? 'text-red-400 font-bold' : 'text-slate-500'}>
              {oilReminder?.distanceRemaining.toLocaleString()} {vehicle.distanceUnit.toUpperCase()} LEFT
            </span>
            <span className="text-indigo-400 group-hover:underline flex items-center gap-0.5">
              SERVICE <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* Total Maintenance Cost */}
        <div 
          onClick={() => onNavigateTab('maintenance')}
          className="bg-slate-900/50 border border-slate-800 hover:border-indigo-500/50 p-5 rounded-sm flex flex-col justify-between cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-wider text-slate-400 font-medium">Service Investment</span>
            <Wrench className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tighter">
              ${stats.totalMaintenanceCost.toFixed(2)}
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">
              TOTAL
            </span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div className="bg-indigo-500 h-full w-[65%]" />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-500">
            <span>{vehicleMaint.length} RECORDS ARCHIVED</span>
            <span className="text-indigo-400 group-hover:underline flex items-center gap-0.5">
              LEDGER <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Recent Fuel Logs Table & Geometric Active Reminders Feed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Recent Fill-ups & Efficiency Table */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Fuel className="w-4 h-4 text-indigo-400" />
              <h3 className="font-bold text-sm uppercase tracking-wider text-white">Recent Fuel Fill-Ups</h3>
            </div>
            <button
              onClick={() => onNavigateTab('fuel')}
              className="text-xs font-mono uppercase text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              All Logs <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-2">
            {vehicleFuel.slice(0, 4).map((log) => {
              const eff = formatEfficiency(log.calculatedEfficiency, vehicle.distanceUnit, 'mpg_us');
              return (
                <div
                  key={log.id}
                  className="p-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-sm flex items-center justify-between text-xs transition-colors"
                >
                  <div>
                    <div className="font-semibold text-slate-200 flex items-center gap-2">
                      <span>{log.date}</span>
                      <span className="text-slate-500 font-mono text-[11px]">
                        [{log.odometer.toLocaleString()} {vehicle.distanceUnit}]
                      </span>
                    </div>
                    <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                      {log.fuelAmount} {vehicle.fuelVolumeUnit} pumped • ${log.pricePerUnit.toFixed(2)}/{vehicle.fuelVolumeUnit === 'gallons' ? 'gal' : 'L'}
                      {log.gasStation && ` @ ${log.gasStation}`}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono font-bold text-white text-sm">
                      ${log.totalCost.toFixed(2)}
                    </div>
                    {log.calculatedEfficiency ? (
                      <span className="inline-block mt-0.5 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-sm bg-indigo-950 text-indigo-300 border border-indigo-800">
                        {eff.value} {eff.unit}
                      </span>
                    ) : (
                      <span className="text-slate-500 text-[10px] font-mono">BASELINE</span>
                    )}
                  </div>
                </div>
              );
            })}

            {vehicleFuel.length === 0 && (
              <div className="text-center py-8 text-slate-500 text-xs font-mono uppercase tracking-wider">
                No fuel fill-ups logged yet.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Scheduled Reminders Feed (Geometric Balance Indigo Box Style) */}
        <div className="bg-indigo-950/20 border border-indigo-500/30 rounded-sm p-5 shadow-sm">
          <div className="flex items-center justify-between pb-3 border-b border-indigo-500/20 mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              <h3 className="text-xs uppercase tracking-widest font-bold text-indigo-300">Active Service Alerts</h3>
            </div>
            <button
              onClick={() => onNavigateTab('reminders')}
              className="text-xs font-mono uppercase text-indigo-400 hover:text-indigo-300 font-bold flex items-center gap-1"
            >
              Configure Hub <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {reminders.map((reminder) => {
              const overdue = reminder.status === 'overdue';
              const soon = reminder.status === 'due_soon';

              return (
                <div
                  key={reminder.id}
                  className={`p-3.5 rounded-sm border text-xs ${
                    overdue
                      ? 'bg-slate-950 border-l-2 border-l-red-500 border-slate-800 text-white'
                      : soon
                      ? 'bg-slate-950 border-l-2 border-l-amber-500 border-slate-800 text-white'
                      : 'bg-slate-950 border-l-2 border-l-emerald-500 border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
                      {reminder.type === 'oil_change' ? (
                        <Droplet className="w-3.5 h-3.5 text-indigo-400" />
                      ) : (
                        <Disc className="w-3.5 h-3.5 text-blue-400" />
                      )}
                      {reminder.title}
                    </span>
                    <span className={`px-1.5 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-wider ${
                      overdue ? 'bg-red-950 text-red-300 border border-red-800' : soon ? 'bg-amber-950 text-amber-300 border border-amber-800' : 'bg-slate-900 text-slate-400 border border-slate-800'
                    }`}>
                      {overdue ? 'OVERDUE' : soon ? 'DUE SOON' : 'SCHEDULED'}
                    </span>
                  </div>

                  <p className="mt-1.5 text-slate-400 text-xs leading-relaxed">
                    {reminder.description}
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                    <span>DUE AT: <strong className="text-white">{reminder.dueOdometer.toLocaleString()} {vehicle.distanceUnit.toUpperCase()}</strong></span>
                    <span>TARGET: {reminder.dueDate}</span>
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
