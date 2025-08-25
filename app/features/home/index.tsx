import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { LinearGradient } from 'expo-linear-gradient';
// Import components
import Upload from '../uploadTopTab/index';
import Library from '../libraryTopTab';
import Assessment from '../assessmentTopTab/index';

const { width, height } = Dimensions.get('window');

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeacherApp'>;

interface UploadedFile {
    id: string;
    name: string;
    type: 'pdf' | 'image';
    size: string;
    uploadDate: string;
    status: 'processing' | 'completed' | 'failed';
    tags: {
        standard: string;
        subject: string;
        chapter: string;
        language: string;
    };
}

const TeacherApp: React.FC = () => {
    const navigation = useNavigation<Navigation>();
    const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'assessment'>('upload');
    const [libraryFiles, setLibraryFiles] = useState<UploadedFile[]>([]);

    // Handle files processed from Upload component
    const handleFilesProcessed = (files: UploadedFile[]) => {
        setLibraryFiles(prev => [...prev, ...files]);
    };

    // Handle navigation to assessment screen
    const handleNavigateToAssessment = () => {
        navigation.navigate('Assessment');
    };

    // Handle file selection from Library
    const handleFileSelect = (file: UploadedFile) => {
        console.log('Selected file:', file);
        // Add your file selection logic here
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'upload':
                return <Upload />;
            case 'library':
                return <Library />;
            case 'assessment':
                return <Assessment />;
            default:
                return <Upload />;
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerContent}>
                    <View style={styles.headerLeft}>
                        <View style={styles.profileIcon}>
                            <Icon name="person" size={24} color="#4A90E2" />
                        </View>
                        <View>
                            <Text style={styles.welcomeText}>Welcome back,</Text>
                            <Text style={styles.teacherName}>Gokul Thirumal</Text>
                        </View>
                    </View>
                </View>
            </View>

            {/* Tab Navigation */}
            <View style={styles.tabNavigation}>
                <TouchableOpacity
                    style={[styles.tab, activeTab === 'upload' && styles.activeTab]}
                    onPress={() => setActiveTab('upload')}
                >
                    <Icon
                        name="cloud-upload"
                        size={20}
                        color={activeTab === 'upload' ? '#4A90E2' : '#95A5A6'}
                    />
                    <Text
                        style={[styles.tabText, activeTab === 'upload' && styles.activeTabText]}
                    >
                        Upload
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'library' && styles.activeTab]}
                    onPress={() => setActiveTab('library')}
                >
                    <Icon
                        name="library-books"
                        size={20}
                        color={activeTab === 'library' ? '#4A90E2' : '#95A5A6'}
                    />
                    <Text
                        style={[styles.tabText, activeTab === 'library' && styles.activeTabText]}
                    >
                        Library
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tab, activeTab === 'assessment' && styles.activeTab]}
                    onPress={() => setActiveTab('assessment')}
                >
                    <Icon
                        name="assessment"
                        size={20}
                        color={activeTab === 'assessment' ? '#4A90E2' : '#95A5A6'}
                    />
                    <Text
                        style={[styles.tabText, activeTab === 'assessment' && styles.activeTabText]}
                    >
                        Assessment
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Main Content with Global ScrollView */}
            <ScrollView 
                style={styles.contentContainer}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.tabContent}>
                    {renderTabContent()}
                </View>
            </ScrollView>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        backgroundColor: '#FFFFFF',
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    profileIcon: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: width * 0.06,
        backgroundColor: '#E3F2FD',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width * 0.03,
    },
    welcomeText: {
        fontSize: width * 0.035,
        color: '#7F8C8D',
    },
    teacherName: {
        fontSize: width * 0.045,
        fontWeight: '700',
        color: '#2C3E50',
    },
    tabNavigation: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        paddingHorizontal: width * 0.05,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height * 0.02,
        borderBottomWidth: 3,
        borderBottomColor: 'transparent',
    },
    activeTab: {
        borderBottomColor: '#4A90E2',
    },
    tabText: {
        fontSize: width * 0.035,
        color: '#95A5A6',
        marginLeft: width * 0.02,
        fontWeight: '500',
    },
    activeTabText: {
        color: '#4A90E2',
        fontWeight: '600',
    },
    contentContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingBottom: height * 0.05,
    },
    tabContent: {
        flex: 1,
        // marginTop: width * 0.05,
        paddingHorizontal: width * 0.04,
    },
});

export default TeacherApp;