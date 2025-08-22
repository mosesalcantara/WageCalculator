import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 16,
  },
  table: {
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
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
  headerRow: {
    backgroundColor: "#2196F3",
    paddingVertical: 12,
  },
  evenRow: {
    backgroundColor: "#fafafa",
  },
  oddRow: {
    backgroundColor: "#f0f0f0",
  },
  cellText: {
    color: "#333",
    fontSize: 14,
  },
  headerCell: {
    fontWeight: "bold",
    fontSize: 15,
    color: "#fff",
  },
  actionCell: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  closeBtn: {
    marginTop: 16,
    alignSelf: "center",
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  closeBtnText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default styles;
