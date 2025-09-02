import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f2f2f2", padding: 16 },
  table: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    width: 361,
  },
  title: {
    color: "#333",
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
  },
  headerRow: { backgroundColor: "#2196F3", paddingVertical: 12 },
  headerCell: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#fff",
  },
  cellText: { color: "#333", fontSize: 14 },
  actionCell: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  empty: { textAlign: "center", marginVertical: 10 },
});

export default styles;
