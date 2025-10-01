import AddEstablishmentModal from "@/components/Modals/AddEstablishmentModal";
import NavBar from "@/components/NavBar";
import EstablishmentsTable from "@/components/Tables/EstablishmentsTable";
import useDeleteEstablishment from "@/hooks/useDeleteEstablishment";
import useFetchEstablishments from "@/hooks/useFetchEstablishments";
import { getDb } from "@/utils/globals";
import { useFocusEffect } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useCallback } from "react";
import { BackHandler, View } from "react-native";

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
    <View className="flex-1 bg-[#acb6e2ff] p-4">
      <NavBar />

      <EstablishmentsTable
        db={db}
        router={router}
        records={records}
        refetch={refetch}
        onDelete={handleDelete}
      />

      <AddEstablishmentModal db={db} refetch={refetch} />
    </View>
  );
};

export default EstablishmentPage;
