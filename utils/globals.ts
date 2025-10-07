import * as schema from "@/db/schema";
import { Period, ViolationTypes, ViolationValues } from "@/types/globals";
import { differenceInDays, format, parse } from "date-fns";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export const toastVisibilityTime = 1000;

export const wageOrders = [
  {
    name: "RB-MIMAROPA-09",
    date: "2019-02-01",
    rates: {
      lessThanTen: 283,
      tenOrMore: 320,
    },
  },
  {
    name: "RB-MIMAROPA-10",
    date: "2022-06-10",
    rates: {
      lessThanTen: 329,
      tenOrMore: 355,
    },
  },
  {
    name: "RB-MIMAROPA-11",
    date: "2023-12-07",
    rates: {
      lessThanTen: 369,
      tenOrMore: 395,
    },
  },
  {
    name: "RB-MIMAROPA-12",
    date: "2024-12-23",
    rates: {
      lessThanTen: 404,
      tenOrMore: 430,
    },
  },
];

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
  "Night Shift Differential",
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

export const validateDateRange = (startDate: string, endDate: string) => {
  return startDate && endDate && differenceInDays(endDate, startDate) >= 0;
};

export const getMinimumRate = (
  startDate: string,
  endDate: string,
  size: string,
) => {
  wageOrders.sort((a, b) => {
    return Number(new Date(a.date)) - Number(new Date(b.date));
  });

  let rate = 0;

  if (validateDateRange(startDate, endDate) && size) {
    if (differenceInDays(wageOrders[0].date, startDate) > 0) {
      rate =
        size == "Employing 10 or more workers"
          ? wageOrders[0].rates.tenOrMore
          : wageOrders[0].rates.lessThanTen;
    } else {
      let index = 0;
      for (const wageOrder of wageOrders) {
        if (differenceInDays(wageOrder.date, startDate) <= 0) {
          if (
            index == wageOrders.length - 1 ||
            differenceInDays(wageOrders[index + 1].date, endDate) > 0
          ) {
            rate =
              size == "Employing 10 or more workers"
                ? wageOrder.rates.tenOrMore
                : wageOrder.rates.lessThanTen;
            break;
          }
        }
        ++index;
      }
    }
  }
  return rate;
};

export const calculate = (period: Period, type: string, size: string) => {
  let result = 0;

  if (validate(period)) {
    const daysOrHours = Number(period.daysOrHours);
    const rate = Number(period.rate);
    const minimumRate = getMinimumRate(
      period.start_date,
      period.end_date,
      size,
    );
    const rateToUse = Math.max(rate, minimumRate);

    if (type == "Basic Wage") {
      result = (rateToUse - rate) * daysOrHours;
    } else if (type == "Overtime Pay") {
      result = (rateToUse / 8) * 0.25 * daysOrHours;
    } else if (type == "Night Shift Differential") {
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
  size: string,
) => {
  let result = 0;
  violationType.periods.forEach((period) => {
    result += calculate(period, type, size);
  });
  violationType.received && (result -= Number(violationType.received));
  return result;
};

// export const getPeriodFormat = (rate?: number) => {
//   return { ...periodFormat, rate: `${rate ? `${rate}` : ""}` };
// };

// export const getInitialViolations1 = (rate?: number) => {
//   const values = {} as ViolationValues;
//   violationTypesArray.forEach((type) => {
//     const periodsFormat = { periods: [getPeriodFormat(rate)] };
//     values[type as ViolationTypes] =
//       type == "13th Month Pay"
//         ? { ...periodsFormat, received: "" }
//         : periodsFormat;
//   });
//   return values;
// };

export const getInitialViolations = () => {
  const values = {} as ViolationValues;
  violationTypesArray.forEach((type) => {
    const periodsFormat = { periods: [periodFormat] };
    values[type as ViolationTypes] =
      type == "13th Month Pay"
        ? { ...periodsFormat, received: "" }
        : periodsFormat;
  });
  return values;
};
