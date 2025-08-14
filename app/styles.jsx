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
    paddingVertical: 5,
    paddingHorizontal: 10, 
    borderRadius: 5,
    alignSelf: "flex-end",
  },
  moreButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
  establishmentCard: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: "#ffffffff",
  },
  establishmentText: { fontWeight: "bold" },
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
