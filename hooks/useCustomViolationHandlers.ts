import {
  CustomPeriod,
  Establishment,
  PaymentType,
  ViolationType,
  ViolationValues,
  WageOrder,
} from "@/types/globals";
import { customPeriodFormat, formatDate } from "@/utils/globals";
import { Updater } from "use-immer";

const useCustomViolationHandlers = (
  violationType: ViolationType,
  paymentType: PaymentType,
  wageOrders: WageOrder[],
  establishment: Establishment | undefined,
  violationValues: ViolationValues,
  setter: Updater<ViolationValues>,
) => {
  const handleChange = (
    index: number,
    key: keyof CustomPeriod | string,
    value: Date | string | number,
  ) => {
    if (violationType === "Custom") {
      if (key.endsWith("_date")) value = formatDate(value as Date);

      setter((draft) => {
        draft[violationType][paymentType][index][key as keyof CustomPeriod] =
          `${value}`;
      });
    }
  };

  const handleAddPeriod = () => {
    if (violationType === "Custom") {
      setter((draft) => {
        draft[violationType][paymentType].push(customPeriodFormat);
      });
    }
  };

  const handleRemovePeriod = (index: number) => {
    setter((draft) => {
      draft[violationType][paymentType].splice(index, 1);
    });
  };

  const handleClearPeriod = (index: number) => {
    setter((draft) => {
      draft[violationType][paymentType][index] = customPeriodFormat;
    });
  };

  return {
    handleChange,
    handleAddPeriod,
    handleClearPeriod,
    handleRemovePeriod,
  };
};

export default useCustomViolationHandlers;
