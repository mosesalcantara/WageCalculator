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
  image: { width: "28%", height: 60, resizeMode: "contain", marginLeft: "-5" },
  types: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    paddingVertical: 10,
  },
  button: {
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
  buttonActive: { backgroundColor: "#2c3e50", borderColor: "#2c3e50" },
  buttonText: { marginLeft: 6, fontSize: 14, color: "#555" },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    height: 40,
  },
  employeeContainer: { paddingVertical: 10 },
  employee: { fontWeight: "bold", fontSize: 20, textAlign: "left", marginLeft: "3%" },
  periodsContainer: { height: 520 },
  periods: { gap: 30 },
  receivedContainer: { marginHorizontal: 40, paddingTop: 10 },
  subtotal: { fontWeight: "bold", fontSize: 20, textAlign: "left", fontStyle: "italic", textDecorationLine: "underline", marginLeft: "3%",},
  saveButtonContainer: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: "4%",
    marginRight: "3%",
    marginBottom: "-14%",
  },
  saveButton: { backgroundColor: "#2196F3", padding: 20, paddingVertical: 10, borderRadius: 8},
  saveButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  footer: { textAlign: "center", fontSize: 12, color: "#888" },
});

export default styles;
