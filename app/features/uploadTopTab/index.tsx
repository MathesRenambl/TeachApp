import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import UploadComponent from '../uploadTopTab/components/upload';
import StudentModal from './components/studentModal'; // Import the new StudentModal component

const { width, height } = Dimensions.get('window');

interface StatCardProps {
    title: string;
    value: string;
    subtitle: string;
    icon: string;
    gradientColors: string[];
    onPress?: () => void;
}

const StatCard: React.FC<StatCardProps> = ({ 
    title, 
    value, 
    subtitle, 
    icon, 
    gradientColors, 
    onPress 
}) => (
    <TouchableOpacity style={styles.statCard} onPress={onPress} activeOpacity={0.8}>
        <LinearGradient
            colors={gradientColors}
            style={styles.statCardGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
        >
            <View style={styles.statCardContent}>
                <View style={styles.statCardHeader}>
                    <View style={styles.statIconContainer}>
                        <Icon name={icon as any} size={24} color="#FFFFFF" />
                    </View>
                    <Text style={styles.statValue}>{value}</Text>
                </View>
                <Text style={styles.statTitle}>{title}</Text>
                <Text style={styles.statSubtitle}>{subtitle}</Text>
            </View>
        </LinearGradient>
    </TouchableOpacity>
);

interface QuickActionProps {
    title: string;
    description: string;
    icon: string;
    color: string;
    onPress: () => void;
}

const QuickActionCard: React.FC<QuickActionProps> = ({ 
    title, 
    description, 
    icon, 
    color, 
    onPress 
}) => (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress} activeOpacity={0.8}>
        <View style={[styles.quickActionIcon, { backgroundColor: `${color}15` }]}>
            <Icon name={icon as any} size={28} color={color} />
        </View>
        <View style={styles.quickActionContent}>
            <Text style={styles.quickActionTitle}>{title}</Text>
            <Text style={styles.quickActionDescription}>{description}</Text>
        </View>
        <Icon name="arrow-forward-ios" size={16} color="#BDC3C7" />
    </TouchableOpacity>
);

interface ActivityItem {
    id: string;
    title: string;
    time: string;
    icon: string;
    color: string;
}

interface Stats {
    totalPDFs: number;
    activeAssessments: number;
    totalStudents: number;
    recentUploads: number;
}

interface UploadedFile {
    id: string;
    name: string;
    type: 'pdf' | 'image';
    size: string;
    uploadDate: string;
    status: 'uploading' | 'completed' | 'failed';
    uri?: string;
    progress?: number;
}

interface DashboardProps {
    stats?: Stats;
    onLibraryPress?: () => void;
    onAssessmentPress?: () => void;
    onUploadPress?: () => void;
    onAnalyticsPress?: () => void;
    recentActivities?: ActivityItem[];
    onFilesUploaded?: (files: UploadedFile[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
    stats = {
        totalPDFs: 127,
        activeAssessments: 8,
        totalStudents: 160, // Updated to match modal data
        recentUploads: 15
    },
    onLibraryPress = () => {},
    onAssessmentPress = () => {},
    onUploadPress = () => {},
    onAnalyticsPress = () => {},
    recentActivities = [
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
    ],
    onFilesUploaded
}) => {
    const [currentStats, setCurrentStats] = useState(stats);
    const [currentActivities, setCurrentActivities] = useState(recentActivities);
    const [showStudentModal, setShowStudentModal] = useState(false);

    // Handle file upload completion
    const handleFilesUploaded = (uploadedFiles: UploadedFile[]) => {
        // Update stats
        const pdfCount = uploadedFiles.filter(file => file.type === 'pdf').length;
        const imageCount = uploadedFiles.filter(file => file.type === 'image').length;
        
        setCurrentStats(prev => ({
            ...prev,
            totalPDFs: prev.totalPDFs + pdfCount,
            recentUploads: prev.recentUploads + uploadedFiles.length
        }));

        // Add new activities
        const newActivities = uploadedFiles.map(file => ({
            id: `upload_${file.id}`,
            title: `${file.name} uploaded successfully`,
            time: 'Just now',
            icon: file.type === 'pdf' ? 'picture-as-pdf' : 'image',
            color: file.type === 'pdf' ? '#FF6B6B' : '#4ECDC4'
        }));

        setCurrentActivities(prev => [...newActivities, ...prev.slice(0, 2)]);

        // Call parent callback
        onFilesUploaded?.(uploadedFiles);
    };

    const handleUploadStart = () => {
        console.log('Upload started...');
    };

    const handleUploadComplete = (files: UploadedFile[]) => {
        console.log('Upload completed:', files);
    };

    // Handle student card press
    const handleStudentCardPress = () => {
        setShowStudentModal(true);
    };

    return (
        <View style={styles.dashboardContainer}>
            {/* Statistics Cards */}
            <View style={styles.statsSection}>
                <Text style={styles.sectionTitle}>Overview</Text>
                <View style={styles.statsGrid}>
                    <StatCard
                        title="PDF Library"
                        value={currentStats.totalPDFs.toString()}
                        subtitle="Total documents"
                        icon="library-books"
                        gradientColors={['#667eea', '#764ba2']}
                        onPress={onLibraryPress}
                    />
                    <StatCard
                        title="Active Tests"
                        value={currentStats.activeAssessments.toString()}
                        subtitle="Ongoing assessments"
                        icon="assessment"
                        gradientColors={['#f093fb', '#f5576c']}
                        onPress={onAssessmentPress}
                    />
                </View>
                <View style={styles.statsGrid}>
                    <StatCard
                        title="Students"
                        value={currentStats.totalStudents.toString()}
                        subtitle="Enrolled learners"
                        icon="group"
                        gradientColors={['#4facfe', '#00f2fe']}
                        onPress={handleStudentCardPress} // Added onPress handler
                    />
                    <StatCard
                        title="This Week"
                        value={currentStats.recentUploads.toString()}
                        subtitle="New uploads"
                        icon="trending-up"
                        gradientColors={['#43e97b', '#38f9d7']}
                    />
                </View>
            </View>

            {/* Upload Component */}
            <UploadComponent
                onFilesUploaded={handleFilesUploaded}
                onUploadStart={handleUploadStart}
                onUploadComplete={handleUploadComplete} onFileUrlReceived={function (url: string): void {
                    throw new Error('Function not implemented.');
                } }            />

            {/* Quick Actions */}
            <View style={styles.quickActionsSection}>
                <Text style={styles.sectionTitle}>Quick Actions</Text>
                <View style={styles.quickActionsContainer}>
                    <QuickActionCard
                        title="Create Assessment"
                        description="Design tests and quizzes for students"
                        icon="quiz"
                        color="#f093fb"
                        onPress={onAssessmentPress}
                    />
                    <QuickActionCard
                        title="Browse Library"
                        description="Explore your document collection"
                        icon="folder-open"
                        color="#4facfe"
                        onPress={onLibraryPress}
                    />
                    <QuickActionCard
                        title="Student Analytics"
                        description="View performance and progress reports"
                        icon="analytics"
                        color="#43e97b"
                        onPress={onAnalyticsPress}
                    />
                    <QuickActionCard
                        title="View All Students"
                        description="Manage students by class and section"
                        icon="school"
                        color="#FF9500"
                        onPress={handleStudentCardPress} // Added student management action
                    />
                </View>
            </View>

            {/* Recent Activity */}
            <View style={styles.activitySection}>
                <Text style={styles.sectionTitle}>Recent Activity</Text>
                <View style={styles.activityContainer}>
                    {currentActivities.map((activity, index) => (
                        <View 
                            key={activity.id} 
                            style={[
                                styles.activityItem,
                                index === currentActivities.length - 1 && styles.lastActivityItem
                            ]}
                        >
                            <View style={[
                                styles.activityIcon, 
                                { backgroundColor: `${activity.color}15` }
                            ]}>
                                <Icon name={activity.icon as any} size={20} color={activity.color} />
                            </View>
                            <View style={styles.activityContent}>
                                <Text style={styles.activityTitle}>{activity.title}</Text>
                                <Text style={styles.activityTime}>{activity.time}</Text>
                            </View>
                        </View>
                    ))}
                </View>
            </View>

            {/* Student Modal */}
            <StudentModal
                visible={showStudentModal}
                onClose={() => setShowStudentModal(false)}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    dashboardContainer: {
        flex: 1,
    },
    sectionTitle: {
        fontSize: width * 0.05,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: height * 0.015,
        marginTop: height * 0.02,
    },
    statsSection: {
        marginBottom: height * 0.02,
    },
    statsGrid: {
        flexDirection: 'row',
        gap: width * 0.03,
        marginBottom: height * 0.015,
    },
    statCard: {
        flex: 1,
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    statCardGradient: {
        padding: width * 0.04,
        minHeight: height * 0.12,
        justifyContent: 'space-between',
    },
    statCardContent: {
        flex: 1,
    },
    statCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: height * 0.01,
    },
    statIconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 8,
        borderRadius: 12,
    },
    statValue: {
        fontSize: width * 0.08,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    statTitle: {
        fontSize: width * 0.035,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    statSubtitle: {
        fontSize: width * 0.03,
        color: 'rgba(255, 255, 255, 0.8)',
    },

    // Quick Actions
    quickActionsSection: {
        marginBottom: height * 0.02,
    },
    quickActionsContainer: {
        gap: height * 0.012,
    },
    quickActionCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: width * 0.04,
        flexDirection: 'row',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    quickActionIcon: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: width * 0.06,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width * 0.04,
    },
    quickActionContent: {
        flex: 1,
    },
    quickActionTitle: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 2,
    },
    quickActionDescription: {
        fontSize: width * 0.032,
        color: '#7F8C8D',
    },

    // Activity Section
    activitySection: {
        marginBottom: height * 0.02,
    },
    activityContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: width * 0.04,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    activityItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height * 0.015,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    lastActivityItem: {
        borderBottomWidth: 0,
    },
    activityIcon: {
        width: width * 0.1,
        height: width * 0.1,
        borderRadius: width * 0.05,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width * 0.03,
    },
    activityContent: {
        flex: 1,
    },
    activityTitle: {
        fontSize: width * 0.035,
        fontWeight: '500',
        color: '#2C3E50',
        marginBottom: 2,
    },
    activityTime: {
        fontSize: width * 0.03,
        color: '#7F8C8D',
    },
});

export default Dashboard;