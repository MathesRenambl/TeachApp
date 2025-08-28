// app/features/auth/SignUp.tsx
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Picker } from '@react-native-picker/picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NavigationProp, useNavigation } from '@react-navigation/native';

interface Child {
    name: string;
    school: string;
    medium: 'Tamil' | 'English' | '';
    curriculum: 'State Board' | 'CBSE' | 'ICSE' | '';
    standard: string;
}

interface SignUpProps {
    navigation: NavigationProp<any>;
}

const SignUp: React.FC<SignUpProps> = () => {
    const navigation = useNavigation<NavigationProp<any>>();
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [numberOfChildren, setNumberOfChildren] = useState('1');
    const [children, setChildren] = useState<Child[]>([{
        name: '',
        school: '',
        medium: '',
        curriculum: '',
        standard: ''
    }]);
    const [loading, setLoading] = useState(false);

    const validateEmail = (email: string) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    };

    const handleNumberOfChildrenChange = (value: string) => {
        const num = parseInt(value);
        setNumberOfChildren(value);
        
        const newChildren: Child[] = [];
        for (let i = 0; i < num; i++) {
            newChildren.push(children[i] || {
                name: '',
                school: '',
                medium: '',
                curriculum: '',
                standard: ''
            });
        }
        setChildren(newChildren);
    };

    const updateChild = (index: number, field: keyof Child, value: string) => {
        const updatedChildren = [...children];
        updatedChildren[index] = {
            ...updatedChildren[index],
            [field]: value
        };
        setChildren(updatedChildren);
    };

    const validateForm = () => {
        if (!fullName.trim()) {
            Alert.alert('Error', 'Please enter your full name');
            return false;
        }

        if (!email || !validateEmail(email)) {
            Alert.alert('Error', 'Please enter a valid email address');
            return false;
        }

        if (!password || password.length < 6) {
            Alert.alert('Error', 'Password must be at least 6 characters long');
            return false;
        }

        if (password !== confirmPassword) {
            Alert.alert('Error', 'Passwords do not match');
            return false;
        }

        // Validate children data
        for (let i = 0; i < children.length; i++) {
            const child = children[i];
            if (!child.name.trim()) {
                Alert.alert('Error', `Please enter name for child ${i + 1}`);
                return false;
            }
            if (!child.school.trim()) {
                Alert.alert('Error', `Please enter school for child ${i + 1}`);
                return false;
            }
            if (!child.medium) {
                Alert.alert('Error', `Please select medium for child ${i + 1}`);
                return false;
            }
            if (!child.curriculum) {
                Alert.alert('Error', `Please select curriculum for child ${i + 1}`);
                return false;
            }
            if (!child.standard.trim()) {
                Alert.alert('Error', `Please enter standard for child ${i + 1}`);
                return false;
            }
        }

        return true;
    };

    const handleSignUp = async () => {
        if (!validateForm()) return;

        setLoading(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const userData = {
                fullName,
                email,
                password, // In real app, never store plain password
                numberOfChildren: parseInt(numberOfChildren),
                children,
                createdAt: new Date().toISOString()
            };

            // Store user data (in real app, send to backend)
            await AsyncStorage.setItem('userData', JSON.stringify(userData));
            await AsyncStorage.setItem('userToken', 'demo_token_' + Date.now());

            Alert.alert(
                'Success',
                'Account created successfully!',
                [
                    {
                        text: 'OK',
                        onPress: () => {
                            navigation.reset({
                                index: 0,
                                routes: [{ name: 'Home' }],
                            });
                        }
                    }
                ]
            );
        } catch (error) {
            Alert.alert('Error', 'Failed to create account. Please try again.');
            console.error('SignUp error:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <KeyboardAvoidingView 
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={styles.keyboardAvoid}
            >
                <ScrollView contentContainerStyle={styles.scrollContainer}>
                    <View style={styles.header}>
                        <Text style={styles.title}>Create Account</Text>
                        <Text style={styles.subtitle}>Sign up to get started</Text>
                    </View>

                    <View style={styles.form}>
                        {/* Personal Information */}
                        <Text style={styles.sectionTitle}>Personal Information</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Full Name</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your full name"
                                value={fullName}
                                onChangeText={setFullName}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Email</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your email"
                                value={email}
                                onChangeText={setEmail}
                                keyboardType="email-address"
                                autoCapitalize="none"
                                autoCorrect={false}
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Enter your password"
                                value={password}
                                onChangeText={setPassword}
                                secureTextEntry
                            />
                        </View>

                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Confirm Password</Text>
                            <TextInput
                                style={styles.input}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChangeText={setConfirmPassword}
                                secureTextEntry
                            />
                        </View>

                        {/* Children Information */}
                        <Text style={styles.sectionTitle}>Children Information</Text>
                        
                        <View style={styles.inputGroup}>
                            <Text style={styles.label}>Number of Children</Text>
                            <View style={styles.pickerContainer}>
                                <Picker
                                    selectedValue={numberOfChildren}
                                    onValueChange={handleNumberOfChildrenChange}
                                    style={styles.picker}
                                >
                                    {[1, 2, 3, 4, 5].map(num => (
                                        <Picker.Item key={num} label={num.toString()} value={num.toString()} />
                                    ))}
                                </Picker>
                            </View>
                        </View>

                        {children.map((child, index) => (
                            <View key={index} style={styles.childContainer}>
                                <Text style={styles.childTitle}>Child {index + 1}</Text>
                                
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Child Name</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter child's name"
                                        value={child.name}
                                        onChangeText={(value) => updateChild(index, 'name', value)}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>School</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter school name"
                                        value={child.school}
                                        onChangeText={(value) => updateChild(index, 'school', value)}
                                    />
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Medium</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={child.medium}
                                            onValueChange={(value) => updateChild(index, 'medium', value)}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="Select Medium" value="" />
                                            <Picker.Item label="Tamil" value="Tamil" />
                                            <Picker.Item label="English" value="English" />
                                        </Picker>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Curriculum</Text>
                                    <View style={styles.pickerContainer}>
                                        <Picker
                                            selectedValue={child.curriculum}
                                            onValueChange={(value) => updateChild(index, 'curriculum', value)}
                                            style={styles.picker}
                                        >
                                            <Picker.Item label="Select Curriculum" value="" />
                                            <Picker.Item label="State Board" value="State Board" />
                                            <Picker.Item label="CBSE" value="CBSE" />
                                            <Picker.Item label="ICSE" value="ICSE" />
                                        </Picker>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Standard</Text>
                                    <TextInput
                                        style={styles.input}
                                        placeholder="Enter standard (e.g., 1st, 2nd, 10th)"
                                        value={child.standard}
                                        onChangeText={(value) => updateChild(index, 'standard', value)}
                                    />
                                </View>
                            </View>
                        ))}

                        <TouchableOpacity 
                            style={[styles.signUpButton, loading && styles.disabledButton]} 
                            onPress={handleSignUp}
                            disabled={loading}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.signUpButtonText}>Create Account</Text>
                            )}
                        </TouchableOpacity>

                        <View style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                                <Text style={styles.loginText}>Sign In</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    keyboardAvoid: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: 20,
    },
    header: {
        alignItems: 'center',
        marginBottom: 30,
        marginTop: 20,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 10,
    },
    subtitle: {
        fontSize: 16,
        color: '#666',
    },
    form: {
        backgroundColor: '#fff',
        padding: 20,
        borderRadius: 10,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 20,
        marginTop: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: '500',
        color: '#333',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        padding: 15,
        fontSize: 16,
        backgroundColor: '#fff',
    },
    pickerContainer: {
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 8,
        backgroundColor: '#fff',
    },
    picker: {
        height: 50,
    },
    childContainer: {
        backgroundColor: '#f8f9fa',
        padding: 15,
        borderRadius: 8,
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#e9ecef',
    },
    childTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#007AFF',
        marginBottom: 15,
        textAlign: 'center',
    },
    signUpButton: {
        backgroundColor: '#007AFF',
        padding: 15,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: 10,
    },
    disabledButton: {
        backgroundColor: '#ccc',
    },
    signUpButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 30,
    },
    footerText: {
        fontSize: 16,
        color: '#666',
    },
    loginText: {
        fontSize: 16,
        color: '#007AFF',
        fontWeight: '600',
    },
});

export default SignUp;