import React, { useState } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Dimensions,
    Alert,
    Modal,
    ActivityIndicator,
    FlatList,
    Image,
    ScrollView
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';

const { width, height } = Dimensions.get('window');

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

interface UploadComponentProps {
    onFilesUploaded?: (files: UploadedFile[]) => void;
    onUploadStart?: () => void;
    onUploadComplete?: (files: UploadedFile[]) => void;
}

const UploadComponent: React.FC<UploadComponentProps> = ({
    onFilesUploaded,
    onUploadStart,
    onUploadComplete
}) => {
    const [uploadModalVisible, setUploadModalVisible] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<UploadedFile[]>([]);
    const [completedFiles, setCompletedFiles] = useState<UploadedFile[]>([]);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    // Format file size
    const formatFileSize = (bytes: number): string => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    // Generate unique ID
    const generateId = (): string => {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    };

    // Simulate file upload with progress
    const simulateUpload = (file: UploadedFile): Promise<UploadedFile> => {
        return new Promise((resolve) => {
            let progress = 0;
            const interval = setInterval(() => {
                progress += Math.random() * 20;
                if (progress >= 100) {
                    progress = 100;
                    clearInterval(interval);
                    const completedFile = {
                        ...file,
                        status: 'completed' as const,
                        progress: 100,
                        uploadDate: new Date().toISOString()
                    };
                    resolve(completedFile);
                } else {
                    setUploadingFiles(prev =>
                        prev.map(f => f.id === file.id ? { ...f, progress } : f)
                    );
                }
            }, 200);
        });
    };

    // Handle PDF upload
    const handlePDFUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
                copyToCacheDirectory: true,
                multiple: true,
            });

            if (!result.canceled && result.assets) {
                const newFiles: UploadedFile[] = result.assets.map(asset => ({
                    id: generateId(),
                    name: asset.name,
                    type: 'pdf' as const,
                    size: formatFileSize(asset.size || 0),
                    uploadDate: '',
                    status: 'uploading' as const,
                    uri: asset.uri,
                    progress: 0
                }));

                setUploadingFiles(prev => [...prev, ...newFiles]);
                setUploadModalVisible(false);
                onUploadStart?.();

                // Upload files with progress
                const uploadPromises = newFiles.map(file => simulateUpload(file));
                const completedUploads = await Promise.all(uploadPromises);

                setUploadingFiles(prev => prev.filter(f => !completedUploads.find(cf => cf.id === f.id)));
                setCompletedFiles(prev => [...prev, ...completedUploads]);
                
                onFilesUploaded?.(completedUploads);
                onUploadComplete?.(completedUploads);
                setShowSuccessModal(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload PDF files. Please try again.');
        }
    };

    // Handle Image upload
    const handleImageUpload = async () => {
        try {
            const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant permission to access your photo library.');
                return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
                mediaTypes: ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection: true,
                quality: 0.8,
            });

            if (!result.canceled && result.assets) {
                const newFiles: UploadedFile[] = result.assets.map(asset => ({
                    id: generateId(),
                    name: asset.fileName || `image_${Date.now()}.jpg`,
                    type: 'image' as const,
                    size: formatFileSize(asset.fileSize || 0),
                    uploadDate: '',
                    status: 'uploading' as const,
                    uri: asset.uri,
                    progress: 0
                }));

                setUploadingFiles(prev => [...prev, ...newFiles]);
                setUploadModalVisible(false);
                onUploadStart?.();

                // Upload files with progress
                const uploadPromises = newFiles.map(file => simulateUpload(file));
                const completedUploads = await Promise.all(uploadPromises);

                setUploadingFiles(prev => prev.filter(f => !completedUploads.find(cf => cf.id === f.id)));
                setCompletedFiles(prev => [...prev, ...completedUploads]);
                
                onFilesUploaded?.(completedUploads);
                onUploadComplete?.(completedUploads);
                setShowSuccessModal(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to upload images. Please try again.');
        }
    };

    // Handle Camera capture
    const handleCameraCapture = async () => {
        try {
            const { status } = await ImagePicker.requestCameraPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission needed', 'Please grant permission to access your camera.');
                return;
            }

            const result = await ImagePicker.launchCameraAsync({
                allowsEditing: true,
                aspect: [4, 3],
                quality: 0.8,
            });

            if (!result.canceled && result.assets[0]) {
                const asset = result.assets[0];
                const newFile: UploadedFile = {
                    id: generateId(),
                    name: `camera_${Date.now()}.jpg`,
                    type: 'image' as const,
                    size: formatFileSize(asset.fileSize || 0),
                    uploadDate: '',
                    status: 'uploading' as const,
                    uri: asset.uri,
                    progress: 0
                };

                setUploadingFiles(prev => [...prev, newFile]);
                setUploadModalVisible(false);
                onUploadStart?.();

                // Upload file with progress
                const completedUpload = await simulateUpload(newFile);

                setUploadingFiles(prev => prev.filter(f => f.id !== newFile.id));
                setCompletedFiles(prev => [...prev, completedUpload]);
                
                onFilesUploaded?.([completedUpload]);
                onUploadComplete?.([completedUpload]);
                setShowSuccessModal(true);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to capture image. Please try again.');
        }
    };

    // Render upload progress item
    const renderUploadItem = ({ item }: { item: UploadedFile }) => (
        <View style={styles.uploadItem}>
            <View style={styles.uploadItemLeft}>
                <View style={[styles.fileIcon, { backgroundColor: item.type === 'pdf' ? '#FF6B6B15' : '#4ECDC415' }]}>
                    <Icon 
                        name={item.type === 'pdf' ? 'picture-as-pdf' : 'image'} 
                        size={24} 
                        color={item.type === 'pdf' ? '#FF6B6B' : '#4ECDC4'} 
                    />
                </View>
                <View style={styles.fileInfo}>
                    <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
                    <Text style={styles.fileSize}>{item.size}</Text>
                    <View style={styles.progressContainer}>
                        <View style={styles.progressBar}>
                            <View style={[styles.progressFill, { width: `${item.progress || 0}%` }]} />
                        </View>
                        <Text style={styles.progressText}>{Math.round(item.progress || 0)}%</Text>
                    </View>
                </View>
            </View>
            <ActivityIndicator size="small" color="#667eea" />
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Upload Button */}
            <TouchableOpacity
                style={styles.uploadButton}
                onPress={() => setUploadModalVisible(true)}
                activeOpacity={0.8}
            >
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.uploadButtonGradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Icon name="cloud-upload" size={28} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Upload New Content</Text>
                    <Text style={styles.uploadButtonSubtext}>PDFs, Images & More</Text>
                </LinearGradient>
            </TouchableOpacity>

            {/* Uploading Files List */}
            {uploadingFiles.length > 0 && (
                <View style={styles.uploadingSection}>
                    <Text style={styles.sectionTitle}>Uploading...</Text>
                    <FlatList
                        data={uploadingFiles}
                        renderItem={renderUploadItem}
                        keyExtractor={(item) => item.id}
                        scrollEnabled={false}
                    />
                </View>
            )}

            {/* Upload Options Modal */}
            <Modal
                visible={uploadModalVisible}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setUploadModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Upload Content</Text>
                            <TouchableOpacity
                                onPress={() => setUploadModalVisible(false)}
                                style={styles.closeButton}
                            >
                                <Icon name="close" size={24} color="#7F8C8D" />
                            </TouchableOpacity>
                        </View>

                        <ScrollView style={styles.optionsContainer}>
                            {/* PDF Upload */}
                            <TouchableOpacity style={styles.optionCard} onPress={handlePDFUpload}>
                                <LinearGradient
                                    colors={['#FF6B6B15', '#FF6B6B05']}
                                    style={styles.optionGradient}
                                >
                                    <View style={styles.optionIcon}>
                                        <Icon name="picture-as-pdf" size={32} color="#FF6B6B" />
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text style={styles.optionTitle}>Upload PDFs</Text>
                                        <Text style={styles.optionDescription}>
                                            Select PDF documents from your device
                                        </Text>
                                    </View>
                                    <Icon name="arrow-forward-ios" size={16} color="#BDC3C7" />
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Image Gallery Upload */}
                            <TouchableOpacity style={styles.optionCard} onPress={handleImageUpload}>
                                <LinearGradient
                                    colors={['#4ECDC415', '#4ECDC405']}
                                    style={styles.optionGradient}
                                >
                                    <View style={styles.optionIcon}>
                                        <Icon name="photo-library" size={32} color="#4ECDC4" />
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text style={styles.optionTitle}>Photo Gallery</Text>
                                        <Text style={styles.optionDescription}>
                                            Choose images from your gallery
                                        </Text>
                                    </View>
                                    <Icon name="arrow-forward-ios" size={16} color="#BDC3C7" />
                                </LinearGradient>
                            </TouchableOpacity>

                            {/* Camera Capture */}
                            <TouchableOpacity style={styles.optionCard} onPress={handleCameraCapture}>
                                <LinearGradient
                                    colors={['#45B7D115', '#45B7D105']}
                                    style={styles.optionGradient}
                                >
                                    <View style={styles.optionIcon}>
                                        <Icon name="camera-alt" size={32} color="#45B7D1" />
                                    </View>
                                    <View style={styles.optionContent}>
                                        <Text style={styles.optionTitle}>Take Photo</Text>
                                        <Text style={styles.optionDescription}>
                                            Capture image using camera
                                        </Text>
                                    </View>
                                    <Icon name="arrow-forward-ios" size={16} color="#BDC3C7" />
                                </LinearGradient>
                            </TouchableOpacity>
                        </ScrollView>
                    </View>
                </View>
            </Modal>

            {/* Success Modal */}
            <Modal
                visible={showSuccessModal}
                transparent={true}
                animationType="fade"
                onRequestClose={() => setShowSuccessModal(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.successModalContent}>
                        <View style={styles.successIcon}>
                            <Icon name="check-circle" size={64} color="#4CAF50" />
                        </View>
                        <Text style={styles.successTitle}>Upload Successful!</Text>
                        <Text style={styles.successMessage}>
                            Your files have been uploaded successfully and are now available in your library.
                        </Text>
                        <TouchableOpacity
                            style={styles.successButton}
                            onPress={() => setShowSuccessModal(false)}
                        >
                            <Text style={styles.successButtonText}>Great!</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginTop: height * 0.02,
    },
    uploadButton: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        marginBottom: height * 0.02,
    },
    uploadButtonGradient: {
        padding: width * 0.06,
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: height * 0.15,
    },
    uploadButtonText: {
        fontSize: width * 0.045,
        fontWeight: '700',
        color: '#FFFFFF',
        marginTop: height * 0.01,
    },
    uploadButtonSubtext: {
        fontSize: width * 0.032,
        color: 'rgba(255, 255, 255, 0.8)',
        marginTop: height * 0.005,
    },

    // Uploading Section
    uploadingSection: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: width * 0.04,
        marginBottom: height * 0.02,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 2,
    },
    sectionTitle: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: height * 0.015,
    },
    uploadItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: height * 0.01,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
        marginBottom: height * 0.01,
    },
    uploadItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    fileIcon: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: width * 0.06,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width * 0.03,
    },
    fileInfo: {
        flex: 1,
    },
    fileName: {
        fontSize: width * 0.035,
        fontWeight: '500',
        color: '#2C3E50',
        marginBottom: 2,
    },
    fileSize: {
        fontSize: width * 0.03,
        color: '#7F8C8D',
        marginBottom: height * 0.005,
    },
    progressContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: width * 0.02,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: '#E9ECEF',
        borderRadius: 2,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#667eea',
        borderRadius: 2,
    },
    progressText: {
        fontSize: width * 0.028,
        color: '#7F8C8D',
        width: width * 0.08,
        textAlign: 'right',
    },

    // Modal Styles
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: width * 0.9,
        maxHeight: height * 0.8,
        overflow: 'hidden',
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
        fontWeight: '700',
        color: '#2C3E50',
    },
    closeButton: {
        padding: width * 0.02,
    },
    optionsContainer: {
        padding: width * 0.05,
    },
    optionCard: {
        marginBottom: height * 0.015,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    optionGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: width * 0.04,
    },
    optionIcon: {
        width: width * 0.15,
        height: width * 0.15,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width * 0.04,
    },
    optionContent: {
        flex: 1,
    },
    optionTitle: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 4,
    },
    optionDescription: {
        fontSize: width * 0.032,
        color: '#7F8C8D',
    },

    // Success Modal
    successModalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        width: width * 0.85,
        padding: width * 0.08,
        alignItems: 'center',
    },
    successIcon: {
        marginBottom: height * 0.02,
    },
    successTitle: {
        fontSize: width * 0.05,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: height * 0.01,
        textAlign: 'center',
    },
    successMessage: {
        fontSize: width * 0.035,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: width * 0.05,
        marginBottom: height * 0.03,
    },
    successButton: {
        backgroundColor: '#4CAF50',
        borderRadius: 25,
        paddingHorizontal: width * 0.1,
        paddingVertical: height * 0.015,
    },
    successButtonText: {
        fontSize: width * 0.04,
        fontWeight: '600',
        color: '#FFFFFF',
    },
});

export default UploadComponent;