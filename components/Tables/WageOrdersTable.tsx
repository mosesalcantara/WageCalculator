import confirmAlert from "@/components/ConfirmAlert";
import UpdateWageOrderModal from "@/components/Modals/UpdateWageOrderModal";
import { Db, WageOrder } from "@/types/globals";
import { formatDate } from "@/utils/globals";
import React from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

type Props = {
  db: Db;
  wageOrders: WageOrder[] | undefined;
  refetch: () => void;
  onDelete: (id: number) => Promise<void>;
};

const WageOrdersTable = ({ db, wageOrders, refetch, onDelete }: Props) => {
  return (
    <FlatList
      data={wageOrders}
      keyExtractor={(wageOrder) => `${wageOrder.id}`}
      renderItem={({ item: wageOrder }) => (
        <View className="my-1.5 flex-row justify-between rounded-md border bg-white p-2.5">
          <View>
            <Text className="font-b text-base text-[#333]">
              {wageOrder.name}
            </Text>
            <Text className="text-base text-[#333]">
              {formatDate(wageOrder.date, "MMMM dd, yyyy")} - P
              {wageOrder.less_than_ten}/{wageOrder.ten_or_more}
            </Text>
          </View>

          <View className="flex-row items-center gap-1">
            <UpdateWageOrderModal
              db={db}
              wageOrder={wageOrder}
              refetch={refetch}
            />

            <TouchableOpacity
              onPress={() => confirmAlert(wageOrder.id, "Wage Order", onDelete)}
            >
              <Icon name="delete" size={20} color="#E53935" />
            </TouchableOpacity>
          </View>
        </View>
      )}
    />
  );
};

export default WageOrdersTable;
