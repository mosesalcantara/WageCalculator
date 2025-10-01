import { establishments } from "@/db/schema";
import { Db, Establishment, Violations } from "@/types/globals";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import SessionStorage from "react-native-session-storage";
import Toast from "react-native-toast-message";

const useFetchEstablishmentViolations = (db: Db) => {
  const [record, setRecord] = useState<Establishment | undefined>();

  const handleFetch = useCallback(async () => {
    try {
      const id = SessionStorage.getItem("establishment_id") as string;
      const data = await db.query.establishments.findFirst({
        where: eq(establishments.id, Number(id)),
        with: { employees: { with: { violations: true } } },
      });
      if (data) {
        const employeesData = data.employees.map((employee) => {
          let violations: Violations[] = [];
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
        setRecord({
          ...data,
          employees: employeesData,
        });
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
      });
    }
  }, []);

  useEffect(() => {
    handleFetch();
  }, []);

  return { record, refetch: handleFetch };
};

export default useFetchEstablishmentViolations;
