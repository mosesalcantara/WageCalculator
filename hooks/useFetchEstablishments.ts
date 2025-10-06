import { Db, Establishment } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { useCallback, useEffect, useState } from "react";
import Toast from "react-native-toast-message";

const useFetchEstablishments = (db: Db) => {
  const [records, setRecords] = useState<Establishment[] | undefined>();

  const handleFetch = useCallback(async () => {
    try {
      const data = await db.query.establishments.findMany({
        with: { employees: true },
      });
      setRecords(data);
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

  return { records, refetch: handleFetch };
};

export default useFetchEstablishments;
