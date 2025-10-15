import AddEstablishmentModal from "@/components/Modals/AddEstablishmentModal";
import NavBar from "@/components/NavBar";
import EstablishmentsTable from "@/components/Tables/EstablishmentsTable";
import useDeleteEstablishment from "@/hooks/useDeleteEstablishment";
import useFetchEstablishments from "@/hooks/useFetchEstablishments";
import { getDb } from "@/utils/globals";
import { useFocusEffect } from "@react-navigation/native";
import { Href, useRouter } from "expo-router";
import { useCallback } from "react";
import { BackHandler, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
const EstablishmentPage = () => {
  const db = getDb();
  const router = useRouter();

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
    <SafeAreaView className="flex-1 bg-[#acb6e2ff]">
      <NavBar />

      <View className="flex-1 p-4">
        <View className="flex-row justify-between items-center mb-2">
          <Text className="text-center text-xl font-bold">Establishments</Text>
          <AddEstablishmentModal db={db} refetch={refetch} />
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

export default EstablishmentPage;
