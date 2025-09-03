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
  image: { width: "28%", height: 60, resizeMode: "contain" },
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
  employeeContainer: { paddingVertical: 15 },
  employee: { fontWeight: "bold", fontSize: 20, textAlign: "center" },
  periodsContainer: { height: 450 },
  periods: { gap: 30 },
  receivedContainer: { marginHorizontal: 40, paddingTop: 10 },
  subtotal: { fontWeight: "bold", fontSize: 20, textAlign: "center", fontStyle: "italic", textDecorationLine: "underline" },
  saveButtonContainer: { marginHorizontal: 20, marginVertical: -8 },
  saveButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 30,
  },
  saveButtonText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
});

export default styles;
