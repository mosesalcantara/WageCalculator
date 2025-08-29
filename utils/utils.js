import * as schema from "@/db/schema";
import { format, isAfter, isBefore, parse, parseISO } from "date-fns";
import { drizzle } from "drizzle-orm/expo-sqlite";
import { useSQLiteContext } from "expo-sqlite";

export const getDb = () => {
  return drizzle(useSQLiteContext(), { schema });
};

export const inputFormat = {
  start_date: "",
  end_date: "",
  daysOrHours: "",
};

export const formatNumber = (number) => {
  return (parseFloat(number) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const numToLetter = (index) => {
  return String.fromCharCode(65 + index);
};

export const formatDate = (date) => {
  date = parse(date, "yyyy-MM-dd", new Date());
  return format(date, "dd MMMM yyyy");
};

export const parseDate = (date) => {
  return parseISO(new Date(date).toISOString());
};

export const getRate = (start, actualRate) => {
  let minimumRate = 0;

  isBefore(parseDate(start), parseDate("2024-12-23"))
    ? (minimumRate = 395)
    : (minimumRate = 430);

  let isBelow = false;
  let rate = 0;

  isBelow = actualRate < minimumRate;
  isBelow ? (rate = minimumRate) : (rate = actualRate);

  return {
    minimumRate: minimumRate,
    isBelow: isBelow,
    rate: rate,
  };
};

export const getMultiplier = (start) => {
  let multiplier = 1;

  isAfter(parseDate(start), parseDate("2023-12-31")) &&
  isBefore(parseDate(start), parseDate("2024-12-23"))
    ? (multiplier = 1)
    : (multiplier = 0.3);

  return multiplier;
};

export const validate = (values, type, index) => {
  return Object.values(values[type].inputs[index]).every((value) => value);
};

export const calculate = (values, type, index, actualRate) => {
  const isValid = validate(values, type, index);
  let total = 0;
  if (isValid) {
    const startDate = values[type].inputs[index].start_date;
    const daysOrHours = values[type].inputs[index].daysOrHours;
    const { minimumRate, isBelow, rate } = getRate(startDate, actualRate);

    if (type == "Basic Wage") {
      if (isBelow) {
        total = (minimumRate - actualRate) * daysOrHours;
      }
    } else if (type == "Overtime Pay") {
      total = (rate / 8) * 0.25 * daysOrHours;
    } else if (type == "Night Differential") {
      total = (rate / 8) * 0.1 * daysOrHours;
    } else if (type == "Special Day") {
      total = rate * getMultiplier(startDate) * daysOrHours;
    } else if (type == "Rest Day") {
      total = rate * 0.3 * daysOrHours;
    } else if (type == "Holiday Pay") {
      total = rate * daysOrHours;
    } else if (type == "13th Month Pay") {
      total = (rate * daysOrHours) / 12;
    }
  }

  return total;
};

export const getTotals = (values, type, actualRate) => {
  let subtotal = 0;
  values[type].inputs.forEach((_, index) => {
    subtotal += calculate(values, type, index, actualRate);
  });
  values[type].received && (subtotal -= values[type].received);
  return subtotal;
};
