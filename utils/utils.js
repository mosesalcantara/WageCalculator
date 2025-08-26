import { isBefore, parse } from "date-fns";

export const inputFormat = {
  start_date: "",
  end_date: "",
  daysOrHours: "",
  total: "",
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

export const getRate = (start, actualRate) => {
  let minimumRate = 0;
  const date = parse(start, "yyyy-MM-dd", new Date());

  isBefore(date, new Date(2024, 12, 23))
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
