import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Dimensions, Alert, ActivityIndicator, Modal } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

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

interface UploadTabProps {
    onFilesProcessed?: (files: UploadedFile[]) => void;
}

const UploadTab: React.FC<UploadTabProps> = ({ onFilesProcessed }) => {
    const [selectedFiles, setSelectedFiles] = useState<UploadedFile[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);

    // Tag selection states
    const [tagModal, setTagModal] = useState<TagModalState>({ visible: false, uploadType: null });
    const [selectedTags, setSelectedTags] = useState({
        standard: '',
        subject: '',
        chapter: '',
        language: '',
    });

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

    const resetTags = () => {
        setSelectedTags({
            standard: '',
            subject: '',
            chapter: '',
            language: '',
        });
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
                console.log(file)
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

        Alert.alert(
            'Processing Content',
            `Processing ${selectedFiles.length} file(s) for content generation.\n\nThis may take a few minutes.`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Start Processing',
                    onPress: () => {
                        console.log('Processing started...');
                        if (onFilesProcessed) {
                            onFilesProcessed(selectedFiles);
                        }
                        setSelectedFiles([]);
                        Alert.alert('Success', 'Content has been processed and moved to the Library.');
                    },
                },
            ]
        );
    };

    const TagSelectionModal = () => (
        <Modal
            visible={tagModal.visible}
            animationType="fade"
            transparent={true}
            onRequestClose={closeTagModal}
        >
            <View style={styles.modalOverlay}>
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
        </Modal>
    );

    return (
        <View style={styles.tabContent}>
            <View style={styles.uploadSection}>
                <Text style={styles.sectionTitle}>Interactive Learning Made Easy</Text>
                <Text style={styles.sectionSubtitle}>
                    Upload PDF documents or images to turn your resources into impactful learning environments
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

            {/* Tag Selection Modal */}
            {TagSelectionModal()}
        </View>
    );
};

const styles = StyleSheet.create({
    tabContent: {
        flex: 1,
    },
    uploadSection: {
        marginBottom: height * 0.03,
    },
    sectionTitle: {
        fontSize: width * 0.055,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: height * 0.01,
    },
    sectionSubtitle: {
        fontSize: width * 0.038,
        color: '#7F8C8D',
        marginBottom: height * 0.025,
        lineHeight: height * 0.028,
    },
    uploadButtons: {
        flexDirection: 'row',
        gap: width * 0.04,
    },
    uploadButton: {
        flex: 1,
    },
    uploadButtonContent: {
        padding: width * 0.05,
        borderRadius: width * 0.04,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        backgroundColor: '#FFFFFF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 3 },
        shadowOpacity: 0.15,
        shadowRadius: 6,
        elevation: 4,
        height: height * 0.16,
    },
    pdfButton: {
        borderColor: '#E74C3C',
    },
    imageButton: {
        borderColor: '#27AE60',
    },
    uploadButtonText: {
        fontSize: width * 0.042,
        fontWeight: '600',
        color: '#2C3E50',
        marginTop: height * 0.012,
        marginBottom: height * 0.005,
        textAlign: 'center',
    },
    uploadButtonSubtext: {
        fontSize: width * 0.032,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: height * 0.022,
    },
    uploadProgress: {
        marginTop: height * 0.025,
        padding: width * 0.04,
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.03,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    progressHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.012,
    },
    progressText: {
        fontSize: width * 0.038,
        fontWeight: '600',
        color: '#4A90E2',
        marginLeft: width * 0.02,
    },
    progressBar: {
        height: height * 0.006,
        backgroundColor: '#E9ECEF',
        borderRadius: height * 0.003,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#4A90E2',
        borderRadius: height * 0.003,
    },
    filesSection: {
        marginTop: height * 0.02,
    },
    fileItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: width * 0.04,
        borderRadius: width * 0.03,
        marginBottom: height * 0.012,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
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
        fontSize: width * 0.038,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: height * 0.004,
    },
    fileDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: height * 0.008,
    },
    fileSize: {
        fontSize: width * 0.032,
        color: '#7F8C8D',
    },
    fileDot: {
        fontSize: width * 0.032,
        color: '#7F8C8D',
        marginHorizontal: width * 0.015,
    },
    fileDate: {
        fontSize: width * 0.032,
        color: '#7F8C8D',
    },
    fileTags: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: width * 0.015,
    },
    tag: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.002,
        borderRadius: width * 0.01,
    },
    tagText: {
        fontSize: width * 0.028,
        color: '#1976D2',
        fontWeight: '500',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.004,
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
        fontSize: width * 0.028,
        fontWeight: '600',
        marginLeft: width * 0.008,
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
    processButton: {
        marginTop: height * 0.02,
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
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        borderRadius: width * 0.04,
        width: width * 0.9,
        maxHeight: height * 0.8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.25,
        shadowRadius: 20,
        elevation: 15,
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
        fontSize: width * 0.04,
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
        paddingHorizontal: width * 0.035,
        paddingVertical: height * 0.01,
        borderRadius: width * 0.02,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        marginBottom: height * 0.008,
    },
    tagOptionSelected: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    tagOptionText: {
        fontSize: width * 0.032,
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
        fontSize: width * 0.038,
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
        fontSize: width * 0.038,
        color: '#FFFFFF',
        fontWeight: '600',
    },
});

export default UploadTab;