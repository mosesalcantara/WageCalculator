import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Dimensions } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";
import { styles } from "./styles";


const { width: screenWidth } = Dimensions.get("window");

const Employees = () => {
  const employees = [
    { name: "Juan Dela Cruz", rate: 500, underpayment: 0 },
    { name: "Maria Santos", rate: 480, underpayment: 20 },
  ];

  const handleEdit = (name) => {
    console.log("Edit", name);
  };

  const handleDelete = (name) => {
    console.log("Delete", name);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Establishment 1 - Employees</Text>

      <ScrollView horizontal={false} showsVerticalScrollIndicator={false}>
        <View style={[styles.table, { width: screenWidth - 32 }]}>
          {/* Table Header */}
          <View style={[styles.row, styles.headerRow]}>
            <Text style={[styles.cell, styles.headerCell, { flex: 2 }]}>Name</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Rate</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 1 }]}>Underpay</Text>
            <Text style={[styles.cell, styles.headerCell, { flex: 0.8 }]}>Actions</Text>
          </View>

          {/* Table Rows */}
          {employees.map((emp, index) => (
            <View key={index} style={[styles.row, index % 2 === 0 ? styles.evenRow : styles.oddRow]}>
              <Text style={[styles.cellText, { flex: 2 }]}>{emp.name}</Text>
              <Text style={[styles.cellText, { flex: 1 }]}>{emp.rate}</Text>
              <Text style={[styles.cellText, { flex: 1 }]}>{emp.underpayment}</Text>
              <View style={[styles.actionCell, { flex: 0.8 }]}>
                <TouchableOpacity onPress={() => handleEdit(emp.name)}>
                  <Icon name="edit" size={20} color="#2196F3" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(emp.name)}>
                  <Icon name="delete" size={20} color="#E53935" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <TouchableOpacity style={styles.closeBtn}>
        <Text style={styles.closeBtnText}>Close</Text>
      </TouchableOpacity>
    </View>
  );
};



export default Employees;