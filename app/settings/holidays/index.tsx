import AddHolidayModal from "@/components/Modals/AddHolidayModal";
import NavBar from "@/components/NavBar";
import HolidaysTable from "@/components/Tables/HolidaysTable";
import useDeleteHoliday from "@/hooks/useDeleteHoliday";
import useFetchHolidays from "@/hooks/useFetchHolidays";
import { getDb } from "@/utils/globals";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const HolidaysPage = () => {
  const db = getDb();

  const { holidays, refetch } = useFetchHolidays(db);
  const { handleDelete } = useDeleteHoliday(db, refetch);

  return (
    <SafeAreaView className="flex-1 bg-primary">
      <NavBar />

      <View className="flex-1 p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="font-b text-center text-xl">Holidays</Text>
          <AddHolidayModal db={db} refetch={refetch} />
        </View>

        <HolidaysTable
          db={db}
          holidays={holidays}
          refetch={refetch}
          onDelete={handleDelete}
        />
      </View>
    </SafeAreaView>
  );
};

export default HolidaysPage;
