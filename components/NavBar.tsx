import { Image, Text, View } from "react-native";

type Props = {
  className?: string;
  title?: string;
};

const NavBar = ({ className, title = "DOLECalc" }: Props) => {
  return (
    <View
      className={`h-[3.75rem] flex-row items-center justify-between border-b bg-[#acb6e2ff] px-2.5 ${className}`}
    >
      <Image
        source={require("@/assets/images/dole.png")}
        className="h-[3.75rem] w-[3.75rem]"
        style={{ resizeMode: "contain" }}
      />
      <Text className="text-center text-xl font-bold">{title}</Text>
      <Image
        source={require("@/assets/images/bagongpilipinas.png")}
        className="h-[3.75rem] w-[3.75rem]"
        style={{ resizeMode: "contain" }}
      />
    </View>
  );
};

export default NavBar;
