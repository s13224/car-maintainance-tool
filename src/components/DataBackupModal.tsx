import React from 'react';
import { X, Download, Upload, RotateCcw, FileSpreadsheet, Database, Check } from 'lucide-react';
import { Vehicle, FuelLog, MaintenanceLog } from '../types';

interface DataBackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeVehicle: Vehicle;
  vehicles: Vehicle[];
  fuelLogs: FuelLog[];
  maintenanceLogs: MaintenanceLog[];
  onResetDemoData: () => void;
  onImportData: (data: { vehicles: Vehicle[]; fuelLogs: FuelLog[]; maintenanceLogs: MaintenanceLog[] }) => void;
}

export const DataBackupModal: React.FC<DataBackupModalProps> = ({
  isOpen,
  onClose,
  activeVehicle,
  vehicles,
  fuelLogs,
  maintenanceLogs,
  onResetDemoData,
  onImportData,
}) => {
  if (!isOpen) return null;

  // Export CSV of maintenance history
  const handleExportMaintenanceCSV = () => {
    const vLogs = maintenanceLogs.filter((m) => m.vehicleId === activeVehicle.id);
    const headers = ['Date', 'Odometer', 'Service Type', 'Custom Name', 'Cost ($)', 'Service Provider', 'Parts Replaced', 'Notes', 'Next Due Odo', 'Next Due Date'];
    const rows = vLogs.map((m) => [
      m.date,
      m.odometer,
      m.serviceType,
      m.customServiceName || '',
      m.cost.toFixed(2),
      `"${(m.serviceProvider || '').replace(/"/g, '""')}"`,
      `"${(m.partsReplaced || '').replace(/"/g, '""')}"`,
      `"${(m.notes || '').replace(/"/g, '""')}"`,
      m.nextDueOdometer || '',
      m.nextDueDate || '',
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeVehicle.name.replace(/\s+/g, '_')}_Maintenance_History.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV of fuel logs
  const handleExportFuelCSV = () => {
    const vLogs = fuelLogs.filter((f) => f.vehicleId === activeVehicle.id);
    const headers = ['Date', 'Odometer', 'Distance Delta', 'Fuel Amount', 'Price Per Unit', 'Total Cost ($)', 'Efficiency (MPG/base)', 'Full Tank', 'Station', 'Notes'];
    const rows = vLogs.map((f) => [
      f.date,
      f.odometer,
      f.distanceDelta || '',
      f.fuelAmount,
      f.pricePerUnit,
      f.totalCost.toFixed(2),
      f.calculatedEfficiency || '',
      f.isFullTank ? 'Yes' : 'No',
      `"${(f.gasStation || '').replace(/"/g, '""')}"`,
      `"${(f.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${activeVehicle.name.replace(/\s+/g, '_')}_Fuel_Logs.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export full JSON backup
  const handleExportJSON = () => {
    const backup = {
      version: 1,
      exportDate: new Date().toISOString(),
      vehicles,
      fuelLogs,
      maintenanceLogs,
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backup, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `AutoTrack_Backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Import JSON backup
  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        if (json.vehicles && json.fuelLogs && json.maintenanceLogs) {
          onImportData({
            vehicles: json.vehicles,
            fuelLogs: json.fuelLogs,
            maintenanceLogs: json.maintenanceLogs,
          });
          alert('Data backup successfully imported!');
          onClose();
        } else {
          alert('Invalid AutoTrack backup file format.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-150">
      <div className="bg-slate-900 border border-slate-800 rounded-sm w-full max-w-md shadow-2xl overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-sm bg-indigo-950 text-indigo-400 border border-indigo-800 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm uppercase tracking-wider text-white">Data Management &amp; Export</h2>
              <p className="text-[11px] font-mono text-slate-500 uppercase">Export spreadsheets, backup, or restore</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-sm hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 text-xs">
          
          {/* CSV Exports */}
          <div>
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-2">
              EXPORT VEHICLE SPREADSHEETS (.CSV)
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportMaintenanceCSV}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-sm text-left flex flex-col gap-1 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase text-[11px] font-mono">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Maintenance CSV</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Complete service logs</span>
              </button>

              <button
                onClick={handleExportFuelCSV}
                className="p-3 bg-slate-950 hover:bg-slate-900 border border-slate-800 rounded-sm text-left flex flex-col gap-1 transition-colors"
              >
                <div className="flex items-center gap-1.5 text-indigo-400 font-bold uppercase text-[11px] font-mono">
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Fuel Logs CSV</span>
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">Mileage &amp; fill-up history</span>
              </button>
            </div>
          </div>

          {/* Full JSON Backup & Restore */}
          <div className="pt-3 border-t border-slate-800">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-2">
              FULL APPLICATION BACKUP &amp; SYNC
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleExportJSON}
                className="p-2.5 bg-slate-950 hover:bg-slate-900 text-slate-200 rounded-sm font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 border border-slate-800 transition-colors"
              >
                <Download className="w-4 h-4 text-indigo-400" />
                <span>Download JSON</span>
              </button>

              <label className="p-2.5 bg-slate-950 hover:bg-slate-900 text-slate-200 rounded-sm font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 border border-slate-800 cursor-pointer transition-colors">
                <Upload className="w-4 h-4 text-indigo-400" />
                <span>Import Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileImport}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset to Demo Data */}
          <div className="pt-3 border-t border-slate-800">
            <span className="font-mono text-[11px] uppercase tracking-wider text-slate-300 block mb-1">
              RESET SAMPLE SEED DATA
            </span>
            <p className="text-[10px] font-mono text-slate-500 uppercase mb-2">
              Restores sample 2022 Honda CR-V with realistic fuel logs and oil change reminder.
            </p>
            <button
              onClick={() => {
                if (confirm('Reset to initial demo data? Any custom entries will be replaced.')) {
                  onResetDemoData();
                  onClose();
                }
              }}
              className="w-full py-2 px-3 bg-red-950/20 hover:bg-red-950/40 border border-red-800/80 text-red-300 rounded-sm font-mono text-xs uppercase tracking-wider font-semibold flex items-center justify-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Starter Seed Data</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
