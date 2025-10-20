import { employees, establishments } from "@/db/schema";
import {
  Db,
  Employee,
  Establishment,
  Violation,
  ViolationTypes,
} from "@/types/globals";
import { getInitialViolationTypes, toastVisibilityTime } from "@/utils/globals";
import { eq } from "drizzle-orm";
import { useCallback, useEffect } from "react";
import SessionStorage from "react-native-session-storage";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

const useFetchViolations = (db: Db) => {
  const employee_id = SessionStorage.getItem("employee_id") as string;

  const [establishment, setEstablishment] = useImmer<Establishment | undefined>(
    undefined,
  );
  const [employee, setEmployee] = useImmer<Employee | undefined>(undefined);
  const [violationTypes, setViolationTypes] = useImmer<ViolationTypes>(
    getInitialViolationTypes(),
  );

  const handleFetch = useCallback(async () => {
    try {
      const employee = await db.query.employees.findFirst({
        where: eq(employees.id, Number(employee_id)),
        with: { violations: true },
      });
      if (employee) {
        let violations: Violation[] = [];
        if (employee.violations.length > 0) {
          violations = [
            {
              ...employee.violations[0],
              values: employee.violations[0].values as string,
            },
          ];
          setViolationTypes(
            JSON.parse(employee.violations[0].values as string),
          );
        } else {
          setViolationTypes(getInitialViolationTypes(employee.rate));
        }
        setEmployee({ ...employee, violations: violations });
        const establishment = await db.query.establishments.findFirst({
          where: eq(establishments.id, Number(employee.establishment_id)),
        });
        setEstablishment(establishment);
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

  return { establishment, employee, violationTypes, setViolationTypes };
};

export default useFetchViolations;
