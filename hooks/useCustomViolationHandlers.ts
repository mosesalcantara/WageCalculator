import {
  CustomPeriod,
  Employee,
  PaymentType,
  ViolationType,
  ViolationValues,
} from "@/types/globals";
import {
  customPeriodFormat,
  formatDate,
  getPeriodFormat,
} from "@/utils/globals";
import { Updater } from "use-immer";

const useCustomViolationHandlers = (
  violationType: ViolationType,
  paymentType: PaymentType,
  employee: Employee | undefined,
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
        draft[violationType][paymentType].push(
          getPeriodFormat(violationType, employee?.rate) as CustomPeriod,
        );
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
