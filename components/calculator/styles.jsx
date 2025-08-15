import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f5f5f5" },
  header: { flexDirection: "row", alignItems: "center", backgroundColor: "#2c3e50", padding: 15 },
  headerText: { color: "#fff", fontSize: 18, fontWeight: "bold", marginLeft: 10 },
  calcScroll: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#ddd", paddingVertical: 10 },
  calcButton: {
    flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#ccc", backgroundColor: "#fff",
    paddingVertical: 6, paddingHorizontal: 12, borderRadius: 8, marginHorizontal: 5
  },
  calcButtonActive: { backgroundColor: "#2c3e50", borderColor: "#2c3e50" },
  calcButtonText: { marginLeft: 6, fontSize: 14, color: "#555" },
  calcButtonTextActive: { color: "#fff" },
  content: { padding: 15 },
  card: {
    backgroundColor: "#fff", padding: 15, borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 2
  },
  label: { fontSize: 14, fontWeight: "bold", marginTop: 10, marginBottom: 4, color: "#333" },
  input: {
    borderWidth: 1, borderColor: "#ccc", borderRadius: 6, paddingHorizontal: 10, height: 40, backgroundColor: "#fafafa",
    justifyContent: "center"
  },
  dateField: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  calcAction: { backgroundColor: "#2c3e50", padding: 12, borderRadius: 6, marginTop: 15, alignItems: "center" },
  calcActionText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  resultBox: {
    marginTop: 15, padding: 12, backgroundColor: "#eafaf1", borderRadius: 6, borderWidth: 1, borderColor: "#27ae60"
  },
  resultLabel: { fontSize: 14, fontWeight: "bold", color: "#27ae60" },
  resultValue: { fontSize: 18, fontWeight: "bold", color: "#27ae60", marginTop: 4 },
  addButton: { marginTop: 8, backgroundColor: "#3498db", paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4 },
  addButtonText: { color: "#fff", fontSize: 12, fontWeight: "bold" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" },
  modalBox: { backgroundColor: "#fff", width: "80%", borderRadius: 8, padding: 15 },
  modalTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 10 },
  modalActions: { flexDirection: "row", justifyContent: "flex-end", marginTop: 10 },
  modalBtn: { paddingVertical: 8, paddingHorizontal: 15, marginLeft: 10, borderRadius: 4 },
  modalBtnText: { fontSize: 14 },
    image: {
    width: 60,
    height: 60,
    resizeMode: "contain",
  },
});

export const pickerSelectStyles = {
  inputIOS: {
    fontSize: 14, paddingVertical: 10, paddingHorizontal: 10, borderWidth: 1, borderColor: "#ccc",
    borderRadius: 6, color: "#333", backgroundColor: "#fafafa", marginBottom: 6
  },
  inputAndroid: {
    fontSize: 14, paddingHorizontal: 10, paddingVertical: 8, borderWidth: 1, borderColor: "#ccc",
    borderRadius: 6, color: "#333", backgroundColor: "#fafafa", marginBottom: 6
  }
};
