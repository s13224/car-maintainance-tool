import React from 'react';
import { 
  AlertTriangle, 
  Clock, 
  CheckCircle2, 
  Droplet, 
  Bell, 
  Volume2, 
  ChevronRight, 
  Wrench,
  Sparkles
} from 'lucide-react';
import { Vehicle, AutoReminder } from '../types';

interface OilChangeReminderBannerProps {
  vehicle: Vehicle;
  reminder: AutoReminder;
  onLogOilChange: () => void;
  onOpenRemindersHub: () => void;
  onTriggerTestReminder: () => void;
  browserNotificationPermission: NotificationPermission | 'unsupported';
  onRequestNotificationPermission: () => void;
}

export const OilChangeReminderBanner: React.FC<OilChangeReminderBannerProps> = ({
  vehicle,
  reminder,
  onLogOilChange,
  onOpenRemindersHub,
  onTriggerTestReminder,
  browserNotificationPermission,
  onRequestNotificationPermission,
}) => {
  const isOverdue = reminder.status === 'overdue';
  const isDueSoon = reminder.status === 'due_soon';
  const isGood = reminder.status === 'good';

  // Calculate life remaining percentage
  const lifeRemaining = Math.max(0, 100 - reminder.percentageUsed);

  // Background and border styling based on urgency
  let containerStyle = 'bg-slate-900/70 border border-slate-800 border-l-4 border-l-emerald-500 text-slate-200';
  let badgeStyle = 'bg-emerald-950 text-emerald-400 border-emerald-800';
  let progressColor = 'bg-emerald-500';

  if (isOverdue) {
    containerStyle = 'bg-slate-900 border border-slate-800 border-l-4 border-l-red-500 text-white shadow-lg shadow-red-950/20';
    badgeStyle = 'bg-red-950 text-red-300 border-red-800 font-bold';
    progressColor = 'bg-red-500';
  } else if (isDueSoon) {
    containerStyle = 'bg-indigo-950/30 border border-indigo-500/30 border-l-4 border-l-amber-500 text-white shadow-lg shadow-amber-950/10';
    badgeStyle = 'bg-amber-950 text-amber-300 border-amber-800 font-bold';
    progressColor = 'bg-amber-500';
  }

  return (
    <div 
      id="oil-change-automatic-reminder-banner"
      className={`rounded-sm p-4 sm:p-5 transition-all ${containerStyle}`}
    >
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        
        {/* Left Column: Icon & Details */}
        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-sm flex items-center justify-center shrink-0 ${
            isOverdue ? 'bg-red-950/80 text-red-400 border border-red-800/80' :
            isDueSoon ? 'bg-amber-950/80 text-amber-400 border border-amber-800/80' :
            'bg-slate-900 text-emerald-400 border border-slate-800'
          }`}>
            <Droplet className="w-5 h-5" />
          </div>

          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <h2 className="text-sm uppercase tracking-widest font-black text-white flex items-center gap-2">
                Automatic Service Telemetry: Engine Oil Health
              </h2>
              <span className={`px-2 py-0.5 rounded-sm text-[10px] font-mono uppercase tracking-widest border ${badgeStyle}`}>
                {isOverdue ? 'CRITICAL: OVERDUE' : isDueSoon ? 'ATTENTION: DUE SOON' : 'STATUS: OPTIMAL'}
              </span>
            </div>

            <p className="mt-1 text-xs text-slate-300">
              {isOverdue ? (
                <span className="text-red-300 font-medium">
                  Exceeded recommended interval by {Math.abs(reminder.distanceRemaining).toLocaleString()} {vehicle.distanceUnit}. Fresh oil change required immediately.
                </span>
              ) : isDueSoon ? (
                <span className="text-amber-200">
                  Approaching service threshold: only <strong className="font-mono">{reminder.distanceRemaining.toLocaleString()} {vehicle.distanceUnit}</strong> (~{reminder.daysRemaining} days) remaining before next oil change.
                </span>
              ) : (
                <span className="text-slate-300">
                  Oil condition optimal: <strong className="font-mono text-white">{reminder.distanceRemaining.toLocaleString()} {vehicle.distanceUnit}</strong> or approx. {reminder.daysRemaining} days remaining (Due at {reminder.dueOdometer.toLocaleString()} {vehicle.distanceUnit}).
                </span>
              )}
            </p>

            {/* Quick Oil Spec Info */}
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] font-mono text-slate-400">
              <span>OIL TYPE: <strong className="text-slate-200">{vehicle.oilType}</strong></span>
              <span>•</span>
              <span>INTERVAL: <strong className="text-slate-200">{vehicle.oilChangeIntervalDistance.toLocaleString()} {vehicle.distanceUnit} / {vehicle.oilChangeIntervalMonths} MO</strong></span>
              <span>•</span>
              <span>TARGET ODO: <strong className="text-indigo-300">{reminder.dueOdometer.toLocaleString()} {vehicle.distanceUnit}</strong></span>
            </div>
          </div>
        </div>

        {/* Right Column: Life Meter & Action Buttons */}
        <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-4 shrink-0">
          {/* Visual Life Remaining Meter */}
          <div className="bg-slate-950 rounded-sm p-2.5 border border-slate-800 min-w-[150px]">
            <div className="flex justify-between items-center text-[10px] uppercase font-mono tracking-wider mb-1.5">
              <span className="text-slate-500">Lubricant Life</span>
              <span className={`font-bold ${
                isOverdue ? 'text-red-400' : isDueSoon ? 'text-amber-400' : 'text-emerald-400'
              }`}>
                {lifeRemaining}%
              </span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-none overflow-hidden">
              <div 
                className={`h-full transition-all duration-500 ${progressColor}`}
                style={{ width: `${Math.max(4, lifeRemaining)}%` }}
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            <button
              id="btn-banner-log-oil-change"
              onClick={onLogOilChange}
              className="flex-1 sm:flex-initial px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-sm text-xs font-bold uppercase tracking-wider shadow-sm flex items-center justify-center gap-1.5 transition-all"
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Log Oil Service</span>
            </button>

            <button
              id="btn-banner-reminders-hub"
              onClick={onOpenRemindersHub}
              className="px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-sm text-xs font-semibold uppercase tracking-wider border border-slate-800 flex items-center justify-center gap-1 transition-colors"
              title="Configure intervals & notifications"
            >
              <span>Intervals</span>
              <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
            </button>
          </div>
        </div>
      </div>

      {/* Automatic Notification Control Strip */}
      <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs font-mono text-slate-400">
        <div className="flex items-center gap-2">
          <Bell className="w-3.5 h-3.5 text-indigo-400" />
          <span className="text-[11px] uppercase tracking-wider">
            AUTOMATIC TELEMETRY: {browserNotificationPermission === 'granted' ? (
              <span className="text-emerald-400 font-bold">ONLINE (BROWSER PUSH ACTIVE)</span>
            ) : (
              <span className="text-slate-400">IN-APP ALERTS ACTIVE</span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {browserNotificationPermission !== 'granted' && (
            <button
              id="btn-enable-browser-alerts"
              onClick={onRequestNotificationPermission}
              className="text-indigo-400 hover:text-indigo-300 font-semibold uppercase tracking-wider text-[11px] underline flex items-center gap-1"
            >
              Enable Push Alerts
            </button>
          )}

          <button
            id="btn-test-reminder-alert"
            onClick={onTriggerTestReminder}
            className="text-slate-300 hover:text-white flex items-center gap-1 px-2.5 py-1 rounded-sm bg-slate-900 hover:bg-slate-800 border border-slate-800 text-[11px] uppercase tracking-wider transition-colors"
            title="Simulate an automatic oil change reminder with audio and banner alert"
          >
            <Volume2 className="w-3.5 h-3.5 text-indigo-400" />
            <span>Simulate Alert</span>
          </button>
        </div>
      </div>
    </div>
  );
};
