import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#acb6e2ff" },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    textAlign: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    backgroundColor: "#acb6e2ff",
  },
  moreButton: {
    backgroundColor: "#1E90FF",
    paddingVertical: 5, // Adjust height
    paddingHorizontal: 10, // Adjust width
    borderRadius: 5,
    alignSelf: "flex-end", // or 'center' to center
  },
  moreButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  establishmentCard: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#ffffffff",
  },
  establishmentText: { fontWeight: "bold" },
  addButton: {
    backgroundColor: "#000",
    padding: 12,
    borderRadius: 30,
    marginTop: 20,
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
  saveButton: {
    backgroundColor: "#fff",
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  saveText: { fontWeight: "bold" },

  tableContainer: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 10,
    width: "90%",
    maxHeight: "80%",
  },
  tableTitle: { fontWeight: "bold", fontSize: 16, marginBottom: 10 },
  tableRowHeader: {
    flexDirection: "row",
    backgroundColor: "#c3ced49e",
    paddingVertical: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableAddress: {
    fontStyle: "italic",
    marginBottom: 10,
    textAlign: "left",
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: "bold",
    textAlign: "center",
  },
  tableRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderColor: "#eee",
    paddingVertical: 5,
  },
  tableCell: { flex: 1, textAlign: "center" },
});
