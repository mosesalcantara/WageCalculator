import { establishments } from "@/db/schema";
import { Db, Employee, Establishment } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { eq } from "drizzle-orm";
import { useCallback, useEffect } from "react";
import SessionStorage from "react-native-session-storage";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

const useFetchEmployees = (db: Db) => {
  const [establishment, setEstablishment] = useImmer<Establishment | undefined>(
    undefined,
  );
  const [employees, setEmployees] = useImmer<Employee[] | undefined>(undefined);

  const handleFetch = useCallback(async () => {
    try {
      const establishment_id = SessionStorage.getItem(
        "establishment_id",
      ) as string;
      const establishment = await db.query.establishments.findFirst({
        where: eq(establishments.id, Number(establishment_id)),
        with: { employees: true },
      });
      if (establishment && establishment.employees) {
        setEstablishment(establishment);
        setEmployees(establishment.employees);
      }
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
        visibilityTime: toastVisibilityTime,
      });
    }
  }, [setEstablishment, setEmployees]);

  useEffect(() => {
    handleFetch();
  }, [handleFetch]);

  return { establishment, employees, refetch: handleFetch };
};

export default useFetchEmployees;
