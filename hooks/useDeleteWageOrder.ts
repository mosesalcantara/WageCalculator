import { wageOrders } from "@/db/schema";
import { Db } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { eq } from "drizzle-orm";
import Toast from "react-native-toast-message";

const useDeleteWageOrder = (db: Db, refetch: () => void) => {
  const handleDelete = async (id: number) => {
    try {
      await db.delete(wageOrders).where(eq(wageOrders.id, id));
      refetch();
      Toast.show({
        type: "success",
        text1: "Deleted Wage Order",
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

export default useDeleteWageOrder;
