import React, { useState } from 'react';
import NavBar from '../.expo/components/NavBar';
import { Button } from 'react-native';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from 'react-native';

export default function HomeScreen() {
  const [establishments, setEstablishments] = useState([
    {
      id: '1',
      name: 'DOLE - MIMAROPA',
      address: '',
      type: '',
      image: '',
      employees: [
        { id: '1', name: 'Crisostomo Ibarra', rate: '500', underpayment: '0' },
        { id: '2', name: 'Maria Clara Alba', rate: '480', underpayment: '20' },
      ],
    },
    {
      id: '2',
      name: 'Establishment 2',
      address: '',
      type: '',
      image: '',
      employees: [
        { id: '1', name: 'Pedro Reyes', rate: '450', underpayment: '50' },
      ],
    },
    {
      id: '3',
      name: 'Establishment 3',
      address: '',
      type: '',
      image: '',
      employees: [],
    },
  ]);

  const [form, setForm] = useState({
    name: '',
    address: '',
    type: '',
    image: '',
  });

  const [formModalVisible, setFormModalVisible] = useState(false);
  const [tableModalVisible, setTableModalVisible] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] =
    useState(null);

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
      setForm({ name: '', address: '', type: '', image: '' });
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
      <NavBar title ="Wage Calculator" />

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

            <View style={{ flexDirection: 'row', justifyContent: 'flex-end' }}>
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
            
            <TouchableOpacity
              style={styles.moreButton}
              onPress={() => console.log('Button pressed!')}
            >
            <Text style={styles.moreButtonText}>More Details</Text>
            </TouchableOpacity>

            {/* Table Header */}
            <View style={styles.tableRowHeader}>
              <Text style={styles.tableHeaderText}>Name of Employee</Text>
              <Text style={styles.tableHeaderText}>Actual Rate</Text>
              <Text style={styles.tableHeaderText}>No. of Underpayment</Text>
            </View>

            {/* Table Rows */}
            {selectedEstablishment?.employees.map((emp) => (
              <View key={emp.id} style={styles.tableRow}>
                <Text style={styles.tableCell}>{emp.name}</Text>
                <Text style={styles.tableCell}>{emp.rate}</Text>
                <Text style={styles.tableCell}>{emp.underpayment}</Text>
              </View>
            ))}

            {/* Close Button */}
            <TouchableOpacity
              style={[styles.saveButton, { marginTop: 15, alignSelf: 'center' }]}
              onPress={() => setTableModalVisible(false)}
            >
              <Text style={styles.saveText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#acb6e2ff' },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    backgroundColor: '#acb6e2ff',
  },
  moreButton: {
    backgroundColor: '#1E90FF',
    paddingVertical: 5,   // Adjust height
    paddingHorizontal: 10, // Adjust width
    borderRadius: 5,
    alignSelf: 'flex-end', // or 'center' to center
  },
  moreButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  establishmentCard: {
    padding: 10,
    marginVertical: 5,
    borderWidth: 1,
    borderRadius: 5,
    backgroundColor: '#ffffffff',
  },
  establishmentText: { fontWeight: 'bold' },
  addButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 30,
    marginTop: 20,
  },
  addText: { color: '#fff', textAlign: 'center', fontWeight: 'bold' },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  form: {
    backgroundColor: '#1E90FF',
    padding: 16,
    borderRadius: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 8,
  },
  label: { color: '#fff', marginTop: 5 },
  input: {
    backgroundColor: '#fff',
    borderRadius: 5,
    paddingHorizontal: 8,
    height: 35,
    marginTop: 2,
  },
  saveButton: {
    backgroundColor: '#fff',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 10,
  },
  saveText: { fontWeight: 'bold' },

  tableContainer: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 10,
    width: '90%',
    maxHeight: '80%',
  },
  tableTitle: { fontWeight: 'bold', fontSize: 16, marginBottom: 10 },
  tableRowHeader: {
    flexDirection: 'row',
    backgroundColor: '#c3ced49e',
    paddingVertical: 5,
    borderTopLeftRadius: 5,
    borderTopRightRadius: 5,
  },
  tableHeaderText: {
    flex: 1,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderColor: '#eee',
    paddingVertical: 5,
  },
  tableCell: { flex: 1, textAlign: 'center' },
});
