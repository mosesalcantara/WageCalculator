import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";

export type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export type Db = ExpoSQLiteDatabase<
  typeof import("c:/laragon/www/WageCalculator/db/schema")
> & {
  $client: SQLiteDatabase;
};

export type Establishment = {
  id: number;
  name: string;
  size: string;
  employees?: Employee[];
};

export type Employee = {
  id: number;
  last_name: string;
  first_name: string;
  middle_initial: string;
  rate: number;
  start_day: string;
  end_day: string;
  establishment_id?: number;
  violations?: Violation[] | [];
};

export type Violation = {
  id: number;
  values: ViolationTypes | string;
  employee_id?: number;
};

export type CustomViolation = {
  id: number;
  values: CustomViolationType | string;
  employee_id?: number;
};

export type ViolationKeys =
  | "Basic Wage"
  | "Overtime Pay"
  | "Night Shift Differential"
  | "Special Day"
  | "Rest Day"
  | "Holiday Pay"
  | "13th Month Pay"
  | "Custom";

export type ViolationTypes = {
  [key in ViolationKeys]: { periods: Period[]; received: string };
};

export type CustomViolationType = {
  periods: CustomPeriod[];
  received: string;
};

export type Period = {
  start_date: string;
  end_date: string;
  rate: string;
  daysOrHours: string;
  type: string;
};

export type CustomPeriod = {
  start_date: string;
  end_date: string;
  type: string;
  rate: string;
  days: string;
  nightShiftHours: string;
  overtimeHours: string;
};

export type Holiday = {
  name: string;
  date: string;
  type: string;
};
