import React, { useState } from "react";
import BagongPilipinasImage from "@/assets/images/bagongpilipinas.png";
import DoleImage from "@/assets/images/dole.png";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  Image,
  Modal
} from "react-native";
import { styles, pickerSelectStyles } from "./styles";
import Icon from "react-native-vector-icons/MaterialIcons";
import RNPickerSelect from "react-native-picker-select";
import DateTimePickerModal from "react-native-modal-datetime-picker";

export default function InspectorCalculator() {
  const calculators = [
    { label: "Basic Wage", icon: "payments" },
    { label: "Holiday Pay", icon: "event-available" },
    { label: "Premium Pay", icon: "star" },
    { label: "Overtime Pay", icon: "access-time" },
    { label: "Night Differential", icon: "nights-stay" },
    { label: "13th Month Pay", icon: "card-giftcard" }
  ];

  const [selectedCalc, setSelectedCalc] = useState("Basic Wage");
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [datePickerVisible, setDatePickerVisible] = useState({ field: null, visible: false });

  // Type lists
  const [holidayTypes, setHolidayTypes] = useState([
    { label: "Regular Holiday", value: "Regular" },
    { label: "Special Holiday", value: "Special" }
  ]);
  const [premiumTypes, setPremiumTypes] = useState([
    { label: "Rest Day", value: "Rest Day" },
    { label: "Special Holiday", value: "Special Holiday" }
  ]);
  const [overtimeTypes, setOvertimeTypes] = useState([
    { label: "Regular OT", value: "Regular" },
    { label: "Rest Day OT", value: "Rest Day" }
  ]);
  const [ndTypes, setNdTypes] = useState([
    { label: "Regular Night", value: "Regular" },
    { label: "Special Night", value: "Special" }
  ]);
  const [monthTypes, setMonthTypes] = useState([
    { label: "Pro-rated", value: "Pro-rated" },
    { label: "Full", value: "Full" }
  ]);

  // Modal states
  const [modalVisible, setModalVisible] = useState(false);
  const [newType, setNewType] = useState("");
  const [typeTarget, setTypeTarget] = useState("");

  const handleChange = (field, value) => {
    setInputs(prev => ({ ...prev, [field]: value }));
  };

  const handleDateConfirm = (date) => {
    handleChange(datePickerVisible.field, date.toISOString().split("T")[0]);
    setDatePickerVisible({ field: null, visible: false });
  };

  const openAddTypeModal = (target) => {
    setTypeTarget(target);
    setNewType("");
    setModalVisible(true);
  };

  const saveNewType = () => {
    if (!newType.trim()) return;
    const typeItem = { label: newType, value: newType };
    if (typeTarget === "holiday") setHolidayTypes(prev => [...prev, typeItem]);
    if (typeTarget === "premium") setPremiumTypes(prev => [...prev, typeItem]);
    if (typeTarget === "overtime") setOvertimeTypes(prev => [...prev, typeItem]);
    if (typeTarget === "nightDiff") setNdTypes(prev => [...prev, typeItem]);
    if (typeTarget === "month") setMonthTypes(prev => [...prev, typeItem]);
    setModalVisible(false);
  };

  const calculate = () => {
    const dr = parseFloat(inputs.actualRate) || parseFloat(inputs.prevailingRate) || 0;
    const days = parseFloat(inputs.days) || 0;
    const hours = parseFloat(inputs.hours) || 0;
    let total = 0;

    switch (selectedCalc) {
      case "Basic Wage":
        total = dr * days;
        break;
      case "Holiday Pay":
        total = dr * days * 2;
        break;
      case "Premium Pay":
        total = dr * days * 1.3;
        break;
      case "Overtime Pay":
        total = (dr / 8) * hours * 1.25;
        break;
      case "Night Differential":
        total = (dr / 8) * hours * 0.1 * days;
        break;
      case "13th Month Pay":
        total = (dr * days) / 12;
        break;
    }

    setResult(total.toFixed(2));
  };

  const renderDateInput = (label, field) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity
        style={[styles.input, styles.dateField]}
        onPress={() => setDatePickerVisible({ field, visible: true })}
      >
        <Text style={{ color: inputs[field] ? "#000" : "#aaa" }}>
          {inputs[field] || `Select ${label.toLowerCase()}`}
        </Text>
        <Icon name="date-range" size={20} color="#555" />
      </TouchableOpacity>
    </>
  );

  const renderPickerWithAdd = (label, items, targetField, addTarget) => (
    <>
      <Text style={styles.label}>{label}</Text>
      <RNPickerSelect
        style={pickerSelectStyles}
        onValueChange={(v) => handleChange(targetField, v)}
        items={items}
      />
      <TouchableOpacity style={styles.addButton} onPress={() => openAddTypeModal(addTarget)}>
        <Text style={styles.addButtonText}>+ Add {label}</Text>
      </TouchableOpacity>
    </>
  );

  const renderFields = () => {
    switch (selectedCalc) {
      case "Basic Wage":
        return (
          <>
            {renderDateInput("Start Date", "startDate")}
            {renderDateInput("End Date", "endDate")}
            <Text style={styles.label}>Prevailing Rate</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter prevailing rate"
              value={inputs.prevailingRate || ""}
              onChangeText={v => handleChange("prevailingRate", v)}
            />
            <Text style={styles.label}>Actual Rate</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter actual rate"
              value={inputs.actualRate || ""}
              onChangeText={v => handleChange("actualRate", v)}
            />
            <Text style={styles.label}>Days</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter days"
              value={inputs.days || ""}
              onChangeText={v => handleChange("days", v)}
            />
          </>
        );

      case "Holiday Pay":
        return (
          <>
            {renderPickerWithAdd("Holiday Type", holidayTypes, "holidayType", "holiday")}
            {renderDateInput("Start Date", "startDate")}
            {renderDateInput("End Date", "endDate")}
            <Text style={styles.label}>Days</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter days"
              value={inputs.days || ""}
              onChangeText={v => handleChange("days", v)}
            />
          </>
        );

      case "Premium Pay":
        return (
          <>
            {renderPickerWithAdd("Premium Type", premiumTypes, "premiumType", "premium")}
            {renderDateInput("Start Date", "startDate")}
            {renderDateInput("End Date", "endDate")}
            <Text style={styles.label}>Days</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter days"
              value={inputs.days || ""}
              onChangeText={v => handleChange("days", v)}
            />
          </>
        );

      case "Overtime Pay":
        return (
          <>
            {renderPickerWithAdd("Overtime Type", overtimeTypes, "overtimeType", "overtime")}
            {renderDateInput("Start Date", "startDate")}
            {renderDateInput("End Date", "endDate")}
            <Text style={styles.label}>Days</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter days"
              value={inputs.days || ""}
              onChangeText={v => handleChange("days", v)}
            />
            <Text style={styles.label}>Hours</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter hours"
              value={inputs.hours || ""}
              onChangeText={v => handleChange("hours", v)}
            />
          </>
        );

      case "Night Differential":
        return (
          <>
            {renderPickerWithAdd("Night Differential Type", ndTypes, "ndType", "nightDiff")}
            {renderDateInput("Start Date", "startDate")}
            {renderDateInput("End Date", "endDate")}
            <Text style={styles.label}>Days</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter days"
              value={inputs.days || ""}
              onChangeText={v => handleChange("days", v)}
            />
            <Text style={styles.label}>Hours</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter hours"
              value={inputs.hours || ""}
              onChangeText={v => handleChange("hours", v)}
            />
          </>
        );

      case "13th Month Pay":
        return (
          <>
            {renderPickerWithAdd("13th Month Pay Type", monthTypes, "monthType", "month")}
            {renderDateInput("Start Date", "startDate")}
            {renderDateInput("End Date", "endDate")}
            <Text style={styles.label}>Days</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              placeholder="Enter days"
              value={inputs.days || ""}
              onChangeText={v => handleChange("days", v)}
            />
          </>
        );
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Icon name="assignment" size={22} color="#fff" />
        <Text style={styles.headerText}>Inspector Wage Calculator</Text><View style={styles.header}>
              <Image source={DoleImage} style={styles.image} />
              <Image source={BagongPilipinasImage} style={styles.image} />
            </View>
      </View>

      {/* Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.calcScroll}>
        {calculators.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.calcButton, selectedCalc === item.label && styles.calcButtonActive]}
            onPress={() => {
              setSelectedCalc(item.label);
              setResult(null);
              setInputs({});
            }}
          >
            <Icon
              name={item.icon}
              size={18}
              color={selectedCalc === item.label ? "#fff" : "#555"}
            />
            <Text style={[styles.calcButtonText, selectedCalc === item.label && styles.calcButtonTextActive]}>
              {item.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Form */}
      <ScrollView style={styles.content}>
        <View style={styles.card}>
          {renderFields()}
          <TouchableOpacity style={styles.calcAction} onPress={calculate}>
            <Text style={styles.calcActionText}>Calculate</Text>
          </TouchableOpacity>
          {result !== null && (
            <View style={styles.resultBox}>
              <Text style={styles.resultLabel}>Total Pay:</Text>
              <Text style={styles.resultValue}>₱ {result}</Text>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Date Picker */}
      <DateTimePickerModal
        isVisible={datePickerVisible.visible}
        mode="date"
        onConfirm={handleDateConfirm}
        onCancel={() => setDatePickerVisible({ field: null, visible: false })}
      />

      {/* Add Type Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Add New Type</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter type name"
              value={newType}
              onChangeText={setNewType}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalBtn} onPress={() => setModalVisible(false)}>
                <Text style={styles.modalBtnText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalBtn, { backgroundColor: "#27ae60" }]} onPress={saveNewType}>
                <Text style={[styles.modalBtnText, { color: "#fff" }]}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}


