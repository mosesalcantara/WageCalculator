import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Button,
} from 'react-native';
import { styles } from "./styles";
import { Gesture, GestureDetector, GestureHandlerRootView } from 'react-native-gesture-handler';
import DateTimePickerModal from 'react-native-modal-datetime-picker';
import { Ionicons } from '@expo/vector-icons';
import RNPickerSelect from 'react-native-picker-select';

const CALCULATOR_TYPES = [
  'Basic Wages',
  'Holiday Pay',
  'Premium Pay',
  'Overtime Pay',
  'Night Differential',
  '13th-Month Pay',
  'Retirement Pay',
];

const calculatorConfig = {
  'Basic Wages': {
    label: '',
    types: [],
    showDates: true,
    showDays: true,
    showPrevailingRate: true,
    showPR: true,
    showAR: true,
    compute: ({ prNum, arNum, daysNum }) => (prNum - arNum) * daysNum,
  },
  'Holiday Pay': {
    label: 'Holiday Type',
    types: [
      { label: 'Regular Holiday', value: 'regular', rate: 1 },
      { label: 'Special Non-working Day', value: 'special', rate: 0.3 },
    ],
    showDates: true,
    showDays: true,
    compute: ({ prNum, typeRate, daysNum }) => prNum * typeRate * daysNum,
  },
  'Premium Pay': {
    label: 'Premium Type',
    types: [
      { label: 'Regular Premium', value: 'regularPremium', rate: 1.3 },
      { label: 'Holiday Premium', value: 'holidayPremium', rate: 1.5 },
    ],
    showDates: true,
    showDays: true,
    compute: ({ prNum, typeRate, daysNum }) => prNum * typeRate * daysNum,
  },
  'Overtime Pay': {
    label: 'Overtime Type',
    types: [
      { label: 'Regular Overtime', value: 'regularOT', rate: 1.25 },
      { label: 'Holiday Overtime', value: 'holidayOT', rate: 1.5 },
    ],
    showDates: true,
    showDays: true,
    compute: ({ prNum, typeRate, daysNum }) => prNum * typeRate * daysNum,
  },
  'Night Differential': {
    label: 'Night Differential Type',
    types: [
      { label: 'Regular Night Diff', value: 'regularND', rate: 0.1 },
      { label: 'Holiday Night Diff', value: 'holidayND', rate: 0.2 },
    ],
    showDates: true,
    showDays: true,
    compute: ({ prNum, typeRate, daysNum }) => prNum * typeRate * daysNum,
  },
  '13th-Month Pay': {
    label: '13th Month Type',
    types: [{ label: 'Standard', value: 'standard', rate: 1 }],
    showDates: true,
    showDays: true,
    compute: ({ prNum, typeRate, daysNum }) => prNum * typeRate * daysNum,
  },
  'Retirement Pay': {
    label: '',
    types: [],
    showDates: true,
    showDays: true,
    showPrevailingRate: true,
    showPR: true,
    showAR: true,
    compute: ({ prNum, arNum, daysNum }) => (prNum - arNum) * daysNum,
  },
};

export default function EmployeeDetails() {
  const [selectedCalculatorIndex, setSelectedCalculatorIndex] = useState(0);
  const selectedCalculator = CALCULATOR_TYPES[selectedCalculatorIndex];

  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [prevailingRate, setPrevailingRate] = useState('');
  const [pr, setPr] = useState('');
  const [ar, setAr] = useState('');
  const [days, setDays] = useState('');
  const [total, setTotal] = useState('');

  const [typesList, setTypesList] = useState([]);
  const [selectedType, setSelectedType] = useState(null);

  const [newTypeLabel, setNewTypeLabel] = useState('');
  const [newTypeValue, setNewTypeValue] = useState('');
  const [newTypeRate, setNewTypeRate] = useState('');

  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [selectedField, setSelectedField] = useState('');

  useEffect(() => {
    const config = calculatorConfig[selectedCalculator] || {};
    setTypesList(config.types || []);
    setSelectedType(null);
    setNewTypeLabel('');
    setNewTypeValue('');
    setNewTypeRate('');
    setStartDate('');
    setEndDate('');
    setPrevailingRate('');
    setPr('');
    setAr('');
    setDays('');
    setTotal('');
  }, [selectedCalculator]);

  const showDatePicker = (field) => {
    setSelectedField(field);
    setDatePickerVisibility(true);
  };
  const hideDatePicker = () => setDatePickerVisibility(false);
  const handleConfirm = (date) => {
    const formatted = date.toISOString().split('T')[0];
    selectedField === 'start' ? setStartDate(formatted) : setEndDate(formatted);
    hideDatePicker();
  };

  const handleCompute = () => {
    const config = calculatorConfig[selectedCalculator];
    const prNum = parseFloat(pr) || 0;
    const arNum = parseFloat(ar) || 0;
    const daysNum = parseFloat(days) || 0;
    let typeRate = 1;
    if (selectedType) {
      const found = typesList.find((t) => t.value === selectedType);
      typeRate = found ? found.rate : 1;
    }
    try {
      const result = config.compute({ prNum, arNum, daysNum, typeRate });
      setTotal(result.toFixed(2));
    } catch {
      setTotal('0.00');
    }
  };

  const handleClear = () => {
    setStartDate('');
    setEndDate('');
    setPrevailingRate('');
    setPr('');
    setAr('');
    setDays('');
    setTotal('');
    setSelectedType(null);
    setNewTypeLabel('');
    setNewTypeValue('');
    setNewTypeRate('');
  };

  const addType = () => {
    if (newTypeLabel && newTypeValue && newTypeRate) {
      const rateNum = parseFloat(newTypeRate);
      if (isNaN(rateNum)) return;
      if (typesList.some((t) => t.value === newTypeValue)) {
        alert('Type value must be unique');
        return;
      }
      setTypesList([...typesList, { label: newTypeLabel, value: newTypeValue, rate: rateNum }]);
      setNewTypeLabel('');
      setNewTypeValue('');
      setNewTypeRate('');
    }
  };

  // Horizontal swipe gesture only for buttons
  const panGesture = Gesture.Pan()
    .onEnd((e) => {
      const { translationX, velocityX } = e;
      if (translationX > 50 && Math.abs(velocityX) > 500) {
        setSelectedCalculatorIndex((prev) =>
          prev === 0 ? CALCULATOR_TYPES.length - 1 : prev - 1
        );
      } else if (translationX < -50 && Math.abs(velocityX) > 500) {
        setSelectedCalculatorIndex((prev) =>
          prev === CALCULATOR_TYPES.length - 1 ? 0 : prev + 1
        );
      }
    });

  const config = calculatorConfig[selectedCalculator] || {};

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.header}>Wage Calculator</Text>

        {/* Horizontal swipe + buttons */}
        <GestureDetector gesture={panGesture}>
          <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.buttonScroll}
              contentContainerStyle={styles.buttonScrollContent}
            >
              {CALCULATOR_TYPES.map((type, i) => (
                <TouchableOpacity
                  key={type}
                  style={[
                    styles.calcButton,
                    selectedCalculatorIndex === i && styles.activeCalcButton,
                  ]}
                  onPress={() => setSelectedCalculatorIndex(i)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.calcButtonText,
                      selectedCalculatorIndex === i && styles.activeCalcButtonText,
                    ]}
                  >
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
        </GestureDetector>

        <View style={styles.blueBox}>
          <Text style={styles.blueBoxText}>{selectedCalculator}</Text>
        </View>

        <View style={styles.formBox}>
          {config.label && (
            <>
              <Text style={styles.label}>{config.label}</Text>
              <View style={styles.customPickerContainer}>
                <Ionicons name="flag-outline" size={22} color="#4A90E2" style={{ marginRight: 12 }} />
                <RNPickerSelect
                  onValueChange={setSelectedType}
                  value={selectedType}
                  placeholder={{ label: `Select ${config.label}`, value: null, color: '#999' }}
                  items={typesList}
                  style={{
                    inputIOS: styles.customPickerInput,
                    inputAndroid: styles.customPickerInput,
                    iconContainer: { top: 18, right: 12 },
                  }}
                  Icon={() => <Ionicons name="chevron-down" size={20} color="#4A90E2" />}
                />
              </View>

              <Text style={styles.label}>Add New {config.label}</Text>
              <TextInput
                style={styles.input}
                placeholder={`${config.label} Name`}
                value={newTypeLabel}
                onChangeText={setNewTypeLabel}
              />
              <TouchableOpacity style={[styles.button, styles.addBtn]} onPress={addType}>
                <Ionicons name="add-circle-outline" size={20} color="#fff" />
                <Text style={styles.buttonText}> Add {config.label}</Text>
              </TouchableOpacity>
            </>
          )}

          {config.showDates && (
            <>
              <Text style={styles.label}>Start Date</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => showDatePicker('start')}>
                <Text>{startDate || 'Select Start Date'}</Text>
                <Ionicons name="calendar-outline" size={20} color="#555" />
              </TouchableOpacity>

              <Text style={styles.label}>End Date</Text>
              <TouchableOpacity style={styles.dateInput} onPress={() => showDatePicker('end')}>
                <Text>{endDate || 'Select End Date'}</Text>
                <Ionicons name="calendar-outline" size={20} color="#555" />
              </TouchableOpacity>
            </>
          )}

          {config.showPrevailingRate && (
            <>
              <Text style={styles.label}>Prevailing Rate</Text>
              <TextInput
                style={styles.input}
                value={prevailingRate}
                onChangeText={setPrevailingRate}
                keyboardType="numeric"
              />
            </>
          )}
          {config.showPR && (
            <>
              <Text style={styles.label}>PR</Text>
              <TextInput style={styles.input} value={pr} onChangeText={setPr} keyboardType="numeric" />
            </>
          )}
          {config.showAR && (
            <>
              <Text style={styles.label}>AR</Text>
              <TextInput style={styles.input} value={ar} onChangeText={setAr} keyboardType="numeric" />
            </>
          )}
          {config.showDays && (
            <>
              <Text style={styles.label}>Days</Text>
              <TextInput style={styles.input} value={days} onChangeText={setDays} keyboardType="numeric" />
            </>
          )}

          <Text style={styles.totalText}>TOTAL = {total}</Text>

          <View style={styles.buttonRow}>
            <TouchableOpacity style={[styles.button, styles.computeBtn]} onPress={handleCompute}>
              <Text style={styles.computeText}>Compute</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[styles.button, styles.clearBtn]} onPress={handleClear}>
              <Text>Clear</Text>
            </TouchableOpacity>
          </View>
        </View>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirm}
          onCancel={hideDatePicker}
        />
      </ScrollView>
    </GestureHandlerRootView>
  );
}


