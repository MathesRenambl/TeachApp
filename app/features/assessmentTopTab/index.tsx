import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeacherApp'>;

// JSON Data structure matching your HTML
const assessmentData = {
    stats: {
        total: 8,
        active: 3,
        avgScore: 87
    },
    categories: [
        { name: 'All', count: 8, active: true },
        { name: 'Active', count: 3, active: false },
        { name: 'Completed', count: 4, active: false },
        { name: 'Draft', count: 1, active: false }
    ],
    assessments: [
        {
            id: 1,
            title: 'Mathematics Chapter 3 Quiz',
            subject: 'Mathematics',
            grade: 'Grade 5',
            status: 'Active',
            statusColor: '#3B82F6',
            statusBg: '#DBEAFE',
            dueDate: '1/25/2024',
            questions: 15,
            completed: '1/2',
            avgScore: '85%',
            assignedTo: ['Emma Johnson', 'Liam Smith']
        },
        {
            id: 2,
            title: 'Science Lab Report',
            subject: 'Science',
            grade: 'Grade 4',
            status: 'Completed',
            statusColor: '#10B981',
            statusBg: '#D1FAE5',
            dueDate: '1/20/2024',
            questions: 10,
            completed: '1/1',
            avgScore: '92%',
            assignedTo: ['Sophia Davis']
        },
        {
            id: 3,
            title: 'English Reading Comprehension',
            subject: 'English',
            grade: 'Grade 6',
            status: 'Active',
            statusColor: '#3B82F6',
            statusBg: '#DBEAFE',
            dueDate: '1/28/2024',
            questions: 20,
            completed: '0/1',
            avgScore: null,
            assignedTo: ['Emma Johnson']
        },
        {
            id: 4,
            title: 'History Timeline Project',
            subject: 'History',
            grade: 'Grade 7',
            status: 'Draft',
            statusColor: '#6B7280',
            statusBg: '#F3F4F6',
            dueDate: '2/1/2024',
            questions: 12,
            completed: '0/0',
            avgScore: null,
            assignedTo: []
        }
    ]
};

// Empty state data (when no assessments exist)
const emptyAssessmentData = {
    stats: {
        total: 0,
        active: 0,
        avgScore: 0
    },
    categories: [
        { name: 'All', count: 0, active: true },
        { name: 'Active', count: 0, active: false },
        { name: 'Completed', count: 0, active: false },
        { name: 'Draft', count: 0, active: false }
    ],
    assessments: []
};

// No Data SVG Component
const NoDataSvg: React.FC = () => (
    <Svg width={width * 0.6} height={width * 0.4} viewBox="0 0 200 120">
        {/* Document stack */}
        <Rect x="60" y="40" width="80" height="60" rx="4" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
        <Rect x="55" y="35" width="80" height="60" rx="4" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
        <Rect x="50" y="30" width="80" height="60" rx="4" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="1" />

        {/* Lines on document */}
        <Rect x="60" y="45" width="50" height="2" fill="#D1D5DB" />
        <Rect x="60" y="55" width="40" height="2" fill="#D1D5DB" />
        <Rect x="60" y="65" width="45" height="2" fill="#D1D5DB" />

        {/* Magnifying glass */}
        <Circle cx="150" cy="50" r="12" fill="none" stroke="#9CA3AF" strokeWidth="2" />
        <Path d="M159 59L167 67" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />

        {/* Question mark */}
        <Path d="M90 20C90 18 91 16 93 16C95 16 96 18 96 20C96 22 95 23 94 24L93 26M93 30V32"
            stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" fill="none" />
    </Svg>
);

const Assessment: React.FC = () => {
    const navigation = useNavigation<Navigation>();

    // Set to true to show empty state, false to show data
    const [hasData, setHasData] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState('All');

    const currentData = hasData ? assessmentData : emptyAssessmentData;

    const handleCreateAssessmentClick = () => {
        navigation.navigate("CustomizerAssessment");
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active':
                return 'play-circle-outline';
            case 'Completed':
                return 'check-circle';
            case 'Draft':
                return 'description';
            default:
                return 'help-outline';
        }
    };

    const renderAssessmentCard = (assessment: any) => (
        <View key={assessment.id} style={styles.assessmentCard}>
            <View style={styles.assessmentHeader}>
                <View style={styles.assessmentInfo}>
                    <View style={styles.titleRow}>
                        <Text style={styles.assessmentTitle}>{assessment.title}</Text>
                        <View style={[styles.statusBadge, { backgroundColor: assessment.statusBg }]}>
                            <Icon
                                name={getStatusIcon(assessment.status)}
                                size={12}
                                color={assessment.statusColor}
                            />
                            <Text style={[styles.statusText, { color: assessment.statusColor }]}>
                                {assessment.status}
                            </Text>
                        </View>
                    </View>
                    <Text style={styles.subjectGrade}>
                        {assessment.subject} • {assessment.grade}
                    </Text>
                    {assessment.assignedTo.length > 0 && (
                        <View style={styles.assignedRow}>
                            <Text style={styles.assignedLabel}>Assigned to:</Text>
                            <View style={styles.assignedContainer}>
                                {assessment.assignedTo.map((student: string, index: number) => (
                                    <View key={index} style={styles.studentTag}>
                                        <Text style={styles.studentText}>{student}</Text>
                                    </View>
                                ))}
                            </View>
                        </View>
                    )}
                </View>
                <TouchableOpacity style={styles.moreButton}>
                    <Icon name="more-vert" size={20} color="#9CA3AF" />
                </TouchableOpacity>
            </View>

            <View style={styles.assessmentDetails}>
                <View style={styles.detailItem}>
                    <Icon name="calendar-today" size={14} color="#6B7280" />
                    <Text style={styles.detailText}>Due: {assessment.dueDate}</Text>
                </View>
                <View style={styles.detailItem}>
                    <Icon name="help-outline" size={14} color="#6B7280" />
                    <Text style={styles.detailText}>{assessment.questions} questions</Text>
                </View>
                <View style={styles.detailItem}>
                    <Icon name="person-outline" size={14} color="#6B7280" />
                    <Text style={styles.detailText}>{assessment.completed} completed</Text>
                </View>
                {assessment.avgScore && (
                    <View style={styles.detailItem}>
                        <Icon name="emoji-events" size={14} color="#6B7280" />
                        <Text style={styles.detailText}>Avg: {assessment.avgScore}</Text>
                    </View>
                )}
            </View>

            {assessment.status !== 'Draft' && (
                <View style={styles.assessmentActions}>
                    <TouchableOpacity style={styles.viewResultsButton}>
                        <Text style={styles.viewResultsText}>View Results</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.editButton}>
                        <Text style={styles.editButtonText}>Edit</Text>
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );

    return (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
                {/* Header Card */}
                <View style={styles.headerCard}>
                    <LinearGradient
                        colors={['#667eea', '#764ba2']}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.gradientBackground}
                    >
                        <View style={styles.headerContent}>
                            <View style={styles.headerText}>
                                <Text style={styles.headerTitle}>Assessment Center</Text>
                                <Text style={styles.headerSubtitle}>
                                    Create and manage assessments for your student or children
                                </Text>
                            </View>
                            <View style={styles.headerIcon}>
                                <Icon name="assignment" size={32} color="rgba(255,255,255,0.8)" />
                            </View>
                        </View>

                        <View style={styles.statsContainer}>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{currentData.stats.total}</Text>
                                <Text style={styles.statLabel}>Total</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{currentData.stats.active}</Text>
                                <Text style={styles.statLabel}>Active</Text>
                            </View>
                            <View style={styles.statItem}>
                                <Text style={styles.statNumber}>{currentData.stats.avgScore}%</Text>
                                <Text style={styles.statLabel}>Avg Score</Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>


                {/* Filter Categories */}
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.categoriesContainer}
                >
                    {currentData.categories.map((category, index) => (
                        <TouchableOpacity
                            key={index}
                            style={[
                                styles.categoryButton,
                                selectedCategory === category.name && styles.categoryButtonActive
                            ]}
                            onPress={() => setSelectedCategory(category.name)}
                        >
                            <Text style={[
                                styles.categoryText,
                                selectedCategory === category.name && styles.categoryTextActive
                            ]}>
                                {category.name} ({category.count})
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>

                {/* Create Assessment Button */}

                <LinearGradient
                    colors={['#43e97b', '#38f9d7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButtonBackground} // handles gradient & rounded corners
                >
                    <TouchableOpacity
                        style={styles.createAssessmentButton}
                        onPress={handleCreateAssessmentClick}
                        activeOpacity={0.8}
                    >
                        <View style={styles.createAssessmentContent}>
                            <Icon name="add" size={24} color="#FFFFFF" />
                            <Text style={styles.createAssessmentText}>Create New Assessment</Text>
                        </View>
                    </TouchableOpacity>
                </LinearGradient>


                {/* Recent Assessments */}
                <Text style={styles.sectionTitle}>Recent Assessments</Text>

                {currentData.assessments.length > 0 ? (
                    <View style={styles.assessmentsContainer}>
                        {currentData.assessments.map(renderAssessmentCard)}
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <NoDataSvg />
                        <Text style={styles.emptyStateTitle}>No Assessments Yet</Text>
                        <Text style={styles.emptyStateSubtitle}>
                            Create your first assessment to get started with tracking your children's progress
                        </Text>
                        {/* <TouchableOpacity
                            style={styles.emptyStateButton}
                            onPress={handleCreateAssessmentClick}
                        >
                            <Text style={styles.emptyStateButtonText}>Create Assessment</Text>
                        </TouchableOpacity> */}
                    </View>
                )}

                {/* Toggle button for demo purposes */}
                {/* <TouchableOpacity 
                    style={styles.toggleButton}
                    onPress={() => setHasData(!hasData)}
                >
                    <Text style={styles.toggleButtonText}>
                        Toggle to {hasData ? 'Empty' : 'Data'} State
                    </Text>
                </TouchableOpacity> */}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    scrollView: {
        flex: 1,
        // paddingHorizontal: width * 0.04,
        paddingTop: height * 0.02,
    },
    headerCard: {
        borderRadius: width * 0.04,
        marginBottom: height * 0.02,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden', // clip gradient inside rounded corners
    },
    gradientBackground: {
        borderRadius: width * 0.04,
        padding: width * 0.04,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: height * 0.02,
    },
    headerText: {
        flex: 1,
    },
    headerTitle: {
        color: '#FFFFFF',
        fontSize: width * 0.05,
        fontWeight: 'bold',
        marginBottom: height * 0.005,
    },
    headerSubtitle: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: width * 0.035,
    },
    headerIcon: {
        width: width * 0.16,
        height: width * 0.16,
        backgroundColor: 'rgba(255,255,255,0.2)',
        borderRadius: width * 0.08,
        alignItems: 'center',
        justifyContent: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    statItem: {
        alignItems: 'center',
    },
    statNumber: {
        color: '#FFFFFF',
        fontSize: width * 0.06,
        fontWeight: 'bold',
    },
    statLabel: {
        color: 'rgba(255,255,255,0.8)',
        fontSize: width * 0.03,
        marginTop: 2,
    },
    categoriesContainer: {
        marginBottom: height * 0.015,
    },
    categoryButton: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.01,
        borderRadius: width * 0.06,
        marginRight: width * 0.02,
    },
    categoryButtonActive: {
        backgroundColor: '#5108fbfb',
    },
    categoryText: {
        color: '#6B7280',
        fontSize: width * 0.035,
        fontWeight: '500',
    },
    categoryTextActive: {
        color: '#FFFFFF',
    },
    gradientButtonBackground: {
        borderRadius: width * 0.03,
        marginBottom: height * 0.02,
        shadowColor: '#10B981',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },

    createAssessmentButton: {
        borderRadius: width * 0.03,
        overflow: 'hidden', // keeps touch area inside rounded gradient
    },

    createAssessmentContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height * 0.018,
        paddingHorizontal: width * 0.06,
    },
    createAssessmentText: {
        color: '#FFFFFF',
        fontSize: width * 0.042,
        fontWeight: '600',
        marginLeft: width * 0.02,
    },

    sectionTitle: {
        fontSize: width * 0.045,
        fontWeight: '600',
        color: '#1F2937',
        marginBottom: height * 0.015,
    },
    assessmentsContainer: {
        // paddingBottom: height * 0.1,
    },
    assessmentCard: {
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.04,
        padding: width * 0.04,
        marginBottom: height * 0.015,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    assessmentHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: height * 0.015,
    },
    assessmentInfo: {
        flex: 1,
    },
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.005,
        flexWrap: 'wrap',
    },
    assessmentTitle: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#1F2937',
        flex: 1,
        marginRight: width * 0.02,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.003,
        borderRadius: width * 0.04,
        gap: 4,
    },
    statusText: {
        fontSize: width * 0.03,
        fontWeight: '500',
    },
    subjectGrade: {
        fontSize: width * 0.032,
        color: '#6B7280',
        marginBottom: height * 0.005,
    },
    assignedRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: height * 0.005,
    },
    assignedLabel: {
        fontSize: width * 0.03,
        color: '#9CA3AF',
        marginRight: width * 0.02,
    },
    assignedContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 4,
    },
    studentTag: {
        backgroundColor: '#D1FAE5',
        paddingHorizontal: width * 0.02,
        paddingVertical: 2,
        borderRadius: width * 0.04,
    },
    studentText: {
        fontSize: width * 0.03,
        color: '#059669',
    },
    moreButton: {
        padding: height * 0.005,
        borderRadius: width * 0.02,
    },
    assessmentDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: height * 0.015,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: width * 0.06,
        marginBottom: height * 0.005,
        flex: 0.48,
    },
    detailText: {
        fontSize: width * 0.03,
        color: '#6B7280',
        marginLeft: width * 0.015,
    },
    assessmentActions: {
        flexDirection: 'row',
        gap: width * 0.02,
        paddingTop: height * 0.01,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
    },
    viewResultsButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#10B981',
        borderRadius: width * 0.02,
        paddingVertical: height * 0.01,
        alignItems: 'center',
    },
    viewResultsText: {
        color: '#10B981',
        fontSize: width * 0.035,
        fontWeight: '500',
    },
    editButton: {
        flex: 1,
        backgroundColor: '#E5E7EB',
        borderRadius: width * 0.02,
        paddingVertical: height * 0.01,
        alignItems: 'center',
    },
    editButtonText: {
        color: '#374151',
        fontSize: width * 0.035,
        fontWeight: '500',
    },
    emptyState: {
        alignItems: 'center',
        // paddingVertical: height * 0.08,
    },
    emptyStateTitle: {
        fontSize: width * 0.05,
        fontWeight: '600',
        color: '#374151',
        marginTop: height * 0.02,
        marginBottom: height * 0.01,
    },
    emptyStateSubtitle: {
        fontSize: width * 0.037,
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: width * 0.05,
        marginBottom: height * 0.03,
        paddingHorizontal: width * 0.08,
    },
    emptyStateButton: {
        backgroundColor: '#8B5CF6',
        paddingHorizontal: width * 0.08,
        paddingVertical: height * 0.015,
        borderRadius: width * 0.03,
    },
    emptyStateButtonText: {
        color: '#FFFFFF',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
    toggleButton: {
        backgroundColor: '#3B82F6',
        padding: height * 0.02,
        borderRadius: width * 0.03,
        marginBottom: height * 0.05,
        alignItems: 'center',
    },
    toggleButtonText: {
        color: '#FFFFFF',
        fontSize: width * 0.04,
        fontWeight: '600',
    },
});

export default Assessment;