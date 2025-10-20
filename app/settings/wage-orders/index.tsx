import AddWageOrderModal from "@/components/Modals/AddWageOrderModal";
import NavBar from "@/components/NavBar";
import WageOrdersTable from "@/components/Tables/WageOrdersTable";
import useDeleteWageOrder from "@/hooks/useDeleteWageOrder";
import useFetchWageOrders from "@/hooks/useFetchWageOrders";
import { getDb } from "@/utils/globals";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const WageOrdersPage = () => {
  const db = getDb();

  const { wageOrders, setWageOrders, refetch } = useFetchWageOrders(db);
  const { handleDelete } = useDeleteWageOrder(db, refetch);

  return (
    <SafeAreaView className="flex-1 bg-[#acb6e2ff]">
      <NavBar />

      <View className="flex-1 p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-center text-xl font-bold">Wage Orders</Text>
          <AddWageOrderModal db={db} refetch={refetch} />
        </View>

        <WageOrdersTable
          db={db}
          wageOrders={wageOrders}
          refetch={refetch}
          onDelete={handleDelete}
        />
      </View>
    </SafeAreaView>
  );
};

export default WageOrdersPage;
