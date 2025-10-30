import * as models from "@/db/schema";
import { Db, WageOrder } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { useCallback, useEffect } from "react";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

const useFetchWageOrders = (db: Db) => {
  const [wageOrders, setWageOrders] = useImmer<WageOrder[] | undefined>(
    undefined,
  );

  const handleFetch = useCallback(async () => {
    try {
      const seed = async () => {
        const initialWageOrders = [
          {
            name: "RB-MIMAROPA-09",
            date: "2019-02-01",
            less_than_ten: 283,
            ten_or_more: 320,
          },
          {
            name: "RB-MIMAROPA-10",
            date: "2022-06-10",
            less_than_ten: 329,
            ten_or_more: 355,
          },
          {
            name: "RB-MIMAROPA-11",
            date: "2023-12-07",
            less_than_ten: 369,
            ten_or_more: 395,
          },
          {
            name: "RB-MIMAROPA-12",
            date: "2024-12-23",
            less_than_ten: 404,
            ten_or_more: 430,
          },
        ];

        await db.insert(models.wageOrders).values(initialWageOrders);
      };

      const wageOrders = await db.query.wageOrders.findMany();

      if (wageOrders.length === 0) {
        await seed();
        handleFetch();
      }

      const sortedWageOrders = wageOrders.sort((a, b) => {
        return Number(new Date(a.date)) - Number(new Date(b.date));
      });

      setWageOrders(sortedWageOrders);
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
        visibilityTime: toastVisibilityTime,
      });
    }
  }, [setWageOrders]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return { wageOrders, setWageOrders, refetch: handleFetch };
};

export default useFetchWageOrders;
