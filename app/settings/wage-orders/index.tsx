import AddWageOrderModal from "@/components/Modals/AddWageOrderModal";
import NavBar from "@/components/NavBar";
import { toastVisibilityTime } from "@/utils/globals";
import { ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Toast from "react-native-toast-message";

const WageOrdersPage = () => {
  const handleAddWageOrderSubmit = async (
    values: {
      name: string;
      date: string;
      lessThanTen: string;
      tenOrMore: string;
    },
    { resetForm }: { resetForm: () => void },
  ) => {
    try {
      console.log(values);
      resetForm();
      Toast.show({
        type: "success",
        text1: "Added Wage Order",
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

  return (
    <SafeAreaView className="flex-1 bg-[#acb6e2ff]">
      <NavBar />

      <View className="flex-1 p-4">
        <View className="mb-2 flex-row items-center justify-between">
          <Text className="text-center text-xl font-bold">Wage Orders</Text>
          <AddWageOrderModal onSubmit={handleAddWageOrderSubmit} />
        </View>

        <ScrollView className="rounded-md" showsVerticalScrollIndicator={true}>
          <View className="my-1.5 flex-row justify-between rounded-md border bg-white p-2.5">
            <View>
              <Text className="text-base font-bold text-[#333]">
                RB-MIMAROPA-09
              </Text>
              <Text className="text-base text-[#333]">
                June 10, 2022 - P404/430
              </Text>
            </View>

            <View className="justify-center">
              <Text>Actions</Text>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
};

export default WageOrdersPage;
