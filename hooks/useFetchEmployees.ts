import { establishments } from "@/db/schema";
import { Db, Employee, Establishment } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { eq } from "drizzle-orm";
import { useCallback, useEffect, useState } from "react";
import SessionStorage from "react-native-session-storage";
import Toast from "react-native-toast-message";

const useFetchEmployees = (db: Db) => {
  const [parent, setParent] = useState<Establishment | undefined>();
  const [records, setRecords] = useState<Employee[] | undefined>();

  const handleFetch = useCallback(async () => {
    try {
      const parent_id = SessionStorage.getItem("establishment_id") as string;
      const data = await db.query.establishments.findFirst({
        where: eq(establishments.id, Number(parent_id)),
        with: { employees: true },
      });
      if (data && data.employees) {
        setParent(data);
        setRecords(data.employees);
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

  return { parent, records, refetch: handleFetch };
};

export default useFetchEmployees;
