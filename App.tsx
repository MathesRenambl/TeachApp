import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import TeacherApp from './app/TeacherApp';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestCustomizer from './app/TestCustomizer';
import ExamApp from './app/ExamApp';
import { RootStackParamList } from './types';
import MatchTheFollowing from './app/MatchTheFollowing';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Assessment from './app/Assessment';
import Library from './app/Library';
import React from 'react';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <SafeAreaProvider style={{ flex: 1 }}>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="TeacherApp" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="TeacherApp" component={TeacherApp} />
                    <Stack.Screen name="Library" component={Library} />
                    <Stack.Screen name="Assessment" component={Assessment} />
                    <Stack.Screen name="TestCustomizer" component={TestCustomizer} />
                    <Stack.Screen name="ExamApp" component={ExamApp} />
                    <Stack.Screen name="MatchTheFollowing" component={MatchTheFollowing} />
                </Stack.Navigator>
            </NavigationContainer>
        </SafeAreaProvider>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
