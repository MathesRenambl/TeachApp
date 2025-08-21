import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions, Alert, ScrollView } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../types';
import { useNavigation } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeacherApp'>;

interface AssessmentCreationState {
    showSlider: boolean;
    selectedStandard: string;
    selectedSubject: string;
    selectedChapter: string;
    showAssessmentOptions: boolean;
}

interface AssessmentProps {
    onNavigateToAssessment?: () => void;
}

const Assessment: React.FC<AssessmentProps> = ({ onNavigateToAssessment }) => {
    const [teachFromContent, setTeachFromContent] = useState(false);
    const [createExam, setCreateExam] = useState(false);
    const [generateQuiz, setGenerateQuiz] = useState(false);
    const [createAssignment, setCreateAssignment] = useState(false);
    const navigation = useNavigation<Navigation>();
    // Assessment creation states
    const [assessmentCreation, setAssessmentCreation] = useState<AssessmentCreationState>({
        showSlider: false,
        selectedStandard: '',
        selectedSubject: '',
        selectedChapter: '',
        showAssessmentOptions: false,
    });

    // Tag options
    const tagOptions = {
        standards: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Kindergarten', 'Pre-K'],
        subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education', 'Language Arts'],
        chapters: ['chapter 1', 'chapter 2', 'chapter 3', 'chapter 4', 'chapter 5', 'chapter 6'],
    };

    const resetOptions = () => {
        setTeachFromContent(false);
        setCreateExam(false);
        setGenerateQuiz(false);
        setCreateAssignment(false);
    };

    const resetAssessmentCreation = () => {
        setAssessmentCreation({
            showSlider: false,
            selectedStandard: '',
            selectedSubject: '',
            selectedChapter: '',
            showAssessmentOptions: false,
        });
        resetOptions();
    };

    const handleAssessmentTagSelection = (category: 'selectedStandard' | 'selectedSubject' | 'selectedChapter', value: string) => {
        setAssessmentCreation(prev => ({
            ...prev,
            [category]: value,
        }));

        // Check if all three selections are made
        const updatedState = { ...assessmentCreation, [category]: value };
        if (updatedState.selectedStandard && updatedState.selectedSubject && updatedState.selectedChapter) {
            setAssessmentCreation(prev => ({
                ...prev,
                [category]: value,
                showAssessmentOptions: true,
            }));
        }
    };

    const handleCreateAssessmentClick = () => {
        // setAssessmentCreation(prev => ({
        //     ...prev,
        //     showSlider: true,
        // }));
        navigation.navigate("CustomizerAssessment")
    };

    const handleAssessmentGeneration = () => {
        if (!teachFromContent && !createExam && !generateQuiz && !createAssignment) {
            Alert.alert('No Assessment Type Selected', 'Please select at least one assessment type to create.');
            return;
        }

        const actions = [];
        if (teachFromContent) actions.push('Interactive Teaching Content');
        if (createExam) actions.push('Comprehensive Exam');
        if (generateQuiz) actions.push('Quick Quiz');
        if (createAssignment) actions.push('Assignment Tasks');

        const { selectedStandard, selectedSubject, selectedChapter } = assessmentCreation;

        Alert.alert(
            'Creating Assessment',
            `Creating ${actions.join(', ')} for:\n\nClass: ${selectedStandard}\nSubject: ${selectedSubject}\nChapter: ${selectedChapter}\n\nThis may take a few minutes.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Create Assessment',
                    onPress: () => {
                        console.log('Assessment creation started...');
                        resetAssessmentCreation();
                        Alert.alert('Success', 'Assessment has been created successfully!');
                        onNavigateToAssessment?.();
                    },
                },
            ]
        );
    };

    const handleCheckboxPress = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter((prev: any) => !prev);
    };

    return (
        <View style={styles.container}>
            {!assessmentCreation.showSlider ? (
                <View style={styles.assessmentInitialView}>
                    <View style={styles.emptyState}>
                        <Icon name="assessment" size={width * 0.16} color="#4A90E2" />
                        <Text style={styles.emptyStateTitle}>Assessment Dashboard</Text>
                        <Text style={styles.emptyStateDescription}>
                            Create custom assessments and track student performance
                        </Text>
                    </View>

                    <TouchableOpacity
                        style={styles.createAssessmentButton}
                        onPress={handleCreateAssessmentClick}
                        activeOpacity={0.8}
                    >
                        <View style={styles.createAssessmentContent}>
                            <Icon name="add-circle" size={24} color="#FFFFFF" />
                            <Text style={styles.createAssessmentText}>Create Assessment</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.viewAssessmentButton}
                        onPress={onNavigateToAssessment}
                        activeOpacity={0.7}
                    >
                        <View style={styles.viewAssessmentContent}>
                            <Icon name="visibility" size={20} color="#4A90E2" />
                            <Text style={styles.viewAssessmentText}>View Assessments</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                <ScrollView style={styles.assessmentCreationView} showsVerticalScrollIndicator={false}>
                    <View style={styles.assessmentHeader}>
                        <TouchableOpacity
                            style={styles.backButton}
                            onPress={resetAssessmentCreation}
                            activeOpacity={0.7}
                        >
                            <Icon name="arrow-back" size={24} color="#4A90E2" />
                        </TouchableOpacity>
                        <Text style={styles.assessmentHeaderTitle}>Create New Assessment</Text>
                    </View>

                    {/* Class Selection */}
                    <View style={styles.assessmentTagSection}>
                        <Text style={styles.assessmentTagTitle}>Select Class/Standard *</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.horizontalScrollView}
                            contentContainerStyle={styles.horizontalScrollContent}
                        >
                            {tagOptions.standards.map((standard) => (
                                <TouchableOpacity
                                    key={standard}
                                    style={[
                                        styles.assessmentTagOption,
                                        assessmentCreation.selectedStandard === standard && styles.assessmentTagOptionSelected,
                                    ]}
                                    onPress={() => handleAssessmentTagSelection('selectedStandard', standard)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.assessmentTagOptionText,
                                            assessmentCreation.selectedStandard === standard && styles.assessmentTagOptionTextSelected,
                                        ]}
                                    >
                                        {standard}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Subject Selection */}
                    <View style={styles.assessmentTagSection}>
                        <Text style={styles.assessmentTagTitle}>Select Subject *</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.horizontalScrollView}
                            contentContainerStyle={styles.horizontalScrollContent}
                        >
                            {tagOptions.subjects.map((subject) => (
                                <TouchableOpacity
                                    key={subject}
                                    style={[
                                        styles.assessmentTagOption,
                                        assessmentCreation.selectedSubject === subject && styles.assessmentTagOptionSelected,
                                    ]}
                                    onPress={() => handleAssessmentTagSelection('selectedSubject', subject)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.assessmentTagOptionText,
                                            assessmentCreation.selectedSubject === subject && styles.assessmentTagOptionTextSelected,
                                        ]}
                                    >
                                        {subject}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Chapter Selection */}
                    <View style={styles.assessmentTagSection}>
                        <Text style={styles.assessmentTagTitle}>Select Chapter *</Text>
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            style={styles.horizontalScrollView}
                            contentContainerStyle={styles.horizontalScrollContent}
                        >
                            {tagOptions.chapters.map((chapter) => (
                                <TouchableOpacity
                                    key={chapter}
                                    style={[
                                        styles.assessmentTagOption,
                                        assessmentCreation.selectedChapter === chapter && styles.assessmentTagOptionSelected,
                                    ]}
                                    onPress={() => handleAssessmentTagSelection('selectedChapter', chapter)}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        style={[
                                            styles.assessmentTagOptionText,
                                            assessmentCreation.selectedChapter === chapter && styles.assessmentTagOptionTextSelected,
                                        ]}
                                    >
                                        {chapter}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    {/* Assessment Type Selection */}
                    {assessmentCreation.showAssessmentOptions && (
                        <View style={styles.actionsSection}>
                            <View style={styles.sectionHeaderMain}>
                                <Text style={styles.sectionTitle}>What would you like to create?</Text>
                                <Text style={styles.sectionSubtitle}>
                                    Select one or more assessment types to generate
                                </Text>
                            </View>

                            <View style={styles.checkboxContainer}>
                                <TouchableOpacity
                                    style={styles.checkboxItem}
                                    onPress={() => handleCheckboxPress(setTeachFromContent)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.checkbox, teachFromContent && styles.checkboxSelected]}>
                                        {teachFromContent && <Icon name="check" size={16} color="#FFFFFF" />}
                                    </View>
                                    <View style={styles.checkboxContent}>
                                        <Text style={styles.checkboxTitle}>Interactive Teaching Content</Text>
                                        <Text style={styles.checkboxDescription}>
                                            Create slide presentations, interactive lessons, and teaching materials
                                        </Text>
                                    </View>
                                    <Icon name="school" size={24} color="#9B59B6" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.checkboxItem}
                                    onPress={() => handleCheckboxPress(setCreateExam)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.checkbox, createExam && styles.checkboxSelected]}>
                                        {createExam && <Icon name="check" size={16} color="#FFFFFF" />}
                                    </View>
                                    <View style={styles.checkboxContent}>
                                        <Text style={styles.checkboxTitle}>Comprehensive Exam</Text>
                                        <Text style={styles.checkboxDescription}>
                                            Generate detailed exams with multiple question types and answer keys
                                        </Text>
                                    </View>
                                    <Icon name="assignment" size={24} color="#E67E22" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.checkboxItem}
                                    onPress={() => handleCheckboxPress(setGenerateQuiz)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.checkbox, generateQuiz && styles.checkboxSelected]}>
                                        {generateQuiz && <Icon name="check" size={16} color="#FFFFFF" />}
                                    </View>
                                    <View style={styles.checkboxContent}>
                                        <Text style={styles.checkboxTitle}>Quick Quiz</Text>
                                        <Text style={styles.checkboxDescription}>
                                            Generate short quizzes for quick knowledge assessment
                                        </Text>
                                    </View>
                                    <Icon name="quiz" size={24} color="#3498DB" />
                                </TouchableOpacity>

                                <TouchableOpacity
                                    style={styles.checkboxItem}
                                    onPress={() => handleCheckboxPress(setCreateAssignment)}
                                    activeOpacity={0.8}
                                >
                                    <View style={[styles.checkbox, createAssignment && styles.checkboxSelected]}>
                                        {createAssignment && <Icon name="check" size={16} color="#FFFFFF" />}
                                    </View>
                                    <View style={styles.checkboxContent}>
                                        <Text style={styles.checkboxTitle}>Assignment Tasks</Text>
                                        <Text style={styles.checkboxDescription}>
                                            Create homework assignments and practice exercises
                                        </Text>
                                    </View>
                                    <Icon name="task" size={24} color="#27AE60" />
                                </TouchableOpacity>
                            </View>

                            <TouchableOpacity
                                style={styles.processButton}
                                onPress={handleAssessmentGeneration}
                                activeOpacity={0.8}
                            >
                                <View style={styles.processButtonContent}>
                                    <Icon name="auto-awesome" size={20} color="#FFFFFF" />
                                    <Text style={styles.processButtonText}>Create Assessment</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    )}

                    {/* Selected Tags Summary */}
                    {(assessmentCreation.selectedStandard || assessmentCreation.selectedSubject || assessmentCreation.selectedChapter) && (
                        <View style={styles.selectedTagsSummary}>
                            <Text style={styles.selectedTagsTitle}>Selected Parameters:</Text>
                            <View style={styles.selectedTagsContainer}>
                                {assessmentCreation.selectedStandard && (
                                    <View style={styles.selectedTag}>
                                        <Text style={styles.selectedTagText}>Class: {assessmentCreation.selectedStandard}</Text>
                                    </View>
                                )}
                                {assessmentCreation.selectedSubject && (
                                    <View style={styles.selectedTag}>
                                        <Text style={styles.selectedTagText}>Subject: {assessmentCreation.selectedSubject}</Text>
                                    </View>
                                )}
                                {assessmentCreation.selectedChapter && (
                                    <View style={styles.selectedTag}>
                                        <Text style={styles.selectedTagText}>Chapter: {assessmentCreation.selectedChapter}</Text>
                                    </View>
                                )}
                            </View>
                        </View>
                    )}
                </ScrollView>
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    assessmentInitialView: {
        flex: 1,
        justifyContent: 'center',
        minHeight: height * 0.5,
    },
    emptyState: {
        alignItems: 'center',
        paddingVertical: height * 0.05,
        paddingHorizontal: width * 0.05,
    },
    emptyStateTitle: {
        fontSize: width * 0.05,
        fontWeight: '600',
        color: '#2C3E50',
        marginTop: height * 0.02,
        marginBottom: height * 0.01,
        textAlign: 'center',
    },
    emptyStateDescription: {
        fontSize: width * 0.038,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: height * 0.025,
    },
    createAssessmentButton: {
        backgroundColor: '#4A90E2',
        borderRadius: width * 0.03,
        marginTop: height * 0.03,
        marginBottom: height * 0.015,
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
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
    viewAssessmentButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.03,
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    viewAssessmentContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height * 0.016,
        paddingHorizontal: width * 0.06,
    },
    viewAssessmentText: {
        color: '#4A90E2',
        fontSize: width * 0.042,
        fontWeight: '600',
        marginLeft: width * 0.02,
    },
    assessmentCreationView: {
        flex: 1,
    },
    assessmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.025,
        paddingVertical: height * 0.01,
    },
    backButton: {
        marginRight: width * 0.04,
        padding: width * 0.01,
    },
    assessmentHeaderTitle: {
        fontSize: width * 0.05,
        fontWeight: '700',
        color: '#2C3E50',
    },
    assessmentTagSection: {
        marginBottom: height * 0.025,
    },
    assessmentTagTitle: {
        fontSize: width * 0.042,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: height * 0.012,
    },
    horizontalScrollView: {
        flexGrow: 0,
    },
    horizontalScrollContent: {
        paddingRight: width * 0.05,
    },
    assessmentTagOption: {
        backgroundColor: '#F8F9FA',
        borderRadius: width * 0.05,
        paddingVertical: height * 0.01,
        paddingHorizontal: width * 0.04,
        marginRight: width * 0.025,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        minWidth: width * 0.2,
        alignItems: 'center',
    },
    assessmentTagOptionSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    assessmentTagOptionText: {
        fontSize: width * 0.035,
        fontWeight: '500',
        color: '#6C757D',
        textAlign: 'center',
    },
    assessmentTagOptionTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    selectedTagsSummary: {
        backgroundColor: '#F8F9FA',
        borderRadius: width * 0.03,
        padding: width * 0.04,
        marginBottom: height * 0.02,
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2',
    },
    selectedTagsTitle: {
        fontSize: width * 0.036,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: height * 0.008,
    },
    selectedTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: width * 0.02,
    },
    selectedTag: {
        backgroundColor: '#4A90E2',
        borderRadius: width * 0.04,
        paddingVertical: height * 0.006,
        paddingHorizontal: width * 0.03,
    },
    selectedTagText: {
        color: '#FFFFFF',
        fontSize: width * 0.03,
        fontWeight: '500',
    },
    actionsSection: {
        marginTop: height * 0.02,
    },
    sectionHeaderMain: {
        marginBottom: height * 0.02,
    },
    sectionTitle: {
        fontSize: width * 0.045,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: height * 0.008,
    },
    sectionSubtitle: {
        fontSize: width * 0.036,
        color: '#7F8C8D',
        lineHeight: height * 0.025,
    },
    checkboxContainer: {
        gap: height * 0.015,
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: width * 0.04,
        borderRadius: width * 0.03,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    checkbox: {
        width: width * 0.06,
        height: width * 0.06,
        borderRadius: width * 0.015,
        borderWidth: 2,
        borderColor: '#BDC3C7',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width * 0.04,
    },
    checkboxSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    checkboxContent: {
        flex: 1,
        marginRight: width * 0.03,
    },
    checkboxTitle: {
        fontSize: width * 0.038,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: height * 0.004,
    },
    checkboxDescription: {
        fontSize: width * 0.032,
        color: '#7F8C8D',
        lineHeight: height * 0.022,
    },
    processButton: {
        marginTop: height * 0.025,
        marginBottom: height * 0.02,
    },
    processButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height * 0.018,
        borderRadius: width * 0.03,
        backgroundColor: '#4A90E2',
        shadowColor: '#4A90E2',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    processButtonText: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: width * 0.02,
    },
});

export default Assessment;