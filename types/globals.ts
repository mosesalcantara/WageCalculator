export type Override<T1, T2> = Omit<T1, keyof T2> & T2;

export type Establishment = {
  id: number;
  name: string;
  employees?: Employee[],
};

export type Employee = {
  id: number;
  first_name: string;
  last_name: string;
  rate: number;
  start_day: string;
  end_day: string;
  establishment_id?: number;
  violations?: Violations[];
};

export type Violations = {
  id: number;
  values: ViolationValues | string;
  employee_id: number;
};

export type ViolationValues = {
  [key: string]: ViolationType;
};

export type ViolationType = {
  periods: Period[];
  received?: number;
};

export type Period = {
  start_date: string;
  end_date: string;
  daysOrHours: number;
};
