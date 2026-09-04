/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DEFAULT_VEHICLES, 
  DEFAULT_FUEL_LOGS, 
  DEFAULT_MAINTENANCE_LOGS 
} from './data/defaultData';
import { 
  Vehicle, 
  FuelLog, 
  MaintenanceLog, 
  InAppNotification, 
  AutoReminder, 
  ServiceType 
} from './types';
import { recalculateFuelLogs, getAllReminders, calculateOilChangeReminder } from './utils/calculations';
import { 
  getNotificationPermission, 
  requestBrowserNotificationPermission, 
  sendBrowserNotification, 
  playChimeSound,
  loadStoredNotifications,
  saveStoredNotifications
} from './utils/notifications';

import { Navbar } from './components/Navbar';
import { OilChangeReminderBanner } from './components/OilChangeReminderBanner';
import { DashboardOverview } from './components/DashboardOverview';
import { FuelTracker } from './components/FuelTracker';
import { MaintenanceLogger } from './components/MaintenanceLogger';
import { RemindersManager } from './components/RemindersManager';
import { AddFuelModal } from './components/AddFuelModal';
import { AddMaintenanceModal } from './components/AddMaintenanceModal';
import { UpdateOdometerModal } from './components/UpdateOdometerModal';
import { VehicleModal } from './components/VehicleModal';
import { DataBackupModal } from './components/DataBackupModal';
import { Database, Sparkles, CheckCircle2, AlertTriangle, X } from 'lucide-react';

const STORAGE_KEYS = {
  VEHICLES: 'autotrack_vehicles_v1',
  FUEL_LOGS: 'autotrack_fuel_logs_v1',
  MAINTENANCE_LOGS: 'autotrack_maintenance_logs_v1',
  ACTIVE_VEHICLE: 'autotrack_active_vehicle_id_v1',
  LAST_CHECKED: 'autotrack_last_reminder_check_v1',
};

export default function App() {
  // 1. Core State
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.VEHICLES);
      return saved ? JSON.parse(saved) : DEFAULT_VEHICLES;
    } catch {
      return DEFAULT_VEHICLES;
    }
  });

  const [activeVehicleId, setActiveVehicleId] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.ACTIVE_VEHICLE);
      if (saved && vehicles.some((v) => v.id === saved)) {
        return saved;
      }
      return vehicles[0]?.id || DEFAULT_VEHICLES[0].id;
    } catch {
      return DEFAULT_VEHICLES[0].id;
    }
  });

  const [fuelLogs, setFuelLogs] = useState<FuelLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.FUEL_LOGS);
      const parsed: FuelLog[] = saved ? JSON.parse(saved) : DEFAULT_FUEL_LOGS;
      return recalculateFuelLogs(parsed);
    } catch {
      return recalculateFuelLogs(DEFAULT_FUEL_LOGS);
    }
  });

  const [maintenanceLogs, setMaintenanceLogs] = useState<MaintenanceLog[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.MAINTENANCE_LOGS);
      return saved ? JSON.parse(saved) : DEFAULT_MAINTENANCE_LOGS;
    } catch {
      return DEFAULT_MAINTENANCE_LOGS;
    }
  });

  const [notifications, setNotifications] = useState<InAppNotification[]>(() => {
    return loadStoredNotifications();
  });

  const [browserPermission, setBrowserPermission] = useState<NotificationPermission | 'unsupported'>(() => {
    return getNotificationPermission();
  });

  // Navigation tab
  const [activeTab, setActiveTab] = useState<'dashboard' | 'fuel' | 'maintenance' | 'reminders'>('dashboard');

  // Modals state
  const [isAddFuelOpen, setIsAddFuelOpen] = useState(false);
  const [editingFuelLog, setEditingFuelLog] = useState<FuelLog | null>(null);

  const [isAddMaintenanceOpen, setIsAddMaintenanceOpen] = useState(false);
  const [editingMaintenanceLog, setEditingMaintenanceLog] = useState<MaintenanceLog | null>(null);
  const [preselectedServiceType, setPreselectedServiceType] = useState<ServiceType | undefined>(undefined);

  const [isUpdateOdometerOpen, setIsUpdateOdometerOpen] = useState(false);
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [isEditingVehicle, setIsEditingVehicle] = useState(false);

  const [isBackupModalOpen, setIsBackupModalOpen] = useState(false);

  // Active vehicle object
  const activeVehicle = useMemo(() => {
    return vehicles.find((v) => v.id === activeVehicleId) || vehicles[0] || DEFAULT_VEHICLES[0];
  }, [vehicles, activeVehicleId]);

  // Compute reminders for active vehicle
  const activeReminders = useMemo(() => {
    return getAllReminders(activeVehicle, maintenanceLogs);
  }, [activeVehicle, maintenanceLogs]);

  const oilReminder = useMemo(() => {
    return calculateOilChangeReminder(activeVehicle, maintenanceLogs);
  }, [activeVehicle, maintenanceLogs]);

  // Save to localStorage when state changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
    } catch (e) {
      console.error(e);
    }
  }, [vehicles]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_VEHICLE, activeVehicleId);
    } catch (e) {
      console.error(e);
    }
  }, [activeVehicleId]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.FUEL_LOGS, JSON.stringify(fuelLogs));
    } catch (e) {
      console.error(e);
    }
  }, [fuelLogs]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.MAINTENANCE_LOGS, JSON.stringify(maintenanceLogs));
    } catch (e) {
      console.error(e);
    }
  }, [maintenanceLogs]);

  useEffect(() => {
    saveStoredNotifications(notifications);
  }, [notifications]);

  // Automatic oil change notification check on vehicle change / load
  useEffect(() => {
    if (!activeVehicle || !oilReminder) return;

    if (oilReminder.status === 'overdue' || oilReminder.status === 'due_soon') {
      const todayKey = `${activeVehicle.id}_${oilReminder.status}_${new Date().toISOString().split('T')[0]}`;
      const lastCheck = localStorage.getItem(STORAGE_KEYS.LAST_CHECKED);

      if (lastCheck !== todayKey) {
        localStorage.setItem(STORAGE_KEYS.LAST_CHECKED, todayKey);

        const isOverdue = oilReminder.status === 'overdue';
        const title = isOverdue ? '⚠️ Oil Change Overdue!' : '🔔 Oil Change Due Soon';
        const message = isOverdue
          ? `${activeVehicle.name}: Oil change is overdue by ${Math.abs(oilReminder.distanceRemaining).toLocaleString()} ${activeVehicle.distanceUnit}!`
          : `${activeVehicle.name}: Oil change due in ${oilReminder.distanceRemaining.toLocaleString()} ${activeVehicle.distanceUnit} (~${oilReminder.daysRemaining} days remaining).`;

        // Send native browser notification if granted
        sendBrowserNotification(title, {
          body: message,
          tag: `oil-reminder-${activeVehicle.id}`,
        });

        // Add to in-app notification center
        const newNotif: InAppNotification = {
          id: `notif-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          title,
          message,
          severity: isOverdue ? 'urgent' : 'warning',
          vehicleId: activeVehicle.id,
          vehicleName: activeVehicle.name,
          read: false,
        };

        setNotifications((prev) => [newNotif, ...prev.slice(0, 19)]);
      }
    }
  }, [activeVehicle, oilReminder]);

  // Request browser notification permission
  const handleRequestNotificationPermission = async () => {
    const perm = await requestBrowserNotificationPermission();
    setBrowserPermission(perm);
    if (perm === 'granted') {
      sendBrowserNotification('AutoTrack Notifications Active', {
        body: 'You will now automatically receive desktop alerts when oil changes or services are due.',
      });
      playChimeSound('success');
    }
  };

  // Trigger test reminder (simulate an automatic alert)
  const handleTriggerTestReminder = (type: 'oil_change' | 'tire_rotation' = 'oil_change') => {
    const isOil = type === 'oil_change';
    const title = isOil ? '⚠️ Automated Alert: Oil Change Due Soon' : '🔔 Automated Alert: Tire Rotation Due';
    const message = isOil
      ? `${activeVehicle.name} has reached service interval: ${oilReminder.distanceRemaining.toLocaleString()} ${activeVehicle.distanceUnit} remaining before scheduled oil change.`
      : `${activeVehicle.name} is approaching recommended 7,500 ${activeVehicle.distanceUnit} tire rotation.`;

    playChimeSound(oilReminder.status === 'overdue' ? 'urgent' : 'warning');

    // Trigger browser notification
    const dispatched = sendBrowserNotification(title, {
      body: message,
      tag: `test-reminder-${Date.now()}`,
    });

    // Add to in-app notification drawer
    const notif: InAppNotification = {
      id: `notif-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      title,
      message: `${message}${dispatched ? ' (Sent to desktop)' : ''}`,
      severity: isOil ? 'warning' : 'info',
      vehicleId: activeVehicle.id,
      vehicleName: activeVehicle.name,
      read: false,
    };

    setNotifications((prev) => [notif, ...prev]);
  };

  // Handle Fuel Log Save (Add or Edit)
  const handleSaveFuelLog = (logData: Omit<FuelLog, 'distanceDelta' | 'calculatedEfficiency' | 'costPerDistance'>) => {
    let updatedLogs: FuelLog[];

    const exists = fuelLogs.some((l) => l.id === logData.id);
    if (exists) {
      updatedLogs = fuelLogs.map((l) => (l.id === logData.id ? { ...l, ...logData } : l));
    } else {
      updatedLogs = [logData as FuelLog, ...fuelLogs];
    }

    // Recalculate efficiencies
    const recalculated = recalculateFuelLogs(updatedLogs);
    setFuelLogs(recalculated);

    // If entered odometer is higher than vehicle's current odometer, auto-sync
    if (logData.odometer > activeVehicle.currentOdometer) {
      setVehicles((prev) =>
        prev.map((v) => (v.id === activeVehicle.id ? { ...v, currentOdometer: logData.odometer } : v))
      );
    }

    playChimeSound('success');
  };

  const handleDeleteFuelLog = (id: string) => {
    if (confirm('Delete this fuel log record?')) {
      const remaining = fuelLogs.filter((l) => l.id !== id);
      setFuelLogs(recalculateFuelLogs(remaining));
    }
  };

  // Handle Maintenance Log Save (Add or Edit)
  const handleSaveMaintenanceLog = (logData: MaintenanceLog, isOilChange?: boolean) => {
    let updatedLogs: MaintenanceLog[];

    const exists = maintenanceLogs.some((m) => m.id === logData.id);
    if (exists) {
      updatedLogs = maintenanceLogs.map((m) => (m.id === logData.id ? logData : m));
    } else {
      updatedLogs = [logData, ...maintenanceLogs];
    }

    setMaintenanceLogs(updatedLogs);

    // Auto-sync odometer if higher
    setVehicles((prev) =>
      prev.map((v) => {
        if (v.id === activeVehicle.id) {
          const newOdo = Math.max(v.currentOdometer, logData.odometer);
          if (isOilChange) {
            return {
              ...v,
              currentOdometer: newOdo,
              lastOilChangeOdometer: logData.odometer,
              lastOilChangeDate: logData.date,
            };
          }
          return { ...v, currentOdometer: newOdo };
        }
        return v;
      })
    );

    playChimeSound('success');
  };

  const handleDeleteMaintenanceLog = (id: string) => {
    if (confirm('Delete this maintenance record?')) {
      setMaintenanceLogs((prev) => prev.filter((m) => m.id !== id));
    }
  };

  // Handle Odometer Update
  const handleUpdateOdometer = (newOdometer: number) => {
    setVehicles((prev) =>
      prev.map((v) => (v.id === activeVehicle.id ? { ...v, currentOdometer: newOdometer } : v))
    );
    playChimeSound('success');
  };

  // Handle Vehicle Save
  const handleSaveVehicle = (v: Vehicle) => {
    setVehicles((prev) => {
      const idx = prev.findIndex((item) => item.id === v.id);
      if (idx >= 0) {
        const copy = [...prev];
        copy[idx] = v;
        return copy;
      }
      return [...prev, v];
    });
    setActiveVehicleId(v.id);
    playChimeSound('success');
  };

  const handleDeleteVehicle = (id: string) => {
    if (vehicles.length <= 1) {
      alert('You must keep at least one vehicle.');
      return;
    }
    const remaining = vehicles.filter((v) => v.id !== id);
    setVehicles(remaining);
    setActiveVehicleId(remaining[0].id);
  };

  // Handle Vehicle Intervals Update from Reminders Hub
  const handleUpdateVehicleIntervals = (
    dist: number,
    mo: number,
    oilType: Vehicle['oilType']
  ) => {
    setVehicles((prev) =>
      prev.map((v) =>
        v.id === activeVehicle.id
          ? {
              ...v,
              oilChangeIntervalDistance: dist,
              oilChangeIntervalMonths: mo,
              oilType,
            }
          : v
      )
    );
    playChimeSound('success');
  };

  // Reset to Demo Data
  const handleResetDemoData = () => {
    setVehicles(DEFAULT_VEHICLES);
    setActiveVehicleId(DEFAULT_VEHICLES[0].id);
    setFuelLogs(recalculateFuelLogs(DEFAULT_FUEL_LOGS));
    setMaintenanceLogs(DEFAULT_MAINTENANCE_LOGS);
    setNotifications([]);
    localStorage.removeItem(STORAGE_KEYS.LAST_CHECKED);
    playChimeSound('success');
  };

  // Import JSON Data
  const handleImportData = (data: { vehicles: Vehicle[]; fuelLogs: FuelLog[]; maintenanceLogs: MaintenanceLog[] }) => {
    setVehicles(data.vehicles);
    if (data.vehicles.length > 0) {
      setActiveVehicleId(data.vehicles[0].id);
    }
    setFuelLogs(recalculateFuelLogs(data.fuelLogs));
    setMaintenanceLogs(data.maintenanceLogs);
    playChimeSound('success');
  };

  // Notifications Helpers
  const handleMarkNotificationsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const handleClearNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white">
      
      {/* Navigation Bar */}
      <Navbar
        vehicles={vehicles}
        activeVehicle={activeVehicle}
        onSelectVehicle={setActiveVehicleId}
        onOpenAddVehicle={() => {
          setIsEditingVehicle(false);
          setIsVehicleModalOpen(true);
        }}
        onOpenEditVehicle={() => {
          setIsEditingVehicle(true);
          setIsVehicleModalOpen(true);
        }}
        onOpenAddFuel={() => {
          setEditingFuelLog(null);
          setIsAddFuelOpen(true);
        }}
        onOpenAddMaintenance={() => {
          setEditingMaintenanceLog(null);
          setPreselectedServiceType(undefined);
          setIsAddMaintenanceOpen(true);
        }}
        onOpenUpdateOdometer={() => setIsUpdateOdometerOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        notifications={notifications}
        reminders={activeReminders}
        onMarkNotificationsRead={handleMarkNotificationsRead}
        onClearNotification={handleClearNotification}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {/* Automatic Oil Change Reminder Alert Banner (Prominently displays on Dashboard & Reminders, or when overdue/due soon on any tab) */}
        {(activeTab === 'dashboard' || activeTab === 'reminders' || oilReminder.status !== 'good') && (
          <OilChangeReminderBanner
            vehicle={activeVehicle}
            reminder={oilReminder}
            onLogOilChange={() => {
              setEditingMaintenanceLog(null);
              setPreselectedServiceType('oil_change');
              setIsAddMaintenanceOpen(true);
            }}
            onOpenRemindersHub={() => setActiveTab('reminders')}
            onTriggerTestReminder={() => handleTriggerTestReminder('oil_change')}
            browserNotificationPermission={browserPermission}
            onRequestNotificationPermission={handleRequestNotificationPermission}
          />
        )}

        {/* Tab 1: Dashboard */}
        {activeTab === 'dashboard' && (
          <DashboardOverview
            vehicle={activeVehicle}
            fuelLogs={fuelLogs}
            maintenanceLogs={maintenanceLogs}
            reminders={activeReminders}
            onNavigateTab={setActiveTab}
            onOpenAddFuel={() => {
              setEditingFuelLog(null);
              setIsAddFuelOpen(true);
            }}
            onOpenAddMaintenance={() => {
              setEditingMaintenanceLog(null);
              setPreselectedServiceType(undefined);
              setIsAddMaintenanceOpen(true);
            }}
            onOpenUpdateOdometer={() => setIsUpdateOdometerOpen(true)}
          />
        )}

        {/* Tab 2: Fuel Tracker & Fuel Economy */}
        {activeTab === 'fuel' && (
          <FuelTracker
            vehicle={activeVehicle}
            fuelLogs={fuelLogs}
            onAddFuelLog={handleSaveFuelLog}
            onEditFuelLog={(log) => {
              setEditingFuelLog(log);
              setIsAddFuelOpen(true);
            }}
            onDeleteFuelLog={handleDeleteFuelLog}
            onOpenAddModal={() => {
              setEditingFuelLog(null);
              setIsAddFuelOpen(true);
            }}
          />
        )}

        {/* Tab 3: Maintenance History */}
        {activeTab === 'maintenance' && (
          <MaintenanceLogger
            vehicle={activeVehicle}
            maintenanceLogs={maintenanceLogs}
            onOpenAddModal={(preselectedType) => {
              setEditingMaintenanceLog(null);
              setPreselectedServiceType(preselectedType);
              setIsAddMaintenanceOpen(true);
            }}
            onEditMaintenanceLog={(log) => {
              setEditingMaintenanceLog(log);
              setIsAddMaintenanceOpen(true);
            }}
            onDeleteMaintenanceLog={handleDeleteMaintenanceLog}
          />
        )}

        {/* Tab 4: Oil Change & Automatic Reminders Hub */}
        {activeTab === 'reminders' && (
          <RemindersManager
            vehicle={activeVehicle}
            reminders={activeReminders}
            onUpdateVehicleIntervals={handleUpdateVehicleIntervals}
            onLogOilChange={() => {
              setEditingMaintenanceLog(null);
              setPreselectedServiceType('oil_change');
              setIsAddMaintenanceOpen(true);
            }}
            onTriggerTestReminder={handleTriggerTestReminder}
            browserNotificationPermission={browserPermission}
            onRequestNotificationPermission={handleRequestNotificationPermission}
          />
        )}
      </main>

      {/* App Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 py-5 text-[11px] font-mono uppercase tracking-wider text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-400">AUTOTRACK</span>
            <span>•</span>
            <span>AUTOMATIC SERVICE REMINDERS &amp; FUEL EFFICIENCY</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBackupModalOpen(true)}
              className="text-slate-400 hover:text-indigo-400 flex items-center gap-1.5 transition-colors"
            >
              <Database className="w-3.5 h-3.5" />
              <span>EXPORT &amp; BACKUP</span>
            </button>
            <span>•</span>
            <button
              onClick={handleResetDemoData}
              className="hover:text-slate-300 transition-colors"
            >
              RESET DEMO
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AddFuelModal
        isOpen={isAddFuelOpen}
        onClose={() => {
          setIsAddFuelOpen(false);
          setEditingFuelLog(null);
        }}
        vehicle={activeVehicle}
        editingLog={editingFuelLog}
        onSave={handleSaveFuelLog}
      />

      <AddMaintenanceModal
        isOpen={isAddMaintenanceOpen}
        onClose={() => {
          setIsAddMaintenanceOpen(false);
          setEditingMaintenanceLog(null);
          setPreselectedServiceType(undefined);
        }}
        vehicle={activeVehicle}
        editingLog={editingMaintenanceLog}
        preselectedType={preselectedServiceType}
        onSave={handleSaveMaintenanceLog}
      />

      <UpdateOdometerModal
        isOpen={isUpdateOdometerOpen}
        onClose={() => setIsUpdateOdometerOpen(false)}
        vehicle={activeVehicle}
        onSave={handleUpdateOdometer}
      />

      <VehicleModal
        isOpen={isVehicleModalOpen}
        onClose={() => {
          setIsVehicleModalOpen(false);
          setIsEditingVehicle(false);
        }}
        vehicle={isEditingVehicle ? activeVehicle : null}
        onSave={handleSaveVehicle}
        onDelete={handleDeleteVehicle}
      />

      <DataBackupModal
        isOpen={isBackupModalOpen}
        onClose={() => setIsBackupModalOpen(false)}
        activeVehicle={activeVehicle}
        vehicles={vehicles}
        fuelLogs={fuelLogs}
        maintenanceLogs={maintenanceLogs}
        onResetDemoData={handleResetDemoData}
        onImportData={handleImportData}
      />

    </div>
  );
}
