import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Dimensions, Alert, ActivityIndicator, } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'; 

const { width, height } = Dimensions.get('window');
type Navigation = NativeStackNavigationProp<RootStackParamList, 'TeacherApp'>;

interface UploadedFile {
    id: string;
    name: string;
    type: 'pdf' | 'image';
    size: string;
    uploadDate: string;
    status: 'processing' | 'completed' | 'failed';
}

const TeacherApp: React.FC = () => {
    const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
    const [libraryFiles, setLibraryFiles] = useState<UploadedFile[]>([]);
    const [teachFromContent, setTeachFromContent] = useState(false);
    const [createExam, setCreateExam] = useState(false);
    const [generateQuiz, setGenerateQuiz] = useState(false);
    const [createAssignment, setCreateAssignment] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [activeTab, setActiveTab] = useState<'upload' | 'library' | 'analytics'>('upload');

    const navigation = useNavigation<Navigation>();
    const resetOptions = () => {
        setTeachFromContent(false);
        setCreateExam(false);
        setGenerateQuiz(false);
        setCreateAssignment(false);
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
                    id: Date.now().toString(),
                    name: file.name || (type === 'pdf' ? 'Document.pdf' : 'Image.jpg'),
                    type,
                    size: file.size ? `${(file.size / (1024 * 1024)).toFixed(1)} MB` : '1.2 MB',
                    uploadDate: new Date().toLocaleDateString(),
                    status: 'processing',
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

    const hasAnyOptionSelected = teachFromContent || createExam || generateQuiz || createAssignment;

    // Prevent ScrollView from reacting to touch events in the actions section
    const stopPropagation = {
        onStartShouldSetResponder: () => true,
        onResponderTerminationRequest: () => false,
    };

    const UploadTab = () => (
        <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="always" // Changed to 'always' to prevent tap interference
            keyboardDismissMode="none" // Disable keyboard-related scrolling
            scrollEventThrottle={16} // Improve scroll performance
        >
            <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Interactive Learning Made Easy</Text>
                <Text style={styles.sectionSubtitle}>
                    Upload PDF documents or images to turn your resource to impactful learning environment
                </Text>

                <View style={styles.uploadButtons}>
                    <TouchableOpacity
                        style={styles.uploadButton}
                        onPress={() => handleFileUpload('pdf')}
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
                        onPress={() => handleFileUpload('image')}
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
                <View style={styles.actionsSection} {...stopPropagation}>
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

                        {/* <TouchableOpacity
                            style={styles.checkboxItem}
                            onPress={() => handleCheckboxPress(setGenerateQuiz)}
                            activeOpacity={0.8}
                        >
                            <View style={[styles.checkbox, generateQuiz && styles.checkboxSelected]}>
                                {generateQuiz && <Icon name="check" size={16} color="#FFFFFF" />}
                            </View>
                            <View style={styles.checkboxContent}>
                                <Text style={styles.checkboxTitle}>Quick Quiz Generator</Text>
                                <Text style={styles.checkboxDescription}>
                                    Create short quizzes for quick assessments and practice tests
                                </Text>
                            </View>
                            <Icon name="quiz" size={24} color="#1ABC9C" />
                        </TouchableOpacity> */}

                        {/* <TouchableOpacity
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
                                    Generate homework assignments and practice exercises
                                </Text>
                            </View>
                            <Icon name="task" size={24} color="#E74C3C" />
                        </TouchableOpacity> */}
                    </View>

                    {hasAnyOptionSelected && (
                        <TouchableOpacity
                            style={styles.clearButton}
                            onPress={clearAllOptions}
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

    const LibraryTab = () => (
        <View style={styles.tabContent}>
            {libraryFiles.length === 0 ? (
                <View style={styles.emptyState}>
                    <Icon name="folder-open" size={width * 0.16} color="#CCCCCC" />
                    <Text style={styles.emptyStateTitle}>Content Library</Text>
                    <Text style={styles.emptyStateDescription}>
                        Your generated teaching materials, exams, and assignments will appear here
                    </Text>
                </View>
            ) : (
                <ScrollView
                    style={styles.tabContent}
                    contentContainerStyle={styles.scrollContent}
                    keyboardShouldPersistTaps="always"
                    keyboardDismissMode="none"
                >
                    <View style={styles.filesSection}>
                        <Text style={styles.sectionTitle}>Generated Content ({libraryFiles.length})</Text>
                        {libraryFiles.map(file => (
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
                                </View>
                                <View style={[styles.statusBadge, styles.statusCompleted]}>
                                    <Icon name="check-circle" size={16} color="#27AE60" />
                                    <Text style={[styles.statusText, styles.statusTextCompleted]}>Generated</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                </ScrollView>
            )}
        </View>
    );

    const AnalyticsTab = () => (
        <View style={styles.tabContent}>
            <View style={styles.emptyState}>
                <Icon name="analytics" size={width * 0.16} color="#CCCCCC" />
                <Text style={styles.emptyStateTitle}>Analytics Dashboard</Text>
                <Text style={styles.emptyStateDescription}>
                    Track student performance, content usage, and engagement metrics
                </Text>
            </View>
        </View>
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
                                <Text style={styles.teacherName}>Goku Thirumal</Text>
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
                        style={[styles.tab, activeTab === 'analytics' && styles.activeTab]}
                        onPress={() => setActiveTab('analytics')}
                    >
                        <Icon
                            name="analytics"
                            size={20}
                            color={activeTab === 'analytics' ? '#4A90E2' : '#95A5A6'}
                        />
                        <Text
                            style={[styles.tabText, activeTab === 'analytics' && styles.activeTabText]}
                        >
                            Analytics
                        </Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>

            <View style={styles.contentContainer}>
                {activeTab === 'upload' && <UploadTab />}
                {activeTab === 'library' && <LibraryTab />}
                {activeTab === 'analytics' && <AnalyticsTab />}
            </View>
        </View>
    );
};

// Styles remain unchanged
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
        boarderBottomColor: '#4A90E2',
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
        marginTop: height * 0.02,
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
});

export default TeacherApp;