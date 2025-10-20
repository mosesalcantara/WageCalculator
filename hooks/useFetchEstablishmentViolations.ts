import { establishments } from "@/db/schema";
import { Db, Establishment, Violation } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { eq } from "drizzle-orm";
import { useCallback, useEffect } from "react";
import SessionStorage from "react-native-session-storage";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

const useFetchEstablishmentViolations = (db: Db) => {
  const [establishment, setEstablishment] = useImmer<Establishment | undefined>(
    undefined,
  );

  const handleFetch = useCallback(async () => {
    try {
      const id = SessionStorage.getItem("establishment_id") as string;
      const establishment = await db.query.establishments.findFirst({
        where: eq(establishments.id, Number(id)),
        with: { employees: { with: { violations: true } } },
      });
      if (establishment) {
        const employees = establishment.employees.map((employee) => {
          let violations: Violation[] = [];
          if (employee.violations.length > 0) {
            violations = [
              {
                ...employee.violations[0],
                values: employee.violations[0].values as string,
              },
            ];
          }
          return { ...employee, violations: violations };
        });
        setEstablishment({
          ...establishment,
          employees: employees,
        });
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

  return { establishment, refetch: handleFetch };
};

export default useFetchEstablishmentViolations;
