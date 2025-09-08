import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  bold: { fontWeight: "bold" },
  topBorder: {
    marginHorizontal: 40,
    paddingTop: 10,
    borderTopColor: "#0d3dffff",
    borderTopWidth: 5,
    borderRightColor: "#0d3dffff",
    borderRightWidth: 1,
    borderLeftColor: "#0d3dffff",
    borderLeftWidth: 1,
    borderBottomColor: "#0d3dffff",
    borderBottomWidth: 1,
    borderRadius: 8,
    marginBottom: 20,
    padding: 10,
  },
  periodHeader: { textAlign: "center", fontWeight: "bold" },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 10,
    marginBottom: 4,
    color: "#333",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    paddingHorizontal: 10,
    backgroundColor: "#fafafa",
    justifyContent: "center",
    height: 40,
  },
  dateField: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  resultBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#eafaf1",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#27ae60",
  },
  resultLabel: { fontSize: 16, color: "#27ae60" },
  resultValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#27ae60",
    marginTop: 4,
  },
  buttons: { flexDirection: "row", gap: 10, marginTop: 10 },
  button: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    color: "#ffffffff",
    borderWidth: 1,
    borderRadius: 5,
  },
});

export default styles;
