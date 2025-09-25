import { Image, Text, View } from "react-native";
import tw from "twrnc";

type Props = {
  title?: string;
};

const NavBar = ({ title = "Wage Calculator" }: Props) => {
  return (
    <View
      style={tw`flex-row items-center justify-between px-2.5 border-b h-[60px] bg-[#acb6e2ff]`}
    >
      <Image
        source={require("@/assets/images/dole.png")}
        style={tw.style(`w-[60px] h-[60px]`, { resizeMode: "contain" })}
      />
      <Text style={tw`font-bold text-center text-xl`}>{title}</Text>
      <Image
        source={require("@/assets/images/bagongpilipinas.png")}
        style={tw.style(`w-[60px] h-[60px]`, { resizeMode: "contain" })}
      />
    </View>
  );
};

export default NavBar;
