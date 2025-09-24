export type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export type Establishment = {
  id: number;
  name: string;
  employees?: Employee[];
};

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  rate: number;
  start_day: string;
  end_day: string;
  establishment_id?: number;
  violations?: Violations[] | [];
};

export type Violations = {
  id: number;
  values: ViolationValues | string;
  employee_id: number;
};

export type ViolationTypes =
  | "Basic Wage"
  | "Overtime Pay"
  | "Night Differential"
  | "Special Day"
  | "Rest Day"
  | "Holiday Pay"
  | "13th Month Pay";

export type ViolationValues = {
  "Basic Wage": ViolationType;
  "Overtime Pay": ViolationType;
  "Night Differential": ViolationType;
  "Special Day": ViolationType;
  "Rest Day": ViolationType;
  "Holiday Pay": ViolationType;
  "13th Month Pay": ViolationType & { received: string };
};

export type ViolationType = {
  periods: Period[];
};

export type Period = {
  start_date: string;
  end_date: string;
  daysOrHours: string;
};
