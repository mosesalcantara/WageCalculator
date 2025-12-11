import { establishments } from "@/db/schema";
import { Db, Establishment, Violation } from "@/types/globals";
import { parseNumber, toastVisibilityTime } from "@/utils/globals";
import { eq } from "drizzle-orm";
import { useCallback, useEffect } from "react";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

const useFetchEstablishmentViolations = (db: Db, establishment_id: string) => {
  const [establishment, setEstablishment] = useImmer<Establishment | undefined>(
    undefined,
  );

  const handleFetch = useCallback(async () => {
    try {
      const establishment = await db.query.establishments.findFirst({
        where: eq(establishments.id, parseNumber(establishment_id)),
        with: { employees: { with: { violations: true } } },
      });

      if (establishment) {
        const employees = establishment.employees.map((employee) => {
          let violations: Violation[] = [];
          const violation = employee.violations[0];

          if (employee.violations.length > 0) {
            let values = JSON.parse(violation.values as string);
            values["Custom"] = { Underpayment: [], "Non-payment": [] };
            violations = [{ ...violation, values: JSON.stringify(values) }];
          }

          return { ...employee, violations: violations };
        });

        setEstablishment({ ...establishment, employees: employees });
      }
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
        visibilityTime: toastVisibilityTime,
      });
    }
  }, [establishment_id, setEstablishment]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return { establishment, refetch: handleFetch };
};

export default useFetchEstablishmentViolations;
