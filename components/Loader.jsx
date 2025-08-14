import { ActivityIndicator, Text, View } from "react-native";

const Loader = ({ title = "Loading..." }) => {
  return (
    <View style={{ flex: 1 }}>
      <ActivityIndicator size="large" />
      <Text>{title}</Text>
    </View>
  );
};

export default Loader;
