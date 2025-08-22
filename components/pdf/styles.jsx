import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    backgroundColor: "#acb6e2ff",
    height: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    flex: 1,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});

export default styles;
