import {
  Employee,
  PaymentType,
  Period,
  ViolationType,
  ViolationValues,
} from "@/types/globals";
import { formatDate, getPeriodFormat } from "@/utils/globals";
import { Updater } from "use-immer";

const useViolationHandlers = (
  violationType: ViolationType,
  paymentType: PaymentType,
  employee: Employee | undefined,
  setter: Updater<ViolationValues>,
) => {
  const handleChange = (
    index: number,
    key: keyof Period | string,
    value: string | number | Date,
  ) => {
    if (violationType !== "Custom") {
      if (key.endsWith("_date")) value = formatDate(value as Date);

      setter((draft) => {
        draft[violationType][paymentType][index][key as keyof Period] =
          `${value}`;
      });
    }
  };

  const handleAddPeriod = () => {
    if (violationType !== "Custom") {
      setter((draft) => {
        draft[violationType][paymentType].push(
          getPeriodFormat(violationType, employee?.rate) as Period,
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
      draft[violationType][paymentType][index] = getPeriodFormat(violationType);
    });
  };

  return {
    handleChange,
    handleAddPeriod,
    handleClearPeriod,
    handleRemovePeriod,
  };
};

export default useViolationHandlers;
