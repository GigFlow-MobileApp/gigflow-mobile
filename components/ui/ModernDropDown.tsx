import { StyleSheet } from 'react-native';
import { MotiView } from 'moti';
import DropDownPicker from 'react-native-dropdown-picker';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/components/ColorSchemeProvider';

interface ModernDropdownProps<T> {
  open: boolean;
  value: T | null;
  items: Array<{
    label: string;
    value: T;
  }>;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  setValue: (callback: (value: T | null) => T) => void; // Modified this line
  setItems: (callback: (items: Array<{
    label: string;
    value: T;
  }>) => Array<{
    label: string;
    value: T;
  }>) => void;
}

export const ModernDropdown = <T extends string | number>({ 
  open, 
  value, 
  items, 
  setOpen, 
  setValue, 
  setItems 
}: ModernDropdownProps<T>) => {
  const { colorScheme } = useColorScheme();

  return (
    <MotiView
      from={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'timing', duration: 500 }}
      style={[styles.container, {zIndex: 1000}]}
    >
      <DropDownPicker
        open={open}
        value={value}
        items={items}
        setOpen={setOpen}
        setValue={setValue}
        setItems={setItems}
        textStyle={[styles.dropdownText, { color: Colors[colorScheme].text }]}
        dropDownContainerStyle={[
          styles.dropdownContainer,
          { 
            backgroundColor: Colors[colorScheme].background, 
            borderColor: Colors[colorScheme].border,
            zIndex: 2000,
            elevation: 5 
          },
        ]}
        theme={colorScheme === 'dark' ? 'DARK' : 'LIGHT'}
        showArrowIcon={true}
        showTickIcon={true}
        closeAfterSelecting={true}
        listMode="SCROLLVIEW"
        scrollViewProps={{
          nestedScrollEnabled: true,
        }}
        style={[styles.dropdown, {
          backgroundColor: Colors[colorScheme].background,
          borderColor: Colors[colorScheme].border,
          marginBottom: 16,
          zIndex: 1000,
        }]}
      />
    </MotiView>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  dropdown: {
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  dropdownText: {
    fontSize: 16,
    fontWeight: '500',
  },
  dropdownContainer: {
    borderWidth: 1.5,
    borderRadius: 12,
    marginTop: 8,
  },
});