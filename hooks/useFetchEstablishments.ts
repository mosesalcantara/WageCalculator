import { Db, Establishment } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { useCallback, useEffect } from "react";
import Toast from "react-native-toast-message";
import { useImmer } from "use-immer";

const useFetchEstablishments = (db: Db) => {
  const [establishments, setEstablishments] = useImmer<
    Establishment[] | undefined
  >(undefined);

  const handleFetch = useCallback(async () => {
    try {
      const establishments = await db.query.establishments.findMany({
        with: { employees: true },
      });
      setEstablishments(establishments);
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

  return { establishments, refetch: handleFetch };
};

export default useFetchEstablishments;
