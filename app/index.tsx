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

  const { records, refetch } = useFetchEstablishments(db);
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
        <EstablishmentsTable
          db={db}
          router={router}
          records={records}
          refetch={refetch}
          onDelete={handleDelete}
        />

        <TouchableOpacity
          onPress={() => {
            router.push("/custom" as Href);
          }}
        >
          <Text className="text-center font-bold text-white mb-20">Custom</Text>
        </TouchableOpacity>

        <AddEstablishmentModal db={db} refetch={refetch} />
      </View>
    </SafeAreaView>
  );
};

export default EstablishmentPage;
