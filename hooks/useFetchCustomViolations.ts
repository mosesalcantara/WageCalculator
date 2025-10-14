import { employees } from "@/db/schema";
import { CustomViolationType, Db } from "@/types/globals";
import {
  getInitialCustomViolationType,
  toastVisibilityTime,
} from "@/utils/globals";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import SessionStorage from "react-native-session-storage";
import Toast from "react-native-toast-message";

const useFetchViolations = (db: Db) => {
  const parent_id = SessionStorage.getItem("employee_id") as string;

  const [customViolationType, setCustomViolationType] =
    useState<CustomViolationType>(getInitialCustomViolationType());

  const handleFetch = useCallback(async () => {
    try {
      const data = await db.query.employees.findFirst({
        where: eq(employees.id, Number(parent_id)),
        with: { customViolations: true },
      });
      if (data) {
        if (data.customViolations.length > 0) {
          setCustomViolationType(
            JSON.parse(data.customViolations[0].values as string),
          );
        } else {
          setCustomViolationType(getInitialCustomViolationType(data.rate));
        }
      }
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

  return { customViolationType, setCustomViolationType };
};

export default useFetchViolations;
