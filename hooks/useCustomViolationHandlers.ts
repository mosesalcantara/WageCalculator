import { wageOrders } from "@/db/schema";
import {
  CustomPeriod,
  CustomViolationType,
  Establishment,
  WageOrder,
} from "@/types/globals";
import { customPeriodFormat, getMinimumRate } from "@/utils/globals";
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
      rate: period.rate ? Number(period.rate) : 0,
      days: period.days ? Number(period.days) : 0,
      nightShiftHours: period.nightShiftHours
        ? Number(period.nightShiftHours)
        : 0,
      overtimeHours: period.overtimeHours ? Number(period.overtimeHours) : 0,
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
      rateToUse * daysMultiplier * days +
      (rateToUse / 8) * nightShiftMultiplier * nightShiftHours +
      (rateToUse / 8) * overtimeMultiplier * overtimeHours;

    return {
      rate,
      rateToUse,
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
    if (establishment) {
      customViolationType.periods.forEach((period) => {
        result += calculate(establishment.size, period).total;
        customViolationType.received &&
          (result -= Number(customViolationType.received));
      });
    }
    return result;
  };

  const handleChange = (
    index: number,
    key: keyof CustomPeriod | string,
    value: string | number | Date,
  ) => {
    if (key.endsWith("_date")) {
      value = (value as Date).toISOString().split("T")[0];
    }

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
