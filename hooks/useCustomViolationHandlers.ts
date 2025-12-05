import {
  CustomPeriod,
  CustomViolationType,
  Establishment,
  WageOrder,
} from "@/types/globals";
import {
  customPeriodFormat,
  formatDate,
  getMinimumRate,
  parseNumber,
} from "@/utils/globals";
import { Updater } from "use-immer";

const useCustomViolationHandlers = (
  wageOrders: WageOrder[],
  establishment: Establishment | undefined,
  customViolationType: CustomViolationType,
  setter: Updater<CustomViolationType>,
) => {
  const calculate = (size: string, period: CustomPeriod) => {
    const values = {
      ...period,
      rate: parseNumber(period.rate),
      days: parseNumber(period.days),
      nightShiftHours: parseNumber(period.nightShiftHours),
      overtimeHours: parseNumber(period.overtimeHours),
    };

    const minimumRate = getMinimumRate(
      wageOrders,
      size,
      period.start_date,
      period.end_date,
    );
    const rateToUse = Math.max(values.rate, minimumRate);

    const type = period.type.toLowerCase();
    let nightShiftMultiplier = 0;
    if (type.includes("night shift")) nightShiftMultiplier = 1.1;

    let overtimeMultiplier = 0;
    if (type.includes("ot")) {
      overtimeMultiplier = 1.3;
      if (type.includes("ordinary day")) overtimeMultiplier = 1.25;
    }

    let daysMultiplier = 0;
    if (type.includes("ordinary day")) daysMultiplier = 1;
    else if (
      type.includes("rest day") &&
      type.includes("special (non-working) day")
    ) {
      daysMultiplier = 1.5;
      if (type.includes("double")) daysMultiplier = 1.95;
    } else if (type.includes("holiday")) {
      daysMultiplier = 2;
      if (type.includes("double")) {
        daysMultiplier = 3;
        if (type.includes("rest day")) daysMultiplier = 3.9;
      } else {
        if (type.includes("rest day")) daysMultiplier = 2.6;
      }
    } else if (
      type.includes("rest day") ||
      type.includes("special (non-working) day")
    ) {
      daysMultiplier = 1.3;
      if (type.includes("double")) daysMultiplier = 1.5;
    }

    let total = 0;
    total =
      rateToUse * daysMultiplier * values.days +
      (rateToUse / 8) * nightShiftMultiplier * values.nightShiftHours +
      (rateToUse / 8) * overtimeMultiplier * values.overtimeHours;

    return {
      rate: values.rate,
      rateToUse,
      daysMultiplier,
      days: values.days,
      nightShiftMultiplier,
      nightShiftHours: values.nightShiftHours,
      overtimeMultiplier,
      overtimeHours: values.overtimeHours,
      total,
    };
  };

  const getTotal = () => {
    let result = 0;
    if (establishment) {
      customViolationType.periods.forEach((period) => {
        result += calculate(establishment.size, period).total;
        if (customViolationType.received) {
          result -= parseNumber(customViolationType.received);
        }
      });
    }
    return result;
  };

  const handleChange = (
    index: number,
    key: keyof CustomPeriod | string,
    value: Date | string | number,
  ) => {
    if (key.endsWith("_date")) value = formatDate(value as Date);

    setter((draft) => {
      draft.periods[index][key as keyof CustomPeriod] = `${value}`;
    });
  };

  const handleReceivedChange = (value: string) => {
    setter((draft) => {
      draft.received = value;
    });
  };

  const handleAddPeriod = () => {
    setter((draft) => {
      draft.periods.push(customPeriodFormat);
    });
  };

  const handleRemovePeriod = (index: number) => {
    setter((draft) => {
      draft.periods.splice(index, 1);
    });
  };

  const handleClearPeriod = (index: number) => {
    setter((draft) => {
      draft.periods[index] = customPeriodFormat;
    });
  };

  return {
    calculate,
    getTotal,
    handleChange,
    handleReceivedChange,
    handleAddPeriod,
    handleClearPeriod,
    handleRemovePeriod,
  };
};

export default useCustomViolationHandlers;
