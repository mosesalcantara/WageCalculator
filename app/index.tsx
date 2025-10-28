import AddEstablishmentModal from "@/components/Modals/AddEstablishmentModal";
import ViewSettingsModal from "@/components/Modals/ViewSettingsModal";
import NavBar from "@/components/NavBar";
import EstablishmentsTable from "@/components/Tables/EstablishmentsTable";
import useDeleteEstablishment from "@/hooks/useDeleteEstablishment";
import useFetchEstablishments from "@/hooks/useFetchEstablishments";
import useFetchHolidays from "@/hooks/useFetchHolidays";
import useFetchWageOrders from "@/hooks/useFetchWageOrders";
import { getDb } from "@/utils/globals";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const EstablishmentsPage = () => {
  const db = getDb();
  const router = useRouter();

  useFetchWageOrders(db);
  useFetchHolidays(db);

  const { establishments, refetch } = useFetchEstablishments(db);
  const { handleDelete } = useDeleteEstablishment(db, refetch);

  useFocusEffect(
    useCallback(() => {
      const handleBackPress = () => {
        BackHandler.exitApp();
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
    <SafeAreaView className="flex-1 bg-primary">
      <NavBar />

      <View className="p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-center text-xl font-bold">Establishments</Text>
          <View className="flex-row justify-end gap-2">
            <AddEstablishmentModal db={db} refetch={refetch} />
            <ViewSettingsModal router={router} />
          </View>
        </View>
      
        <EstablishmentsTable
          db={db}
          router={router}
          establishments={establishments}
          refetch={refetch}
          onDelete={handleDelete}
        />
      </View>
    </SafeAreaView>
  );
};

export default EstablishmentsPage;
