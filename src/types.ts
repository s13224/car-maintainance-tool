export type DistanceUnit = 'miles' | 'km';
export type FuelVolumeUnit = 'gallons' | 'liters';
export type EfficiencyUnit = 'mpg_us' | 'mpg_uk' | 'l_per_100km' | 'km_per_l';

export interface Vehicle {
  id: string;
  name: string;
  make: string;
  model: string;
  year: number;
  trim?: string;
  licensePlate?: string;
  vin?: string;
  currentOdometer: number;
  distanceUnit: DistanceUnit;
  fuelVolumeUnit: FuelVolumeUnit;
  oilChangeIntervalDistance: number; // e.g., 5000 miles or 8000 km
  oilChangeIntervalMonths: number; // e.g., 6 months
  tireRotationIntervalDistance: number; // e.g., 7500 miles
  lastOilChangeOdometer?: number;
  lastOilChangeDate?: string; // YYYY-MM-DD
  oilType: 'Full Synthetic' | 'Synthetic Blend' | 'Conventional' | 'High Mileage';
  colorTheme?: string;
  notes?: string;
}

export interface FuelLog {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  odometer: number;
  fuelAmount: number; // gallons or liters
  pricePerUnit: number; // $ per gal or liter
  totalCost: number;
  isFullTank: boolean;
  missedPreviousFillUp?: boolean;
  notes?: string;
  gasStation?: string;
  fuelGrade?: 'Regular 87' | 'Midgrade 89' | 'Premium 91-93' | 'Diesel' | 'E85';
  // Computed fields
  distanceDelta?: number; // distance since previous fill-up
  calculatedEfficiency?: number; // calculated efficiency in vehicle's base unit
  costPerDistance?: number;
}

export type ServiceType = 
  | 'oil_change'
  | 'tire_rotation'
  | 'brake_service'
  | 'cabin_filter'
  | 'engine_filter'
  | 'transmission_fluid'
  | 'battery'
  | 'spark_plugs'
  | 'coolant_flush'
  | 'wheel_alignment'
  | 'inspection_emissions'
  | 'wiper_blades'
  | 'suspension'
  | 'other';

export interface MaintenanceLog {
  id: string;
  vehicleId: string;
  date: string; // YYYY-MM-DD
  odometer: number;
  serviceType: ServiceType;
  customServiceName?: string;
  cost: number;
  serviceProvider: string; // Dealer, Independent Shop, DIY, etc.
  notes?: string;
  partsReplaced?: string;
  isOilChange: boolean;
  nextDueOdometer?: number;
  nextDueDate?: string;
}

export type ReminderStatus = 'good' | 'due_soon' | 'overdue';

export interface AutoReminder {
  id: string;
  vehicleId: string;
  type: 'oil_change' | 'tire_rotation' | 'service';
  title: string;
  description: string;
  status: ReminderStatus;
  dueOdometer: number;
  dueDate: string;
  distanceRemaining: number;
  daysRemaining: number;
  percentageUsed: number;
  isDismissed?: boolean;
  lastNotifiedDate?: string;
}

export interface InAppNotification {
  id: string;
  timestamp: string;
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'urgent';
  vehicleId: string;
  vehicleName: string;
  read: boolean;
}
