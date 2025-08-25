// Card.tsx
import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle; // For custom styles passed from parent
  padding?: 'sm' | 'md' | 'lg';
}

export default function Card({
  children,
  style,
  padding = 'md'
}: CardProps) {
  const getPaddingStyles = (): ViewStyle => {
    switch (padding) {
      case 'sm':
        return { padding: 12 }; // p-3 (approx 12px)
      case 'md':
        return { padding: 16 }; // p-4 (approx 16px)
      case 'lg':
        return { padding: 24 }; // p-6 (approx 24px)
      default:
        return {};
    }
  };

  return (
    <View
      style={[
        styles.base,
        getPaddingStyles(),
        style, // Apply custom styles last to allow override
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    backgroundColor: 'white', // bg-white
    borderRadius: 12, // rounded-xl (assuming 12px for xl, default is 8px for lg)
    shadowColor: '#000', // shadow-sm
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2, // Android shadow
    borderWidth: 1, // border
    borderColor: '#f3f4f6', // border-gray-100
    // Dark mode styles would typically be handled by a theme context or similar in React Native
    // For this example, we are not directly implementing dark:bg-gray-800 etc.
  },
});
