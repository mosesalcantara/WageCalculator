import { Text } from "react-native";

type Props = {
  name: string;
};

const Label = ({ name }: Props) => {
  return <Text className="mt-1 font-b text-white">{name}</Text>;
};

export default Label;
