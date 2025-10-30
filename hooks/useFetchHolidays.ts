import * as models from "@/db/schema";
import { Db, Holiday, Override } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import holidaysJSON from "@/utils/holidays.json";
import { useCallback, useEffect } from "react";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

const useFetchHolidays = (db: Db) => {
  const [holidays, setHolidays] = useImmer<Holiday[] | undefined>(undefined);

  const seed = async () => {
    const initialHolidays: Override<Holiday, { id?: number }>[] = [];

    Object.values(holidaysJSON).forEach((yearHolidays) => {
      initialHolidays.push(...yearHolidays);
    });

    await db.insert(models.holidays).values(initialHolidays);
  };

  const handleFetch = useCallback(async () => {
    try {
      const holidays = await db.query.holidays.findMany();

      if (holidays.length === 0) {
        await seed();
        handleFetch();
      }

      const sortedHolidays = holidays.sort((a, b) => {
        return Number(new Date(a.date)) - Number(new Date(b.date));
      });

      setHolidays(sortedHolidays);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
        visibilityTime: toastVisibilityTime,
      });
    }
  }, []);

  useEffect(() => {
    handleFetch();
  }, []);

  return { holidays, setHolidays, refetch: handleFetch };
};

export default useFetchHolidays;
