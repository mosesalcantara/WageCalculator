import { employees, establishments, violations } from "@/db/schema";
import { Db, Establishment } from "@/types/globals";
import { toastVisibilityTime } from "@/utils/globals";
import { eq, inArray } from "drizzle-orm";
import Toast from "react-native-toast-message";

const useDeleteEstablishment = (db: Db, refetch: () => void) => {
  const handleDelete = async (id: number) => {
    try {
      const data: Establishment | undefined =
        await db.query.establishments.findFirst({
          where: eq(establishments.id, id),
          with: { employees: true },
        });

      if (data && data.employees) {
        const ids = data.employees.map((employee) => employee.id);
        await db.delete(violations).where(inArray(violations.employee_id, ids));
      }

      await db.delete(employees).where(eq(employees.establishment_id, id));
      await db.delete(establishments).where(eq(establishments.id, id));

      refetch();

      Toast.show({
        type: "success",
        text1: "Deleted Establishment",
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

export default useDeleteEstablishment;
