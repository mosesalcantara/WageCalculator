import { ActivityIndicator, Text, View } from "react-native";

const Loader = ({ title = "Loading..." }) => {
  return (
    <View style={{ flex: 1, gap: 3, justifyContent: "center" }}>
      <ActivityIndicator size="large" />
      <Text style={{ textAlign: "center", fontWeight: "bold" }}>{title}</Text>
    </View>
  );
};

export default Loader;
