import { employees } from "@/db/schema";
import {
  Db,
  Employee,
  Establishment,
  Violation,
  ViolationValues,
} from "@/types/globals";
import {
  getInitialViolationValues,
  parseNumber,
  toastVisibilityTime,
} from "@/utils/globals";
import { eq } from "drizzle-orm";
import { useCallback, useEffect } from "react";
import SessionStorage from "react-native-session-storage";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

const useFetchViolations = (db: Db) => {
  const employee_id = SessionStorage.getItem("employee_id");

  const [establishment, setEstablishment] = useImmer<Establishment | undefined>(
    undefined,
  );
  const [employee, setEmployee] = useImmer<Employee | undefined>(undefined);

  const [violationValues, setViolationValues] = useImmer<ViolationValues>(
    getInitialViolationValues(),
  );

  const handleFetch = useCallback(async () => {
    try {
      const employee = await db.query.employees.findFirst({
        where: eq(employees.id, parseNumber(employee_id as string)),
        with: { establishment: true, violations: true },
      });

      if (employee) {
        let violations: Violation[] = [];
        const violation = employee.violations[0];

        if (employee.violations.length > 0) {
          violations = [{ ...violation, values: violation.values as string }];
          setViolationValues(JSON.parse(violation.values as string));
        } else {
          setViolationValues(getInitialViolationValues(employee.rate));
        }

        setEmployee({ ...employee, violations: violations });
        setEstablishment(employee.establishment);
      }
    } catch (error) {
      console.error(error);

      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
        visibilityTime: toastVisibilityTime,
      });
    }
  }, [employee_id, setEstablishment, setEmployee, setViolationValues]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return { establishment, employee, violationValues, setViolationValues };
};

export default useFetchViolations;
