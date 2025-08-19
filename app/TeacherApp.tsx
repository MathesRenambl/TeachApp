import React, { useState, useRef, useLayoutEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView,StatusBar, Dimensions, Alert, ActivityIndicator } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// Import Library component (you'll need to adjust the import path)
import Library from './Library'; // Adjust this import path as needed

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

interface TagModalState {
    visible: boolean;
    uploadType: 'pdf' | 'image' | null;
}

interface AssessmentCreationState {
    showSlider: boolean;
    selectedStandard: string;
    selectedSubject: string;
    selectedChapter: string;
    showAssessmentOptions: boolean;
}

const TeacherApp: React.FC = () => {

    const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
    const [libraryFiles, setLibraryFiles] = useState<UploadedFile[]>([]);
    const [teachFromContent, setTeachFromContent] = useState(false);
    const [createExam, setCreateExam] = useState(false);
    const [generateQuiz, setGenerateQuiz] = useState(false);
    const [createAssignment, setCreateAssignment] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'assessment'>('upload');
    
    // Assessment creation states
    const [assessmentCreation, setAssessmentCreation] = useState<AssessmentCreationState>({
        showSlider: false,
        selectedStandard: '',
        selectedSubject: '',
        selectedChapter: '',
        showAssessmentOptions: false,
    });

    // Tag selection states - FIXED: Made consistent property names
    const [tagModal, setTagModal] = useState<TagModalState>({ visible: false, uploadType: null });
    const [selectedTags, setSelectedTags] = useState({
        standard: '',
        subject: '',
        chapter: '',
        language: '',
    });
    const navigation = useNavigation<Navigation>();

    const generateUniqueId = () => {
        const timestamp = Date.now();
        const random1 = Math.random().toString(36).substr(2, 9);
        const random2 = Math.random().toString(36).substr(2, 5);
        return `${timestamp}-${random1}-${random2}`;
    };

    // Tag options
    const tagOptions = {
        standards: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5', 'Class 6', 'Class 7', 'Class 8', 'Class 9', 'Class 10', 'Class 11', 'Class 12', 'Kindergarten', 'Pre-K'],
        subjects: ['Mathematics', 'Science', 'English', 'Social Studies', 'Physics', 'Chemistry', 'Biology', 'History', 'Geography', 'Computer Science', 'Art', 'Music', 'Physical Education', 'Language Arts'],
        chapters: ['chapter 1', 'chapter 2', 'chapter 3', 'chapter 4', 'chapter 5', 'chapter 6'],
        languages: ['English', 'Tamil', 'Hindi', 'Telugu', 'Kannada', 'Malayalam', 'Bengali', 'Gujarati', 'Marathi', 'Punjabi'],
    };

    // Use useRef for scroll position and ScrollView reference
    const scrollViewRef = useRef<ScrollView>(null);
    const scrollYPosition = useRef(0);

    // useEffect to restore scroll position after a re-render from state change
    useLayoutEffect(() => {
        scrollViewRef.current?.scrollTo({ y: scrollYPosition.current, animated: false });
    }, [teachFromContent, createExam, generateQuiz, createAssignment]);

    const resetOptions = () => {
        setTeachFromContent(false);
        setCreateExam(false);
        setGenerateQuiz(false);
        setCreateAssignment(false);
    };

    const resetTags = () => {
        setSelectedTags({
            standard: '',
            subject: '',
            chapter: '',
            language: '',
        });
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

    const openTagModal = (type: 'pdf' | 'image') => {
        setTagModal({ visible: true, uploadType: type });
        resetTags();
    };

    const closeTagModal = () => {
        setTagModal({ visible: false, uploadType: null });
        resetTags();
    };

    const handleTagSelection = (category: keyof typeof selectedTags, value: string) => {
        setSelectedTags(prev => ({
            ...prev,
            [category]: value,
        }));
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
        setAssessmentCreation(prev => ({
            ...prev,
            showSlider: true,
        }));
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
                        navigation.navigate('Assessment');
                    },
                },
            ]
        );
    };

    const validateAndProceedUpload = () => {
        const { standard, subject, chapter, language } = selectedTags;

        if (!standard || !subject || !chapter || !language) {
            Alert.alert('Incomplete Tags', 'Please select all required tags before uploading.');
            return;
        }
        if (tagModal.uploadType) {
            handleFileUpload(tagModal.uploadType);
            closeTagModal();
        }
    };

    const handleFileUpload = async (type: 'pdf' | 'image') => {
        try {
            let result;
            if (type === 'pdf') {
                result = await DocumentPicker.getDocumentAsync({
                    type: 'application/pdf',
                    copyToCacheDirectory: true,
                });
            } else {
                result = await ImagePicker.launchImageLibraryAsync({
                    mediaTypes: ImagePicker.MediaTypeOptions.Images,
                    allowsEditing: true,
                    quality: 1,
                });
            }

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];

                resetOptions();
                setUploadProgress(0);

                const mockFile: UploadedFile = {
                    id: generateUniqueId(),
                    name: file.name || (type === 'pdf' ? 'Document.pdf' : 'Image.jpg'),
                    type,
                    size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
                    uploadDate: new Date().toLocaleDateString(),
                    status: 'processing',
                    tags: selectedTags,
                };

                const progressInterval = setInterval(() => {
                    setUploadProgress(prev => {
                        if (prev !== null && prev < 100) {
                            return prev + 10;
                        } else {
                            clearInterval(progressInterval);
                            setUploadProgress(null);
                            setSelectedFiles(prev => [...prev, { ...mockFile, status: 'completed' }]);
                            return null;
                        }
                    });
                }, 200);
            }
        } catch (error) {
            Alert.alert('Upload Error', 'Failed to upload file. Please try again.');
        }
    };

    const handleRemoveFile = (fileId: string) => {
        Alert.alert(
            'Remove File',
            'Are you sure you want to remove this file?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Remove',
                    style: 'destructive',
                    onPress: () => {
                        setSelectedFiles(prev => prev.filter(file => file.id !== fileId));
                        resetOptions();
                    },
                },
            ]
        );
    };

    const TagSelectionModal = () => (
        <View style={[styles.modalOverlay, { display: tagModal.visible ? 'flex' : 'none' }]}>
            <View style={styles.modalContainer}>
                <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>
                        Select Tags for {tagModal.uploadType === 'pdf' ? 'PDF' : 'Image'} Upload
                    </Text>
                    <TouchableOpacity onPress={closeTagModal} style={styles.modalCloseButton}>
                        <Icon name="close" size={24} color="#7F8C8D" />
                    </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
                    {/* Standard Selection */}
                    <View style={styles.tagSection}>
                        <Text style={styles.tagSectionTitle}>Standard/Class *</Text>
                        <View style={styles.tagOptionsContainer}>
                            {tagOptions.standards.map((standard) => (
                                <TouchableOpacity
                                    key={standard}
                                    style={[
                                        styles.tagOption,
                                        selectedTags.standard === standard && styles.tagOptionSelected,
                                    ]}
                                    onPress={() => handleTagSelection('standard', standard)}
                                >
                                    <Text
                                        style={[
                                            styles.tagOptionText,
                                            selectedTags.standard === standard && styles.tagOptionTextSelected,
                                        ]}
                                    >
                                        {standard}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Subject Selection */}
                    <View style={styles.tagSection}>
                        <Text style={styles.tagSectionTitle}>Subject *</Text>
                        <View style={styles.tagOptionsContainer}>
                            {tagOptions.subjects.map((subject) => (
                                <TouchableOpacity
                                    key={subject}
                                    style={[
                                        styles.tagOption,
                                        selectedTags.subject === subject && styles.tagOptionSelected,
                                    ]}
                                    onPress={() => handleTagSelection('subject', subject)}
                                >
                                    <Text
                                        style={[
                                            styles.tagOptionText,
                                            selectedTags.subject === subject && styles.tagOptionTextSelected,
                                        ]}
                                    >
                                        {subject}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Chapter Selection */}
                    <View style={styles.tagSection}>
                        <Text style={styles.tagSectionTitle}>Chapter *</Text>
                        <View style={styles.tagOptionsContainer}>
                            {tagOptions.chapters.map((chapter) => (
                                <TouchableOpacity
                                    key={chapter}
                                    style={[
                                        styles.tagOption,
                                        selectedTags.chapter === chapter && styles.tagOptionSelected,
                                    ]}
                                    onPress={() => handleTagSelection('chapter', chapter)}
                                >
                                    <Text
                                        style={[
                                            styles.tagOptionText,
                                            selectedTags.chapter === chapter && styles.tagOptionTextSelected,
                                        ]}
                                    >
                                        {chapter}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>

                    {/* Language Selection */}
                    <View style={styles.tagSection}>
                        <Text style={styles.tagSectionTitle}>Language *</Text>
                        <View style={styles.tagOptionsContainer}>
                            {tagOptions.languages.map((language) => (
                                <TouchableOpacity
                                    key={language}
                                    style={[
                                        styles.tagOption,
                                        selectedTags.language === language && styles.tagOptionSelected,
                                    ]}
                                    onPress={() => handleTagSelection('language', language)}
                                >
                                    <Text
                                        style={[
                                            styles.tagOptionText,
                                            selectedTags.language === language && styles.tagOptionTextSelected,
                                        ]}
                                    >
                                        {language}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </ScrollView>

                <View style={styles.modalActions}>
                    <TouchableOpacity style={styles.modalCancelButton} onPress={closeTagModal}>
                        <Text style={styles.modalCancelText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.modalConfirmButton} onPress={validateAndProceedUpload}>
                        <Text style={styles.modalConfirmText}>Upload File</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </View>
    );

    const handleProcessContent = () => {
        if (selectedFiles.length === 0) {
            Alert.alert('No Files', 'Please upload at least one file to continue.');
            return;
        }

        if (!teachFromContent && !createExam && !generateQuiz && !createAssignment) {
            Alert.alert('No Action Selected', 'Please select at least one action to perform with your content.');
            return;
        }

        const actions = [];
        if (teachFromContent) actions.push('Interactive Teaching Content');
        if (createExam) actions.push('Comprehensive Exam');
        if (generateQuiz) actions.push('Quick Quiz');
        if (createAssignment) actions.push('Assignment Tasks');

        Alert.alert(
            'Processing Content',
            `Creating ${actions.join(', ')} from ${selectedFiles.length} file(s).\n\nThis may take a few minutes.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start Processing',
                    onPress: () => {
                        console.log('Processing started...');
                        setLibraryFiles(prev => [...prev, ...selectedFiles]);
                        setSelectedFiles([]);
                        resetOptions();
                        Alert.alert('Success', 'Content has been created and moved to the Library.');
                        navigation.navigate('TestCustomizer');
                    },
                },
            ]
        );
    };

    const clearAllOptions = () => {
        resetOptions();
    };

    const handleCheckboxPress = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
        setter((prev: any) => !prev);
    };

    const handleClearButtonPress = () => {
        clearAllOptions();
    };

    const hasAnyOptionSelected = teachFromContent || createExam || generateQuiz || createAssignment;

    const UploadTab = () => (
        <ScrollView
            ref={scrollViewRef}
            style={styles.tabContent}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="always"
            keyboardDismissMode="none"
            scrollEventThrottle={16}
            onScroll={(e) => (scrollYPosition.current = e.nativeEvent.contentOffset.y)}
        >
            <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Interactive Learning Made Easy</Text>
                <Text style={styles.sectionSubtitle}>
                    Upload PDF documents or images to turn your resource to impactful learning environment
                </Text>

                <View style={styles.uploadButtons}>
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => openTagModal('pdf')}
                        disabled={uploadProgress !== null}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.uploadButtonContent, styles.pdfButton]}>
                            <Icon name="picture-as-pdf" size={width * 0.08} color="#E74C3C" />
                            <Text style={styles.uploadButtonText}>Upload PDF</Text>
                            <Text style={styles.uploadButtonSubtext}>Documents, textbooks, notes</Text>
                        </View>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => openTagModal('image')}
                        disabled={uploadProgress !== null}
                        activeOpacity={0.7}
                    >
                        <View style={[styles.uploadButtonContent, styles.imageButton]}>
                            <Icon name="image" size={width * 0.08} color="#27AE60" />
                            <Text style={styles.uploadButtonText}>Upload Images</Text>
                            <Text style={styles.uploadButtonSubtext}>Diagrams, charts, photos</Text>
                        </View>
                    </TouchableOpacity>
                </View>

                {uploadProgress !== null && (
                    <View style={styles.uploadProgress}>
                        <View style={styles.progressHeader}>
                            <Icon name="cloud-upload" size={20} color="#4A90E2" />
                            <Text style={styles.progressText}>Uploading... {uploadProgress}%</Text>
                        </View>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${uploadProgress}%` }]} />
                        </View>
                    </View>
                )}
            </View>

            {selectedFiles.length > 0 && (
                <View style={styles.filesSection}>
                    <Text style={styles.sectionTitle}>Uploaded Files ({selectedFiles.length})</Text>

                    {selectedFiles.map(file => (
                        <View key={file.id} style={styles.fileItem}>
                            <View style={styles.fileIcon}>
                                <Icon
                                    name={file.type === 'pdf' ? 'picture-as-pdf' : 'image'}
                                    size={24}
                                    color={file.type === 'pdf' ? '#E74C3C' : '#27AE60'}
                                />
                            </View>
                            <View style={styles.fileInfo}>
                                <Text style={styles.fileName}>{file.name}</Text>
                                <View style={styles.fileDetails}>
                                    <Text style={styles.fileSize}>{file.size}</Text>
                                    <Text style={styles.fileDot}>•</Text>
                                    <Text style={styles.fileDate}>{file.uploadDate}</Text>
                                </View>
                                <View style={styles.fileTags}>
                                    <View style={styles.tag}>
                                        <Text style={styles.tagText}>{file.tags.standard}</Text>
                                    </View>
                                    <View style={styles.tag}>
                                        <Text style={styles.tagText}>{file.tags.subject}</Text>
                                    </View>
                                    <View style={styles.tag}>
                                        <Text style={styles.tagText}>{file.tags.chapter}</Text>
                                    </View>
                                </View>
                            </View>
                            <View
                                style={[
                                    styles.statusBadge,
                                    file.status === 'completed' && styles.statusCompleted,
                                    file.status === 'processing' && styles.statusProcessing,
                                    file.status === 'failed' && styles.statusFailed,
                                ]}
                            >
                                {file.status === 'processing' && <ActivityIndicator size="small" color="#F39C12" />}
                                {file.status === 'completed' && <Icon name="check-circle" size={16} color="#27AE60" />}
                                {file.status === 'failed' && <Icon name="error" size={16} color="#E74C3C" />}
                                <Text
                                    style={[
                                        styles.statusText,
                                        file.status === 'completed' && styles.statusTextCompleted,
                                        file.status === 'processing' && styles.statusTextProcessing,
                                        file.status === 'failed' && styles.statusTextFailed,
                                    ]}
                                >
                                    {file.status === 'completed' ? 'Ready' : file.status === 'processing' ? 'Processing' : 'Failed'}
                                </Text>
                            </View>
                            <TouchableOpacity
                                style={styles.removeButton}
                                onPress={() => handleRemoveFile(file.id)}
                                activeOpacity={0.7}
                            >
                                <Icon name="close" size={20} color="#E74C3C" />
                            </TouchableOpacity>
                        </View>
                    ))}
                </View>
            )}

            {selectedFiles.length > 0 && (
                <View style={styles.actionsSection}>
                    <View style={styles.sectionHeaderMain}>
                        <Text style={styles.sectionTitle}>What would you like to create?</Text>
                        <Text style={styles.sectionSubtitle}>
                            Select one or more options to generate content from your uploaded files
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
                    </View>

                    {hasAnyOptionSelected && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={handleClearButtonPress}
                            activeOpacity={0.7}
                        >
                            <Icon name="clear-all" size={18} color="#E74C3C" />
                            <Text style={styles.clearButtonText}>Clear All</Text>
                        </TouchableOpacity>
                    )}

                    <TouchableOpacity
                        style={styles.processButton}
                        onPress={handleProcessContent}
                        activeOpacity={0.8}
                    >
                        <View style={styles.processButtonContent}>
                            <Icon name="auto-awesome" size={20} color="#FFFFFF" />
                            <Text style={styles.processButtonText}>Generate Content</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            )}
        </ScrollView>
    );

    // Updated LibraryTab to use the Library component
    const LibraryTab = () => (
        <View style={styles.tabContent}>
            <Library />
        </View>
    );

    // Enhanced Assessment Tab with Create Assessment functionality
    const AssessmentTab = () => (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollContent}>
            {!assessmentCreation.showSlider ? (
                // Initial Assessment Tab View
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
                        onPress={() => navigation.navigate("Assessment")}
                        activeOpacity={0.7}
                    >
                        <View style={styles.viewAssessmentContent}>
                            <Icon name="visibility" size={20} color="#4A90E2" />
                            <Text style={styles.viewAssessmentText}>View Assessments</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            ) : (
                // Assessment Creation Flow
                <View style={styles.assessmentCreationView}>
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

                    {/* Assessment Type Selection - Shows after all tags are selected */}
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

                            {hasAnyOptionSelected && (
                                <TouchableOpacity
                                    style={styles.clearButton}
                                    onPress={handleClearButtonPress}
                                    activeOpacity={0.7}
                                >
                                    <Icon name="clear-all" size={18} color="#E74C3C" />
                                    <Text style={styles.clearButtonText}>Clear All</Text>
                                </TouchableOpacity>
                            )}

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
                </View>
            )}
        </ScrollView>
    );

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
            <SafeAreaView style={styles.safeArea}>
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
            </SafeAreaView>

            <View style={styles.contentContainer}>
                {activeTab === 'upload' && <UploadTab />}
                {activeTab === 'library' && <LibraryTab />}
                {activeTab === 'assessment' && <AssessmentTab />}
            </View>
            {TagSelectionModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    safeArea: {
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 5,
        zIndex: 1000,
    },
    header: {
        backgroundColor: '#FFFFFF',
        marginTop: 0,
        paddingHorizontal: width * 0.05,
        paddingVertical: height * 0.02,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
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
    tabContent: {
        flex: 1,
    },
    scrollContent: {
        padding: width * 0.05,
        paddingBottom: height * 0.1,
    },
    uploadSection: {
        marginBottom: height * 0.04,
    },
    sectionTitle: {
        fontSize: width * 0.06,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: height * 0.01,
    },
    sectionSubtitle: {
        fontSize: width * 0.04,
        color: '#7F8C8D',
        marginBottom: height * 0.03,
        lineHeight: height * 0.03,
    },
    uploadButtons: {
        flexDirection: 'row',
        gap: width * 0.04,
    },
    uploadButton: {
        flex: 1,
    },
    uploadButtonContent: {
        padding: width * 0.06,
        borderRadius: width * 0.04,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
        height: height * 0.18,
    },
    pdfButton: {
        borderColor: '#E74C3C',
    },
    imageButton: {
        borderColor: '#27AE60',
    },
    uploadButtonText: {
        fontSize: width * 0.045,
        fontWeight: '600',
        color: '#2C3E50',
        marginTop: height * 0.015,
        marginBottom: height * 0.005,
        textAlign: 'center',
    },
    uploadButtonSubtext: {
        fontSize: width * 0.035,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: height * 0.025,
    },
    uploadProgress: {
        marginTop: height * 0.03,
        padding: width * 0.04,
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.03,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.015,
    },
    progressText: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#4A90E2',
        marginLeft: width * 0.02,
    },
    progressBar: {
        height: height * 0.008,
        backgroundColor: '#E9ECEF',
        borderRadius: height * 0.004,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4A90E2',
        borderRadius: height * 0.004,
    },
    filesSection: {
        marginBottom: height * 0.04,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: width * 0.04,
        borderRadius: width * 0.03,
        marginBottom: height * 0.015,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    fileIcon: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: width * 0.02,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width * 0.03,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: height * 0.005,
    },
    fileDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    fileSize: {
        fontSize: width * 0.035,
        color: '#7F8C8D',
    },
    fileDot: {
        fontSize: width * 0.035,
        color: '#7F8C8D',
        marginHorizontal: width * 0.02,
    },
    fileDate: {
        fontSize: width * 0.035,
        color: '#7F8C8D',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.005,
        borderRadius: width * 0.015,
        backgroundColor: '#F8F9FA',
        marginRight: width * 0.02,
    },
    statusCompleted: {
        backgroundColor: '#D5EDDA',
    },
    statusProcessing: {
        backgroundColor: '#FFF3CD',
    },
    statusFailed: {
        backgroundColor: '#F8D7DA',
    },
    statusText: {
        fontSize: width * 0.03,
        fontWeight: '600',
        marginLeft: width * 0.01,
        color: '#7F8C8D',
    },
    statusTextCompleted: {
        color: '#27AE60',
    },
    statusTextProcessing: {
        color: '#F39C12',
    },
    statusTextFailed: {
        color: '#E74C3C',
    },
    removeButton: {
        width: width * 0.08,
        height: width * 0.08,
        borderRadius: width * 0.04,
        backgroundColor: '#FFEBEE',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#FFCDD2',
    },
    actionsSection: {
        marginBottom: height * 0.04,
    },
    sectionHeaderMain: {
        marginBottom: height * 0.02,
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.015,
        borderRadius: width * 0.03,
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#E74C3C',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
        marginTop: height * 0.02,
        marginBottom: height * 0.01,
    },
    clearButtonText: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#E74C3C',
        marginLeft: width * 0.02,
    },
    checkboxContainer: {
        marginTop: -30
    },
    checkboxItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: width * 0.05,
        borderRadius: width * 0.03,
        marginBottom: height * 0.02,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
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
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: height * 0.005,
    },
    checkboxDescription: {
        fontSize: width * 0.035,
        color: '#7F8C8D',
        lineHeight: height * 0.025,
    },
    processButton: {
        marginTop: height * 0.02,
    },
    processButtonContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height * 0.02,
        borderRadius: width * 0.03,
        backgroundColor: '#4A90E2',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 3,
        },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
    },
    processButtonText: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#FFFFFF',
        marginLeft: width * 0.02,
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.1,
    },
    emptyStateTitle: {
        fontSize: width * 0.05,
        fontWeight: '600',
        color: '#2C3E50',
        marginTop: height * 0.02,
        marginBottom: height * 0.01,
    },
    emptyStateDescription: {
        fontSize: width * 0.04,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: height * 0.03,
    },
    fileTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginTop: height * 0.008,
        gap: width * 0.02,
    },
    tag: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.003,
        borderRadius: width * 0.01,
    },
    tagText: {
        fontSize: width * 0.03,
        color: '#1976D2',
        fontWeight: '500',
    },
    modalOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.04,
        width: width * 0.9,
        maxHeight: height * 0.8,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 5,
        },
        shadowOpacity: 0.3,
        shadowRadius: 10,
        elevation: 10,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: width * 0.05,
        borderBottomWidth: 1,
        borderBottomColor: '#E9ECEF',
    },
    modalTitle: {
        fontSize: width * 0.045,
        fontWeight: '600',
        color: '#2C3E50',
        flex: 1,
    },
    modalCloseButton: {
        width: width * 0.08,
        height: width * 0.08,
        borderRadius: width * 0.04,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        maxHeight: height * 0.55,
        paddingHorizontal: width * 0.05,
    },
    tagSection: {
        marginVertical: height * 0.02,
    },
    tagSectionTitle: {
        fontSize: width * 0.042,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: height * 0.015,
    },
    tagOptionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: width * 0.02,
    },
    tagOption: {
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.012,
        borderRadius: width * 0.02,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        marginBottom: height * 0.01,
    },
    tagOptionSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    tagOptionText: {
        fontSize: width * 0.035,
        color: '#7F8C8D',
        fontWeight: '500',
    },
    tagOptionTextSelected: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    modalActions: {
        flexDirection: 'row',
        padding: width * 0.05,
        gap: width * 0.03,
        borderTopWidth: 1,
        borderTopColor: '#E9ECEF',
    },
    modalCancelButton: {
        flex: 1,
        paddingVertical: height * 0.015,
        borderRadius: width * 0.02,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        alignItems: 'center',
    },
    modalCancelText: {
        fontSize: width * 0.04,
        color: '#7F8C8D',
        fontWeight: '600',
    },
    modalConfirmButton: {
        flex: 1,
        paddingVertical: height * 0.015,
        borderRadius: width * 0.02,
        backgroundColor: '#4A90E2',
        alignItems: 'center',
    },
    modalConfirmText: {
        fontSize: width * 0.04,
        color: '#FFFFFF',
        fontWeight: '600',
    },assessmentInitialView: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    createAssessmentButton: {
        backgroundColor: '#4A90E2',
        borderRadius: 12,
        marginTop: 30,
        marginBottom: 15,
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
        paddingVertical: 16,
        paddingHorizontal: 24,
    },
    createAssessmentText: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    viewAssessmentButton: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        borderWidth: 2,
        borderColor: '#4A90E2',
    },
    viewAssessmentContent: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    viewAssessmentText: {
        color: '#4A90E2',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    assessmentCreationView: {
        flex: 1,
        paddingHorizontal: 20,
    },
    assessmentHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 30,
        paddingVertical: 10,
    },
    backButton: {
        marginRight: 15,
        padding: 5,
    },
    assessmentHeaderTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#2C3E50',
    },
    assessmentTagSection: {
        marginBottom: 25,
    },
    assessmentTagTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 12,
    },
    horizontalScrollView: {
        flexGrow: 0,
    },
    horizontalScrollContent: {
        paddingRight: 20,
    },
    assessmentTagOption: {
        backgroundColor: '#F8F9FA',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 10,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        minWidth: 80,
        alignItems: 'center',
    },
    assessmentTagOptionSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    assessmentTagOptionText: {
        fontSize: 14,
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
        borderRadius: 12,
        padding: 16,
        marginBottom: 20,
        borderLeftWidth: 4,
        borderLeftColor: '#4A90E2',
    },
    selectedTagsTitle: {
        fontSize: 14,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 8,
    },
    selectedTagsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    selectedTag: {
        backgroundColor: '#4A90E2',
        borderRadius: 15,
        paddingVertical: 6,
        paddingHorizontal: 12,
        marginRight: 8,
        marginBottom: 6,
    },
    selectedTagText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontWeight: '500',
    },
    
    
});

export default TeacherApp;