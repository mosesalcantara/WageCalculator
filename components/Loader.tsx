import { ActivityIndicator, Text, View } from "react-native";

type Props = { title?: string };

const Loader = ({ title = "Loading" }: Props) => {
  return (
    <View className="flex-1 justify-center gap-1">
      <ActivityIndicator size="large" />

      <Text className="text-center font-b text-xl">{title}</Text>
    </View>
  );
};

export default Loader;
