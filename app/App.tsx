import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AsyncStorage from '@react-native-async-storage/async-storage';
import TestCustomizer from '../scripts/TestCustomizer';
import ExamApp from '../scripts/ExamApp';
import { RootStackParamList } from '../types';
import MatchTheFollowing from '../scripts/MatchTheFollowing';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import CustomizerAssessment from './features/customizerAssessment';
import Home from './features/home';
import Library from './features/libraryTopTab';
import Login from './features/auth/login';
import SignUp from './features/auth/signUp';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
    const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);

    useEffect(() => {
        checkLoginStatus();
    }, []);

    const checkLoginStatus = async () => {
        try {
            const token = await AsyncStorage.getItem('userToken');
            const user = await AsyncStorage.getItem('userData');
            console.log(user)
            setIsLoggedIn(!!token);
        } catch (error) {
            console.error('Error checking login status:', error);
            setIsLoggedIn(false);
        }
    };

    if (isLoggedIn === null) {
        // You can show a loading screen here
        return null;
    }

    return (
        <SafeAreaProvider>
            <NavigationContainer>
                <Stack.Navigator initialRouteName={isLoggedIn ? "Home" : "Login"} screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="Login" component={Login} />
                    <Stack.Screen name="SignUp" component={SignUp} />
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