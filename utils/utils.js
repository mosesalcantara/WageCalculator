export const formatNumber = (number) => {
  return (parseFloat(number) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export const inputFormat = {
  start_date: "",
  end_date: "",
  daysOrHours: "",
  total: "",
};
