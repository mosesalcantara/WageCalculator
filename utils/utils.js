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

export const isBelowMinimum = (rate) => {
  const minimumRate = 430
  return rate < minimumRate;
};

export const getRate = (start, end, rate) => {
  const minimumRate = 430;
  let result = 0;

  if (rate < minimumRate) {
    result = minimumRate;
  } else {
    result = rate;
  }

  return result;
};
