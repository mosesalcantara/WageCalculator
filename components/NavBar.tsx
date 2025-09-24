import { Image, Text, View } from "react-native";

type Props = {
  title?: string;
};

const NavBar = ({ title = "Wage Calculator" }: Props) => {
  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 10,
        borderBottomWidth: 1,
        backgroundColor: "#acb6e2ff",
        height: 60,
      }}
    >
      <Image
        source={require("@/assets/images/dole.png")}
        style={{
          width: 60,
          height: 60,
          resizeMode: "contain",
        }}
      />
      <Text
        style={{
          fontSize: 20,
          fontWeight: "bold",
          textAlign: "center",
          flex: 1,
        }}
      >
        {title}
      </Text>
      <Image
        source={require("@/assets/images/bagongpilipinas.png")}
        style={{
          width: 60,
          height: 60,
          resizeMode: "contain",
        }}
      />
    </View>
  );
};

export default NavBar;
