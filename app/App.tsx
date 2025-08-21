import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import TeacherApp from '../scripts/TeacherApp';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestCustomizer from '../scripts/TestCustomizer';
import ExamApp from '../scripts/ExamApp';
import { RootStackParamList } from '../types';
import MatchTheFollowing from '../scripts/MatchTheFollowing';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomizerAssessment from './features/customizerAssessment';
import Home from './features/home';
import Library from './features/libraryTopTab';
import React from 'react';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="Home" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Home" component={Home} />
                    <Stack.Screen name="Library" component={Library} />
                    <Stack.Screen name="CustomizerAssessment" component={CustomizerAssessment} />
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
