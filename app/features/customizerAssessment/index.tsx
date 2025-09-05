import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, SafeAreaView, Dimensions, Alert } from 'react-native';
import { ChevronRight, Plus, Edit3, Trash2, Download, Eye, FileText, Settings, Save, Languages, Upload } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from 'expo-file-system';

const { width, height } = Dimensions.get('window');

const scale = (size: number) => (width / 375) * size;

// Types
interface ContentTags {
    standard: string;
    subject: string;
    chapter: string;
    language: string;
}

interface UploadedContent {
    id: string;
    fileName: string;
    tags: ContentTags;
    uploadDate: string;
    contentType: string;
}

interface QuestionType {
    count: number;
    marks: number;
}

interface ExamConfig {
    totalMarks: number;
    duration: number;
    questionTypes: {
        'multiple-choice': QuestionType;
        'short-answer': QuestionType;
        'true-false': QuestionType;
        'match-the-following': QuestionType;
    };
    difficulty: string;
}

interface MatchQuestion {
    id: string;
    type: 'match-the-following';
    question: string;
    leftColumn: string[];
    rightColumn: string[];
    correctAnswer: Record<string, string>;
    marks: number;
    difficulty: string;
}

interface OtherQuestion {
    id: string;
    type: string;
    question: string;
    options?: string[];
    correctAnswer?: number | boolean | string;
    marks: number;
    difficulty: string;
}

type Question = MatchQuestion | OtherQuestion;

interface UploadPdfComponentProps {
    uploadedFile: DocumentPicker.DocumentPickerAsset | null;
    setUploadedFile: React.Dispatch<React.SetStateAction<DocumentPicker.DocumentPickerAsset | null>>;
}

type CurrentStep = 'selection' | 'configure' | 'generate' | 'preview';

// Mock data
const mockUploadedContent: UploadedContent[] = [
    {
        id: '1',
        fileName: 'Mathematics_Chapter1.pdf',
        tags: { standard: 'Class 10', subject: 'Mathematics', chapter: 'Chapter 1', language: 'English' },
        uploadDate: '2024-01-15',
        contentType: 'pdf'
    },
    {
        id: '2',
        fileName: 'Science_Diagram.jpg',
        tags: { standard: 'Class 9', subject: 'Science', chapter: 'Chapter 1', language: 'English' },
        uploadDate: '2024-01-16',
        contentType: 'image'
    },
    {
        id: '3',
        fileName: 'History_Notes.pdf',
        tags: { standard: 'Class 8', subject: 'Social Studies', chapter: 'Chapter 1', language: 'Tamil' },
        uploadDate: '2024-01-17',
        contentType: 'pdf'
    },
    {
        id: '4',
        fileName: 'Mathematics_Chapter2.pdf',
        tags: { standard: 'Class 10', subject: 'Mathematics', chapter: 'Chapter 2', language: 'English' },
        uploadDate: '2024-01-18',
        contentType: 'pdf'
    },
    {
        id: '5',
        fileName: 'Science_Notes_Ch2.pdf',
        tags: { standard: 'Class 9', subject: 'Science', chapter: 'Chapter 2', language: 'English' },
        uploadDate: '2024-01-19',
        contentType: 'pdf'
    }
];

const UploadPdfComponent: React.FC<UploadPdfComponentProps> = ({ uploadedFile, setUploadedFile }) => {
    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setUploadedFile(file);
            }
        } catch (err) {
            console.error('Document Picker Error: ', err);
            Alert.alert('Error', 'Failed to pick document.');
        }
    };

    return (
        <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Upload PDF Content</Text>
            {uploadedFile ? (
                <View style={styles.fileNameContainer}>
                    <FileText size={scale(20)} color="#3B82F6" />
                    <Text style={styles.fileNameText}>{uploadedFile.name}</Text>
                </View>
            ) : (
                <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                    <Upload size={scale(16)} color="#FFFFFF" />
                    <Text style={styles.uploadButtonText}>Upload PDF</Text>
                </TouchableOpacity>
            )}
        </View>
    );
};

interface SelectionStepProps {
    selectedCurriculum: string;
    setSelectedCurriculum: React.Dispatch<React.SetStateAction<string>>;
    selectedStandard: string;
    setSelectedStandard: React.Dispatch<React.SetStateAction<string>>;
    selectedSubject: string;
    setSelectedSubject: React.Dispatch<React.SetStateAction<string>>;
    selectedChapters: string[];
    setSelectedChapters: React.Dispatch<React.SetStateAction<string[]>>;
    selectedLanguage: string;
    setSelectedLanguage: React.Dispatch<React.SetStateAction<string>>;
    setCurrentStep: React.Dispatch<React.SetStateAction<CurrentStep>>;
    availableStandards: string[];
    availableSubjects: string[];
    availableChapters: string[];
    availableLanguagesForStateBoard: string[];
    availableLanguagesForCBSE: string[];
    toggleChapterSelection: (chapter: string) => void;
    uploadedFile: DocumentPicker.DocumentPickerAsset | null;
    setUploadedFile: React.Dispatch<React.SetStateAction<DocumentPicker.DocumentPickerAsset | null>>;
    examTitle: string;
    setExamTitle: React.Dispatch<React.SetStateAction<string>>;
}

const SelectionStep: React.FC<SelectionStepProps> = ({
    selectedCurriculum,
    setSelectedCurriculum,
    selectedStandard,
    setSelectedStandard,
    selectedSubject,
    setSelectedSubject,
    selectedChapters,
    setSelectedChapters,
    selectedLanguage,
    setSelectedLanguage,
    setCurrentStep,
    availableStandards,
    availableSubjects,
    availableChapters,
    availableLanguagesForStateBoard,
    availableLanguagesForCBSE,
    toggleChapterSelection,
    uploadedFile,
    setUploadedFile,
    examTitle,
    setExamTitle,
}) => {
    const MemoizedChapterButton = React.memo(({ chapter, isSelected, onPress }: { chapter: string; isSelected: boolean; onPress: (chapter: string) => void }) => {
        return (
            <TouchableOpacity
                style={[styles.selectionButton, isSelected && styles.selectedButton]}
                onPress={() => onPress(chapter)}
            >
                <Text style={[styles.buttonText, isSelected && styles.selectedButtonText]}>
                    {chapter}
                </Text>
            </TouchableOpacity>
        );
    });

    const MemoizedSelectionButton = React.memo(({ item, isSelected, onPress }: { item: string; isSelected: boolean; onPress: (item: string) => void }) => {
        return (
            <TouchableOpacity
                style={[styles.selectionButton, isSelected && styles.selectedButton]}
                onPress={() => onPress(item)}
            >
                <Text style={[styles.buttonText, isSelected && styles.selectedButtonText]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    });

    return (
        <ScrollView
            style={styles.container}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: 10 }}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Create Assessment</Text>
                <Text style={styles.subtitle}>
                    Select the content parameters for your assessment based on your uploaded materials.
                </Text>

                <View style={styles.breadcrumb}>
                    <TouchableOpacity onPress={() => { setSelectedCurriculum(''); setSelectedLanguage(''); setSelectedStandard(''); setSelectedSubject(''); setSelectedChapters([]); }}>
                        <Text style={styles.breadcrumbText}>Curriculum</Text>
                    </TouchableOpacity>
                    {selectedCurriculum && (
                        <>
                            <ChevronRight size={scale(16)} color="#9CA3AF" />
                            <TouchableOpacity onPress={() => { setSelectedLanguage(''); setSelectedStandard(''); setSelectedSubject(''); setSelectedChapters([]); }}>
                                <Text style={styles.breadcrumbText}>Language</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {selectedLanguage && (
                        <>
                            <ChevronRight size={scale(16)} color="#9CA3AF" />
                            <TouchableOpacity onPress={() => { setSelectedStandard(''); setSelectedSubject(''); setSelectedChapters([]); }}>
                                <Text style={styles.breadcrumbText}>Standard</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {selectedStandard && (
                        <>
                            <ChevronRight size={scale(16)} color="#9CA3AF" />
                            <TouchableOpacity onPress={() => { setSelectedSubject(''); setSelectedChapters([]); }}>
                                <Text style={styles.breadcrumbText}>Subject</Text>
                            </TouchableOpacity>
                        </>
                    )}
                    {selectedSubject && (
                        <>
                            <ChevronRight size={scale(16)} color="#9CA3AF" />
                            <TouchableOpacity onPress={() => { setSelectedChapters([]); }}>
                                <Text style={styles.breadcrumbText}>Chapter</Text>
                            </TouchableOpacity>
                        </>
                    )}
                </View>

                <View style={styles.inputGroup}>
                    <Text style={styles.inputLabel}>Exam title</Text>
                    <TextInput
                        style={styles.input}
                        keyboardType="default"
                        placeholder="Enter"
                        value={examTitle}
                        onChangeText={setExamTitle}
                    />
                </View>

                <UploadPdfComponent uploadedFile={uploadedFile} setUploadedFile={setUploadedFile} />

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Select Curriculum</Text>
                    <View style={styles.grid}>
                        {['State Board', 'CBSE'].map((curriculum) => (
                            <MemoizedSelectionButton
                                key={curriculum}
                                item={curriculum}
                                isSelected={selectedCurriculum === curriculum}
                                onPress={(item) => {
                                    setSelectedCurriculum(item);
                                    setSelectedLanguage('');
                                    setSelectedStandard('');
                                    setSelectedSubject('');
                                    setSelectedChapters([]);
                                    if (item === 'CBSE') {
                                        setSelectedLanguage('English');
                                    }
                                }}
                            />
                        ))}
                    </View>
                </View>

                {selectedCurriculum && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Medium</Text>
                        <View style={styles.grid}>
                            {selectedCurriculum === 'CBSE' ? (
                                <MemoizedSelectionButton
                                    key="English"
                                    item="English"
                                    isSelected={selectedLanguage === 'English'}
                                    onPress={(item) => {
                                        setSelectedLanguage(item);
                                        setSelectedStandard('');
                                        setSelectedSubject('');
                                        setSelectedChapters([]);
                                    }}
                                />
                            ) : (
                                availableLanguagesForStateBoard.map((language) => (
                                    <MemoizedSelectionButton
                                        key={language}
                                        item={language}
                                        isSelected={selectedLanguage === language}
                                        onPress={(item) => {
                                            setSelectedLanguage(item);
                                            setSelectedStandard('');
                                            setSelectedSubject('');
                                            setSelectedChapters([]);
                                        }}
                                    />
                                ))
                            )}
                        </View>
                    </View>
                )}

                {selectedLanguage && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Standard/Class</Text>
                        <View style={styles.grid}>
                            {availableStandards.map((standard) => (
                                <MemoizedSelectionButton
                                    key={standard}
                                    item={standard}
                                    isSelected={selectedStandard === standard}
                                    onPress={(item) => {
                                        setSelectedStandard(item);
                                        setSelectedSubject('');
                                        setSelectedChapters([]);
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {selectedStandard && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Subject</Text>
                        <View style={styles.grid}>
                            {availableSubjects.map((subject) => (
                                <MemoizedSelectionButton
                                    key={subject}
                                    item={subject}
                                    isSelected={selectedSubject === subject}
                                    onPress={(item) => {
                                        setSelectedSubject(item);
                                        setSelectedChapters([]);
                                    }}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {selectedSubject && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Chapter(s)</Text>
                        <View style={styles.grid}>
                            {availableChapters.map((chapter) => (
                                <MemoizedChapterButton
                                    key={chapter}
                                    chapter={chapter}
                                    isSelected={selectedChapters.includes(chapter)}
                                    onPress={toggleChapterSelection}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {(selectedChapters.length > 0 || uploadedFile) && (
                    <View style={styles.actionContainer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => setCurrentStep('configure')}
                        >
                            <Text style={styles.primaryButtonText}>Continue</Text>
                            <ChevronRight size={scale(16)} color="#FFFFFF" />
                        </TouchableOpacity>
                    </View>
                )}
            </View>
        </ScrollView>
    );
};

interface ConfigureStepProps {
    selectedCurriculum: string;
    selectedStandard: string;
    selectedSubject: string;
    selectedChapters: string[];
    selectedLanguage: string;
    examConfig: ExamConfig;
    setExamConfig: React.Dispatch<React.SetStateAction<ExamConfig>>;
    setCurrentStep: React.Dispatch<React.SetStateAction<CurrentStep>>;
    calculateTotalMarks: () => number;
    generateQuestions: () => Promise<void>;
}

const ConfigureStep: React.FC<ConfigureStepProps> = ({
    selectedCurriculum,
    selectedStandard,
    selectedSubject,
    selectedChapters,
    selectedLanguage,
    examConfig,
    setExamConfig,
    setCurrentStep,
    calculateTotalMarks,
    generateQuestions,
}) => {
    return (
        <ScrollView
            style={styles.container}
            keyboardShouldPersistTaps="handled"
            scrollEventThrottle={16}
            maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: 10 }}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Configure Assessment</Text>
                <Text style={styles.subtitle}>Set up the parameters for your assessment.</Text>

                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Selected Content</Text>
                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Curriculum:</Text>
                            <Text style={styles.summaryValue}>{selectedCurriculum || 'N/A'}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Standard:</Text>
                            <Text style={styles.summaryValue}>{selectedStandard || 'N/A'}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Subject:</Text>
                            <Text style={styles.summaryValue}>{selectedSubject || 'N/A'}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Chapters:</Text>
                            <Text style={styles.summaryValue}>{selectedChapters.length > 0 ? selectedChapters.join(', ') : 'N/A'}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Language:</Text>
                            <Text style={styles.summaryValue}>{selectedLanguage || 'N/A'}</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Basic Settings</Text>
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Duration (minutes)</Text>
                        <TextInput
                            style={styles.input}
                            value={examConfig.duration.toString()}
                            onChangeText={(text) => setExamConfig(prev => ({ ...prev, duration: parseInt(text) || 60 }))}
                            keyboardType="numeric"
                            placeholder="60"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Difficulty Level</Text>
                        <View style={styles.difficultyContainer}>
                            {['easy', 'medium', 'hard', 'mixed'].map((difficulty) => (
                                <TouchableOpacity
                                    key={difficulty}
                                    style={[
                                        styles.difficultyButton,
                                        examConfig.difficulty === difficulty && styles.selectedDifficultyButton
                                    ]}
                                    onPress={() => setExamConfig(prev => ({ ...prev, difficulty }))}
                                >
                                    <Text style={[
                                        styles.difficultyButtonText,
                                        examConfig.difficulty === difficulty && styles.selectedDifficultyButtonText
                                    ]}>
                                        {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Question Types</Text>
                    {Object.keys(examConfig.questionTypes).map((key) => {
                        const typeKey = key as keyof typeof examConfig.questionTypes;
                        const title = typeKey.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase());
                        const config = examConfig.questionTypes[typeKey];

                        return (
                            <View key={typeKey} style={styles.questionTypeCard}>
                                <View style={styles.questionTypeHeader}>
                                    <Text style={styles.questionTypeTitle}>{title}</Text>
                                    <Text style={styles.questionTypeMarks}>
                                        {config.count} × {config.marks} = {config.count * config.marks} marks
                                    </Text>
                                </View>
                                <View style={styles.questionTypeInputs}>
                                    <View style={styles.halfInput}>
                                        <Text style={styles.smallLabel}>Questions</Text>
                                        <TextInput
                                            style={styles.smallInput}
                                            value={config.count.toString()}
                                            onChangeText={(text) => setExamConfig(prev => ({
                                                ...prev,
                                                questionTypes: {
                                                    ...prev.questionTypes,
                                                    [typeKey]: { ...config, count: parseInt(text) || 0 }
                                                }
                                            }))}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                    <View style={styles.halfInput}>
                                        <Text style={styles.smallLabel}>Marks each</Text>
                                        <TextInput
                                            style={styles.smallInput}
                                            value={config.marks.toString()}
                                            onChangeText={(text) => setExamConfig(prev => ({
                                                ...prev,
                                                questionTypes: {
                                                    ...prev.questionTypes,
                                                    [typeKey]: { ...config, marks: parseInt(text) || 1 }
                                                }
                                            }))}
                                            keyboardType="numeric"
                                        />
                                    </View>
                                </View>
                            </View>
                        );
                    })}

                    <View style={styles.totalMarksCard}>
                        <Text style={styles.totalMarksText}>Total Marks: {calculateTotalMarks()}</Text>
                        <Text style={styles.totalDurationText}>Duration: {examConfig.duration} minutes</Text>
                    </View>
                </View>

                <View style={styles.actionButtonsContainer}>
                    <TouchableOpacity
                        style={styles.secondaryButton}
                        onPress={() => setCurrentStep('selection')}
                    >
                        <Text style={styles.secondaryButtonText}>Back</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={generateQuestions}
                    >
                        <Text style={styles.primaryButtonText}>Generate</Text>
                        <Settings size={scale(16)} color="#FFFFFF" />
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
};

const GeneratingStep: React.FC = () => (
    <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={styles.generatingTitle}>Generating Assessment</Text>
        <Text style={styles.generatingSubtitle}>
            AI is analyzing your content and creating customized questions...
        </Text>
    </View>
);

const PreviewStep: React.FC<{
    selectedCurriculum: string;
    selectedStandard: string;
    selectedSubject: string;
    selectedChapters: string[];
    selectedLanguage: string;
    examConfig: ExamConfig;
    setExamConfig: React.Dispatch<React.SetStateAction<ExamConfig>>;
    setCurrentStep: React.Dispatch<React.SetStateAction<CurrentStep>>;
    calculateTotalMarks: () => number;
    generatedQuestions: Question[];
    setGeneratedQuestions: React.Dispatch<React.SetStateAction<Question[]>>;
    showPdfPreview: boolean;
    setShowPdfPreview: React.Dispatch<React.SetStateAction<boolean>>;
    navigate: any;
    examTitle: string;
}> = ({
    selectedCurriculum,
    selectedStandard,
    selectedSubject,
    selectedChapters,
    selectedLanguage,
    examConfig,
    calculateTotalMarks,
    generatedQuestions,
    setCurrentStep,
    showPdfPreview,
    setShowPdfPreview,
    navigate,
    examTitle,
}) => {
        const getCorrectOptionIndex = (question: Question) => {
            if (question.type === 'multiple-choice' && 'options' in question && 'correctAnswer' in question) {
                if (question.options && question.correctAnswer) {
                    return question.options.indexOf(question.correctAnswer as string);
                }
            }
            return -1;
        };

        const getCorrectTrueFalse = (question: Question) => {
            if (question.type === 'true-false' && 'correctAnswer' in question) {
                return (question.correctAnswer as string).toLowerCase() === 'true';
            }
            return null;
        };

        return (
            <ScrollView style={styles.container}>
                <View style={styles.card}>
                    <View style={styles.previewHeader}>
                        <View style={styles.previewHeaderInfo}>
                            <Text style={styles.title}>Assessment Preview</Text>
                            <Text style={styles.subtitle}>Review and edit the questions</Text>
                        </View>
                        <View style={styles.previewActions}>
                            <TouchableOpacity
                                style={styles.iconButton}
                                onPress={() => setShowPdfPreview(true)}
                            >
                                <Eye size={scale(20)} color="#059669" />
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.iconButton}>
                                <Download size={scale(20)} color="#2563EB" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    <View style={styles.assessmentInfo}>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Curriculum:</Text>
                            <Text style={styles.infoValue}>{selectedCurriculum || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Standard:</Text>
                            <Text style={styles.infoValue}>{selectedStandard || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Subject:</Text>
                            <Text style={styles.infoValue}>{selectedSubject || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Chapters:</Text>
                            <Text style={styles.infoValue}>{selectedChapters.length > 0 ? selectedChapters.join(', ') : 'N/A'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Language:</Text>
                            <Text style={styles.infoValue}>{selectedLanguage || 'N/A'}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Total Marks</Text>
                            <Text style={styles.infoValue}>{calculateTotalMarks()}</Text>
                        </View>
                        <View style={styles.infoItem}>
                            <Text style={styles.infoLabel}>Duration</Text>
                            <Text style={styles.infoValue}>{examConfig.duration} min</Text>
                        </View>
                    </View>

                    <View style={styles.questionsContainer}>
                        {generatedQuestions.map((question, index) => {
                            const correctOptionIndex = getCorrectOptionIndex(question);
                            const correctTrueFalse = getCorrectTrueFalse(question);
                            return (
                                <View key={question.id} style={styles.questionCard}>
                                    <View style={styles.questionHeader}>
                                        <View style={styles.questionBadges}>
                                            <View style={styles.questionNumber}>
                                                <Text style={styles.questionNumberText}>Q{index + 1}</Text>
                                            </View>
                                            <View style={styles.marksBadge}>
                                                <Text style={styles.marksBadgeText}>{question.marks} marks</Text>
                                            </View>
                                            <View style={styles.difficultyBadge}>
                                                <Text style={styles.difficultyBadgeText}>{question.difficulty}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.questionActions}>
                                            <TouchableOpacity style={styles.actionButton}>
                                                <Edit3 size={scale(16)} color="#6B7280" />
                                            </TouchableOpacity>
                                            <TouchableOpacity style={styles.actionButton}>
                                                <Trash2 size={scale(16)} color="#EF4444" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <Text style={styles.questionText}>{question.question}</Text>

                                    {question.type === 'multiple-choice' && 'options' in question && question.options && (
                                        <View style={styles.optionsContainer}>
                                            {question.options.map((option, optionIndex) => (
                                                <View key={optionIndex} style={styles.optionRow}>
                                                    <View style={[
                                                        styles.optionCircle,
                                                        optionIndex === correctOptionIndex && styles.correctOptionCircle
                                                    ]}>
                                                        <Text style={[
                                                            styles.optionLetter,
                                                            optionIndex === correctOptionIndex && styles.correctOptionLetter
                                                        ]}>
                                                            {String.fromCharCode(65 + optionIndex)}
                                                        </Text>
                                                    </View>
                                                    <Text style={[
                                                        styles.optionText,
                                                        optionIndex === correctOptionIndex && styles.correctOptionText
                                                    ]}>
                                                        {option}
                                                    </Text>
                                                </View>
                                            ))}
                                        </View>
                                    )}

                                    {question.type === 'true-false' && 'options' in question && (
                                        <View style={styles.trueFalseContainer}>
                                            <View style={[
                                                styles.trueFalseOption,
                                                correctTrueFalse === true && styles.correctTrueFalse
                                            ]}>
                                                <Text style={[
                                                    styles.trueFalseText,
                                                    correctTrueFalse === true && styles.correctTrueFalseText
                                                ]}>
                                                    True
                                                </Text>
                                            </View>
                                            <View style={[
                                                styles.trueFalseOption,
                                                correctTrueFalse === false && styles.correctTrueFalse
                                            ]}>
                                                <Text style={[
                                                    styles.trueFalseText,
                                                    correctTrueFalse === false && styles.correctTrueFalseText
                                                ]}>
                                                    False
                                                </Text>
                                            </View>
                                        </View>
                                    )}

                                    {question.type === 'match-the-following' && 'leftColumn' in question && 'rightColumn' in question && (
                                        <View style={styles.matchContainer}>
                                            <View style={styles.matchColumn}>
                                                <Text style={styles.matchColumnTitle}>Column A</Text>
                                                {question.leftColumn.map((item, i) => (
                                                    <View key={i} style={styles.matchItem}>
                                                        <Text style={styles.matchItemNumber}>{i + 1}.</Text>
                                                        <Text style={styles.matchItemText}>{item}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                            <View style={styles.matchColumn}>
                                                <Text style={styles.matchColumnTitle}>Column B</Text>
                                                {question.rightColumn.map((item, i) => (
                                                    <View key={i} style={styles.matchItem}>
                                                        <Text style={styles.matchItemLetter}>{String.fromCharCode(65 + i)}.</Text>
                                                        <Text style={styles.matchItemText}>{item}</Text>
                                                    </View>
                                                ))}
                                            </View>
                                        </View>
                                    )}
                                </View>
                            );
                        })}
                    </View>

                    <View style={styles.previewActionsBottom}>
                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => setCurrentStep('configure')}
                        >
                            <Text style={styles.secondaryButtonText}>Re-configure</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.greenButton} onPress={() => navigate.navigate("ExamApp")}>
                            <Text style={styles.greenButtonText}>Publish</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </ScrollView>
        );
    };

// Parse API response into Question type
const parseGeneratedQuestions = (examData: any): Question[] => {
    let questions: Question[] = [];

    // Handle the array response format from examsByTeacher API
    let examPaper;
    if (Array.isArray(examData)) {
        if (examData.length === 0) return questions;
        examPaper = examData[0].examPaper; // Get the first exam's examPaper
    } else if (examData.examPaper) {
        examPaper = examData.examPaper;
    } else {
        console.warn('Invalid exam data structure:', examData);
        return questions;
    }

    if (!examPaper || !examPaper.sections || !Array.isArray(examPaper.sections)) {
        console.warn('No sections found in exam paper:', examPaper);
        return questions;
    }

    const sections = examPaper.sections;

    sections.forEach((section: any, sectionIndex: number) => {
        const sectionQuestions = section.questions || [];

        sectionQuestions.forEach((q: any, questionIndex: number) => {
            // Handle different possible field names for question type
            let questionType = (q.questionType || q.type || q.question_type || 'multiple-choice')
                .toLowerCase()
                .replace(/_/g, '-')
                .replace(/\s+/g, '-');

            // Normalize question types
            if (questionType === 'multiple-choice' || questionType === 'multiple_choice') {
                questionType = 'multiple-choice';
            } else if (questionType === 'true-false' || questionType === 'true_false') {
                questionType = 'true-false';
            } else if (questionType === 'short-answer' || questionType === 'short_answer') {
                questionType = 'short-answer';
            } else if (questionType === 'match-the-following' || questionType === 'match_the_following') {
                questionType = 'match-the-following';
            }

            let newQuestion: Question = {
                id: q.id || `q_${sectionIndex}_${questionIndex}`,
                type: questionType,
                question: q.questionText || q.question || q.question_text || 'No question text',
                marks: q.marks || 1,
                difficulty: q.difficulty || 'medium',
            };

            if (questionType === 'multiple-choice') {
                newQuestion.options = Array.isArray(q.options) ? q.options : [];
                newQuestion.correctAnswer = q.answer || q.correctAnswer || '';
            } else if (questionType === 'true-false') {
                newQuestion.options = Array.isArray(q.options) ? q.options : ['True', 'False'];
                newQuestion.correctAnswer = q.answer || q.correctAnswer || '';
            } else if (questionType === 'match-the-following') {
                newQuestion.leftColumn = Array.isArray(q.left) ? q.left : (Array.isArray(q.leftColumn) ? q.leftColumn : []);
                newQuestion.rightColumn = Array.isArray(q.right) ? q.right : (Array.isArray(q.rightColumn) ? q.rightColumn : []);

                // Handle correctAnswer for match-the-following
                if (q.answer && typeof q.answer === 'object' && !Array.isArray(q.answer)) {
                    if ('left' in q.answer && 'right' in q.answer) {
                        newQuestion.correctAnswer = {
                            [q.answer.left || '']: q.answer.right || '',
                        };
                    } else {
                        newQuestion.correctAnswer = q.answer;
                    }
                } else if (q.correctAnswer && typeof q.correctAnswer === 'object') {
                    newQuestion.correctAnswer = q.correctAnswer;
                } else {
                    newQuestion.correctAnswer = {};
                }
            } else if (questionType === 'short-answer') {
                newQuestion.correctAnswer = q.answer || q.correctAnswer || 'N/A';
            }

            questions.push(newQuestion);
        });
    });

    console.log('Parsed Questions:', JSON.stringify(questions, null, 2));
    return questions;
};

// Define getAnswerForQuestion at the top level
// Replace the entire getAnswerForQuestion function (around line 991)
const getAnswerForQuestion = (question: Question): string => {
    try {
        if (question.type === 'multiple-choice' && 'options' in question && question.options && 'correctAnswer' in question) {
            const optionIndex = question.options.indexOf(question.correctAnswer as string);
            return optionIndex !== -1 ? `${String.fromCharCode(97 + optionIndex)}) ${question.correctAnswer}` : (question.correctAnswer as string) || 'N/A';
        } else if (question.type === 'true-false' && 'correctAnswer' in question) {
            return (question.correctAnswer as string) || 'N/A';
        } else if (question.type === 'match-the-following' && 'correctAnswer' in question && 'leftColumn' in question && 'rightColumn' in question) {
            // Ensure correctAnswer is an object and not null/undefined
            if (!question.correctAnswer || typeof question.correctAnswer !== 'object') {
                console.warn(`Invalid correctAnswer for question ${question.id}:`, question.correctAnswer);
                return 'N/A';
            }

            // Ensure leftColumn and rightColumn are arrays
            const leftColumn = Array.isArray(question.leftColumn) ? question.leftColumn : [];
            const rightColumn = Array.isArray(question.rightColumn) ? question.rightColumn : [];

            // Check if correctAnswer is empty or malformed
            if (Object.keys(question.correctAnswer).length === 0) {
                console.warn(`Empty correctAnswer for match-the-following question ${question.id}`);
                return 'N/A';
            }

            // Handle the case where correctAnswer might have {left, right} format instead of Record<string, string>
            let answerRecord: Record<string, string> = {};

            if ('left' in question.correctAnswer && 'right' in question.correctAnswer) {
                // Convert {left, right} format to proper Record<string, string>
                const leftVal = (question.correctAnswer as any).left;
                const rightVal = (question.correctAnswer as any).right;
                if (typeof leftVal === 'string' && typeof rightVal === 'string') {
                    answerRecord[leftVal] = rightVal;
                } else {
                    console.warn(`Invalid left/right values in correctAnswer for question ${question.id}`);
                    return 'N/A';
                }
            } else {
                // Assume it's already in Record<string, string> format
                answerRecord = question.correctAnswer as Record<string, string>;
            }

            const answerPairs = Object.entries(answerRecord)
                .map(([left, right]) => {
                    // Validate that left and right are strings
                    if (typeof left !== 'string' || typeof right !== 'string') {
                        console.warn(`Invalid key-value pair in correctAnswer for question ${question.id}:`, { left, right });
                        return null;
                    }
                    const leftIndex = leftColumn.indexOf(left);
                    const rightIndex = rightColumn.indexOf(right);
                    // Use the right value directly if index is not found
                    const rightLetter = rightIndex !== -1 ? String.fromCharCode(65 + rightIndex) : right;
                    // Only include valid pairs
                    if (leftIndex !== -1 && rightLetter) {
                        return `${leftIndex + 1}-${rightLetter}`;
                    }
                    return null;
                })
                .filter((pair): pair is string => pair !== null) // Remove invalid pairs
                .sort((a, b) => parseInt(a.split('-')[0]) - parseInt(b.split('-')[0]))
                .join(', ');

            return answerPairs || 'N/A';
        } else if (question.type === 'short-answer' && 'correctAnswer' in question) {
            return (question.correctAnswer as string) || 'N/A';
        }
        return 'N/A';
    } catch (error) {
        console.error(`Error in getAnswerForQuestion for question ${question.id}:`, error);
        return 'N/A';
    }
};
const CustomizerAssessment: React.FC = () => {
    const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
    const [selectedStandard, setSelectedStandard] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [uploadedFile, setUploadedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [currentStep, setCurrentStep] = useState<CurrentStep>('selection');
    const [examConfig, setExamConfig] = useState<ExamConfig>({
        totalMarks: 50,
        duration: 60,
        questionTypes: {
            'multiple-choice': { count: 0, marks: 2 },
            'short-answer': { count: 0, marks: 5 },
            'true-false': { count: 0, marks: 1 },
            'match-the-following': { count: 0, marks: 4 },
        },
        difficulty: 'mixed',
    });
    const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
    const [examTitle, setExamTitle] = useState<string>('');
    const navigate = useNavigation();
    const API_URL = 'http://192.168.1.38:3000';

    const availableStandards = [...new Set(mockUploadedContent.map(item => item.tags.standard))];
    const availableSubjects = selectedStandard
        ? [...new Set(mockUploadedContent
            .filter(item => item.tags.standard === selectedStandard)
            .map(item => item.tags.subject))]
        : [];
    const availableChapters = selectedSubject
        ? [...new Set(mockUploadedContent
            .filter(item => item.tags.standard === selectedStandard && item.tags.subject === selectedSubject)
            .map(item => item.tags.chapter))]
        : [];
    const availableLanguagesForStateBoard = ['Tamil', 'English'];
    const availableLanguagesForCBSE = ['English'];

    const toggleChapterSelection = useCallback((chapter: string) => {
        setSelectedChapters(prev => {
            if (prev.includes(chapter)) {
                return prev.filter(c => c !== chapter);
            } else {
                return [...prev, chapter];
            }
        });
    }, []);

    const fetchLastGeneratedExam = async (examId?: number) => {
    try {
        const teacherId = await AsyncStorage.getItem('teacherId');
        if (!teacherId) {
            console.error('Teacher ID not found.');
            return;
        }

        const response = await fetch(`${API_URL}/api/teachers/examsByTeacher`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ teacherId: parseInt(teacherId) }),
        });

        if (!response.ok) {
            console.warn(`Failed to fetch exams: ${response.status}`);
            if (response.status === 404) {
                // Retry after a delay or proceed with examId
                if (examId) {
                    const examResponse = await fetch(`${API_URL}/api/exams/${examId}`);
                    if (!examResponse.ok) throw new Error('Failed to fetch exam by ID');
                    const examData = await examResponse.json();
                    const parsedQuestions = parseGeneratedQuestions(examData);
                    setExamTitle(examData.examPaper?.examName || 'Assessment');
                    setGeneratedQuestions(parsedQuestions);
                    setExamConfig(prev => ({
                        ...prev,
                        totalMarks: parsedQuestions.reduce((total, q) => total + q.marks, 0),
                    }));
                    setCurrentStep('preview');
                    return;
                }
            }
            throw new Error(`Failed to fetch exams: ${response.status}`);
        }

        const exams = await response.json();
        if (!exams.length) throw new Error('No exams found');

        const latestExam = exams.sort((a: any, b: any) =>
            new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
        )[0];

        const parsedQuestions = parseGeneratedQuestions(exams);
        setExamTitle(latestExam.examPaper?.examName || 'Assessment');
        setGeneratedQuestions(parsedQuestions);
        setExamConfig(prev => ({
            ...prev,
            totalMarks: parsedQuestions.reduce((total, q) => total + q.marks, 0),
        }));
        setCurrentStep('preview');
    } catch (error) {
        console.error('Error fetching last generated exam:', error);
        throw error;
    }
};
    useEffect(() => {
        fetchLastGeneratedExam().catch(() => {
            // On mount, if error, stay in selection, no alert
        });
    }, []);

    const generateQuestions = async (): Promise<void> => {
        setIsGenerating(true);
        setCurrentStep('generate');

        const chapterNumbers = selectedChapters.map(chapter => chapter.replace('Chapter ', ''));
        console.log('Raw selectedChapters:', selectedChapters);
        console.log('Raw chapterNumbers:', chapterNumbers);

        if (!Array.isArray(chapterNumbers)) {
            console.error('chapterNumbers is not an array:', chapterNumbers);
            Alert.alert('Error', 'Invalid chapter selection. Please select at least one chapter.');
            setIsGenerating(false);
            setCurrentStep('configure');
            return;
        }

        const teacherId = await AsyncStorage.getItem('teacherId');
        if (!teacherId || isNaN(parseInt(teacherId))) {
            Alert.alert('Error', 'Teacher ID is missing or invalid. Please log in again.');
            setIsGenerating(false);
            setCurrentStep('configure');
            return;
        }

        const formData = new FormData();

        if (uploadedFile && uploadedFile.uri) {
            try {
                const file = {
                    uri: uploadedFile.uri,
                    name: uploadedFile.name || 'uploaded_file.pdf',
                    type: uploadedFile.mimeType || 'application/pdf',
                };
                formData.append('files', file as any);
                console.log('Appended file:', file.name);
            } catch (error) {
                console.error('Error reading file:', error);
                Alert.alert('Error', 'Failed to read the uploaded file.');
                setIsGenerating(false);
                setCurrentStep('configure');
                return;
            }
        }

        const questionPattern = {
            multipleChoice: examConfig.questionTypes['multiple-choice'].count,
            trueFalse: examConfig.questionTypes['true-false'].count,
            shortAnswer: examConfig.questionTypes['short-answer'].count,
            matchTheFollowing: examConfig.questionTypes['match-the-following'].count,
        };
        chapterNumbers.forEach(chapter => {
            formData.append('chapters[]', chapter);
        });
        formData.append('questionPattern', JSON.stringify(questionPattern));
        formData.append('teacherId', teacherId);
        formData.append('subject', selectedSubject);
        formData.append('standard', selectedStandard);
        formData.append('curriculum', selectedCurriculum);
        formData.append('language', selectedLanguage);
        formData.append('difficulty', examConfig.difficulty);
        formData.append('duration', examConfig.duration.toString());
        formData.append('examTitle', examTitle);

        console.log('FormData contents being sent:');
        console.log('- teacherId:', teacherId);
        console.log('- chapters:', chapterNumbers);
        console.log('- questionPattern:', JSON.stringify(questionPattern));
        console.log('- file:', uploadedFile?.name || 'none');
        console.log('- subject:', selectedSubject);
        console.log('- standard:', selectedStandard);
        console.log('- curriculum:', selectedCurriculum);
        console.log('- language:', selectedLanguage);
        console.log('- difficulty:', examConfig.difficulty);
        console.log('- duration:', examConfig.duration.toString());

        try {
        const response = await fetch(`${API_URL}/api/exam/generate`, {
            method: 'POST',
            headers: { 'Accept': 'application/json' },
            body: formData,
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        console.log('Full API Response:', JSON.stringify(data, null, 2));

        // Pass the examId to fetchLastGeneratedExam
        await fetchLastGeneratedExam(data.examId);
    } catch (error: any) {
        console.error('Error generating exam:', error);
        Alert.alert('Error', `Failed to generate exam: ${error.message}`);
        setCurrentStep('configure');
    } finally {
        setIsGenerating(false);
    }
};
    const calculateTotalMarks = (): number => {
        return Object.values(examConfig.questionTypes).reduce((total, type) => {
            return total + (type.count * type.marks);
        }, 0);
    };

    const renderStep = () => {
        if (isGenerating) return <GeneratingStep />;
        switch (currentStep) {
            case 'selection':
                return (
                    <SelectionStep
                        selectedCurriculum={selectedCurriculum}
                        setSelectedCurriculum={setSelectedCurriculum}
                        selectedStandard={selectedStandard}
                        setSelectedStandard={setSelectedStandard}
                        selectedSubject={selectedSubject}
                        setSelectedSubject={setSelectedSubject}
                        selectedChapters={selectedChapters}
                        setSelectedChapters={setSelectedChapters}
                        selectedLanguage={selectedLanguage}
                        setSelectedLanguage={setSelectedLanguage}
                        uploadedFile={uploadedFile}
                        setUploadedFile={setUploadedFile}
                        setCurrentStep={setCurrentStep}
                        availableStandards={availableStandards}
                        availableSubjects={availableSubjects}
                        availableChapters={availableChapters}
                        availableLanguagesForStateBoard={availableLanguagesForStateBoard}
                        availableLanguagesForCBSE={availableLanguagesForCBSE}
                        toggleChapterSelection={toggleChapterSelection}
                        examTitle={examTitle}
                        setExamTitle={setExamTitle}
                    />
                );
            case 'configure':
                return (
                    <ConfigureStep
                        selectedCurriculum={selectedCurriculum}
                        selectedStandard={selectedStandard}
                        selectedSubject={selectedSubject}
                        selectedChapters={selectedChapters}
                        selectedLanguage={selectedLanguage}
                        examConfig={examConfig}
                        setExamConfig={setExamConfig}
                        setCurrentStep={setCurrentStep}
                        calculateTotalMarks={calculateTotalMarks}
                        generateQuestions={generateQuestions}
                    />
                );
            case 'preview':
                return (
                    <PreviewStep
                        selectedCurriculum={selectedCurriculum}
                        selectedStandard={selectedStandard}
                        selectedSubject={selectedSubject}
                        selectedChapters={selectedChapters}
                        selectedLanguage={selectedLanguage}
                        examConfig={examConfig}
                        setExamConfig={setExamConfig}
                        setCurrentStep={setCurrentStep}
                        calculateTotalMarks={calculateTotalMarks}
                        generatedQuestions={generatedQuestions}
                        setGeneratedQuestions={setGeneratedQuestions}
                        showPdfPreview={showPdfPreview}
                        setShowPdfPreview={setShowPdfPreview}
                        navigate={navigate}
                        examTitle={examTitle}
                    />
                );
            default:
                return (
                    <SelectionStep
                        selectedCurriculum={selectedCurriculum}
                        setSelectedCurriculum={setSelectedCurriculum}
                        selectedStandard={selectedStandard}
                        setSelectedStandard={setSelectedStandard}
                        selectedSubject={selectedSubject}
                        setSelectedSubject={setSelectedSubject}
                        selectedChapters={selectedChapters}
                        setSelectedChapters={setSelectedChapters}
                        selectedLanguage={selectedLanguage}
                        setSelectedLanguage={setSelectedLanguage}
                        uploadedFile={uploadedFile}
                        setUploadedFile={setUploadedFile}
                        setCurrentStep={setCurrentStep}
                        availableStandards={availableStandards}
                        availableSubjects={availableSubjects}
                        availableChapters={availableChapters}
                        availableLanguagesForStateBoard={availableLanguagesForStateBoard}
                        availableLanguagesForCBSE={availableLanguagesForCBSE}
                        toggleChapterSelection={toggleChapterSelection}
                        examTitle={examTitle}
                        setExamTitle={setExamTitle}
                    />
                );
        }
    };

    const progressSteps = [
        { key: 'selection', label: 'Select', icon: FileText },
        { key: 'configure', label: 'Configure', icon: Settings },
        { key: 'preview', label: 'Preview', icon: Eye }
    ];
    const currentStepIndex = progressSteps.findIndex(p => p.key === currentStep);

    return (
        <SafeAreaView style={styles.safeArea}>
            <View style={styles.mainContainer}>
                <View style={styles.header}>
                    <Text style={styles.mainTitle}>Create Assessment</Text>
                </View>

                <View style={styles.progressContainer}>
                    <View style={styles.progressSteps}>
                        {progressSteps.map((step, index) => {
                            const Icon = step.icon;
                            const isActive = index === currentStepIndex;
                            const isCompleted = index < currentStepIndex;

                            return (
                                <React.Fragment key={step.key}>
                                    <View style={styles.progressStepContainer}>
                                        <View style={[
                                            styles.progressCircle,
                                            isActive && styles.activeProgressCircle,
                                            isCompleted && styles.completedProgressCircle
                                        ]}>
                                            <Icon size={scale(20)} color={isActive || isCompleted ? '#FFFFFF' : '#9CA3AF'} />
                                        </View>
                                        <Text style={[
                                            styles.progressLabel,
                                            isActive && styles.activeProgressLabel,
                                            isCompleted && styles.completedProgressLabel
                                        ]}>
                                            {step.label}
                                        </Text>
                                    </View>
                                    {index < progressSteps.length - 1 && (
                                        <View style={[styles.progressLine, (isActive || isCompleted) && styles.progressLineActive]} />
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </View>
                </View>

                {renderStep()}

                <Modal
                    visible={showPdfPreview}
                    animationType="slide"
                    presentationStyle="fullScreen"
                >
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Question Paper Preview</Text>
                            <TouchableOpacity
                                onPress={() => setShowPdfPreview(false)}
                                style={styles.closeButton}
                            >
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pdfPreview}>
                            <View style={styles.pdfContent}>
                                <View style={styles.pdfHeader}>
                                    <Text style={styles.pdfTitle}>{examTitle || 'Assessment'}</Text>
                                    <View style={styles.pdfInfo}>
                                        <Text style={styles.pdfInfoText}>Curriculum: {selectedCurriculum || 'N/A'}</Text>
                                        <Text style={styles.pdfInfoText}>Class: {selectedStandard || 'N/A'}</Text>
                                        <Text style={styles.pdfInfoText}>Subject: {selectedSubject || 'N/A'}</Text>
                                        <Text style={styles.pdfInfoText}>Chapters: {selectedChapters.length > 0 ? selectedChapters.join(', ') : 'N/A'}</Text>
                                        <Text style={styles.pdfInfoText}>Language: {selectedLanguage || 'N/A'}</Text>
                                        <Text style={styles.pdfInfoText}>Total Marks: {calculateTotalMarks()}</Text>
                                        <Text style={styles.pdfInfoText}>Time: {examConfig.duration} minutes</Text>
                                    </View>
                                </View>

                                <View style={styles.pdfQuestions}>
                                    {generatedQuestions.map((question, index) => (
                                        <View key={question.id} style={styles.pdfQuestion}>
                                            <View style={styles.pdfQuestionHeader}>
                                                <Text style={styles.pdfQuestionNumber}>Q{index + 1}.</Text>
                                                <Text style={styles.pdfQuestionText}>{question.question}</Text>
                                                <Text style={styles.pdfQuestionMarks}>({question.marks} marks)</Text>
                                            </View>

                                            {question.type === 'multiple-choice' && question.options && (
                                                <View style={styles.pdfOptions}>
                                                    {question.options.map((option, optionIndex) => (
                                                        <Text key={optionIndex} style={styles.pdfOption}>
                                                            {String.fromCharCode(97 + optionIndex)}) {option}
                                                        </Text>
                                                    ))}
                                                </View>
                                            )}
                                            {question.type === 'short-answer' && <View style={styles.pdfAnswerSpace} />}
                                            {question.type === 'true-false' && (
                                                <View style={styles.pdfTrueFalse}>
                                                    <Text style={styles.pdfTrueFalseOption}>( ) True</Text>
                                                    <Text style={styles.pdfTrueFalseOption}>( ) False</Text>
                                                </View>
                                            )}
                                            {question.type === 'match-the-following' && 'leftColumn' in question && 'rightColumn' in question && (
                                                <View style={styles.pdfMatch}>
                                                    <View style={styles.pdfMatchColumn}>
                                                        <Text style={styles.pdfMatchColumnTitle}>Column A</Text>
                                                        {question.leftColumn.map((item, i) => (
                                                            <Text key={i} style={styles.pdfMatchItem}>
                                                                {i + 1}. {item}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                    <View style={styles.pdfMatchColumn}>
                                                        <Text style={styles.pdfMatchColumnTitle}>Column B</Text>
                                                        {question.rightColumn.map((item, i) => (
                                                            <Text key={i} style={styles.pdfMatchItem}>
                                                                {String.fromCharCode(65 + i)}. {item}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                </View>
                                            )}
                                        </View>
                                    ))}
                                </View>

                                <View style={styles.pdfAnswerKey}>
                                    <Text style={styles.pdfAnswerKeyTitle}>--- Answer Key ---</Text>
                                    {generatedQuestions.map((q, i) => (
                                        <Text key={q.id} style={styles.pdfAnswerKeyText}>
                                            Q{i + 1}: {getAnswerForQuestion(q)}
                                        </Text>
                                    ))}
                                </View>
                            </View>
                        </ScrollView>
                    </SafeAreaView>
                </Modal>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#F9FAFB',
    },
    mainContainer: {
        flex: 1,
        paddingHorizontal: width * 0.05,
    },
    container: {
        flex: 1,
    },
    header: {
        paddingVertical: height * 0.02,
    },
    mainTitle: {
        fontSize: scale(26),
        marginTop: 27,
        fontWeight: 'bold',
        color: '#111827',
    },
    progressContainer: {
        marginBottom: height * 0.03,
    },
    progressSteps: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressStepContainer: {
        alignItems: 'center',
    },
    progressCircle: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        borderWidth: 2,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
    },
    activeProgressCircle: {
        borderColor: '#2563EB',
        backgroundColor: '#2563EB',
    },
    completedProgressCircle: {
        borderColor: '#10B981',
        backgroundColor: '#10B981',
    },
    progressLabel: {
        fontSize: scale(12),
        fontWeight: '500',
        color: '#6B7280',
        marginTop: scale(4),
    },
    activeProgressLabel: { color: '#2563EB' },
    completedProgressLabel: { color: '#10B981' },
    progressLine: {
        flex: 1,
        height: 2,
        backgroundColor: '#D1D5DB',
        marginHorizontal: scale(8),
    },
    progressLineActive: {
        backgroundColor: '#10B981',
    },
    card: {
        marginBottom: scale(16),
    },
    title: {
        fontSize: scale(20),
        fontWeight: '600',
        color: '#111827',
        marginBottom: scale(4),
    },
    subtitle: {
        fontSize: scale(14),
        color: '#6B7280',
        marginBottom: scale(16),
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(16),
        flexWrap: 'wrap',
    },
    breadcrumbText: {
        fontSize: scale(13),
        fontWeight: '500',
        color: '#2563EB',
    },
    section: {
        marginBottom: scale(20),
    },
    sectionTitle: {
        fontSize: scale(16),
        fontWeight: '500',
        color: '#111827',
        marginBottom: scale(12),
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        margin: -scale(4),
    },
    selectionButton: {
        flexGrow: 1,
        flexBasis: '40%',
        margin: scale(4),
        padding: scale(14),
        borderRadius: scale(8),
        borderWidth: 1,
        borderColor: '#D1D5DB',
        backgroundColor: '#FFFFFF',
        alignItems: 'center',
    },
    selectedButton: {
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF',
    },
    buttonText: {
        fontSize: scale(14),
        fontWeight: '500',
        color: '#374151',
        textAlign: 'center',
    },
    selectedButtonText: {
        color: '#2563EB',
    },
    actionContainer: {
        alignItems: 'flex-end',
        marginTop: scale(16),
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563EB',
        paddingHorizontal: scale(20),
        paddingVertical: scale(12),
        borderRadius: scale(8),
    },
    primaryButtonText: {
        color: '#FFFFFF',
        fontSize: scale(15),
        fontWeight: '500',
        marginRight: scale(8),
    },
    secondaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderWidth: 1,
        borderColor: '#D1D5DB',
        paddingHorizontal: scale(20),
        paddingVertical: scale(12),
        borderRadius: scale(8),
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: scale(15),
        fontWeight: '500',
    },
    summaryCard: {
        backgroundColor: '#EFF6FF',
        borderRadius: scale(8),
        padding: scale(16),
        marginBottom: scale(20),
    },
    summaryTitle: {
        fontSize: scale(15),
        fontWeight: '600',
        color: '#1E3A8A',
        marginBottom: scale(12),
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    summaryItem: {
        width: '50%',
        marginBottom: scale(8),
    },
    summaryLabel: {
        fontSize: scale(13),
        color: '#1D4ED8',
    },
    summaryValue: {
        fontSize: scale(13),
        fontWeight: '600',
        color: '#1E3A8A',
    },
    inputGroup: {
        marginBottom: scale(16),
    },
    inputLabel: {
        fontSize: scale(14),
        fontWeight: '500',
        color: '#374151',
        marginBottom: scale(6),
    },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: scale(8),
        padding: scale(12),
        fontSize: scale(14),
        backgroundColor: '#FFFFFF',
    },
    difficultyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        margin: -scale(4),
    },
    difficultyButton: {
        flexGrow: 1,
        flexBasis: '40%',
        margin: scale(4),
        padding: scale(10),
        borderRadius: scale(6),
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
    },
    selectedDifficultyButton: {
        borderColor: '#2563EB',
        backgroundColor: '#EFF6FF',
    },
    difficultyButtonText: {
        fontSize: scale(13),
        fontWeight: '500',
        color: '#374151',
    },
    selectedDifficultyButtonText: {
        color: '#2563EB',
    },
    questionTypeCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: scale(8),
        padding: scale(14),
        marginBottom: scale(12),
        backgroundColor: '#F9FAFB',
    },
    questionTypeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(12),
    },
    questionTypeTitle: {
        fontSize: scale(15),
        fontWeight: '600',
        color: '#111827',
    },
    questionTypeMarks: {
        fontSize: scale(12),
        color: '#6B7280',
    },
    questionTypeInputs: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    halfInput: {
        flex: 1,
        marginHorizontal: scale(4),
    },
    smallLabel: {
        fontSize: scale(12),
        color: '#6B7280',
        marginBottom: scale(4),
    },
    smallInput: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: scale(6),
        padding: scale(8),
        fontSize: scale(14),
        backgroundColor: '#FFFFFF',
    },
    totalMarksCard: {
        backgroundColor: '#ECFDF5',
        padding: scale(12),
        borderRadius: scale(8),
        marginTop: scale(8),
        alignItems: 'center',
    },
    totalMarksText: {
        fontSize: scale(16),
        fontWeight: '600',
        color: '#065F46',
    },
    totalDurationText: {
        fontSize: scale(14),
        color: '#047857',
        marginTop: scale(2),
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: scale(20),
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: width * 0.05,
        minHeight: height * 0.5,
    },
    generatingTitle: {
        fontSize: scale(20),
        fontWeight: '600',
        color: '#111827',
        marginTop: scale(16),
        marginBottom: scale(8),
    },
    generatingSubtitle: {
        fontSize: scale(14),
        color: '#6B7280',
        textAlign: 'center',
        lineHeight: scale(22),
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: scale(0),
    },
    previewHeaderInfo: {
        flex: 1,
    },
    previewActions: {
        flexDirection: 'row',
        gap: scale(12),
    },
    iconButton: {
        padding: scale(8),
    },
    greenButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#059669',
        paddingHorizontal: scale(20),
        paddingVertical: scale(12),
        borderRadius: scale(8),
    },
    greenButtonText: {
        color: '#FFFFFF',
        fontSize: scale(15),
        fontWeight: '500',
    },
    assessmentInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        backgroundColor: '#fff',
        padding: scale(12),
        borderRadius: scale(8),
        marginBottom: scale(20),
    },
    infoItem: {
        width: '50%',
        paddingVertical: scale(4),
    },
    infoLabel: {
        fontSize: scale(12),
        color: '#6B7280',
    },
    infoValue: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#111827',
    },
    questionsContainer: {
        marginBottom: scale(20),
    },
    questionCard: {
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: scale(8),
        padding: scale(14),
        marginBottom: scale(12),
    },
    questionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(12),
    },
    questionBadges: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    questionNumber: {
        backgroundColor: '#DBEAFE',
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(12),
        marginRight: scale(6),
    },
    questionNumberText: {
        fontSize: scale(12),
        fontWeight: '600',
        color: '#1E40AF',
    },
    marksBadge: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(8),
        marginRight: scale(6),
    },
    marksBadgeText: {
        fontSize: scale(12),
        color: '#374151',
    },
    difficultyBadge: {
        backgroundColor: '#FEF3C7',
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
        borderRadius: scale(8),
    },
    difficultyBadgeText: {
        fontSize: scale(12),
        color: '#92400E',
        textTransform: 'capitalize',
    },
    questionActions: {
        flexDirection: 'row',
    },
    actionButton: {
        padding: scale(4),
        marginLeft: scale(8),
    },
    questionText: {
        fontSize: scale(15),
        fontWeight: '500',
        color: '#111827',
        marginBottom: scale(12),
        lineHeight: scale(22),
    },
    optionsContainer: {
        marginTop: scale(8),
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(8),
        paddingVertical: scale(4),
    },
    optionCircle: {
        width: scale(22),
        height: scale(22),
        borderRadius: scale(11),
        borderWidth: 2,
        borderColor: '#D1D5DB',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    correctOptionCircle: {
        backgroundColor: '#ECFDF5',
        borderColor: '#10B981',
    },
    optionLetter: {
        fontSize: scale(12),
        color: '#6B7280',
        fontWeight: 'bold',
    },
    correctOptionLetter: {
        color: '#059669',
    },
    optionText: {
        flex: 1,
        fontSize: scale(14),
        color: '#374151',
    },
    correctOptionText: {
        color: '#059669',
        fontWeight: '600',
    },
    trueFalseContainer: {
        flexDirection: 'row',
        marginTop: scale(8),
    },
    trueFalseOption: {
        backgroundColor: '#F3F4F6',
        paddingHorizontal: scale(12),
        paddingVertical: scale(6),
        borderRadius: scale(6),
        marginRight: scale(12),
    },
    correctTrueFalse: {
        backgroundColor: '#ECFDF5',
    },
    trueFalseText: {
        fontSize: scale(14),
        color: '#6B7280',
    },
    correctTrueFalseText: {
        color: '#059669',
        fontWeight: '600',
    },
    matchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingVertical: scale(8),
        marginTop: scale(8),
        borderWidth: 1,
        borderColor: '#E5E7EB',
        borderRadius: scale(4),
        paddingHorizontal: scale(8),
    },
    matchColumn: {
        flex: 1,
        paddingHorizontal: scale(8),
    },
    matchColumnTitle: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#111827',
        marginBottom: scale(8),
        textAlign: 'center',
    },
    matchItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    matchItemNumber: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#374151',
        width: scale(25),
    },
    matchItemLetter: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#374151',
        width: scale(25),
    },
    matchItemText: {
        flex: 1,
        fontSize: scale(14),
        color: '#374151',
        lineHeight: scale(20),
    },
    previewActionsBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: scale(20),
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    modalTitle: {
        fontSize: scale(18),
        fontWeight: '600',
        color: '#111827',
    },
    closeButton: {
        padding: scale(8),
    },
    closeButtonText: {
        fontSize: scale(18),
        color: '#6B7280',
        fontWeight: 'bold',
    },
    pdfPreview: {
        flex: 1,
        padding: width * 0.05,
    },
    pdfContent: {
        backgroundColor: '#FFFFFF',
    },
    pdfHeader: {
        borderBottomWidth: 2,
        borderBottomColor: '#111827',
        paddingBottom: scale(16),
        marginBottom: scale(20),
        alignItems: 'center',
    },
    pdfTitle: {
        fontSize: scale(22),
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: scale(12),
    },
    pdfInfo: {
        alignItems: 'center',
    },
    pdfInfoText: {
        fontSize: scale(13),
        color: '#374151',
        marginBottom: scale(4),
    },
    pdfQuestions: {},
    pdfQuestion: {
        marginBottom: scale(20),
    },
    pdfQuestionHeader: {
        flexDirection: 'row',
        marginBottom: scale(8),
        alignItems: 'flex-start',
    },
    pdfQuestionNumber: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#111827',
        marginRight: scale(6),
    },
    pdfQuestionText: {
        flex: 1,
        fontSize: scale(14),
        color: '#111827',
        lineHeight: scale(20),
    },
    pdfQuestionMarks: {
        fontSize: scale(12),
        color: '#6B7280',
        marginLeft: scale(6),
    },
    pdfOptions: {
        marginLeft: scale(20),
        marginBottom: scale(8),
    },
    pdfOption: {
        fontSize: scale(14),
        color: '#374151',
        marginBottom: scale(4),
    },
    pdfAnswerSpace: {
        marginLeft: scale(20),
        borderBottomWidth: 1,
        borderColor: '#D1D5DB',
        height: scale(60),
        marginTop: scale(8),
    },
    pdfTrueFalse: {
        flexDirection: 'row',
        marginLeft: scale(20),
        gap: scale(16),
    },
    pdfTrueFalseOption: {
        fontSize: scale(14),
        color: '#374151',
    },
    pdfMatch: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginLeft: scale(20),
    },
    pdfMatchColumn: {
        flex: 1,
    },
    pdfMatchColumnTitle: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#111827',
        marginBottom: scale(8),
        textAlign: 'center',
    },
    pdfMatchItem: {
        fontSize: scale(14),
        color: '#111827',
        marginBottom: scale(4),
    },
    pdfAnswerKey: {
        borderTopWidth: 1,
        borderTopColor: '#E5E7EB',
        paddingTop: scale(16),
        marginTop: scale(32),
    },
    pdfAnswerKeyTitle: {
        fontSize: scale(16),
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#111827',
        marginBottom: scale(12),
    },
    pdfAnswerKeyText: {
        fontSize: scale(12),
        color: '#374151',
        marginBottom: scale(4),
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#667eea',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        marginTop: 8,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    fileNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 10,
        padding: 10,
        backgroundColor: '#e8f0fe',
        borderRadius: 8,
    },
    fileNameText: {
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
    },
});

export default CustomizerAssessment;