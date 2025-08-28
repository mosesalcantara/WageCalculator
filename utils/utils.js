import { format, isAfter, isBefore, parse, parseISO } from "date-fns";

export const inputFormat = {
  start_date: "",
  end_date: "",
  daysOrHours: "",
  total: "0",
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

  isBefore(parseDate(start), parseDate("2024-12-23")) &&
  isAfter(parseDate(start), parseDate("2023-12-31"))
    ? (multiplier = 1)
    : (multiplier = 0.3);

  return multiplier;
};
