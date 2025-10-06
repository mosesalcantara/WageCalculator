import { employees, establishments } from "@/db/schema";
import {
  Db,
  Employee,
  Establishment,
  Violation,
  ViolationValues,
} from "@/types/globals";
import { getInitialViolations } from "@/utils/globals";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import SessionStorage from "react-native-session-storage";
import Toast from "react-native-toast-message";

const useFetchViolations = (db: Db) => {
  const parent_id = SessionStorage.getItem("employee_id") as string;

  const [grandparent, setGrandparent] = useState<Establishment | undefined>();
  const [parent, setParent] = useState<Employee | undefined>();
  const [values, setValues] = useState<ViolationValues>(getInitialViolations());

  const handleFetch = useCallback(async () => {
    try {
      const data = await db.query.employees.findFirst({
        where: eq(employees.id, Number(parent_id)),
        with: { violations: true },
      });
      if (data) {
        let violations: Violation[] = [];
        if (data.violations.length > 0) {
          violations = [
            {
              ...data.violations[0],
              values: data.violations[0].values as string,
            },
          ];
          setValues(JSON.parse(data.violations[0].values as string));
        } else {
          setValues(getInitialViolations(data.rate));
        }
        setParent({ ...data, violations: violations });
        const establishmentData = await db.query.establishments.findFirst({
          where: eq(establishments.id, Number(data.establishment_id)),
        });
        setGrandparent(establishmentData);
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

  return { grandparent, parent, values, setValues };
};

export default useFetchViolations;
