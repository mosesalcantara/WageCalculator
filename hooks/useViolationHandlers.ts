import {
  Employee,
  Period,
  ViolationKeys,
  ViolationType,
} from "@/types/globals";
import { getDate, getPeriodFormat } from "@/utils/globals";
import { Updater } from "use-immer";

const useViolationHandlers = (
  type: ViolationKeys,
  employee: Employee | undefined,
  setter: Updater<Record<ViolationKeys, ViolationType>>,
) => {
  const handleChange = (
    index: number,
    key: keyof Period | string,
    value: string | number | Date,
  ) => {
    if (key.endsWith("_date")) {
      value = getDate(value as Date);
    }

    setter((draft) => {
      draft[type].periods[index][key as keyof Period] = `${value}`;
    });
  };

  const handleReceivedChange = (value: string) => {
    setter((draft) => {
      draft[type].received = value;
    });
  };

  const handleAddPeriod = () => {
    setter((draft) => {
      draft[type].periods.push(getPeriodFormat(employee?.rate));
    });
  };

  const handleRemovePeriod = (index: number) => {
    setter((draft) => {
      draft[type].periods.splice(index, 1);
    });
  };

  const handleClearPeriod = (index: number) => {
    setter((draft) => {
      draft[type].periods[index] = getPeriodFormat();
    });
  };

  return {
    handleChange,
    handleReceivedChange,
    handleAddPeriod,
    handleClearPeriod,
    handleRemovePeriod,
  };
};

export default useViolationHandlers;
