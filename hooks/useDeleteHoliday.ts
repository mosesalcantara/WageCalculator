import { holidays } from "@/db/schema";
import { Db } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { eq } from "drizzle-orm";
import Toast from "react-native-toast-message";

const useDeleteHoliday = (db: Db, refetch: () => void) => {
  const handleDelete = async (id: number) => {
    try {
      await db.delete(holidays).where(eq(holidays.id, id));
      refetch();
      Toast.show({
        type: "success",
        text1: "Deleted Holiday",
        visibilityTime: toastVisibilityTime,
      });
    } catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "An Error Has Occured. Please Try Again.",
        visibilityTime: toastVisibilityTime,
      });
    }
  };

  return { handleDelete };
};

export default useDeleteHoliday;
