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
  | "13th Month Pay"
  | "Custom";

export type PaymentType = "Underpayment" | "Non-payment";

export type Period = {
  start_date: string;
  end_date: string;
  type: string;
  rate: string;
  days: string;
  hours: string;
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
  received: string;
};

export type ViolationValues = {
  "Basic Wage": {
    Underpayment: Period[];
    "Non-payment": Period[];
  };
  "Overtime Pay": {
    Underpayment: Period[];
    "Non-payment": Period[];
  };
  "Night Shift Differential": {
    Underpayment: Period[];
    "Non-payment": Period[];
  };
  "Special Day": {
    Underpayment: Period[];
    "Non-payment": Period[];
  };
  "Rest Day": {
    Underpayment: Period[];
    "Non-payment": Period[];
  };
  "Holiday Pay": {
    Underpayment: Period[];
    "Non-payment": Period[];
  };
  "13th Month Pay": {
    Underpayment: Period[];
    "Non-payment": Period[];
  };
  Custom: {
    Underpayment: CustomPeriod[];
    "Non-payment": CustomPeriod[];
  };
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
