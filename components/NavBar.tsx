import { Image, Text, View } from "react-native";
import tw from "twrnc";

type Props = {
  title?: string;
};

const NavBar = ({ title = "Wage Calculator" }: Props) => {
  return (
    <View
      style={tw`flex-row items-center justify-between px-2.5 border-b h-[3.75rem] bg-[#acb6e2ff]`}
    >
      <Image
        source={require("@/assets/images/dole.png")}
        style={tw.style(`w-[3.75rem] h-[3.75rem]`, { resizeMode: "contain" })}
      />
      <Text style={tw`font-bold text-center text-xl`}>{title}</Text>
      <Image
        source={require("@/assets/images/bagongpilipinas.png")}
        style={tw.style(`w-[3.75rem] h-[3.75rem]`, { resizeMode: "contain" })}
      />
    </View>
  );
};

export default NavBar;
