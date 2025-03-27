import React from 'react';
import { Modal, View, ActivityIndicator } from 'react-native';
import { ThemedText } from './ThemedText';
import { useThemeColors } from './ColorSchemeProvider';

interface ProgressDialogProps {
  visible: boolean;
  message: string;
}

export const ProgressDialog: React.FC<ProgressDialogProps> = ({ visible, message }) => {
  const { colors } = useThemeColors();
  
  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
    >
      <View 
        style={{ 
          flex: 1,
          backgroundColor: 'rgba(0,0,0,0.5)',
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <View 
          style={{
            backgroundColor: colors.background,
            padding: 20,
            borderRadius: 10,
            alignItems: 'center',
            gap: 16,
          }}
        >
          <ActivityIndicator size="large" color={colors.primaryText} />
          <ThemedText>{message}</ThemedText>
        </View>
      </View>
    </Modal>
  );
};