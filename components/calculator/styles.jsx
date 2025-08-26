import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
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
    calcAction: {
    backgroundColor: "#2c3e50",
    padding: 12,
    borderRadius: 6,
    marginTop: 15,
    alignItems: "center",
  },
  calcActionText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  resultBox: {
    marginTop: 15,
    padding: 12,
    backgroundColor: "#eafaf1",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#27ae60",
  },
  resultLabel: { fontSize: 14, fontWeight: "bold", color: "#27ae60" },
  resultValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#27ae60",
    marginTop: 4,
  },
});

export default styles;
