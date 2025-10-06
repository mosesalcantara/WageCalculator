import * as schema from "@/db/schema";
import { Period, ViolationTypes, ViolationValues } from "@/types/globals";
import { differenceInDays, format, parse } from "date-fns";
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

export const getMinimumRate = (startDate: string, endDate: string) => {
  const minimumRates = [
    { name: "RB-MIMAROPA-10", date: "2022-06-22", minimum_rate: 355 },
    { name: "RB-MIMAROPA-11", date: "2023-12-07", minimum_rate: 395 },
    { name: "RB-MIMAROPA-12", date: "2024-12-23", minimum_rate: 430 },
  ];

  minimumRates.sort((a, b) => {
    return Number(new Date(a.date)) - Number(new Date(b.date));
  });

  let rate = 0;
  const isValid =
    startDate && endDate && differenceInDays(endDate, startDate) >= 0;

  if (isValid) {
    if (differenceInDays(minimumRates[0].date, startDate) > 0) {
      rate = minimumRates[0].minimum_rate;
    } else {
      let index = 0;
      for (const minimumRate of minimumRates) {
        if (differenceInDays(minimumRate.date, startDate) <= 0) {
          if (
            index == minimumRates.length - 1 ||
            differenceInDays(minimumRates[index + 1].date, endDate) > 0
          ) {
            rate = minimumRate.minimum_rate;
            break;
          }
        }
        ++index;
      }
    }
  }
  return rate;
};

export const calculate = (period: Period, type: string) => {
  let result = 0;

  if (validate(period)) {
    const daysOrHours = Number(period.daysOrHours);
    const rate = Number(period.rate);
    const minimumRate = getMinimumRate(period.start_date, period.end_date);
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
