import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import DropDownPicker from 'react-native-dropdown-picker';
import { Check, ChevronDown } from "lucide-react-native";
import { DropdownItem } from '../types';

interface PersonDropdownProps {
  label: string;
  value: string;
  items: DropdownItem[];
  open: boolean;
  onOpen: (open: boolean) => void;
  onValueChange: (value: string) => void;
  onItemsChange: (items: DropdownItem[]) => void;
  placeholder?: string;
  disabled?: boolean;
  zIndex?: number;
  helperText?: string;
  searchable?: boolean;
}

export function PersonDropdown({
  label,
  value,
  items,
  open,
  onOpen,
  onValueChange,
  onItemsChange,
  placeholder,
  disabled = false,
  zIndex = 1000,
  helperText,
  searchable = true,
}: PersonDropdownProps) {
  return (
    <View style={[styles.container, { zIndex }]}>
      <Text style={styles.label}>{label}</Text>
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={onOpen}
        setValue={onValueChange}
        setItems={onItemsChange}
        listMode="MODAL"
        modalProps={{
          animationType: "slide",
          transparent: false,
        }}
        modalContentContainerStyle={styles.modalContent}
        modalTitle={`Sélectionner ${label.toLowerCase()}`}
        modalTitleStyle={styles.modalTitle}
        modalAnimationType="slide"
        disabled={disabled}
        style={[
          styles.dropdown,
          disabled && styles.disabledDropdown
        ]}
        dropDownContainerStyle={styles.dropdownContainer}
        textStyle={styles.dropdownText}
        placeholderStyle={styles.dropdownPlaceholder}
        placeholder={placeholder}
        ArrowDownIconComponent={() => <ChevronDown color="white" size={20} />}
        TickIconComponent={() => <Check color="#06B6D4" size={18} />}
        searchable={searchable}
        searchPlaceholder="Rechercher..."
        searchTextInputStyle={styles.searchInput}
      />
      {helperText && (
        <Text style={styles.helperText}>{helperText}</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  label: {
    color: "#67E8F9",
    fontWeight: "600",
    marginBottom: 8,
    fontSize: 20,
  },
  dropdown: {
    backgroundColor: "#374151",
    borderColor: "#06B6D4",
    borderWidth: 1,
    borderRadius: 6,
    minHeight: 50,
  },
  dropdownContainer: {
    backgroundColor: "#374151",
    borderColor: "#06B6D4",
    borderWidth: 1,
    borderRadius: 6,
    maxHeight: 200,
  },
  dropdownText: {
    color: "white",
    fontSize: 20,
    textAlign: "left",
    paddingHorizontal: 16,
  },
  dropdownPlaceholder: {
    color: "#9CA3AF",
    fontSize: 20,
  },
  disabledDropdown: {
    opacity: 0.5,
    borderColor: "#6B7280",
  },
  searchInput: {
    backgroundColor: "#4B5563",
    borderColor: "#6B7280",
    color: "white",
  },
  modalContent: {
    flex: 1,
    backgroundColor: "#374151",
    padding: 16,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#06B6D4",
    marginBottom: 12,
    textAlign: "center",
  },
  helperText: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
  },
});