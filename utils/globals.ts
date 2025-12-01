import * as schema from "@/db/schema";
import {
  Period,
  ViolationKey,
  ViolationType,
  WageOrder,
} from "@/types/globals";
import { differenceInDays, format, subDays } from "date-fns";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { SQLiteDatabase } from "expo-sqlite";

export const toastVisibilityTime = 1000;

export const typesOptions = [
  {
    label: "Ordinary day",
    value: "Ordinary day",
  },
  {
    label: "Rest Day",
    value: "Rest Day",
  },
  {
    label: "Special (non-working) day",
    value: "Special (non-working) day",
  },
  {
    label: "Special (non-working) day falling on rest day",
    value: "Special (non-working) day falling on rest day",
  },
  {
    label: "Double special (non-working) day",
    value: "Double special (non-working) day",
  },
  {
    label: "Double special (non-working) day falling on rest day",
    value: "Double special (non-working) day falling on rest day",
  },
  {
    label: "Regular holiday",
    value: "Regular holiday",
  },
  {
    label: "Regular holiday falling on rest day",
    value: "Regular holiday falling on rest day",
  },
  {
    label: "Double regular holiday",
    value: "Double regular holiday",
  },
  {
    label: "Double regular holiday falling on rest day",
    value: "Double regular holiday falling on rest day",
  },
  {
    label: "Ordinary day, night shift",
    value: "Ordinary day, night shift",
  },
  {
    label: "Rest day, night shift",
    value: "Rest day, night shift",
  },
  {
    label: "Special (non-working) day, night shift",
    value: "Special (non-working) day, night shift",
  },
  {
    label: "Special (non-working) day, rest day, night shift",
    value: "Special (non-working) day, rest day, night shift",
  },
  {
    label: "Double special (non-working) day, night shift",
    value: "Double special (non-working) day, night shift",
  },
  {
    label: "Double special (non-working) day, rest day, night shift",
    value: "Double special (non-working) day, rest day, night shift",
  },
  {
    label: "Regular holiday, night shift",
    value: "Regular holiday, night shift",
  },
  {
    label: "Regular holiday, rest day, night shift",
    value: "Regular holiday, rest day, night shift",
  },
  {
    label: "Double holiday, night shift",
    value: "Double holiday, night shift",
  },
  {
    label: "Double holiday, rest day, night shift",
    value: "Double holiday, rest day, night shift",
  },
  {
    label: "Ordinary day, OT",
    value: "Ordinary day, OT",
  },
  {
    label: "Rest day, OT",
    value: "Rest day, OT",
  },
  {
    label: "Special (non-working) day, OT",
    value: "Special (non-working) day, OT",
  },
  {
    label: "Special (non-working) day, rest day, OT",
    value: "Special (non-working) day, rest day, OT",
  },
  {
    label: "Double special (non-working) day, OT",
    value: "Double special (non-working) day, OT",
  },
  {
    label: "Double special (non-working) day, rest day, OT",
    value: "Double special (non-working) day, rest day, OT",
  },
  {
    label: "Regular holiday, OT",
    value: "Regular holiday, OT",
  },
  {
    label: "Regular holiday, rest day, OT",
    value: "Regular holiday, rest day, OT",
  },
  {
    label: "Double holiday, OT",
    value: "Double holiday, OT",
  },
  {
    label: "Double holiday, rest day, OT",
    value: "Double holiday, rest day, OT",
  },
  {
    label: "Ordinary day, night shift, OT",
    value: "Ordinary day, night shift, OT",
  },
  {
    label: "Rest day, night shift, OT",
    value: "Rest day, night shift, OT",
  },
  {
    label: "Special (non-working) day, night shift, OT",
    value: "Special (non-working) day, night shift, OT",
  },
  {
    label: "Special (non-working) day, rest day, night shift, OT",
    value: "Special (non-working) day, rest day, night shift, OT",
  },
  {
    label: "Double special (non-working) day, night shift, OT",
    value: "Double special (non-working) day, night shift, OT",
  },
  {
    label: "Double special (non-working) day, rest day, night shift, OT",
    value: "Double special (non-working) day, rest day, night shift, OT",
  },
  {
    label: "Regular holiday, night shift, OT",
    value: "Regular holiday, night shift, OT",
  },
  {
    label: "Regular holiday, rest day, night shift, OT",
    value: "Regular holiday, rest day, night shift, OT",
  },
  {
    label: "Double holiday, night shift, OT",
    value: "Double holiday, night shift, OT",
  },
  {
    label: "Double holiday, rest day, night shift, OT",
    value: "Double holiday, rest day, night shift, OT",
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

export const violationKeysArray = [
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
  rate: "",
  days: "",
  hours: "",
  type: "Normal Day",
};

export const customPeriodFormat = {
  start_date: "",
  end_date: "",
  type: "",
  rate: "",
  days: "",
  nightShiftHours: "",
  overtimeHours: "",
};

export const periodsFormat = {
  periods: [periodFormat],
};

export const getDb = (sqlDb: SQLiteDatabase) => {
  return drizzle(sqlDb, { schema });
};

export const formatNumber = (number: string | number) => {
  number = Number(number);

  if (isNaN(number)) {
    number = 0;
  }

  return number.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const numberToLetter = (number: number) => {
  return String.fromCharCode(65 + number);
};

export const formatDateValue = (date: string) => {
  return date ? new Date(date) : new Date();
};

export const formatDate = (
  date: string,
  dateFormat: string = "dd MMMM yyyy",
) => {
  return format(new Date(date), dateFormat);
};

export const getDate = (dateTime: Date) => {
  return dateTime.toISOString().split("T")[0];
};

export const validate = (
  object: { [key: string]: string | number },
  excluded: string[] = [],
) => {
  return Object.keys(object).every((key) => {
    return excluded.includes(key) ? true : object[key];
  });
};

export const validateDateRange = (startDate: string, endDate: string) => {
  return startDate && endDate && differenceInDays(endDate, startDate) >= 0;
};

export const isHours = (type: ViolationKey) => {
  return ["Overtime Pay", "Night Shift Differential"].includes(type);
};

export const getMinimumRate = (
  wageOrders: WageOrder[],
  size: string,
  startDate: string,
  endDate: string,
) => {
  let rate = 0;

  if (validateDateRange(startDate, endDate) && size) {
    if (differenceInDays(wageOrders[0].date, startDate) > 0) {
      rate =
        size === "Employing 10 or more workers"
          ? wageOrders[0].ten_or_more
          : wageOrders[0].less_than_ten;
    } else {
      let index = 0;
      for (const wageOrder of wageOrders) {
        if (differenceInDays(wageOrder.date, startDate) <= 0) {
          if (
            index === wageOrders.length - 1 ||
            differenceInDays(wageOrders[index + 1].date, endDate) > 0
          ) {
            rate =
              size === "Employing 10 or more workers"
                ? wageOrder.ten_or_more
                : wageOrder.less_than_ten;
            break;
          }
        }
        ++index;
      }
    }
  }
  return rate;
};

export const calculate = (
  wageOrders: WageOrder[],
  type: ViolationKey,
  size: string,
  period: Period,
) => {
  let result = 0;

  const excluded =
    type === "Overtime Pay" || type === "Night Shift Differential"
      ? []
      : ["hours"];

  if (validate(period, excluded)) {
    const days = Number(period.days);
    const hours = Number(period.hours);

    const rate = Number(period.rate);
    const minimumRate = getMinimumRate(
      wageOrders,
      size,
      period.start_date,
      period.end_date,
    );
    const rateToUse = Math.max(rate, minimumRate);

    if (type === "Basic Wage") {
      result = (rateToUse - rate) * days;
    } else if (type === "Overtime Pay") {
      result =
        (rateToUse / 8) *
        (period.type === "Normal Day" ? 0.25 : 0.3) *
        (days * hours);
    } else if (type === "Night Shift Differential") {
      result = (rateToUse / 8) * 0.1 * (days * hours);
    } else if (type === "Special Day") {
      result = rateToUse * 0.3 * days;
    } else if (type === "Rest Day") {
      result = rateToUse * 0.3 * days;
    } else if (type === "Holiday Pay") {
      result = rateToUse * days;
    } else if (type === "13th Month Pay") {
      result = (rateToUse * days) / 12;
    }
  }

  return result;
};

export const getTotal = (
  wageOrders: WageOrder[],
  type: ViolationKey,
  size: string,
  violationType: { periods: Period[]; received: string },
) => {
  let result = 0;
  violationType.periods.forEach((period) => {
    result += calculate(wageOrders, type, size, period);
  });
  violationType.received && (result -= Number(violationType.received));
  return result;
};

export const getPeriodFormat = (rate?: number) => {
  return { ...periodFormat, rate: rate ? `${rate}` : "" };
};

export const getCustomPeriodFormat = (rate?: number) => {
  return { ...customPeriodFormat, rate: rate ? `${rate}` : "" };
};

export const getInitialViolationTypes = (rate?: number) => {
  const values = {} as Record<ViolationKey, ViolationType>;
  violationKeysArray.forEach((type) => {
    values[type as ViolationKey] = {
      periods: [getPeriodFormat(rate)],
      received: "",
    };
  });
  return values;
};

export const getInitialCustomViolationType = (rate?: number) => {
  return {
    periods: [getCustomPeriodFormat(rate)],
    received: "",
  };
};

export const getViolationKeyword = (type: ViolationKey) => {
  let keyword: string = type;
  if (type === "Basic Wage") {
    keyword = "Wages";
  } else if (type === "Special Day") {
    keyword = "Premium Pay on Special Day";
  } else if (type === "Rest Day") {
    keyword = "Premium Pay on Rest Day";
  }
  return keyword;
};

export const getValueKeyword = (
  type: ViolationKey,
  days: string,
  hours: string,
) => {
  const value = isHours(type) ? hours : days;

  let keyword = "";
  if (["Basic Wage", "Holiday Pay", "13th Month Pay"].includes(type)) {
    keyword = "day";
  } else if (type === "Overtime Pay") {
    keyword = "OT hour";
  } else if (type === "Night Shift Differential") {
    keyword = "night-shift hour";
  } else if (type === "Special Day") {
    keyword = "special day";
  } else if (type === "Rest Day") {
    keyword = "rest day";
  }

  Number(value) > 1 && (keyword += "s");
  return keyword;
};

export const getPeriods = (
  wageOrders: WageOrder[],
  start_date: string,
  end_date: string,
) => {
  const periods = [];

  const isPast =
    differenceInDays(start_date, wageOrders[0].date) <= 0 &&
    differenceInDays(end_date, wageOrders[0].date) <= 0;
  const isFuture =
    differenceInDays(start_date, wageOrders[wageOrders.length - 1].date) >= 0 &&
    differenceInDays(end_date, wageOrders[wageOrders.length - 1].date) >= 0;

  if (isPast || isFuture) {
    periods.push({
      start_date: start_date,
      end_date: end_date,
    });
  } else {
    const start = wageOrders.findLast(
      (wageOrder) => differenceInDays(start_date, wageOrder.date) >= 0,
    );

    const end = wageOrders.findLast(
      (wageOrder) => differenceInDays(end_date, wageOrder.date) >= 0,
    );

    const filteredWageOrders: WageOrder[] = [];
    wageOrders.forEach((wageOrder) => {
      if (
        differenceInDays(start ? start.date : start_date, wageOrder.date) <=
          0 &&
        differenceInDays(end ? end.date : end_date, wageOrder.date) >= 0
      ) {
        filteredWageOrders.push(wageOrder);
      }
    });

    filteredWageOrders.forEach((wageOrder, index) => {
      periods.push({
        start_date: index === 0 ? start_date : wageOrder.date,
        end_date:
          index === filteredWageOrders.length - 1
            ? end_date
            : subDays(filteredWageOrders[index + 1].date, 1)
                .toISOString()
                .split("T")[0],
      });
    });
  }

  return periods;
};
