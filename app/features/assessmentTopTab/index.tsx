import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, ScrollView, Modal, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useNavigation } from '@react-navigation/native';
import Svg, { Path, Circle, Rect } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeacherApp'>;

// Mock data for grades, sections, and students
const gradeData = [
    {
        id: 1,
        name: 'Grade 5',
        sections: [
            {
                id: 'A',
                name: 'A',
                students: [
                    { id: 1, name: 'Emma Johnson', avatar: 'EJ' },
                    { id: 2, name: 'Liam Smith', avatar: 'LS' },
                    { id: 3, name: 'Olivia Brown', avatar: 'OB' },
                    { id: 4, name: 'Noah Davis', avatar: 'ND' }
                ]
            },
            {
                id: 'B',
                name: 'B',
                students: [
                    { id: 11, name: 'New Student1', avatar: 'NS1' },
                    { id: 12, name: 'New Student2', avatar: 'NS2' }
                ]
            }
        ]
    },
    {
        id: 2,
        name: 'Grade 4',
        sections: [
            {
                id: 'B',
                name: 'B',
                students: [
                    { id: 5, name: 'Sophia Wilson', avatar: 'SW' },
                    { id: 6, name: 'Mason Miller', avatar: 'MM' },
                    { id: 7, name: 'Isabella Garcia', avatar: 'IG' }
                ]
            }
        ]
    },
    {
        id: 3,
        name: 'Grade 6',
        sections: [
            {
                id: 'C',
                name: 'C',
                students: [
                    { id: 8, name: 'Ethan Martinez', avatar: 'EM' },
                    { id: 9, name: 'Ava Anderson', avatar: 'AA' },
                    { id: 10, name: 'Lucas Taylor', avatar: 'LT' }
                ]
            }
        ]
    }
];

// Mock chapter data per subject
const chapterData: { [key: string]: string[] } = {
    'Mathematics': ['Chapter 1: Numbers', 'Chapter 2: Algebra', 'Chapter 3: Geometry'],
    'Science': ['Chapter 1: Biology', 'Chapter 2: Physics', 'Chapter 3: Chemistry'],
    'English': ['Chapter 1: Grammar', 'Chapter 2: Reading', 'Chapter 3: Writing'],
    'History': ['Chapter 1: Ancient History', 'Chapter 2: Medieval History', 'Chapter 3: Modern History']
};

// Mock results data for assessments
const resultsData: { [key: number]: { student: string; score: string; status: string; timeSpent?: string; attempts?: number }[] } = {
    1: [
        { student: 'Gokul', score: '85%', status: 'Completed', timeSpent: '45 min', attempts: 1 },
        { student: 'Mani', score: '90%', status: 'Completed', timeSpent: '38 min', attempts: 1 },
        { student: 'Messi', score: 'Not Submitted', status: 'Pending', timeSpent: '-', attempts: 0 },
        { student: 'Lebron', score: 'Not Submitted', status: 'Pending', timeSpent: '-', attempts: 0 }
    ],
    2: [
        { student: 'Mani', score: '92%', status: 'Completed', timeSpent: '52 min', attempts: 1 },
        { student: 'Wick', score: '88%', status: 'Completed', timeSpent: '47 min', attempts: 2 },
        { student: 'kesavaa', score: '95%', status: 'Completed', timeSpent: '41 min', attempts: 1 }
    ]
};

// JSON Data structure matching your requirements
const assessmentData = {
    stats: {
        total: 4,
        active: 1,
        avgScore: 87
    },
    categories: [
        { name: 'Active', count: 1, active: true },
        { name: 'Inactive', count: 2, active: false },
        { name: 'Completed', count: 1, active: false }
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
            completed: '2/4',
            avgScore: '85%',
            isAssigned: true
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
            completed: '3/3',
            avgScore: '92%',
            isAssigned: true
        },
        {
            id: 3,
            title: 'English Reading Comprehension',
            subject: 'English',
            grade: 'Grade 6',
            status: 'Inactive',
            statusColor: '#6B7280',
            statusBg: '#F3F4F6',
            dueDate: '1/28/2024',
            questions: 20,
            completed: '0/0',
            avgScore: null,
            isAssigned: false
        },
        {
            id: 4,
            title: 'History Timeline Project',
            subject: 'History',
            grade: 'Grade 7',
            status: 'Inactive',
            statusColor: '#6B7280',
            statusBg: '#F3F4F6',
            dueDate: '2/1/2024',
            questions: 12,
            completed: '0/0',
            avgScore: null,
            isAssigned: false
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
        { name: 'Active', count: 0, active: true },
        { name: 'Inactive', count: 0, active: false },
        { name: 'Completed', count: 0, active: false }
    ],
    assessments: []
};

// No Data SVG Component
const NoDataSvg: React.FC = () => (
    <Svg width={width * 0.6} height={width * 0.4} viewBox="0 0 200 120">
        <Rect x="60" y="40" width="80" height="60" rx="4" fill="#E5E7EB" stroke="#D1D5DB" strokeWidth="1" />
        <Rect x="55" y="35" width="80" height="60" rx="4" fill="#F3F4F6" stroke="#D1D5DB" strokeWidth="1" />
        <Rect x="50" y="30" width="80" height="60" rx="4" fill="#F9FAFB" stroke="#D1D5DB" strokeWidth="1" />
        <Rect x="60" y="45" width="50" height="2" fill="#D1D5DB" />
        <Rect x="60" y="55" width="40" height="2" fill="#D1D5DB" />
        <Rect x="60" y="65" width="45" height="2" fill="#D1D5DB" />
        <Circle cx="150" cy="50" r="12" fill="none" stroke="#9CA3AF" strokeWidth="2" />
        <Path d="M159 59L167 67" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" />
        <Path d="M90 20C90 18 91 16 93 16C95 16 96 18 96 20C96 22 95 23 94 24L93 26M93 30V32"
            stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" fill="none" />
    </Svg>
);

const Assessment: React.FC = () => {
    const navigation = useNavigation<Navigation>();
    const [hasData, setHasData] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState('Active');
    const [assignModalVisible, setAssignModalVisible] = useState(false);
    const [resultsModalVisible, setResultsModalVisible] = useState(false);
    const [selectedAssessment, setSelectedAssessment] = useState<any>(null);
    const [selectedGrade, setSelectedGrade] = useState<any>(null);
    const [selectedSection, setSelectedSection] = useState<any>(null);
    const [selectedChapter, setSelectedChapter] = useState<string | null>(null);
    const [selectedStudents, setSelectedStudents] = useState<number[]>([]);
    const [isAssigning, setIsAssigning] = useState(false);
    const [assignmentStep, setAssignmentStep] = useState(1);

    const currentData = hasData ? assessmentData : emptyAssessmentData;
    const filteredAssessments = currentData.assessments.filter(
        (assessment: any) => assessment.status === selectedCategory
    );

    const handleCreateAssessmentClick = () => {
        navigation.navigate("CustomizerAssessment");
    };

    const handleAssignClick = (assessment: any) => {
        setSelectedAssessment(assessment);
        setAssignModalVisible(true);
        setSelectedGrade(null);
        setSelectedSection(null);
        setSelectedChapter(null);
        setSelectedStudents([]);
        setAssignmentStep(1);
        setIsAssigning(false);
    };

    const handleViewResultsClick = (assessment: any) => {
        setSelectedAssessment(assessment);
        setResultsModalVisible(true);
    };

    const handleStudentSelect = (studentId: number) => {
        setSelectedStudents(prev =>
            prev.includes(studentId)
                ? prev.filter(id => id !== studentId)
                : [...prev, studentId]
        );
    };
    
    const handleSelectAllStudents = () => {
        if (selectedSection) {
            const allStudentIds = selectedSection.students.map((s: any) => s.id);
            if (selectedStudents.length === allStudentIds.length) {
                // Deselect all
                setSelectedStudents([]);
            } else {
                // Select all
                setSelectedStudents(allStudentIds);
            }
        }
    };

    const handleAssignAssessment = async () => {
        setIsAssigning(true);
        setAssignmentStep(2);

        // Simulate assignment process
        // await new Promise(resolve => setTimeout(resolve, 1000));

        setAssignmentStep(3);
        // await new Promise(resolve => setTimeout(resolve, 1500));

        console.log('Assigning assessment:', selectedAssessment?.title);
        console.log('To grade:', selectedGrade?.name);
        console.log('To section:', selectedSection?.name);
        console.log('To chapter:', selectedChapter);
        console.log('To students:', selectedStudents);

        // Reset states
        setTimeout(() => {
            setAssignModalVisible(false);
            setSelectedAssessment(null);
            setSelectedGrade(null);
            setSelectedSection(null);
            setSelectedChapter(null);
            setSelectedStudents([]);
            setIsAssigning(false);
            setAssignmentStep(1);
        }, 1000);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Active':
                return 'play-circle-outline';
            case 'Completed':
                return 'check-circle';
            case 'Inactive':
                return 'pause-circle-outline';
            default:
                return 'help-outline';
        }
    };

    const getStepIcon = (step: number) => {
        switch (step) {
            case 1:
                return 'assignment-turned-in';
            case 2:
                return 'cloud-upload';
            case 3:
                return 'check-circle';
            default:
                return 'assignment';
        }
    };

    const getStepTitle = (step: number) => {
        switch (step) {
            case 1:
                return 'Assignment Details';
            case 2:
                return 'Processing Assignment';
            case 3:
                return 'Assignment Complete!';
            default:
                return 'Assigning...';
        }
    };

    const getStepDescription = (step: number) => {
        switch (step) {
            case 1:
                return 'Review and confirm assignment details';
            case 2:
                return 'Sending notifications to students...';
            case 3:
                return 'Assessment successfully assigned to students';
            default:
                return '';
        }
    };

    const getScoreColor = (score: string) => {
        const numScore = parseInt(score);
        if (numScore >= 90) return '#10B981';
        if (numScore >= 80) return '#F59E0B';
        if (numScore >= 70) return '#EF4444';
        return '#6B7280';
    };

    const renderStudentItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.studentItem,
                selectedStudents.includes(item.id) && styles.studentItemSelected
            ]}
            onPress={() => handleStudentSelect(item.id)}
            disabled={isAssigning}
        >
            <View style={styles.studentInfo}>
                <View style={styles.studentAvatar}>
                    <Text style={styles.avatarText}>{item.avatar}</Text>
                </View>
                <Text style={styles.studentName}>{item.name}</Text>
            </View>
            <View style={[
                styles.checkbox,
                selectedStudents.includes(item.id) && styles.checkboxSelected
            ]}>
                {selectedStudents.includes(item.id) && (
                    <Icon name="check" size={16} color="#FFFFFF" />
                )}
            </View>
        </TouchableOpacity>
    );

    const renderResultItem = ({ item }: { item: { student: string; score: string; status: string; timeSpent?: string; attempts?: number } }) => (
        <View style={styles.resultItem}>
            <View style={styles.resultHeader}>
                <View style={styles.studentInfo}>
                    <View style={styles.studentAvatar}>
                        <Text style={styles.avatarText}>{item.student.slice(0, 2).toUpperCase()}</Text>
                    </View>
                    <View style={styles.studentDetails}>
                        <Text style={styles.studentName}>{item.student}</Text>
                        <Text style={styles.studentSubInfo}>
                            Time: {item.timeSpent} • Attempts: {item.attempts}
                        </Text>
                    </View>
                </View>
                <View style={styles.resultDetails}>
                    <Text style={[
                        styles.resultScore,
                        { color: item.score !== 'Not Submitted' ? getScoreColor(item.score) : '#6B7280' }
                    ]}>
                        {item.score}
                    </Text>
                    <View style={[
                        styles.statusIndicator,
                        { backgroundColor: item.status === 'Completed' ? '#D1FAE5' : '#FEF3C7' }
                    ]}>
                        <Text style={[
                            styles.resultStatus,
                            { color: item.status === 'Completed' ? '#10B981' : '#F59E0B' }
                        ]}>
                            {item.status}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );

    const renderAssignmentProgress = () => (
        <View style={styles.assignmentProgressContainer}>
            <View style={styles.progressHeader}>
                <Icon name={getStepIcon(assignmentStep)} size={32} color="#8B5CF6" />
                <Text style={styles.progressTitle}>{getStepTitle(assignmentStep)}</Text>
                <Text style={styles.progressDescription}>{getStepDescription(assignmentStep)}</Text>
            </View>

            {assignmentStep === 1 && (
                <View style={styles.assignmentSummary}>
                    <Text style={styles.summaryTitle}>Assignment Summary</Text>
                    <View style={styles.summaryItem}>
                        <Icon name="school" size={16} color="#6B7280" />
                        <Text style={styles.summaryText}>
                            {selectedGrade?.name} - Section {selectedSection?.name}
                        </Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Icon name="book" size={16} color="#6B7280" />
                        <Text style={styles.summaryText}>{selectedChapter}</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Icon name="people" size={16} color="#6B7280" />
                        <Text style={styles.summaryText}>{selectedStudents.length} students selected</Text>
                    </View>
                    <View style={styles.summaryItem}>
                        <Icon name="schedule" size={16} color="#6B7280" />
                        <Text style={styles.summaryText}>Due: {selectedAssessment?.dueDate}</Text>
                    </View>
                </View>
            )}

            {assignmentStep === 2 && (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#8B5CF6" />
                    <Text style={styles.loadingText}>Sending notifications...</Text>
                    <Text style={styles.loadingSubtext}>Please wait while we notify all selected students</Text>
                </View>
            )}

            {assignmentStep === 3 && (
                <View style={styles.successContainer}>
                    <Icon name="check-circle" size={48} color="#10B981" />
                    <Text style={styles.successText}>Successfully Assigned!</Text>
                    <Text style={styles.successSubtext}>
                        {selectedStudents.length} students have been notified
                    </Text>
                </View>
            )}
        </View>
    );

    const renderResultsAnalytics = () => {
        const results = resultsData[selectedAssessment?.id] || [];
        const completed = results.filter(r => r.status === 'Completed').length;
        const pending = results.filter(r => r.status === 'Pending').length;
        const avgScore = completed > 0 
            ? Math.round(results.reduce((sum, r) => sum + (r.score !== 'Not Submitted' ? parseInt(r.score) : 0), 0) / completed)
            : 0;

        return (
            <View style={styles.analyticsContainer}>
                <Text style={styles.analyticsTitle}>Performance Overview</Text>
                <View style={styles.analyticsCards}>
                    <View style={styles.analyticsCard}>
                        <Text style={styles.analyticsNumber}>{completed}</Text>
                        <Text style={styles.analyticsLabel}>Completed</Text>
                        <Icon name="check-circle" size={20} color="#10B981" />
                    </View>
                    <View style={styles.analyticsCard}>
                        <Text style={styles.analyticsNumber}>{pending}</Text>
                        <Text style={styles.analyticsLabel}>Pending</Text>
                        <Icon name="schedule" size={20} color="#F59E0B" />
                    </View>
                    <View style={styles.analyticsCard}>
                        <Text style={styles.analyticsNumber}>{avgScore}%</Text>
                        <Text style={styles.analyticsLabel}>Avg Score</Text>
                        <Icon name="trending-up" size={20} color="#8B5CF6" />
                    </View>
                </View>
            </View>
        );
    };

    // ++ NEW ++ This is the newly created modal for the assignment flow.
    const renderAssignModal = () => {
        const chapters = chapterData[selectedAssessment?.subject] || [];
        const isNextDisabled = !selectedGrade || !selectedSection || !selectedChapter || selectedStudents.length === 0;

        return (
            <Modal
                animationType="slide"
                transparent={true}
                visible={assignModalVisible}
                onRequestClose={() => !isAssigning && setAssignModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>{assignmentStep === 1 ? 'Assign Assessment' : getStepTitle(assignmentStep)}</Text>
                            {!isAssigning && (
                                <TouchableOpacity
                                    style={styles.closeButton}
                                    onPress={() => setAssignModalVisible(false)}
                                >
                                    <Icon name="close" size={24} color="#6B7280" />
                                </TouchableOpacity>
                            )}
                        </View>

                        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                            {assignmentStep === 1 ? (
                                <>
                                    <Text style={styles.sectionLabel}>Select Grade</Text>
                                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classContainer}>
                                        {gradeData.map(grade => (
                                            <TouchableOpacity key={grade.id} style={[styles.classCard, selectedGrade?.id === grade.id && styles.classCardSelected]} onPress={() => { setSelectedGrade(grade); setSelectedSection(null); setSelectedStudents([]); }}>
                                                <Icon name="class" size={24} color={selectedGrade?.id === grade.id ? '#FFFFFF' : '#8B5CF6'} />
                                                <Text style={[styles.className, selectedGrade?.id === grade.id && styles.classNameSelected]}>{grade.name}</Text>
                                            </TouchableOpacity>
                                        ))}
                                    </ScrollView>

                                    {selectedGrade && (
                                        <>
                                            <Text style={styles.sectionLabel}>Select Section</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classContainer}>
                                                {selectedGrade.sections.map((section: any) => (
                                                    <TouchableOpacity key={section.id} style={[styles.classCard, selectedSection?.id === section.id && styles.classCardSelected]} onPress={() => { setSelectedSection(section); setSelectedStudents([]); }}>
                                                        <Text style={[styles.className, selectedSection?.id === section.id && styles.classNameSelected]}>Section {section.name}</Text>
                                                        <Text style={[styles.studentCount, selectedSection?.id === section.id && styles.studentCountSelected]}>{section.students.length} students</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>
                                        </>
                                    )}
                                    
                                    {selectedSection && (
                                        <>
                                            <Text style={styles.sectionLabel}>Select Chapter</Text>
                                            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.classContainer}>
                                                {chapters.map((chapter) => (
                                                    <TouchableOpacity key={chapter} style={[styles.classCard, selectedChapter === chapter && styles.classCardSelected]} onPress={() => setSelectedChapter(chapter)}>
                                                        <Text style={[styles.className, selectedChapter === chapter && styles.classNameSelected]}>{chapter}</Text>
                                                    </TouchableOpacity>
                                                ))}
                                            </ScrollView>

                                            <View style={styles.selectAllContainer}>
                                                <Text style={styles.sectionLabel}>Select Students</Text>
                                                <TouchableOpacity style={styles.selectAllButton} onPress={handleSelectAllStudents}>
                                                    <Text style={styles.selectAllText}>{selectedStudents.length === selectedSection.students.length ? 'Deselect All' : 'Select All'}</Text>
                                                </TouchableOpacity>
                                            </View>
                                            <FlatList
                                                data={selectedSection.students}
                                                renderItem={renderStudentItem}
                                                keyExtractor={(item) => item.id.toString()}
                                                style={styles.studentList}
                                            />
                                        </>
                                    )}
                                </>
                            ) : renderAssignmentProgress()}
                        </ScrollView>
                        
                        {assignmentStep === 1 && (
                            <View style={styles.modalActions}>
                                <TouchableOpacity
                                    style={[styles.exportButton, isNextDisabled && styles.assignButtonDisabled]}
                                    onPress={handleAssignAssessment}
                                    disabled={isNextDisabled}
                                >
                                    <Text style={styles.exportButtonText}>Assign Now</Text>
                                </TouchableOpacity>
                            </View>
                        )}
                    </View>
                </View>
            </Modal>
        );
    };

    // ++ FIXED ++ Renamed from renderAssignModal to renderResultsModal and connected to correct state.
    const renderResultsModal = () => (
        <Modal
            animationType="slide"
            transparent={true}
            visible={resultsModalVisible} // Use correct state variable
            onRequestClose={() => setResultsModalVisible(false)} // Use correct state setter
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalTitle}>Assessment Results</Text> {/* Updated Title */}
                        <TouchableOpacity
                            style={styles.closeButton}
                            onPress={() => setResultsModalVisible(false)}
                        >
                            <Icon name="close" size={24} color="#6B7280" />
                        </TouchableOpacity>
                    </View>

                    <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                        <View style={styles.assessmentDetailsContainer}>
                            <Text style={styles.assessmentTitle}>{selectedAssessment?.title}</Text>
                            <View style={styles.detailItem}>
                                <Icon name="school" size={14} color="#6B7280" />
                                <Text style={styles.detailText}>
                                    {selectedAssessment?.subject} • {selectedAssessment?.grade}
                                </Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Icon name="calendar-today" size={14} color="#6B7280" />
                                <Text style={styles.detailText}>Due: {selectedAssessment?.dueDate}</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Icon name="help-outline" size={14} color="#6B7280" />
                                <Text style={styles.detailText}>{selectedAssessment?.questions} questions</Text>
                            </View>
                            <View style={styles.detailItem}>
                                <Icon name="emoji-events" size={14} color="#6B7280" />
                                <Text style={styles.detailText}>Avg: {selectedAssessment?.avgScore || 'N/A'}</Text>
                            </View>
                        </View>

                        {renderResultsAnalytics()}

                        <Text style={styles.sectionLabel}>Individual Results</Text>
                        <FlatList
                            data={resultsData[selectedAssessment?.id] || []}
                            renderItem={renderResultItem}
                            keyExtractor={(item, index) => `${item.student}-${index}`}
                            style={styles.studentList}
                            showsVerticalScrollIndicator={false}
                            ListEmptyComponent={
                                <View style={styles.emptyResultsContainer}>
                                    <Icon name="assessment" size={48} color="#D1D5DB" />
                                    <Text style={styles.emptyResultsTitle}>No Results Available</Text>
                                    <Text style={styles.emptyResultsText}>
                                        Results will appear here once students complete the assessment
                                    </Text>
                                </View>
                            }
                        />
                    </ScrollView>

                    <View style={styles.modalActions}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => setResultsModalVisible(false)}
                        >
                            <Text style={styles.cancelButtonText}>Close</Text>
                        </TouchableOpacity>
                        {/* <TouchableOpacity
                            style={styles.exportButton}
                            onPress={() => {
                                alert('Exporting results...');
                            }}
                        >
                            <Icon name="download" size={16} color="#FFFFFF" />
                            <Text style={styles.exportButtonText}>Export</Text>
                        </TouchableOpacity> */}
                    </View>
                </View>
            </View>
        </Modal>
    );

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

            <View style={styles.assessmentActions}>
                {assessment.status === 'Active' && assessment.isAssigned ? (
                    <TouchableOpacity
                        style={styles.viewResultsButton}
                        onPress={() => handleViewResultsClick(assessment)}
                    >
                        <Text style={styles.viewResultsText}>View Results</Text>
                    </TouchableOpacity>
                ) : assessment.status === 'Completed' ? (
                    <TouchableOpacity
                        style={styles.viewResultsButton}
                        onPress={() => handleViewResultsClick(assessment)}
                    >
                        <Text style={styles.viewResultsText}>View Results</Text>
                    </TouchableOpacity>
                ) : !assessment.isAssigned ? (
                    <TouchableOpacity
                        style={styles.assignButton}
                        onPress={() => handleAssignClick(assessment)}
                    >
                        <Icon name="person-add" size={16} color="#8B5CF6" />
                        <Text style={styles.assignButtonText}>Assign</Text>
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );

    return (
        <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            <View style={styles.container}>
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

                <LinearGradient
                    colors={['#43e97b', '#38f9d7']}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.gradientButtonBackground}
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

                <Text style={styles.sectionTitle}>Recent Assessments</Text>

                {filteredAssessments.length > 0 ? (
                    <View style={styles.assessmentsContainer}>
                        {filteredAssessments.map(renderAssessmentCard)}
                    </View>
                ) : currentData.assessments.length === 0 ? (
                    <View style={styles.emptyState}>
                        <NoDataSvg />
                        <Text style={styles.emptyStateTitle}>No Assessments Yet</Text>
                        <Text style={styles.emptyStateSubtitle}>
                            Create your first assessment to get started with tracking your children's progress
                        </Text>
                    </View>
                ) : (
                    <View style={styles.emptyState}>
                        <NoDataSvg />
                        <Text style={styles.emptyStateTitle}>No {selectedCategory} Assessments</Text>
                        <Text style={styles.emptyStateSubtitle}>
                            There are no assessments in this category.
                        </Text>
                    </View>
                )}

                {renderAssignModal()}
                {renderResultsModal()}
            </View>
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        paddingHorizontal: width * 0.01,
    },
    scrollView: {
        flex: 1,
        paddingTop: height * 0.02,
    },
    headerCard: {
        borderRadius: width * 0.05,
        marginBottom: height * 0.02,
        shadowColor: '#8B5CF6',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
        overflow: 'hidden',
    },
    gradientBackground: {
        borderRadius: width * 0.05,
        padding: width * 0.04,
    },
    headerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: height * 0.03,
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
        paddingHorizontal: -width * 0.04, 
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
        overflow: 'hidden',
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
        paddingBottom: height * 0.1,
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
    moreButton: {
        padding: height * 0.005,
        borderRadius: width * 0.02,
    },
    assessmentDetails: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginBottom: height * 0.015,
        justifyContent: 'space-between',
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.005,
        width: '48%',
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
    assignButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#8B5CF6',
        borderRadius: width * 0.02,
        paddingVertical: height * 0.01,
        gap: width * 0.01,
    },
    assignButtonText: {
        color: '#8B5CF6',
        fontSize: width * 0.035,
        fontWeight: '500',
    },
    assignButtonDisabled: {
        backgroundColor: '#D1D5DB',
        borderColor: '#D1D5DB',
    },
    emptyState: {
        alignItems: 'center',
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: width * 0.04,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.04,
        width: '100%',
        maxHeight: height * 0.85,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 8,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: width * 0.04,
        borderBottomWidth: 1,
        borderBottomColor: '#F3F4F6',
    },
    modalTitle: {
        fontSize: width * 0.045,
        fontWeight: '600',
        color: '#1F2937',
    },
    closeButton: {
        padding: width * 0.01,
    },
    modalContent: {
        padding: width * 0.04,
    },
    assessmentDetailsContainer: {
        padding: width * 0.03,
        backgroundColor: '#F9FAFB',
        borderRadius: width * 0.03,
        marginBottom: height * 0.02,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    sectionLabel: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#374151',
        marginBottom: height * 0.01,
        marginTop: height * 0.01,
    },
    classContainer: {
        marginBottom: height * 0.02,
    },
    classCard: {
        backgroundColor: '#F9FAFB',
        borderRadius: width * 0.03,
        padding: width * 0.04,
        marginRight: width * 0.03,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: '#F3F4F6',
        minWidth: width * 0.25,
    },
    classCardSelected: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    className: {
        fontSize: width * 0.035,
        fontWeight: '600',
        color: '#374151',
        marginTop: height * 0.005,
    },
    classNameSelected: {
        color: '#FFFFFF',
    },
    studentCount: {
        fontSize: width * 0.03,
        color: '#6B7280',
        marginTop: height * 0.002,
    },
    studentCountSelected: {
        color: 'rgba(255,255,255,0.8)',
    },
    selectAllContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: height * 0.015,
    },
    selectAllButton: {
        paddingVertical: height * 0.008,
        paddingHorizontal: width * 0.03,
        borderRadius: width * 0.02,
        backgroundColor: '#F3F4F6',
    },
    selectAllText: {
        fontSize: width * 0.035,
        color: '#6B7280',
        fontWeight: '500',
    },
    studentList: {
        maxHeight: height * 0.3,
    },
    studentItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: height * 0.015,
        paddingHorizontal: width * 0.04,
        backgroundColor: '#F9FAFB',
        borderRadius: width * 0.03,
        marginBottom: height * 0.01,
        borderWidth: 2,
        borderColor: '#F3F4F6',
    },
    studentItemSelected: {
        backgroundColor: '#EDE9FE',
        borderColor: '#8B5CF6',
    },
    studentInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    studentAvatar: {
        width: width * 0.1,
        height: width * 0.1,
        borderRadius: width * 0.05,
        backgroundColor: '#8B5CF6',
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: width * 0.03,
    },
    avatarText: {
        color: '#FFFFFF',
        fontSize: width * 0.03,
        fontWeight: '600',
    },
    studentName: {
        fontSize: width * 0.04,
        color: '#374151',
        fontWeight: '500',
    },
    checkbox: {
        width: width * 0.06,
        height: width * 0.06,
        borderRadius: width * 0.03,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
    },
    checkboxSelected: {
        backgroundColor: '#8B5CF6',
        borderColor: '#8B5CF6',
    },
    resultItem: {
        backgroundColor: '#F9FAFB',
        borderRadius: width * 0.03,
        marginBottom: height * 0.01,
        borderWidth: 1,
        borderColor: '#F3F4F6',
        overflow: 'hidden',
    },
    resultHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: height * 0.015,
        paddingHorizontal: width * 0.04,
    },
    studentDetails: {
        flex: 1,
    },
    studentSubInfo: {
        fontSize: width * 0.03,
        color: '#6B7280',
        marginTop: 2,
    },
    resultDetails: {
        alignItems: 'flex-end',
    },
    resultScore: {
        fontSize: width * 0.038,
        fontWeight: 'bold',
        marginBottom: 4,
    },
    statusIndicator: {
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.003,
        borderRadius: width * 0.02,
    },
    resultStatus: {
        fontSize: width * 0.03,
        fontWeight: '500',
    },
    modalActions: {
        flexDirection: 'row',
        padding: width * 0.04,
        borderTopWidth: 1,
        borderTopColor: '#F3F4F6',
        gap: width * 0.03,
    },
    cancelButton: {
        flex: 1,
        paddingVertical: height * 0.015,
        borderRadius: width * 0.03,
        borderWidth: 2,
        borderColor: '#D1D5DB',
        alignItems: 'center',
    },
    cancelButtonText: {
        fontSize: width * 0.04,
        color: '#6B7280',
        fontWeight: '600',
    },
    exportButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height * 0.015,
        borderRadius: width * 0.03,
        backgroundColor: '#8B5CF6',
        gap: width * 0.02,
    },
    exportButtonText: {
        fontSize: width * 0.04,
        color: '#FFFFFF',
        fontWeight: '600',
    },
    // Assignment Progress Styles
    assignmentProgressContainer: {
        padding: width * 0.04,
        backgroundColor: '#F9FAFB',
        borderRadius: width * 0.03,
        marginBottom: height * 0.02,
        alignItems: 'center',
    },
    progressHeader: {
        alignItems: 'center',
        marginBottom: height * 0.02,
    },
    progressTitle: {
        fontSize: width * 0.045,
        fontWeight: '600',
        color: '#1F2937',
        marginTop: height * 0.01,
        marginBottom: height * 0.005,
    },
    progressDescription: {
        fontSize: width * 0.035,
        color: '#6B7280',
        textAlign: 'center',
    },
    assignmentSummary: {
        width: '100%',
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.025,
        padding: width * 0.03,
        marginBottom: height * 0.015,
    },
    summaryTitle: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#374151',
        marginBottom: height * 0.01,
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.008,
    },
    summaryText: {
        fontSize: width * 0.035,
        color: '#6B7280',
        marginLeft: width * 0.02,
    },
    loadingContainer: {
        alignItems: 'center',
        paddingVertical: height * 0.02,
    },
    loadingText: {
        fontSize: width * 0.04,
        fontWeight: '500',
        color: '#374151',
        marginTop: height * 0.015,
    },
    loadingSubtext: {
        fontSize: width * 0.032,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: height * 0.005,
    },
    successContainer: {
        alignItems: 'center',
        paddingVertical: height * 0.02,
    },
    successText: {
        fontSize: width * 0.045,
        fontWeight: '600',
        color: '#10B981',
        marginTop: height * 0.015,
    },
    successSubtext: {
        fontSize: width * 0.035,
        color: '#6B7280',
        textAlign: 'center',
        marginTop: height * 0.005,
    },
    // Results Analytics Styles
    analyticsContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.03,
        padding: width * 0.04,
        marginBottom: height * 0.02,
        borderWidth: 1,
        borderColor: '#F3F4F6',
    },
    analyticsTitle: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#374151',
        marginBottom: height * 0.015,
    },
    analyticsCards: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    analyticsCard: {
        flex: 1,
        backgroundColor: '#F9FAFB',
        borderRadius: width * 0.025,
        padding: width * 0.03,
        marginHorizontal: width * 0.01,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E5E7EB',
    },
    analyticsNumber: {
        fontSize: width * 0.045,
        fontWeight: 'bold',
        color: '#1F2937',
        marginBottom: height * 0.005,
    },
    analyticsLabel: {
        fontSize: width * 0.03,
        color: '#6B7280',
        marginBottom: height * 0.008,
        textAlign: 'center',
    },
    // Empty Results Styles
    emptyResultsContainer: {
        alignItems: 'center',
        paddingVertical: height * 0.04,
    },
    emptyResultsTitle: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#374151',
        marginTop: height * 0.015,
        marginBottom: height * 0.005,
    },
    emptyResultsText: {
        fontSize: width * 0.035,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: width * 0.04,
        lineHeight: width * 0.048,
    },
});

export default Assessment;