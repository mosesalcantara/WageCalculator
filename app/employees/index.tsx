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
import { SafeAreaView } from "react-native-safe-area-context";

const EmployeesPage = () => {
  const db = getDb();
  const router = useRouter();

  const { establishment, employees, refetch } = useFetchEmployees(db);
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
      {establishment && (
        <>
          <SafeAreaView className="flex-1 bg-[#acb6e2ff]">
            <NavBar />

            <View className="flex-1 p-4">
              <View className="mb-2 flex-row items-center justify-between">
                <Text className="text-center text-xl font-bold">
                  {establishment.name}
                </Text>
              <AddEmployeeModal db={db} establishment={establishment} refetch={refetch} />
              </View>

              <EmployeesTable
                db={db}
                router={router}
                employees={employees}
                refetch={refetch}
                onDelete={handleDelete}
              />
            </View>
          </SafeAreaView>
        </>
      )}
    </>
  );
};

export default EmployeesPage;
