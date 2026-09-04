import React, { useState, useMemo } from 'react';
import { 
  Wrench, 
  Plus, 
  DollarSign, 
  Calendar, 
  Filter, 
  Search, 
  CheckCircle2, 
  Droplet, 
  Disc, 
  Layers, 
  Battery, 
  ShieldCheck, 
  Sparkles,
  Trash2,
  Edit3,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Vehicle, MaintenanceLog, ServiceType } from '../types';

interface MaintenanceLoggerProps {
  vehicle: Vehicle;
  maintenanceLogs: MaintenanceLog[];
  onOpenAddModal: (preselectedType?: ServiceType) => void;
  onEditMaintenanceLog: (log: MaintenanceLog) => void;
  onDeleteMaintenanceLog: (id: string) => void;
}

const SERVICE_LABELS: Record<ServiceType, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
  oil_change: { label: 'Oil & Filter Change', icon: Droplet, color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' },
  tire_rotation: { label: 'Tire Rotation', icon: Disc, color: 'text-blue-400 bg-blue-500/10 border-blue-500/20' },
  brake_service: { label: 'Brake Service', icon: Disc, color: 'text-red-400 bg-red-500/10 border-red-500/20' },
  cabin_filter: { label: 'Cabin Filter', icon: Layers, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  engine_filter: { label: 'Engine Air Filter', icon: Layers, color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' },
  transmission_fluid: { label: 'Transmission Service', icon: Wrench, color: 'text-purple-400 bg-purple-500/10 border-purple-500/20' },
  battery: { label: 'Battery / Electrical', icon: Battery, color: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20' },
  spark_plugs: { label: 'Spark Plugs', icon: Sparkles, color: 'text-orange-400 bg-orange-500/10 border-orange-500/20' },
  coolant_flush: { label: 'Coolant Flush', icon: Droplet, color: 'text-cyan-400 bg-cyan-500/10 border-cyan-500/20' },
  wheel_alignment: { label: 'Wheel Alignment', icon: Disc, color: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20' },
  inspection_emissions: { label: 'State Inspection', icon: ShieldCheck, color: 'text-teal-400 bg-teal-500/10 border-teal-500/20' },
  wiper_blades: { label: 'Wiper Blades', icon: Layers, color: 'text-sky-400 bg-sky-500/10 border-sky-500/20' },
  suspension: { label: 'Suspension / Shocks', icon: Wrench, color: 'text-rose-400 bg-rose-500/10 border-rose-500/20' },
  other: { label: 'General Repair / Other', icon: Wrench, color: 'text-slate-400 bg-slate-500/10 border-slate-500/20' },
};

export const MaintenanceLogger: React.FC<MaintenanceLoggerProps> = ({
  vehicle,
  maintenanceLogs,
  onOpenAddModal,
  onEditMaintenanceLog,
  onDeleteMaintenanceLog,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'cost_desc' | 'cost_asc'>('date_desc');

  // Filter logs for active vehicle
  const vehicleLogs = useMemo(() => {
    return maintenanceLogs.filter((m) => m.vehicleId === vehicle.id);
  }, [maintenanceLogs, vehicle.id]);

  // Calculations
  const totalCost = vehicleLogs.reduce((sum, m) => sum + (m.cost || 0), 0);
  const oilChangeLogs = vehicleLogs.filter((m) => m.isOilChange || m.serviceType === 'oil_change');
  const totalOilCost = oilChangeLogs.reduce((sum, m) => sum + (m.cost || 0), 0);
  const avgCostPerService = vehicleLogs.length > 0 ? totalCost / vehicleLogs.length : 0;

  // Filter & Search & Sort
  const processedLogs = useMemo(() => {
    let list = [...vehicleLogs];

    if (selectedCategory !== 'all') {
      list = list.filter((m) => m.serviceType === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (m) =>
          m.serviceProvider.toLowerCase().includes(q) ||
          (m.notes && m.notes.toLowerCase().includes(q)) ||
          (m.partsReplaced && m.partsReplaced.toLowerCase().includes(q)) ||
          m.date.includes(q) ||
          (SERVICE_LABELS[m.serviceType]?.label.toLowerCase().includes(q))
      );
    }

    list.sort((a, b) => {
      if (sortBy === 'date_desc') {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      }
      if (sortBy === 'date_asc') {
        return new Date(a.date).getTime() - new Date(b.date).getTime();
      }
      if (sortBy === 'cost_desc') {
        return b.cost - a.cost;
      }
      return a.cost - b.cost;
    });

    return list;
  }, [vehicleLogs, selectedCategory, searchQuery, sortBy]);

  return (
    <div id="maintenance-history-view" className="space-y-6">
      
      {/* View Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="text-[10px] font-mono uppercase tracking-widest text-indigo-400 font-bold mb-1">
            SERVICE ARCHIVE
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white flex items-center gap-2.5">
            <Wrench className="w-6 h-6 text-indigo-400" />
            Vehicle Maintenance History
          </h1>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Full service records, workshop receipts, scheduled checkups, and component logs for {vehicle.year} {vehicle.make} {vehicle.model}.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            id="btn-quick-log-oil"
            onClick={() => onOpenAddModal('oil_change')}
            className="px-3 py-2 bg-indigo-950/60 hover:bg-indigo-900/60 text-indigo-300 border border-indigo-500/40 rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
          >
            <Droplet className="w-4 h-4 text-indigo-400" />
            + Oil Service
          </button>

          <button
            id="btn-open-log-maintenance"
            onClick={() => onOpenAddModal()}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            Log Maintenance
          </button>
        </div>
      </div>

      {/* KPI Stats Grid - Geometric Balance */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-medium">
            <span>Total Maintenance Spent</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tighter">
              ${totalCost.toFixed(2)}
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">USD</span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div className="bg-indigo-500 h-full w-[70%]" />
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500 uppercase">
            {vehicleLogs.length} total services performed
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-medium">
            <span>Oil Changes Logged</span>
            <Droplet className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-light text-indigo-400 tracking-tighter">
              {oilChangeLogs.length}
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">CYCLES</span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div className="bg-emerald-500 h-full w-[80%]" />
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500 uppercase">
            ${totalOilCost.toFixed(2)} oil expenditure
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-medium">
            <span>Average Service Cost</span>
            <Wrench className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl sm:text-5xl font-light text-white tracking-tighter">
              ${avgCostPerService.toFixed(2)}
            </span>
            <span className="text-indigo-400 font-medium text-sm uppercase">/VISIT</span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div className="bg-amber-500 h-full w-[55%]" />
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500 uppercase">
            Per scheduled shop visit
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-5 rounded-sm flex flex-col justify-between">
          <div className="flex items-center justify-between text-xs uppercase tracking-wider text-slate-400 font-medium">
            <span>Last Service Odometer</span>
            <Calendar className="w-4 h-4 text-purple-400" />
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-3xl sm:text-4xl font-light font-mono text-white tracking-tight">
              {vehicleLogs.length > 0 ? `${vehicleLogs[0].odometer.toLocaleString()}` : '--'}
            </span>
            <span className="text-indigo-400 font-medium text-xs uppercase">{vehicle.distanceUnit}</span>
          </div>
          <div className="mt-4 w-full bg-slate-800 h-1 rounded-none overflow-hidden">
            <div className="bg-purple-500 h-full w-[90%]" />
          </div>
          <div className="mt-3 text-[11px] font-mono text-slate-500 uppercase">
            {vehicleLogs.length > 0 ? `${vehicleLogs[0].date}` : 'NO SERVICES LOGGED'}
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 text-xs font-mono scrollbar-none">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            All Services ({vehicleLogs.length})
          </button>
          <button
            onClick={() => setSelectedCategory('oil_change')}
            className={`px-3 py-1.5 rounded-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
              selectedCategory === 'oil_change'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Oil Changes ({oilChangeLogs.length})
          </button>
          <button
            onClick={() => setSelectedCategory('tire_rotation')}
            className={`px-3 py-1.5 rounded-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
              selectedCategory === 'tire_rotation'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Tire Rotations
          </button>
          <button
            onClick={() => setSelectedCategory('brake_service')}
            className={`px-3 py-1.5 rounded-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
              selectedCategory === 'brake_service'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Brakes
          </button>
          <button
            onClick={() => setSelectedCategory('engine_filter')}
            className={`px-3 py-1.5 rounded-sm uppercase tracking-wider whitespace-nowrap transition-colors ${
              selectedCategory === 'engine_filter'
                ? 'bg-indigo-600 text-white font-bold'
                : 'bg-slate-950 text-slate-400 border border-slate-800 hover:text-white'
            }`}
          >
            Filters
          </button>
        </div>

        {/* Search & Sort */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="SEARCH PROVIDER, NOTES..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-950 border border-slate-800 rounded-sm text-xs font-mono text-white placeholder-slate-600 focus:border-indigo-500 focus:outline-none w-full sm:w-56 uppercase"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 text-xs font-mono uppercase text-slate-300 rounded-sm px-2.5 py-1.5 focus:border-indigo-500 focus:outline-none"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="cost_desc">Cost (High to Low)</option>
            <option value="cost_asc">Cost (Low to High)</option>
          </select>
        </div>
      </div>

      {/* Maintenance Logs Cards List */}
      <div className="space-y-3">
        {processedLogs.map((log) => {
          const serviceMeta = SERVICE_LABELS[log.serviceType] || SERVICE_LABELS.other;
          const ServiceIcon = serviceMeta.icon;

          return (
            <div
              key={log.id}
              className="bg-slate-900/50 border border-slate-800 hover:border-indigo-500/40 rounded-sm p-4 sm:p-5 shadow-sm transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                {/* Left Side: Icon & Title & Meta */}
                <div className="flex items-start gap-3.5">
                  <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 border ${serviceMeta.color}`}>
                    <ServiceIcon className="w-5 h-5" />
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-bold text-sm uppercase tracking-wider text-white">
                        {log.customServiceName || serviceMeta.label}
                      </h3>
                      {log.isOilChange && (
                        <span className="px-2 py-0.5 rounded-sm text-[9px] font-mono font-bold uppercase tracking-widest bg-indigo-950 text-indigo-300 border border-indigo-800">
                          OIL TELEMETRY
                        </span>
                      )}
                    </div>

                    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs font-mono text-slate-400">
                      <span className="flex items-center gap-1 font-medium text-slate-300">
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        {log.date}
                      </span>
                      <span>
                        ODOMETER: <strong className="text-white font-mono">{log.odometer.toLocaleString()} {vehicle.distanceUnit.toUpperCase()}</strong>
                      </span>
                      <span>
                        PROVIDER: <strong className="text-slate-300">{log.serviceProvider || 'Self / DIY'}</strong>
                      </span>
                    </div>

                    {/* Parts details */}
                    {log.partsReplaced && (
                      <div className="mt-2.5 text-xs text-slate-300 bg-slate-950 p-2.5 rounded-sm border border-slate-800 font-mono">
                        <span className="text-slate-500 font-bold block text-[10px] uppercase mb-0.5">Components / Specs:</span>
                        {log.partsReplaced}
                      </div>
                    )}

                    {/* Service Notes */}
                    {log.notes && (
                      <p className="mt-2 text-xs text-slate-400">
                        {log.notes}
                      </p>
                    )}

                    {/* Next Due Notification info */}
                    {(log.nextDueOdometer || log.nextDueDate) && (
                      <div className="mt-2.5 flex items-center gap-3 text-[11px] font-mono text-indigo-300 bg-indigo-950/40 px-2.5 py-1 rounded-sm border border-indigo-800/40">
                        <span>NEXT DUE SCHEDULED:</span>
                        {log.nextDueOdometer && (
                          <strong className="text-white">{log.nextDueOdometer.toLocaleString()} {vehicle.distanceUnit.toUpperCase()}</strong>
                        )}
                        {log.nextDueDate && <span>or {log.nextDueDate}</span>}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Cost & Actions */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800">
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Total Cost</span>
                    <span className="text-lg sm:text-xl font-bold font-mono text-white">
                      ${log.cost.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEditMaintenanceLog(log)}
                      className="p-1.5 text-slate-400 hover:text-white rounded-sm hover:bg-slate-800 transition-colors"
                      title="Edit service record"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDeleteMaintenanceLog(log.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-sm hover:bg-slate-800 transition-colors"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {processedLogs.length === 0 && (
          <div className="bg-slate-900/50 border border-slate-800 rounded-sm p-12 text-center text-slate-400">
            <Wrench className="w-10 h-10 text-slate-700 mx-auto mb-3" />
            <h4 className="font-semibold text-white uppercase text-sm font-mono">No maintenance records found</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto font-mono">
              Start recording services like oil changes, tire rotations, and brake jobs to track vehicle health and costs over time.
            </p>
            <button
              onClick={() => onOpenAddModal()}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs uppercase tracking-wider rounded-sm shadow-sm"
            >
              Log First Maintenance Record
            </button>
          </div>
        )}
      </div>

    </div>
  );
};
