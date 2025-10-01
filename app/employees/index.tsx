import AddEmployeeModal from "@/components/Modals/AddEmployeeModal";
import NavBar from "@/components/NavBar";
import EmployeesTable from "@/components/Tables/EmployeesTable";
import useDeleteEmployee from "@/hooks/useDeleteEmployee";
import useFetchEmployees from "@/hooks/useFetchEmployees";
import { getDb } from "@/utils/globals";
import { useFocusEffect } from "@react-navigation/native";
import { Href, useRouter } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Text, View } from "react-native";

const EmployeesPage = () => {
  const db = getDb();
  const router = useRouter();

  const { parent, records, refetch } = useFetchEmployees(db);
  const { handleDelete } = useDeleteEmployee(db, refetch);

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        router.push("/" as Href);
        return true;
      };

      const backhandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress,
      );

      return () => backhandler.remove();
    }, []),
  );

  return (
    <>
      {parent && (
        <>
          <NavBar />

          <View className="flex-1 bg-[#f2f2f2] p-4">
            <Text className="mb-3 text-center text-lg font-bold">
              {parent.name}
            </Text>

            <EmployeesTable
              db={db}
              router={router}
              records={records}
              refetch={refetch}
              onDelete={handleDelete}
            />

            <AddEmployeeModal db={db} parent={parent} refetch={refetch} />
          </View>
        </>
      )}
    </>
  );
};

export default EmployeesPage;
