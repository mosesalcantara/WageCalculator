import { ExpoSQLiteDatabase } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";

export type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export type Db = ExpoSQLiteDatabase<typeof import("@/db/schema")> & {
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
  custom_violations?: CustomViolation[] | [];
};

export type Violation = {
  id: number;
  values: ViolationTypes | string;
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

export type Period = {
  start_date: string;
  end_date: string;
  rate: string;
  daysOrHours: string;
  type: string;
};

export type CustomViolation = {
  id: number;
  values: CustomViolationType | string;
  employee_id?: number;
};

export type CustomViolationType = {
  periods: CustomPeriod[];
  received: string;
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

export type WageOrder = {
  id: number;
  name: string;
  date: string;
  less_than_ten: number;
  ten_or_more: number;
};

export type Holiday = {
  id: number;
  name: string;
  date: string;
  type: string;
}
