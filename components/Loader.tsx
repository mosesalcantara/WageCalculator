import { ActivityIndicator, Text, View } from "react-native";

type Props = {
  title?: string;
};

const Loader = ({ title = "Loading..." }: Props) => {
  return (
    <View style={{ flex: 1, gap: 3, justifyContent: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ textAlign: "center", fontWeight: "bold" }}>{title}</Text>
    </View>
  );
};

export default Loader;
