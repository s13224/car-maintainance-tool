import React, { useState } from 'react';
import { 
  Car, 
  Fuel, 
  Wrench, 
  Bell, 
  Plus, 
  Gauge, 
  AlertTriangle, 
  CheckCircle2, 
  Settings,
  ChevronDown,
  Clock
} from 'lucide-react';
import { Vehicle, InAppNotification, AutoReminder } from '../types';

interface NavbarProps {
  vehicles: Vehicle[];
  activeVehicle: Vehicle;
  onSelectVehicle: (vehicleId: string) => void;
  onOpenAddVehicle: () => void;
  onOpenEditVehicle: () => void;
  onOpenAddFuel: () => void;
  onOpenAddMaintenance: () => void;
  onOpenUpdateOdometer: () => void;
  activeTab: 'dashboard' | 'fuel' | 'maintenance' | 'reminders';
  setActiveTab: (tab: 'dashboard' | 'fuel' | 'maintenance' | 'reminders') => void;
  notifications: InAppNotification[];
  reminders: AutoReminder[];
  onMarkNotificationsRead: () => void;
  onClearNotification: (id: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  vehicles,
  activeVehicle,
  onSelectVehicle,
  onOpenAddVehicle,
  onOpenEditVehicle,
  onOpenAddFuel,
  onOpenAddMaintenance,
  onOpenUpdateOdometer,
  activeTab,
  setActiveTab,
  notifications,
  reminders,
  onMarkNotificationsRead,
  onClearNotification,
}) => {
  const [showVehicleMenu, setShowVehicleMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  // Urgent and due soon reminder counts
  const overdueCount = reminders.filter((r) => r.status === 'overdue').length;
  const dueSoonCount = reminders.filter((r) => r.status === 'due_soon').length;
  const unreadNotifs = notifications.filter((n) => !n.read).length;
  const totalAlertBadge = overdueCount + dueSoonCount + unreadNotifs;

  return (
    <header className="sticky top-0 z-30 bg-slate-950/95 backdrop-blur-md border-b border-slate-800 text-slate-100 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand with Geometric Balance Styling */}
          <div className="flex items-center gap-6">
            <div 
              id="app-brand-logo"
              className="flex items-center gap-3 cursor-pointer select-none"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-9 h-9 rounded-sm bg-indigo-600 border border-indigo-400/40 text-white flex items-center justify-center font-bold shadow-sm">
                <Car className="w-5 h-5" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-indigo-400 font-bold leading-none mb-1">
                  Vehicle Analytics Platform
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="font-black text-lg tracking-tighter text-white">
                    AutoTrack <span className="text-indigo-400 font-light">Pro</span>
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-mono text-slate-500 uppercase">
                    v4.2-STABLE
                  </span>
                </div>
              </div>
            </div>

            {/* Vehicle Selector Dropdown */}
            <div className="relative">
              <button
                id="btn-vehicle-selector"
                onClick={() => setShowVehicleMenu(!showVehicleMenu)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-sm bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs uppercase tracking-wider font-semibold transition-colors"
                title="Select active vehicle"
              >
                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="max-w-[140px] sm:max-w-[200px] truncate text-slate-200">
                  {activeVehicle.year} {activeVehicle.make} {activeVehicle.model}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
              </button>

              {showVehicleMenu && (
                <div 
                  id="dropdown-vehicle-menu"
                  className="absolute left-0 mt-2 w-72 bg-slate-900 border border-slate-800 rounded-sm shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                >
                  <div className="text-[10px] font-mono uppercase text-slate-500 px-3 py-1.5 tracking-widest border-b border-slate-800 mb-1">
                    Select Tracked Vehicle
                  </div>
                  <div className="space-y-1">
                    {vehicles.map((v) => {
                      const isSelected = v.id === activeVehicle.id;
                      return (
                        <button
                          key={v.id}
                          id={`vehicle-opt-${v.id}`}
                          onClick={() => {
                            onSelectVehicle(v.id);
                            setShowVehicleMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-sm text-xs flex items-center justify-between transition-colors ${
                            isSelected 
                              ? 'bg-indigo-950/60 text-indigo-300 font-bold border border-indigo-500/40' 
                              : 'text-slate-300 hover:bg-slate-800/80'
                          }`}
                        >
                          <div>
                            <div className="font-semibold">{v.year} {v.make} {v.model}</div>
                            <div className="text-[11px] font-mono text-slate-500">
                              {v.currentOdometer.toLocaleString()} {v.distanceUnit}
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>

                  <div className="mt-2 pt-2 border-t border-slate-800 flex flex-col gap-1">
                    <button
                      id="btn-edit-vehicle-settings"
                      onClick={() => {
                        setShowVehicleMenu(false);
                        onOpenEditVehicle();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-sm text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 flex items-center gap-2 transition-colors uppercase tracking-wider font-mono text-[11px]"
                    >
                      <Settings className="w-3.5 h-3.5 text-slate-500" />
                      Vehicle Specs &amp; Intervals
                    </button>
                    <button
                      id="btn-add-new-vehicle"
                      onClick={() => {
                        setShowVehicleMenu(false);
                        onOpenAddVehicle();
                      }}
                      className="w-full text-left px-3 py-1.5 rounded-sm text-xs text-indigo-400 hover:bg-indigo-500/10 flex items-center gap-2 font-semibold transition-colors uppercase tracking-wider font-mono text-[11px]"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Another Vehicle
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Odometer Badge */}
            <button
              id="btn-quick-odometer"
              onClick={onOpenUpdateOdometer}
              className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-sm bg-slate-900 hover:bg-slate-800 text-xs text-slate-300 border border-slate-800 transition-colors font-mono"
              title="Click to update odometer"
            >
              <Gauge className="w-3.5 h-3.5 text-indigo-400" />
              <span className="text-slate-400">ODO: <strong className="text-white font-bold">{activeVehicle.currentOdometer.toLocaleString()}</strong> {activeVehicle.distanceUnit}</span>
            </button>
          </div>

          {/* Desktop Navigation Links with Crisp Geometric Underlines */}
          <nav className="hidden lg:flex items-center gap-1">
            <button
              id="nav-tab-dashboard"
              onClick={() => setActiveTab('dashboard')}
              className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider font-bold transition-all ${
                activeTab === 'dashboard'
                  ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              Dashboard
            </button>
            <button
              id="nav-tab-fuel"
              onClick={() => setActiveTab('fuel')}
              className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'fuel'
                  ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Fuel className="w-3.5 h-3.5" />
              Fuel Economy
            </button>
            <button
              id="nav-tab-maintenance"
              onClick={() => setActiveTab('maintenance')}
              className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all ${
                activeTab === 'maintenance'
                  ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              Maintenance History
            </button>
            <button
              id="nav-tab-reminders"
              onClick={() => setActiveTab('reminders')}
              className={`px-3 py-1.5 rounded-sm text-xs uppercase tracking-wider font-bold flex items-center gap-1.5 transition-all relative ${
                activeTab === 'reminders'
                  ? 'bg-slate-900 text-indigo-400 border-b-2 border-indigo-500 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60'
              }`}
            >
              <Bell className="w-3.5 h-3.5" />
              Oil &amp; Reminders
              {(overdueCount > 0 || dueSoonCount > 0) && (
                <span className={`w-2 h-2 rounded-full ${overdueCount > 0 ? 'bg-red-500 animate-ping' : 'bg-amber-400'}`} />
              )}
            </button>
          </nav>

          {/* Action Buttons & Notification Bell */}
          <div className="flex items-center gap-2">
            {/* Quick Add Fuel */}
            <button
              id="btn-header-add-fuel"
              onClick={onOpenAddFuel}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-sm text-xs uppercase tracking-wider font-bold shadow-sm transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Log Fuel</span>
            </button>

            {/* Quick Add Service */}
            <button
              id="btn-header-add-maintenance"
              onClick={onOpenAddMaintenance}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-xs uppercase tracking-wider font-bold shadow-sm transition-colors"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Log Service</span>
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                id="btn-notification-bell"
                onClick={() => {
                  setShowNotificationMenu(!showNotificationMenu);
                  if (!showNotificationMenu) {
                    onMarkNotificationsRead();
                  }
                }}
                className="p-2 rounded-sm text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent hover:border-slate-800 relative transition-colors"
                title="Service Reminders & Alerts"
              >
                <Bell className="w-4 h-4" />
                {totalAlertBadge > 0 && (
                  <span className={`absolute top-1 right-1 w-4 h-4 rounded-full text-[9px] font-mono font-bold flex items-center justify-center text-white ${
                    overdueCount > 0 ? 'bg-red-500 animate-pulse' : 'bg-amber-500'
                  }`}>
                    {totalAlertBadge}
                  </span>
                )}
              </button>

              {showNotificationMenu && (
                <div 
                  id="dropdown-notification-menu"
                  className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-sm shadow-2xl p-3 z-50"
                >
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <span className="font-bold text-xs uppercase tracking-wider text-white flex items-center gap-2">
                      <Bell className="w-3.5 h-3.5 text-indigo-400" />
                      Automatic Service Reminders
                    </span>
                    <button
                      onClick={() => setActiveTab('reminders')}
                      className="text-[11px] font-mono uppercase text-indigo-400 hover:underline"
                    >
                      Manage
                    </button>
                  </div>

                  <div className="py-2 max-h-80 overflow-y-auto space-y-2">
                    {/* Active Reminders */}
                    {reminders.map((reminder) => (
                      <div
                        key={reminder.id}
                        className={`p-2.5 rounded-sm border text-xs ${
                          reminder.status === 'overdue'
                            ? 'bg-slate-950 border-l-2 border-l-red-500 border-slate-800 text-slate-200'
                            : reminder.status === 'due_soon'
                            ? 'bg-slate-950 border-l-2 border-l-amber-500 border-slate-800 text-slate-200'
                            : 'bg-slate-950 border-l-2 border-l-emerald-500 border-slate-800 text-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between font-semibold">
                          <span className="flex items-center gap-1.5">
                            {reminder.status === 'overdue' ? (
                              <AlertTriangle className="w-3.5 h-3.5 text-red-400" />
                            ) : (
                              <Clock className="w-3.5 h-3.5 text-amber-400" />
                            )}
                            {reminder.title}
                          </span>
                          <span className={`uppercase font-mono font-bold px-1.5 py-0.5 rounded-sm text-[9px] ${
                            reminder.status === 'overdue' ? 'bg-red-950 text-red-300 border border-red-800' : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}>
                            {reminder.status === 'overdue' ? 'Overdue' : 'Due Soon'}
                          </span>
                        </div>
                        <p className="mt-1 text-slate-400 text-[11px]">{reminder.description}</p>
                        <div className="mt-2 flex items-center justify-between pt-1 border-t border-slate-800/60 text-[10px] font-mono text-slate-500">
                          <span>Target: {reminder.dueOdometer.toLocaleString()} {activeVehicle.distanceUnit}</span>
                          <span>Due: {reminder.dueDate}</span>
                        </div>
                      </div>
                    ))}

                    {/* Historical Notifications */}
                    {notifications.slice(0, 3).map((notif) => (
                      <div
                        key={notif.id}
                        className="p-2 rounded-sm bg-slate-950 border border-slate-800 text-xs flex justify-between items-start"
                      >
                        <div>
                          <div className="font-semibold text-slate-200">{notif.title}</div>
                          <div className="text-slate-400 text-[11px]">{notif.message}</div>
                        </div>
                        <button
                          onClick={() => onClearNotification(notif.id)}
                          className="text-slate-500 hover:text-slate-300 ml-2 text-xs"
                        >
                          &times;
                        </button>
                      </div>
                    ))}

                    {reminders.length === 0 && notifications.length === 0 && (
                      <div className="text-center py-6 text-slate-500 text-xs font-mono uppercase tracking-wider">
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 mx-auto mb-1 opacity-80" />
                        All maintenance is currently up to date!
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Navigation Row */}
        <div className="lg:hidden flex items-center justify-around py-2.5 border-t border-slate-800 text-xs uppercase tracking-wider font-semibold">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`py-1 px-2.5 rounded-sm ${activeTab === 'dashboard' ? 'text-indigo-400 bg-slate-900 border-b-2 border-indigo-500' : 'text-slate-400'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('fuel')}
            className={`py-1 px-2.5 rounded-sm flex items-center gap-1 ${activeTab === 'fuel' ? 'text-indigo-400 bg-slate-900 border-b-2 border-indigo-500' : 'text-slate-400'}`}
          >
            <Fuel className="w-3.5 h-3.5" />
            Fuel
          </button>
          <button
            onClick={() => setActiveTab('maintenance')}
            className={`py-1 px-2.5 rounded-sm flex items-center gap-1 ${activeTab === 'maintenance' ? 'text-indigo-400 bg-slate-900 border-b-2 border-indigo-500' : 'text-slate-400'}`}
          >
            <Wrench className="w-3.5 h-3.5" />
            Maintenance
          </button>
          <button
            onClick={() => setActiveTab('reminders')}
            className={`py-1 px-2.5 rounded-sm flex items-center gap-1 ${activeTab === 'reminders' ? 'text-indigo-400 bg-slate-900 border-b-2 border-indigo-500' : 'text-slate-400'}`}
          >
            <Bell className="w-3.5 h-3.5" />
            Reminders
            {(overdueCount > 0 || dueSoonCount > 0) && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
