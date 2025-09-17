import * as schema from "@/db/schema";
import { format, isBefore, parse, parseISO } from "date-fns";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export const periodFormat = {
  start_date: "",
  end_date: "",
  daysOrHours: "",
};

export const periodsFormat = {
  periods: [periodFormat],
};

export const getDb = () => {
  return drizzle(useSQLiteContext(), { schema });
};

export const formatNumber = (number) => {
  return (parseFloat(number) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const numberToLetter = (number) => {
  return String.fromCharCode(65 + number);
};

export const formatDate = (date) => {
  return format(parse(date, "yyyy-MM-dd", new Date()), "dd MMMM yyyy");
};

export const parseDate = (date) => {
  return parseISO(new Date(date).toISOString());
};

export const getRate = (startDate, rate) => {
  const minimumRate = isBefore(parseDate(startDate), parseDate("2024-12-23"))
    ? 395
    : 430;
  const isBelow = rate < minimumRate;
  const rateToUse = isBelow ? minimumRate : rate;

  return {
    isBelow: isBelow,
    rateToUse: rateToUse,
  };
};

export const validate = (object) => {
  return Object.values(object).every((value) => value);
};

export const calculate = (period, rate, type) => {
  let result = 0;

  if (validate(period)) {
    const startDate = period.start_date;
    const daysOrHours = period.daysOrHours;
    const { isBelow, rateToUse } = getRate(startDate, rate);

    if (type == "Basic Wage" && isBelow) {
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

export const getTotal = (violationType, rate, type) => {
  let result = violationType.periods.reduce(
    (accumulator, period) => (accumulator += calculate(period, rate, type)),
    0
  );
  violationType.received && (result -= violationType.received);
  return result;
};
