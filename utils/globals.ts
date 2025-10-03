import * as schema from "@/db/schema";
import { Period, ViolationTypes, ViolationValues } from "@/types/globals";
import { format, isBefore, parse } from "date-fns";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export const daysOptions = [
  { label: "Monday", value: "Monday" },
  { label: "Tuesday", value: "Tuesday" },
  { label: "Wednesday", value: "Wednesday" },
  { label: "Thursday", value: "Thursday" },
  { label: "Friday", value: "Friday" },
  { label: "Saturday", value: "Saturday" },
  { label: "Sunday", value: "Sunday" },
];

export const daysArray = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

export const violationTypesArray = [
  "Basic Wage",
  "Overtime Pay",
  "Night Differential",
  "Special Day",
  "Rest Day",
  "Holiday Pay",
  "13th Month Pay",
];

export const periodFormat = {
  start_date: "",
  end_date: "",
  daysOrHours: "",
  rate: "",
};

export const periodsFormat = {
  periods: [periodFormat],
};

export const getDb = () => {
  return drizzle(useSQLiteContext(), { schema });
};

export const formatNumber = (number: string | number) => {
  return (number || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const numberToLetter = (number: number) => {
  return String.fromCharCode(65 + number);
};

export const formatDate = (date: string) => {
  return format(parse(date, "yyyy-MM-dd", new Date()), "dd MMMM yyyy");
};

export const validate = (object: { [key: string]: string | number }) => {
  return Object.values(object).every((value) => value);
};

export const getMinimumRate = (startDate: string) => {
  let minimumRate = 0;
  if (startDate) {
    minimumRate = isBefore(startDate, "2024-12-23") ? 395 : 430;
  }
  return minimumRate;
};

export const calculate = (period: Period, type: string) => {
  let result = 0;

  if (validate(period)) {
    const daysOrHours = Number(period.daysOrHours);
    const rate = Number(period.rate);
    const minimumRate = getMinimumRate(period.start_date);
    const rateToUse = Math.max(rate, minimumRate);

    if (type == "Basic Wage") {
      result = (rateToUse - rate) * daysOrHours;
    } else if (type == "Overtime Pay") {
      result = (rateToUse / 8) * 0.25 * daysOrHours;
    } else if (type == "Night Differential") {
      result = (rateToUse / 8) * 0.1 * daysOrHours;
    } else if (type == "Special Day") {
      result = rateToUse * 0.3 * daysOrHours;
    } else if (type == "Rest Day") {
      result = rateToUse * 0.3 * daysOrHours;
    } else if (type == "Holiday Pay") {
      result = rateToUse * daysOrHours;
    } else if (type == "13th Month Pay") {
      result = (rateToUse * daysOrHours) / 12;
    }
  }

  return result;
};

export const getTotal = (
  violationType: { periods: Period[]; received?: string },
  type: string,
) => {
  let result = 0;
  violationType.periods.forEach((period) => {
    result += calculate(period, type);
  });
  violationType.received && (result -= Number(violationType.received));
  return result;
};

export const getPeriodFormat = (rate?: number) => {
  return { ...periodFormat, rate: `${rate ? `${rate}` : ""}` };
};

export const getInitialViolations = (rate?: number) => {
  const values = {} as ViolationValues;
  violationTypesArray.forEach((type) => {
    const periodsFormat = { periods: [getPeriodFormat(rate)] };
    values[type as ViolationTypes] =
      type == "13th Month Pay"
        ? { ...periodsFormat, received: "" }
        : periodsFormat;
  });
  return values;
};
