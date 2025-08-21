import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Dimensions, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';

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

interface LibraryProps {
    libraryFiles?: UploadedFile[];
    onFileSelect?: (file: UploadedFile) => void;
}

const Library: React.FC<LibraryProps> = ({ libraryFiles = [], onFileSelect }) => {
    const [files, setFiles] = useState<UploadedFile[]>(libraryFiles);
    const [selectedFilter, setSelectedFilter] = useState<'all' | 'pdf' | 'image'>('all');
    const [selectedSubject, setSelectedSubject] = useState<string>('All Subjects');

    useEffect(() => {
        setFiles(libraryFiles);
    }, [libraryFiles]);

    const subjects = ['All Subjects', ...Array.from(new Set(files.map(file => file.tags.subject)))];

    const filteredFiles = files.filter(file => {
        const typeFilter = selectedFilter === 'all' || file.type === selectedFilter;
        const subjectFilter = selectedSubject === 'All Subjects' || file.tags.subject === selectedSubject;
        return typeFilter && subjectFilter;
    });

    const renderFileItem = ({ item }: { item: UploadedFile }) => {
        return (
            <TouchableOpacity
                style={styles.fileCard}
                onPress={() => onFileSelect?.(item)}
                activeOpacity={0.8}
            >
                <View style={styles.fileIconContainer}>
                    <Icon
                        name={item.type === 'pdf' ? 'picture-as-pdf' : 'image'}
                        size={32}
                        color={item.type === 'pdf' ? '#E74C3C' : '#27AE60'}
                    />
                </View>

                <View style={styles.fileContent}>
                    <Text style={styles.fileName} numberOfLines={2}>{item.name}</Text>

                    <View style={styles.fileMetadata}>
                        <Text style={styles.fileSize}>{item.size}</Text>
                        <Text style={styles.fileDot}>•</Text>
                        <Text style={styles.fileDate}>{item.uploadDate}</Text>
                    </View>

                    <View style={styles.fileTags}>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{item.tags.standard}</Text>
                        </View>
                        <View style={styles.tag}>
                            <Text style={styles.tagText}>{item.tags.subject}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.fileActions}>
                    <View
                        style={[
                            styles.statusIndicator,
                            item.status === 'completed' && styles.statusCompleted,
                            item.status === 'processing' && styles.statusProcessing,
                            item.status === 'failed' && styles.statusFailed,
                        ]}
                    >
                        {item.status === 'processing' && <ActivityIndicator size="small" color="#F39C12" />}
                        {item.status === 'completed' && <Icon name="check-circle" size={16} color="#27AE60" />}
                        {item.status === 'failed' && <Icon name="error" size={16} color="#E74C3C" />}
                    </View>
                    <Icon name="chevron-right" size={20} color="#BDC3C7" />
                </View>
            </TouchableOpacity>
        )
    }

    const renderEmptyState = () => (
        <View style={styles.emptyState}>
            <Icon name="folder-open" size={width * 0.16} color="#BDC3C7" />
            <Text style={styles.emptyStateTitle}>No Files in Library</Text>
            <Text style={styles.emptyStateDescription}>
                Upload files from the Upload tab to see them here
            </Text>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Library</Text>
                <Text style={styles.headerSubtitle}>
                    {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''} available
                </Text>
            </View>

            {/* Filters */}
            <View style={styles.filtersSection}>
                {/* File Type Filter */}
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>File Type</Text>
                    <View style={styles.filterButtons}>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                selectedFilter === 'all' && styles.filterButtonActive
                            ]}
                            onPress={() => setSelectedFilter('all')}
                        >
                            <Text style={[
                                styles.filterButtonText,
                                selectedFilter === 'all' && styles.filterButtonTextActive
                            ]}>
                                All
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                selectedFilter === 'pdf' && styles.filterButtonActive
                            ]}
                            onPress={() => setSelectedFilter('pdf')}
                        >
                            <Icon name="picture-as-pdf" size={16} color={selectedFilter === 'pdf' ? '#FFFFFF' : '#7F8C8D'} />
                            <Text style={[
                                styles.filterButtonText,
                                selectedFilter === 'pdf' && styles.filterButtonTextActive
                            ]}>
                                PDF
                            </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={[
                                styles.filterButton,
                                selectedFilter === 'image' && styles.filterButtonActive
                            ]}
                            onPress={() => setSelectedFilter('image')}
                        >
                            <Icon name="image" size={16} color={selectedFilter === 'image' ? '#FFFFFF' : '#7F8C8D'} />
                            <Text style={[
                                styles.filterButtonText,
                                selectedFilter === 'image' && styles.filterButtonTextActive
                            ]}>
                                Images
                            </Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Subject Filter */}
                <View style={styles.filterGroup}>
                    <Text style={styles.filterLabel}>Subject</Text>
                    <View style={styles.subjectFilter}>
                        <FlatList
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            data={subjects}
                            keyExtractor={(item) => item}
                            renderItem={({ item }) => (
                                <TouchableOpacity
                                    style={[
                                        styles.subjectButton,
                                        selectedSubject === item && styles.subjectButtonActive
                                    ]}
                                    onPress={() => setSelectedSubject(item)}
                                >
                                    <Text style={[
                                        styles.subjectButtonText,
                                        selectedSubject === item && styles.subjectButtonTextActive
                                    ]}>
                                        {item}
                                    </Text>
                                </TouchableOpacity>
                            )}
                            contentContainerStyle={styles.subjectScrollContent}
                        />
                    </View>
                </View>
            </View>

            {/* Files List */}
            <View style={styles.filesContainer}>
                {filteredFiles.length > 0 ? (
                    <FlatList
                        data={filteredFiles}
                        keyExtractor={(item) => item.id}
                        renderItem={renderFileItem}
                        showsVerticalScrollIndicator={false}
                        contentContainerStyle={styles.filesList}
                    />
                ) : files.length > 0 ? (
                    <View style={styles.noResultsState}>
                        <Icon name="search-off" size={width * 0.12} color="#BDC3C7" />
                        <Text style={styles.noResultsTitle}>No files match your filters</Text>
                        <Text style={styles.noResultsDescription}>
                            Try adjusting your filter criteria
                        </Text>
                    </View>
                ) : (
                    renderEmptyState()
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    header: {
        marginBottom: height * 0.025,
    },
    headerTitle: {
        fontSize: width * 0.055,
        fontWeight: '700',
        color: '#2C3E50',
        marginBottom: height * 0.005,
    },
    headerSubtitle: {
        fontSize: width * 0.038,
        color: '#7F8C8D',
    },
    filtersSection: {
        marginBottom: height * 0.025,
    },
    filterGroup: {
        marginBottom: height * 0.02,
    },
    filterLabel: {
        fontSize: width * 0.038,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: height * 0.01,
    },
    filterButtons: {
        flexDirection: 'row',
        gap: width * 0.02,
    },
    filterButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: width * 0.035,
        paddingVertical: height * 0.01,
        borderRadius: width * 0.05,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
    },
    filterButtonActive: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    filterButtonText: {
        fontSize: width * 0.032,
        fontWeight: '500',
        color: '#7F8C8D',
        marginLeft: width * 0.01,
    },
    filterButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    subjectFilter: {
        marginRight: -width * 0.05, // Compensate for container padding
    },
    subjectScrollContent: {
        paddingRight: width * 0.05,
    },
    subjectButton: {
        paddingHorizontal: width * 0.04,
        paddingVertical: height * 0.01,
        borderRadius: width * 0.04,
        backgroundColor: '#F8F9FA',
        borderWidth: 1,
        borderColor: '#E9ECEF',
        marginRight: width * 0.025,
        minWidth: width * 0.2,
        alignItems: 'center',
    },
    subjectButtonActive: {
        backgroundColor: '#4A90E2',
        borderColor: '#4A90E2',
    },
    subjectButtonText: {
        fontSize: width * 0.032,
        fontWeight: '500',
        color: '#7F8C8D',
        textAlign: 'center',
    },
    subjectButtonTextActive: {
        color: '#FFFFFF',
        fontWeight: '600',
    },
    filesContainer: {
        flex: 1,
    },
    filesList: {
        paddingBottom: height * 0.02,
    },
    fileCard: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        padding: width * 0.04,
        borderRadius: width * 0.03,
        marginBottom: height * 0.015,
        borderWidth: 1,
        borderColor: '#E9ECEF',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 4,
        elevation: 2,
    },
    fileIconContainer: {
        width: width * 0.12,
        height: width * 0.12,
        borderRadius: width * 0.02,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width * 0.035,
    },
    fileContent: {
        flex: 1,
    },
    fileName: {
        fontSize: width * 0.038,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: height * 0.006,
        lineHeight: width * 0.045,
    },
    fileMetadata: {
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
        gap: width * 0.015,
    },
    tag: {
        backgroundColor: '#E3F2FD',
        paddingHorizontal: width * 0.02,
        paddingVertical: height * 0.003,
        borderRadius: width * 0.01,
    },
    tagText: {
        fontSize: width * 0.028,
        color: '#1976D2',
        fontWeight: '500',
    },
    fileActions: {
        alignItems: 'center',
        gap: height * 0.008,
    },
    statusIndicator: {
        padding: width * 0.01,
    },
    statusCompleted: {
        // No additional styling needed, icon handles color
    },
    statusProcessing: {
        // No additional styling needed, icon handles color
    },
    statusFailed: {
        // No additional styling needed, icon handles color
    },
    emptyState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.1,
        paddingVertical: height * 0.05,
    },
    emptyStateTitle: {
        fontSize: width * 0.045,
        fontWeight: '600',
        color: '#2C3E50',
        marginTop: height * 0.02,
        marginBottom: height * 0.01,
        textAlign: 'center',
    },
    emptyStateDescription: {
        fontSize: width * 0.035,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: height * 0.025,
    },
    noResultsState: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.1,
        paddingVertical: height * 0.05,
    },
    noResultsTitle: {
        fontSize: width * 0.042,
        fontWeight: '600',
        color: '#2C3E50',
        marginTop: height * 0.015,
        marginBottom: height * 0.008,
        textAlign: 'center',
    },
    noResultsDescription: {
        fontSize: width * 0.032,
        color: '#7F8C8D',
        textAlign: 'center',
        lineHeight: height * 0.022,
    },
});

export default Library;