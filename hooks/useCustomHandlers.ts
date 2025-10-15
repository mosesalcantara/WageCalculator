import { CustomPeriod, CustomViolationType } from "@/types/globals";

const useCustomViolationHandlers = (
  customViolationType: CustomViolationType,
) => {
  const calculate = (period: CustomPeriod) => {
    const values = {
      ...period,
      rate: period.rate ? Number(period.rate) : 0,
      days: period.days ? Number(period.days) : 0,
      nightShiftHours: period.nightShiftHours
        ? Number(period.nightShiftHours)
        : 0,
      overtimeHours: period.overtimeHours ? Number(period.overtimeHours) : 0,
    };

    const type = period.type.toLowerCase();
    let nightShiftMultiplier = 0;
    if (type.includes("night shift")) {
      nightShiftMultiplier = 1.1;
    }

    let overtimeMultiplier = 0;
    if (type.includes("ot")) {
      overtimeMultiplier = 1.3;
      if (type.includes("ordinary day")) {
        overtimeMultiplier = 1.25;
      }
    }

    let daysMultiplier = 0;
    if (type.includes("ordinary day")) {
      daysMultiplier = 1;
    } else if (
      type.includes("rest day") &&
      type.includes("special (non-working) day")
    ) {
      daysMultiplier = 1.5;
      if (type.includes("double")) {
        daysMultiplier = 1.95;
      }
    } else if (type.includes("holiday")) {
      daysMultiplier = 2;
      if (type.includes("double")) {
        daysMultiplier = 3;
        if (type.includes("rest day")) {
          daysMultiplier = 3.9;
        }
      } else {
        if (type.includes("rest day")) {
          daysMultiplier = 2.6;
        }
      }
    } else if (
      type.includes("rest day") ||
      type.includes("special (non-working) day")
    ) {
      daysMultiplier = 1.3;
      if (type.includes("double")) {
        daysMultiplier = 1.5;
      }
    }

    const { rate, days, nightShiftHours, overtimeHours } = values;

    let total = 0;
    total =
      rate * daysMultiplier * days +
      (rate / 8) * nightShiftMultiplier * nightShiftHours +
      (rate / 8) * overtimeMultiplier * overtimeHours;

    return {
      rate,
      daysMultiplier,
      days,
      nightShiftMultiplier,
      nightShiftHours,
      overtimeMultiplier,
      overtimeHours,
      total,
    };
  };

  const getTotal = () => {
    let result = 0;
    customViolationType.periods.forEach((period) => {
      result += calculate(period).total;
    });
    return result;
  };

  return {calculate, getTotal};
};

export default useCustomViolationHandlers;
