import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  addButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 30,
    marginTop: 20,
    marginBottom: 30,
  },
  addText: { color: "#fff", textAlign: "center", fontWeight: "bold" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    backgroundColor: "#1E90FF",
    padding: 16,
    borderRadius: 10,
    width: "80%",
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  label: { color: "#fff", marginTop: 5 },
  input: {
    backgroundColor: "#fff",
    borderRadius: 5,
    paddingHorizontal: 8,
    height: 35,
    marginTop: 2,
  },
  actionButton: {
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  actionText: { fontWeight: "bold" },
});

export default styles;
