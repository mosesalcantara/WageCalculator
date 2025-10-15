import { Employee, ViolationKeys, ViolationTypes } from "@/types/globals";
import { getPeriodFormat } from "@/utils/globals";

const useViolationHandlers = (
  type: ViolationKeys,
  employee: Employee | undefined,
  setter: (value: React.SetStateAction<ViolationTypes>) => void,
) => {
  const handleChange = (
    index: number,
    key: string,
    value: string | number | Date,
  ) => {
    if (key.endsWith("_date")) {
      value = (value as Date).toISOString().split("T")[0];
    }

    setter((prev) => {
      const updatedPeriods = prev[type].periods.map((period, periodIndex) =>
        index == periodIndex ? { ...period, [key]: `${value}` } : period,
      );

      return { ...prev, [type]: { ...prev[type], periods: updatedPeriods } };
    });
  };

  const handleReceivedChange = (value: string) => {
    setter((prev) => {
      return {
        ...prev,
        [type]: { periods: prev[type].periods, received: value },
      };
    });
  };

  const handleAddPeriod = () => {
    setter((prev) => {
      return {
        ...prev,
        [type]: {
          periods: [...prev[type].periods, getPeriodFormat(employee?.rate)],
        },
      };
    });
  };

  const handleRemovePeriod = (index: number) => {
    setter((prev) => {
      const updatedPeriods = prev[type].periods;
      updatedPeriods.splice(index, 1);
      return { ...prev, [type]: { periods: updatedPeriods } };
    });
  };

  const handleClearPeriod = (index: number) => {
    setter((prev) => {
      const updatedPeriods = prev[type].periods.map((period, periodIndex) =>
        index == periodIndex ? getPeriodFormat() : period,
      );
      return { ...prev, [type]: { periods: updatedPeriods } };
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
