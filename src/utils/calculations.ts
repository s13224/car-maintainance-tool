import { Vehicle, FuelLog, MaintenanceLog, AutoReminder, ReminderStatus } from '../types';

/**
 * Recalculate fuel efficiencies across fuel logs in ascending chronological order
 */
export function recalculateFuelLogs(logs: FuelLog[]): FuelLog[] {
  // Sort logs by odometer ascending (or date)
  const sorted = [...logs].sort((a, b) => {
    if (a.odometer !== b.odometer) {
      return a.odometer - b.odometer;
    }
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  const result: FuelLog[] = [];

  for (let i = 0; i < sorted.length; i++) {
    const current = { ...sorted[i] };
    const previous = i > 0 ? sorted[i - 1] : null;

    if (previous && !current.missedPreviousFillUp) {
      const distance = current.odometer - previous.odometer;
      if (distance > 0 && current.fuelAmount > 0) {
        current.distanceDelta = distance;

        // If current fill-up was to a full tank, efficiency = distance / fuelAmount
        if (current.isFullTank) {
          // MPG or km/L base: distance / fuelAmount
          current.calculatedEfficiency = Number((distance / current.fuelAmount).toFixed(2));
        }

        if (current.totalCost > 0) {
          current.costPerDistance = Number((current.totalCost / distance).toFixed(3));
        }
      }
    }

    result.push(current);
  }

  // Return back in descending order for default UI display (most recent first)
  return result.sort((a, b) => {
    if (b.odometer !== a.odometer) {
      return b.odometer - a.odometer;
    }
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
}

/**
 * Format fuel efficiency value according to selected target unit
 */
export function formatEfficiency(
  value: number | undefined,
  baseVehicleDistance: 'miles' | 'km',
  targetUnit: 'mpg_us' | 'l_per_100km' | 'km_per_l' | 'mpg_uk' = 'mpg_us'
): { value: string; unit: string } {
  if (value === undefined || value <= 0 || isNaN(value)) {
    return { value: '--', unit: targetUnit === 'l_per_100km' ? 'L/100km' : targetUnit.toUpperCase() };
  }

  // Value is in base (miles/gallon or km/liter)
  if (baseVehicleDistance === 'miles') {
    // value is in MPG (US)
    if (targetUnit === 'mpg_us') {
      return { value: value.toFixed(1), unit: 'MPG' };
    }
    if (targetUnit === 'l_per_100km') {
      // 235.214 / MPG = L/100km
      const l100 = 235.214583 / value;
      return { value: l100.toFixed(1), unit: 'L/100km' };
    }
    if (targetUnit === 'km_per_l') {
      const kml = value * 0.425144;
      return { value: kml.toFixed(1), unit: 'km/L' };
    }
    if (targetUnit === 'mpg_uk') {
      const mpgUk = value * 1.20095;
      return { value: mpgUk.toFixed(1), unit: 'MPG (UK)' };
    }
  } else {
    // base vehicle distance is km, fuel is liters -> value is km/L
    if (targetUnit === 'km_per_l') {
      return { value: value.toFixed(1), unit: 'km/L' };
    }
    if (targetUnit === 'l_per_100km') {
      const l100 = 100 / value;
      return { value: l100.toFixed(1), unit: 'L/100km' };
    }
    if (targetUnit === 'mpg_us') {
      const mpg = value * 2.35214583;
      return { value: mpg.toFixed(1), unit: 'MPG' };
    }
  }

  return { value: value.toFixed(1), unit: 'MPG' };
}

/**
 * Calculate oil change status and reminders for a vehicle
 */
export function calculateOilChangeReminder(
  vehicle: Vehicle,
  maintenanceLogs: MaintenanceLog[]
): AutoReminder {
  // Find most recent oil change log or fallback to vehicle properties
  const oilLogs = maintenanceLogs
    .filter((m) => m.vehicleId === vehicle.id && (m.isOilChange || m.serviceType === 'oil_change'))
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastOilOdo = oilLogs.length > 0 ? oilLogs[0].odometer : (vehicle.lastOilChangeOdometer ?? (vehicle.currentOdometer - 3200));
  const lastOilDate = oilLogs.length > 0 ? oilLogs[0].date : (vehicle.lastOilChangeDate ?? '2026-03-01');

  const intervalDistance = vehicle.oilChangeIntervalDistance || 5000;
  const intervalMonths = vehicle.oilChangeIntervalMonths || 6;

  const dueOdometer = lastOilOdo + intervalDistance;
  const distanceRemaining = dueOdometer - vehicle.currentOdometer;

  // Calculate Due Date based on last oil change date + intervalMonths
  const lastDateObj = new Date(lastOilDate);
  const dueDateObj = new Date(lastDateObj);
  dueDateObj.setMonth(dueDateObj.getMonth() + intervalMonths);
  const dueDate = dueDateObj.toISOString().split('T')[0];

  const now = new Date();
  const msRemaining = dueDateObj.getTime() - now.getTime();
  const daysRemaining = Math.ceil(msRemaining / (1000 * 60 * 60 * 24));

  // Determine percentage used
  const distanceDriven = Math.max(0, vehicle.currentOdometer - lastOilOdo);
  const percentageUsed = Math.min(100, Math.round((distanceDriven / intervalDistance) * 100));

  // Thresholds for alerts:
  // Overdue if distanceRemaining <= 0 OR daysRemaining <= 0
  // Due soon if distanceRemaining <= 500 miles (or 800 km) OR daysRemaining <= 14
  let status: ReminderStatus = 'good';
  if (distanceRemaining <= 0 || daysRemaining <= 0) {
    status = 'overdue';
  } else if (distanceRemaining <= (vehicle.distanceUnit === 'miles' ? 500 : 800) || daysRemaining <= 21) {
    status = 'due_soon';
  }

  let description = '';
  const unitStr = vehicle.distanceUnit;
  if (status === 'overdue') {
    const overdueDist = Math.abs(distanceRemaining);
    description = `Oil change is overdue by ${overdueDist.toLocaleString()} ${unitStr} or ${Math.abs(daysRemaining)} days! Change oil to prevent engine wear.`;
  } else if (status === 'due_soon') {
    description = `Oil change due in ${distanceRemaining.toLocaleString()} ${unitStr} (~${daysRemaining} days remaining).`;
  } else {
    description = `${distanceRemaining.toLocaleString()} ${unitStr} remaining until next service (Due approx. ${dueDate}).`;
  }

  return {
    id: `reminder-oil-${vehicle.id}`,
    vehicleId: vehicle.id,
    type: 'oil_change',
    title: 'Engine Oil & Filter Change',
    description,
    status,
    dueOdometer,
    dueDate,
    distanceRemaining,
    daysRemaining,
    percentageUsed,
  };
}

/**
 * Generate all active reminders for a vehicle (oil change, tire rotation, scheduled checks)
 */
export function getAllReminders(
  vehicle: Vehicle,
  maintenanceLogs: MaintenanceLog[]
): AutoReminder[] {
  const reminders: AutoReminder[] = [];

  // 1. Oil change reminder
  const oilReminder = calculateOilChangeReminder(vehicle, maintenanceLogs);
  reminders.push(oilReminder);

  // 2. Tire rotation reminder
  const tireLogs = maintenanceLogs
    .filter((m) => m.vehicleId === vehicle.id && m.serviceType === 'tire_rotation')
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const lastTireOdo = tireLogs.length > 0 ? tireLogs[0].odometer : (vehicle.currentOdometer - 4500);
  const tireInterval = vehicle.tireRotationIntervalDistance || 7500;
  const tireDueOdo = lastTireOdo + tireInterval;
  const tireDistRemaining = tireDueOdo - vehicle.currentOdometer;
  const tireDistanceDriven = Math.max(0, vehicle.currentOdometer - lastTireOdo);
  const tirePercentage = Math.min(100, Math.round((tireDistanceDriven / tireInterval) * 100));

  let tireStatus: ReminderStatus = 'good';
  if (tireDistRemaining <= 0) {
    tireStatus = 'overdue';
  } else if (tireDistRemaining <= (vehicle.distanceUnit === 'miles' ? 750 : 1200)) {
    tireStatus = 'due_soon';
  }

  // Estimate tire due date (~1000 miles/month)
  const estDaysTire = Math.max(0, Math.round((tireDistRemaining / 33)));
  const tireDueDateObj = new Date();
  tireDueDateObj.setDate(tireDueDateObj.getDate() + estDaysTire);

  reminders.push({
    id: `reminder-tire-${vehicle.id}`,
    vehicleId: vehicle.id,
    type: 'tire_rotation',
    title: 'Tire Rotation & Pressure Check',
    description: tireStatus === 'overdue'
      ? `Tire rotation overdue by ${Math.abs(tireDistRemaining).toLocaleString()} ${vehicle.distanceUnit}.`
      : `${tireDistRemaining.toLocaleString()} ${vehicle.distanceUnit} remaining until recommended rotation.`,
    status: tireStatus,
    dueOdometer: tireDueOdo,
    dueDate: tireDueDateObj.toISOString().split('T')[0],
    distanceRemaining: tireDistRemaining,
    daysRemaining: estDaysTire,
    percentageUsed: tirePercentage,
  });

  return reminders;
}

/**
 * Calculate vehicle overview summary statistics
 */
export function getVehicleStats(
  vehicle: Vehicle,
  fuelLogs: FuelLog[],
  maintenanceLogs: MaintenanceLog[]
) {
  const vehicleFuel = fuelLogs.filter((f) => f.vehicleId === vehicle.id);
  const vehicleMaint = maintenanceLogs.filter((m) => m.vehicleId === vehicle.id);

  // Fuel stats
  const totalFuelCost = vehicleFuel.reduce((sum, f) => sum + (f.totalCost || 0), 0);
  const totalFuelVolume = vehicleFuel.reduce((sum, f) => sum + (f.fuelAmount || 0), 0);

  // Average efficiency from calculated logs
  const validEfficiencies = vehicleFuel
    .map((f) => f.calculatedEfficiency)
    .filter((e): e is number => typeof e === 'number' && e > 0);

  const averageEfficiency = validEfficiencies.length > 0
    ? validEfficiencies.reduce((sum, e) => sum + e, 0) / validEfficiencies.length
    : undefined;

  // Best & worst efficiency
  const bestEfficiency = validEfficiencies.length > 0 ? Math.max(...validEfficiencies) : undefined;
  const worstEfficiency = validEfficiencies.length > 0 ? Math.min(...validEfficiencies) : undefined;

  // Recent 3 logs average
  const recentValid = validEfficiencies.slice(0, 3);
  const recentEfficiency = recentValid.length > 0
    ? recentValid.reduce((sum, e) => sum + e, 0) / recentValid.length
    : undefined;

  // Maintenance stats
  const totalMaintenanceCost = vehicleMaint.reduce((sum, m) => sum + (m.cost || 0), 0);

  // Total cost of ownership logged
  const totalExpenditure = totalFuelCost + totalMaintenanceCost;

  // Cost per mile / km
  const totalTrackedDistance = vehicleFuel.reduce((sum, f) => sum + (f.distanceDelta || 0), 0);
  const overallCostPerDistance = totalTrackedDistance > 0 ? totalExpenditure / totalTrackedDistance : 0;
  const fuelCostPerDistance = totalTrackedDistance > 0 ? totalFuelCost / totalTrackedDistance : 0;

  return {
    totalFuelCost,
    totalFuelVolume,
    averageEfficiency,
    bestEfficiency,
    worstEfficiency,
    recentEfficiency,
    totalMaintenanceCost,
    totalExpenditure,
    totalTrackedDistance,
    overallCostPerDistance,
    fuelCostPerDistance,
    totalFillUps: vehicleFuel.length,
    totalServices: vehicleMaint.length,
  };
}
