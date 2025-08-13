import NavBar from "@/components/NavBar/NavBar";
import { useState } from "react";
import {
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { styles } from "./styles";

const HomeScreen = () => {
  const [establishments, setEstablishments] = useState([
    {
      id: "1",
      name: "DOLE - MIMAROPA",
      address:
        "Confil Building, Sampaguita, Lumangbayan, Calapan City, Oriental Mindoro",
      type: "",
      image: "",
      employees: [
        { id: "1", name: "Crisostomo Ibarra", rate: "500", underpayment: "0" },
        { id: "2", name: "Maria Clara Alba", rate: "480", underpayment: "20" },
        { id: "3", name: "Crisostomo Ibarra", rate: "500", underpayment: "0" },
        { id: "4", name: "Maria Clara Alba", rate: "480", underpayment: "20" },
        { id: "5", name: "Crisostomo Ibarra", rate: "500", underpayment: "0" },
        { id: "6", name: "Maria Clara Alba", rate: "480", underpayment: "20" },
        { id: "7", name: "Crisostomo Ibarra", rate: "500", underpayment: "0" },
        { id: "8", name: "Maria Clara Alba", rate: "480", underpayment: "20" },
        { id: "9", name: "Crisostomo Ibarra", rate: "500", underpayment: "0" },
        { id: "10", name: "Maria Clara Alba", rate: "480", underpayment: "20" },
      ],
    },
    {
      id: "2",
      name: "Establishment 2",
      address: "",
      type: "",
      image: "",
      employees: [
        { id: "1", name: "Pedro Reyes", rate: "450", underpayment: "50" },
      ],
    },
    {
      id: "3",
      name: "Establishment 3",
      address: "",
      type: "",
      image: "",
      employees: [],
    },
  ]);

  const [form, setForm] = useState({
    name: "",
    address: "",
    type: "",
    image: "",
  });

  const [formModalVisible, setFormModalVisible] = useState(false);
  const [tableModalVisible, setTableModalVisible] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState(null);

  const handleSave = () => {
    if (form.name) {
      const newEstablishment = {
        id: Date.now().toString(),
        name: form.name,
        address: form.address,
        type: form.type,
        image: form.image,
        employees: [],
      };
      setEstablishments([...establishments, newEstablishment]);
      setForm({ name: "", address: "", type: "", image: "" });
      setFormModalVisible(false);
    }
  };

  const openTable = (establishment) => {
    setSelectedEstablishment(establishment);
    setTableModalVisible(true);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <NavBar title="Wage Calculator" />

      {/* List of establishments */}
      <FlatList
        data={establishments}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.establishmentCard}
            onPress={() => openTable(item)}
          >
            <Text style={styles.establishmentText}>{item.name}</Text>
          </TouchableOpacity>
        )}
      />

      {/* Add Establishment Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => setFormModalVisible(true)}
      >
        <Text style={styles.addText}>Add Establishment</Text>
      </TouchableOpacity>

      {/* Modal: Add Establishment Form */}
      <Modal
        animationType="slide"
        transparent
        visible={formModalVisible}
        onRequestClose={() => setFormModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.form}>
            <Text style={styles.label}>Name:</Text>
            <TextInput
              style={styles.input}
              value={form.name}
              onChangeText={(text) => setForm({ ...form, name: text })}
            />
            <Text style={styles.label}>Address:</Text>
            <TextInput
              style={styles.input}
              value={form.address}
              onChangeText={(text) => setForm({ ...form, address: text })}
            />
            <Text style={styles.label}>Type:</Text>
            <TextInput
              style={styles.input}
              value={form.type}
              onChangeText={(text) => setForm({ ...form, type: text })}
            />
            <Text style={styles.label}>Image:</Text>
            <TextInput
              style={styles.input}
              value={form.image}
              onChangeText={(text) => setForm({ ...form, image: text })}
            />

            <View style={{ flexDirection: "row", justifyContent: "flex-end" }}>
              <TouchableOpacity
                style={[styles.saveButton, { marginRight: 8 }]}
                onPress={() => setFormModalVisible(false)}
              >
                <Text style={styles.saveText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal: Employee Table */}
      <Modal
        animationType="slide"
        transparent
        visible={tableModalVisible}
        onRequestClose={() => setTableModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.tableContainer}>
            <Text style={styles.tableTitle}>
              {selectedEstablishment?.name} - Employees
            </Text>
            <Text style={styles.tableAddress}>
              {selectedEstablishment?.address}
            </Text>

            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => console.log("Button pressed!")}
            >
              <Text style={styles.moreButtonText}>More Details</Text>
            </TouchableOpacity>

            {/* Table Header */}
            <View style={styles.tableRowHeader}>
              <Text style={styles.tableHeaderText}>Name of Employee</Text>
              <Text style={styles.tableHeaderText}>Actual Rate</Text>
              <Text style={styles.tableHeaderText}>No. of Underpayment</Text>
            </View>

            {/* Scrollable Table Rows */}
            <ScrollView style={{ maxHeight: 300 }}>
              {selectedEstablishment?.employees.map((emp) => (
                <View key={emp.id} style={styles.tableRow}>
                  <Text style={styles.tableCell}>{emp.name}</Text>
                  <Text style={styles.tableCell}>{emp.rate}</Text>
                  <Text style={styles.tableCell}>{emp.underpayment}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Close Button */}
            <TouchableOpacity
              style={[
                styles.saveButton,
                { marginTop: 15, alignSelf: "center" },
              ]}
              onPress={() => setTableModalVisible(false)}
            >
              <Text style={styles.saveText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default HomeScreen;
