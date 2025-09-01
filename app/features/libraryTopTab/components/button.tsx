// Button.tsx
import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface ButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  style?: ViewStyle; // For custom styles passed from parent
  textStyle?: TextStyle; // For custom text styles
}

export default function Button({
  children,
  onClick,
  variant = 'primary',
  size = 'md',
  disabled = false,
  style,
  textStyle,
}: ButtonProps) {
  const getVariantStyles = (isPressed: boolean): ViewStyle => {
    switch (variant) {
      case 'primary':
        return {
          backgroundColor: isPressed ? '#047857' : '#059669', // emerald-700 on press, emerald-600 normal
          borderColor: isPressed ? '#047857' : '#059669',
        };
      case 'secondary':
        return {
          backgroundColor: isPressed ? '#d1d5db' : '#e5e7eb', // gray-300 on press, gray-200 normal
          borderColor: isPressed ? '#d1d5db' : '#e5e7eb',
        };
      case 'outline':
        return {
          backgroundColor: isPressed ? '#ecfdf5' : 'transparent', // emerald-50 on press, transparent normal
          borderColor: isPressed ? '#047857' : '#059669', // emerald-700 on press, emerald-600 normal
        };
      default:
        return {};
    }
  };

  const getVariantTextStyles = (isPressed: boolean): TextStyle => {
    switch (variant) {
      case 'primary':
        return { color: 'white' };
      case 'secondary':
        return { color: '#374151' }; // gray-800
      case 'outline':
        return { color: isPressed ? '#047857' : '#059669' }; // emerald-700 on press, emerald-600 normal
      default:
        return {};
    }
  };

  const getSizeStyles = (): ViewStyle => {
    switch (size) {
      case 'sm':
        return { paddingHorizontal: 12, paddingVertical: 6 };
      case 'md':
        return { paddingHorizontal: 16, paddingVertical: 8 };
      case 'lg':
        return { paddingHorizontal: 24, paddingVertical: 12 };
      default:
        return {};
    }
  };

  const getSizeTextStyles = (): TextStyle => {
    switch (size) {
      case 'sm':
        return { fontSize: 14 };
      case 'md':
        return { fontSize: 16 };
      case 'lg':
        return { fontSize: 18 };
      default:
        return {};
    }
  };

  return (
    <Pressable
      onPress={disabled ? undefined : onClick}
      style={({ pressed }) => [
        styles.base,
        getVariantStyles(pressed),
        getSizeStyles(),
        disabled && styles.disabled,
        style, // Apply custom styles last to allow override
      ]}
      disabled={disabled}
    >
      {({ pressed }) => (
        <Text
          style={[
            styles.baseText,
            getVariantTextStyles(pressed),
            getSizeTextStyles(),
            textStyle, // Apply custom text styles last
          ]}
        >
          {children}
        </Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8, // rounded-lg
    flexDirection: 'row', // flex
    alignItems: 'center', // items-center
    justifyContent: 'center', // justify-center
    borderWidth: 2, // Default border for outline variant, overridden for others
    borderColor: 'transparent', // Default transparent border
  },
  baseText: {
    fontWeight: '500', // font-medium
  },
  disabled: {
    opacity: 0.5,
  },
});
