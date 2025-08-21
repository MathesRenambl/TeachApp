import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import TeacherApp from './TeacherApp';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import TestCustomizer from './TestCustomizer';
import ExamApp from './ExamApp';
import { RootStackParamList } from '../types';
import MatchTheFollowing from './MatchTheFollowing';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import Assessment from './features/assessmentTopTab';
import home from './features/home/index';
import Library from './Library';
import React from 'react';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName="home" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="home" component={home} />
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
