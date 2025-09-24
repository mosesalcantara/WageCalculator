import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#acb6e2ff" },
  card: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#ffffffff",
  },
  text: { fontWeight: "bold" },
  icons: { flexDirection: "row", gap: 3 },
});

export default styles;
