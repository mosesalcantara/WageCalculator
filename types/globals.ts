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
  values: ViolationValues | string;
  employee_id?: number;
};

export type ViolationType =
  | "Basic Wage"
  | "Overtime Pay"
  | "Night Shift Differential"
  | "Special Day"
  | "Rest Day"
  | "Holiday Pay"
  | "13th Month Pay";

export type PaymentType = "Underpayment" | "Non-payment";

export type Period = {
  start_date: string;
  end_date: string;
  rate: string;
  days: string;
  hours: string;
  type: string;
  received: string;
};

export type ViolationValues = Record<
  ViolationType,
  Record<PaymentType, Period[]>
>;

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
};
