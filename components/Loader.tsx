import { ActivityIndicator, Text, View } from "react-native";
import tw from "twrnc";

type Props = {
  title?: string;
};

const Loader = ({ title = "Loading..." }: Props) => {
  return (
    <View style={tw`flex-1 gap-1 justify-center`}>
      <ActivityIndicator size="large" />
      <Text style={tw`text-center font-bold`}>{title}</Text>
    </View>
  );
};

export default Loader;
