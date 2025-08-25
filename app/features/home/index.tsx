import React, { useState } from 'react';
import { ScrollView, StyleSheet, SafeAreaView, StatusBar, Dimensions, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';

// Import separated components
import ProfileHeader from '../home/components/profileHeader';
import TabNavigation, { TabType } from '../home/components/tabNavigation';
import Dashboard from '../uploadTopTab/index'

// Import existing tab components
// import Upload from '../uploadTopTab/index';
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
    const [activeTab, setActiveTab] = useState<TabType>('upload');
    const [libraryFiles, setLibraryFiles] = useState<UploadedFile[]>([]);

    // Mock data for statistics
    const dashboardStats = {
        totalPDFs: 127,
        activeAssessments: 8,
        totalStudents: 20,
        recentUploads: 15
    };

    // Mock data for recent activitiess
    const recentActivities = [
        {
            id: '1',
            title: 'Mathematics Chapter 5 uploaded',
            time: '2 hours ago',
            icon: 'upload-file',
            color: '#667eea'
        },
        {
            id: '2',
            title: 'Science Quiz assigned to Class 8A',
            time: '5 hours ago',
            icon: 'assignment',
            color: '#f093fb'
        },
        {
            id: '3',
            title: '12 new students joined',
            time: '1 day ago',
            icon: 'people',
            color: '#43e97b'
        }
    ];

    // Handle tab change
    const handleTabPress = (tab: TabType) => {
        setActiveTab(tab);
    };

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

    // Handle notification press
    const handleNotificationPress = () => {
        console.log('Notifications pressed');
        // Add notification navigation logic here
    };

    // Dashboard handlers
    const handleLibraryPress = () => setActiveTab('library');
    const handleAssessmentPress = () => setActiveTab('assessment');
    const handleUploadPress = () => setActiveTab('upload');
    const handleAnalyticsPress = () => {
        console.log('Analytics pressed');
        // Add analytics navigation logic here
    };

    // Render tab content
    const renderTabContent = () => {
        switch (activeTab) {
            case 'upload':
                return (
                    <>
                        <Dashboard
                            stats={dashboardStats}
                            onLibraryPress={handleLibraryPress}
                            onAssessmentPress={handleAssessmentPress}
                            onUploadPress={handleUploadPress}
                            onAnalyticsPress={handleAnalyticsPress}
                            recentActivities={recentActivities}
                        />
                        {/* <Upload onFilesProcessed={handleFilesProcessed} /> */}
                    </>
                );
            case 'library':
                return <Library files={libraryFiles} onFileSelect={handleFileSelect} />;
            case 'assessment':
                return <Assessment />;
            default:
                return (
                    <Dashboard
                        stats={dashboardStats}
                        onLibraryPress={handleLibraryPress}
                        onAssessmentPress={handleAssessmentPress}
                        onUploadPress={handleUploadPress}
                        onAnalyticsPress={handleAnalyticsPress}
                        recentActivities={recentActivities}
                    />
                );
        }
    };

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            
            {/* Profile Header */}
            <ProfileHeader
                teacherName="Gokul Thirumal"
                notificationCount={3}
                onNotificationPress={handleNotificationPress}
            />

            {/* Tab Navigation */}
            <TabNavigation
                activeTab={activeTab}
                onTabPress={handleTabPress}
            />

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
    contentContainer: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingBottom: height * 0.05,
    },
    tabContent: {
        flex: 1,
        paddingHorizontal: width * 0.04,
    },
});

export default TeacherApp;