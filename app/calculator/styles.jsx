import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2c3e50",
    padding: 10,
  },
  headerText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 10,
  },
  calcScroll: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
  },
  calcButton: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    backgroundColor: "#fff",
    paddingHorizontal: 12,
    borderRadius: 8,
    marginHorizontal: 5,
    height: 40,
  },
  calcButtonActive: { backgroundColor: "#2c3e50", borderColor: "#2c3e50" },
  calcButtonText: { marginLeft: 6, fontSize: 14, color: "#555" },
  calcButtonTextActive: { color: "#fff" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 5,
  },
  image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});

export default styles;
