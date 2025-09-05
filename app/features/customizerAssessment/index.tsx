import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, StyleSheet, SafeAreaView, Dimensions, Alert } from 'react-native';
import { ChevronRight, Plus, Edit3, Trash2, Download, Eye, FileText, Settings } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as FileSystem from 'expo-file-system';
import { Picker } from '@react-native-picker/picker';
import { Share } from 'react-native';

const { width } = Dimensions.get('window');

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
    questionTypes: { [key: string]: QuestionType };
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

                {uploadedFile && (
                    <View style={styles.inputGroup}>
                        <Text style={styles.inputLabel}>Selected PDF</Text>
                        <View style={styles.fileNameContainer}>
                            <FileText size={scale(20)} color="#3B82F6" />
                            <Text style={styles.fileNameText}>{uploadedFile.name}</Text>
                        </View>
                    </View>
                )}

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

const predefinedQuestionTypes = [
    'multiple-choice',
    'short-answer',
    'true-false',
    'match-the-following',
];

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
    const [modalVisible, setModalVisible] = useState(false);
    const [selectedQuestionType, setSelectedQuestionType] = useState(predefinedQuestionTypes[0]);
    const [customQuestionType, setCustomQuestionType] = useState('');

    const updateQuestionType = (type: string, key: 'count' | 'marks', value: number) => {
        setExamConfig(prevConfig => ({
            ...prevConfig,
            questionTypes: {
                ...prevConfig.questionTypes,
                [type]: {
                    ...prevConfig.questionTypes[type],
                    [key]: value,
                },
            },
        }));
    };

    const addQuestionType = () => {
        const typeToAdd = selectedQuestionType === 'custom' ? customQuestionType.trim().toLowerCase().replace(/\s/g, '-') : selectedQuestionType;
        if (typeToAdd && !examConfig.questionTypes[typeToAdd]) {
            setExamConfig(prevConfig => ({
                ...prevConfig,
                questionTypes: {
                    ...prevConfig.questionTypes,
                    [typeToAdd]: { count: 0, marks: 0 },
                },
            }));
            setCustomQuestionType('');
            setModalVisible(false);
        } else {
            Alert.alert('Error', 'Question type already exists or is invalid.');
        }
    };

    const deleteQuestionType = (type: string) => {
        Alert.alert(
            'Delete Question Type',
            `Are you sure you want to delete ${type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    onPress: () => {
                        setExamConfig(prevConfig => {
                            const newQuestionTypes = { ...prevConfig.questionTypes };
                            delete newQuestionTypes[type];
                            return {
                                ...prevConfig,
                                questionTypes: newQuestionTypes,
                            };
                        });
                    },
                },
            ],
            { cancelable: false }
        );
    };

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
                    {Object.entries(examConfig.questionTypes).map(([type, values]) => (
                        <View key={type} style={styles.questionTypeCard}>
                            <View style={styles.questionTypeHeader}>
                                <Text style={styles.questionTypeTitle}>{type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</Text>
                                <Text style={styles.questionTypeMarks}>
                                    {values.count} × {values.marks} = {values.count * values.marks} marks
                                </Text>
                            </View>
                            <View style={styles.questionTypeInputs}>
                                <View style={styles.halfInput}>
                                    <Text style={styles.smallLabel}>Questions</Text>
                                    <TextInput
                                        style={styles.smallInput}
                                        value={String(values.count)}
                                        onChangeText={(text) => updateQuestionType(type, 'count', Number(text))}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <View style={styles.halfInput}>
                                    <Text style={styles.smallLabel}>Marks each</Text>
                                    <TextInput
                                        style={styles.smallInput}
                                        value={String(values.marks)}
                                        onChangeText={(text) => updateQuestionType(type, 'marks', Number(text))}
                                        keyboardType="numeric"
                                    />
                                </View>
                                <TouchableOpacity onPress={() => deleteQuestionType(type)} style={styles.deleteButton}>
                                    <Trash2 size={20} color="#EF4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))}
                    <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
                        <Plus size={20} color="#fff" />
                        <Text style={styles.addButtonText}>Add Question Type</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.totalMarksCard}>
                    <Text style={styles.totalMarksText}>Total Marks: {calculateTotalMarks()}</Text>
                    <Text style={styles.totalDurationText}>Duration: {examConfig.duration} minutes</Text>
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

            <Modal
                animationType="slide"
                transparent={true}
                visible={modalVisible}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.centeredView}>
                    <View style={styles.modalView}>
                        <Text style={styles.modalTitle}>Add Question Type</Text>
                        <Picker
                            selectedValue={selectedQuestionType}
                            style={styles.picker}
                            onValueChange={(itemValue) => setSelectedQuestionType(itemValue)}
                        >
                            {predefinedQuestionTypes.map((type, index) => (
                                <Picker.Item key={index} label={type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} value={type} />
                            ))}
                            <Picker.Item label="Type new" value="custom" />
                        </Picker>
                        {selectedQuestionType === 'custom' && (
                            <TextInput
                                style={styles.textInput}
                                placeholder="Enter custom question type"
                                onChangeText={setCustomQuestionType}
                                value={customQuestionType}
                            />
                        )}
                        <View style={styles.buttonRow}>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.buttonClose]}
                                onPress={() => setModalVisible(false)}
                            >
                                <Text style={styles.textStyle}>Cancel</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={[styles.modalButton, styles.buttonAdd]}
                                onPress={addQuestionType}
                            >
                                <Text style={styles.textStyle}>Add</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
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

    const generatePdfContent = () => {
        const sections = Object.entries(examConfig.questionTypes).map(([type, values]) => {
            const title = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
            return {
                title,
                questions: generatedQuestions.filter(q => q.type === type),
                totalMarks: values.count * values.marks,
            };
        }).filter(section => section.questions.length > 0);

        const content = sections.map(section => `
            <div style="margin-bottom: 24px;">
                <h2 style="font-size: 18px; font-weight: bold; color: #111827; margin-bottom: 8px;">Section: ${section.title} (${section.totalMarks} marks)</h2>
                ${section.questions.map((q, qIndex) => `
                    <div style="margin-bottom: 16px; border-bottom: 1px solid #E5E7EB; padding-bottom: 16px;">
                        <p style="font-size: 16px; color: #111827; font-weight: 500;">${qIndex + 1}. ${q.question}</p>
                        ${q.type === 'multiple-choice' && 'options' in q && q.options && `
                            <ul style="list-style-type: none; padding-left: 0; margin-top: 8px;">
                                ${q.options.map((option, oIndex) => `
                                    <li style="font-size: 14px; color: #374151; margin-bottom: 4px;">
                                        (${String.fromCharCode(65 + oIndex)}) ${option}
                                    </li>
                                `).join('')}
                            </ul>
                        `}
                        ${q.type === 'true-false' && 'options' in q && q.options && `
                            <p style="font-size: 14px; color: #374151; margin-top: 8px;">(True/False)</p>
                        `}
                        ${q.type === 'match-the-following' && 'leftColumn' in q && 'rightColumn' in q && `
                            <div style="display: flex; flex-direction: row; justify-content: space-between; margin-top: 8px;">
                                <div style="flex: 1; padding-right: 16px;">
                                    <h4 style="font-size: 14px; font-weight: 600;">Column A</h4>
                                    <ul style="list-style-type: none; padding-left: 0;">
                                        ${q.leftColumn.map((item, i) => `
                                            <li style="font-size: 14px; color: #374151; margin-bottom: 4px;">${i + 1}. ${item}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                                <div style="flex: 1; padding-left: 16px;">
                                    <h4 style="font-size: 14px; font-weight: 600;">Column B</h4>
                                    <ul style="list-style-type: none; padding-left: 0;">
                                        ${q.rightColumn.map((item, i) => `
                                            <li style="font-size: 14px; color: #374151; margin-bottom: 4px;">${String.fromCharCode(65 + i)}. ${item}</li>
                                        `).join('')}
                                    </ul>
                                </div>
                            </div>
                        `}
                    </div>
                `).join('')}
            </div>
        `).join('');

        const answerKeyContent = `
            <div style="border-top: 1px solid #E5E7EB; padding-top: 16px; margin-top: 32px;">
                <h3 style="font-size: 16px; font-weight: bold; text-align: center; color: #111827; margin-bottom: 12px;">Answer Key</h3>
                ${generatedQuestions.map((q, index) => {
                    const answer = getAnswerForQuestion(q);
                    return `<p style="font-size: 12px; color: #374151; margin-bottom: 4px;">Q${index + 1}: ${answer}</p>`;
                }).join('')}
            </div>
        `;

        const htmlContent = `
            <html>
                <head>
                    <title>${examTitle || 'Assessment'}</title>
                    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=0" />
                    <style>
                        body { font-family: sans-serif; padding: 20px; color: #111827; line-height: 1.6; }
                        h1 { font-size: 24px; font-weight: bold; text-align: center; margin-bottom: 10px; }
                        h2 { font-size: 18px; font-weight: bold; margin-bottom: 8px; }
                        .header { text-align: center; margin-bottom: 24px; }
                        .info-table { width: 100%; border-collapse: collapse; margin-top: 16px; }
                        .info-table td { padding: 8px; border: 1px solid #E5E7EB; font-size: 14px; }
                        .question-section { margin-bottom: 24px; border-bottom: 1px solid #E5E7EB; padding-bottom: 16px; }
                        .question-text { font-size: 16px; font-weight: 500; margin-bottom: 8px; }
                        .options-list { list-style-type: none; padding: 0; margin-left: 16px; }
                        .option-item { margin-bottom: 4px; font-size: 14px; }
                        .answer-key { border-top: 2px solid #111827; margin-top: 40px; padding-top: 20px; }
                        .answer-key h2 { text-align: center; }
                        .answer-item { font-size: 14px; margin-bottom: 8px; }
                        .match-table { width: 100%; margin-top: 8px; }
                        .match-table td { vertical-align: top; padding: 8px; }
                        .match-column-title { font-size: 14px; font-weight: 600; margin-bottom: 8px; }
                        .match-list { list-style-type: none; padding: 0; }
                        .match-item { font-size: 14px; margin-bottom: 4px; }
                    </style>
                </head>
                <body>
                    <div class="header">
                        <h1>${examTitle || 'Assessment'}</h1>
                        <p style="font-size: 14px; color: #6B7280;">Total Marks: ${calculateTotalMarks()} | Duration: ${examConfig.duration} minutes</p>
                        <table class="info-table">
                            <tr>
                                <td><strong>Curriculum:</strong> ${selectedCurriculum || 'N/A'}</td>
                                <td><strong>Standard:</strong> ${selectedStandard || 'N/A'}</td>
                                <td><strong>Subject:</strong> ${selectedSubject || 'N/A'}</td>
                            </tr>
                            <tr>
                                <td colspan="3"><strong>Chapters:</strong> ${selectedChapters.length > 0 ? selectedChapters.join(', ') : 'N/A'}</td>
                            </tr>
                        </table>
                    </div>
                    <div class="main-content">
                        ${content}
                    </div>
                    <div class="answer-key">
                        ${answerKeyContent}
                    </div>
                </body>
            </html>
        `;
        return htmlContent;
    };

    const downloadPdf = async () => {
        const htmlContent = generatePdfContent();
        const { uri } = await FileSystem.documentDirectory;
        if (uri) {
            const pdfUri = `${uri}${examTitle.replace(/ /g, '_') || 'assessment'}.pdf`;
            try {
                await FileSystem.writeAsStringAsync(pdfUri, htmlContent, { encoding: FileSystem.EncodingType.UTF8 });
                const result = await FileSystem.getContentUriAsync(pdfUri);
                await Share.share({
                    url: result.uri,
                    title: 'Assessment',
                });
            } catch (e) {
                console.error('Error during PDF creation or sharing: ', e);
                Alert.alert('Error', 'Failed to generate and share the PDF.');
            }
        } else {
            Alert.alert('Error', 'Could not access document directory.');
        }
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
                        <TouchableOpacity style={styles.iconButton} onPress={downloadPdf}>
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

    if (!Array.isArray(examData) || examData.length === 0) {
        console.warn('Invalid or empty exam data:', examData);
        return questions;
    }

    const latestExam = examData.sort((a: any, b: any) => 
        new Date(b.creationDate).getTime() - new Date(a.creationDate).getTime()
    )[0];

    const examPaper = latestExam.examPaper;
    if (!examPaper || !examPaper.sections || !Array.isArray(examPaper.sections)) {
        console.warn('No sections found in exam paper:', examPaper);
        return questions;
    }

    examPaper.sections.forEach((section: any, sectionIndex: number) => {
        const sectionQuestions = section.questions || [];

        sectionQuestions.forEach((q: any, questionIndex: number) => {
            let questionType = (q.questionType || q.type || 'multiple-choice')
                .toLowerCase()
                .replace(/_/g, '-');

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
                question: q.question || q.questionText || 'No question text',
                marks: q.marks || section.marksPerQuestion || 1,
                difficulty: q.difficulty || 'medium',
            };

            if (questionType === 'multiple-choice' || questionType === 'true-false') {
                newQuestion.options = Array.isArray(q.options) ? q.options : [];
                newQuestion.correctAnswer = q.answer || q.correctAnswer || '';
            } else if (questionType === 'match-the-following') {
                newQuestion.leftColumn = Array.isArray(q.left) ? q.left : (Array.isArray(q.leftColumn) ? q.leftColumn : []);
                newQuestion.rightColumn = Array.isArray(q.right) ? q.right : (Array.isArray(q.rightColumn) ? q.rightColumn : []);
                newQuestion.correctAnswer = q.answer && typeof q.answer === 'object' ? q.answer : {};
            } else if (questionType === 'short-answer') {
                newQuestion.correctAnswer = q.answer || q.correctAnswer || 'N/A';
            }

            questions.push(newQuestion);
        });
    });

    console.log('Parsed Questions:', JSON.stringify(questions, null, 2));
    return questions;
};

// Define getAnswerForQuestion
const getAnswerForQuestion = (question: Question): string => {
    try {
        if (question.type === 'multiple-choice' && 'options' in question && question.options && 'correctAnswer' in question) {
            const optionIndex = question.options.indexOf(question.correctAnswer as string);
            return optionIndex !== -1 ? `${String.fromCharCode(97 + optionIndex)}) ${question.correctAnswer}` : (question.correctAnswer as string) || 'N/A';
        } else if (question.type === 'true-false' && 'correctAnswer' in question) {
            return (question.correctAnswer as string) || 'N/A';
        } else if (question.type === 'match-the-following' && 'correctAnswer' in question && 'leftColumn' in question && 'rightColumn' in question) {
            if (!question.correctAnswer || typeof question.correctAnswer !== 'object') {
                console.warn(`Invalid correctAnswer for question ${question.id}:`, question.correctAnswer);
                return 'N/A';
            }

            const leftColumn = Array.isArray(question.leftColumn) ? question.leftColumn : [];
            const rightColumn = Array.isArray(question.rightColumn) ? question.rightColumn : [];

            if (Object.keys(question.correctAnswer).length === 0) {
                console.warn(`Empty correctAnswer for match-the-following question ${question.id}`);
                return 'N/A';
            }

            let answerRecord: Record<string, string> = {};
            if ('left' in question.correctAnswer && 'right' in question.correctAnswer) {
                const leftVal = (question.correctAnswer as any).left;
                const rightVal = (question.correctAnswer as any).right;
                if (typeof leftVal === 'string' && typeof rightVal === 'string') {
                    answerRecord[leftVal] = rightVal;
                } else {
                    console.warn(`Invalid left/right values in correctAnswer for question ${question.id}`);
                    return 'N/A';
                }
            } else {
                answerRecord = question.correctAnswer as Record<string, string>;
            }

            const answerPairs = Object.entries(answerRecord)
                .map(([left, right]) => {
                    if (typeof left !== 'string' || typeof right !== 'string') {
                        console.warn(`Invalid key-value pair in correctAnswer for question ${question.id}:`, { left, right });
                        return null;
                    }
                    const leftIndex = leftColumn.indexOf(left);
                    const rightIndex = rightColumn.indexOf(right);
                    const rightLetter = rightIndex !== -1 ? String.fromCharCode(65 + rightIndex) : right;
                    if (leftIndex !== -1 && rightLetter) {
                        return `${leftIndex + 1}-${rightLetter}`;
                    }
                    return null;
                })
                .filter((pair): pair is string => pair !== null)
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
        questionTypes: {},
        difficulty: 'mixed',
    });
    const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
    const [examTitle, setExamTitle] = useState<string>('');
    const navigate = useNavigation();

    const API_URL = 'http://192.168.1.38:3000';

    useEffect(() => {
        const loadSelectedPdf = async () => {
            try {
                const stored = await AsyncStorage.getItem('selectedPdf');
                if (stored) {
                    const json = JSON.parse(stored);
                    setUploadedFile({
                        name: json.title,
                        uri: json.url,
                        mimeType: 'application/pdf',
                        size: 0,
                    });
                    // Optional: await AsyncStorage.removeItem('selectedPdf');
                }
            } catch (error) {
                console.error('Error loading selected PDF:', error);
            }
        };
        loadSelectedPdf();
    }, []);

    const availableStandards = [...new Set(mockUploadedContent.map(item => item.tags.standard))];
    const availableSubjects = selectedStandard ? [...new Set(mockUploadedContent
        .filter(item => item.tags.standard === selectedStandard)
        .map(item => item.tags.subject))] : [];
    const availableChapters = selectedSubject ? [...new Set(mockUploadedContent
        .filter(item => item.tags.standard === selectedStandard && item.tags.subject === selectedSubject)
        .map(item => item.tags.chapter))] : [];
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
                throw new Error('Teacher ID not found.');
            }

            const response = await fetch(`${API_URL}/api/teachers/examsByTeacher`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ teacherId: parseInt(teacherId) }),
            });

            if (!response.ok) {
                throw new Error(`Failed to fetch exams: ${response.status}`);
            }

            const exams = await response.json();
            if (!exams.length) {
                throw new Error('No exams found for this teacher');
            }

            // Find the exam matching the provided examId
            const targetExam = examId ? exams.find((exam: any) => exam.id === examId) : null;
            if (!targetExam) {
                throw new Error(`Generated exam with ID ${examId} not found in teacher exams`);
            }

            console.log('Fetched exam:', JSON.stringify(targetExam, null, 2));

            const parsedQuestions = parseGeneratedQuestions([targetExam]);
            if (parsedQuestions.length === 0) {
                throw new Error('No questions parsed from the exam data');
            }

            setExamTitle(targetExam.examPaper?.title || examTitle || 'Assessment');
            setGeneratedQuestions(parsedQuestions);
            setExamConfig(prev => ({
                ...prev,
                totalMarks: parsedQuestions.reduce((total, q) => total + q.marks, 0),
            }));
            setCurrentStep('preview');
        } catch (error: any) {
            console.error('Error fetching last generated exam:', error);
            Alert.alert('Error', `Failed to fetch generated exam: ${error.message}`);
            setCurrentStep('configure');
        }
    };

    const generateQuestions = async (): Promise<void> => {
        setIsGenerating(true);
        setCurrentStep('generate');

        const chapterNumbers = selectedChapters.map(chapter => chapter.replace('Chapter ', ''));
        console.log('Raw selectedChapters:', selectedChapters);
        console.log('Raw chapterNumbers:', chapterNumbers);

        if (!Array.isArray(chapterNumbers) || chapterNumbers.length === 0) {
            console.error('Invalid chapter selection:', chapterNumbers);
            Alert.alert('Error', 'Please select at least one chapter.');
            setIsGenerating(false);
            setCurrentStep('configure');
            return;
        }

        const teacherId = await AsyncStorage.getItem('teacherId');
        if (!teacherId || isNaN(parseInt(teacherId))) {
            console.error('Invalid teacherId:', teacherId);
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

        const questionPattern: { [key: string]: number } = {};
        Object.entries(examConfig.questionTypes).forEach(([type, { count }]) => {
            if (count > 0) {
                questionPattern[type] = count;
            }
        });

        if (Object.keys(questionPattern).length === 0) {
            console.error('No valid question types selected');
            Alert.alert('Error', 'Please configure at least one question type with a non-zero count.');
            setIsGenerating(false);
            setCurrentStep('configure');
            return;
        }

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
        console.log('- examTitle:', examTitle);

        try {
            const response = await fetch(`${API_URL}/api/exam/generate`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json'
                },
                body: formData,
            });

            if (!response.ok) {
                let errorMessage = `HTTP error! status: ${response.status}`;
                try {
                    const errorData = await response.json();
                    console.error('Server error response:', JSON.stringify(errorData, null, 2));
                    errorMessage = errorData.message || errorMessage;
                } catch (jsonError) {
                    console.error('Failed to parse error response:', jsonError);
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log('Generate API Response:', JSON.stringify(data, null, 2));

            if (!data.examId) {
                throw new Error('No examId returned from generate API');
            }

            // Fetch the last generated exam using the examId from the generate response
            await fetchLastGeneratedExam(data.examId);

        } catch (error: any) {
            console.error('Error generating exam:', error);
            Alert.alert('Error', `Failed to generate exam: ${error.message}`);
            setIsGenerating(false);
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
                <Modal visible={showPdfPreview} animationType="slide" presentationStyle="fullScreen">
                    <SafeAreaView style={styles.modalContainer}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Question Paper Preview</Text>
                            <TouchableOpacity onPress={() => setShowPdfPreview(false)} style={styles.closeButton}>
                                <Text style={styles.closeButtonText}>✕</Text>
                            </TouchableOpacity>
                        </View>
                        <ScrollView style={styles.pdfPreview}>
                            <View style={styles.pdfContent}>
                                <View style={styles.pdfHeader}>
                                    <Text style={styles.pdfTitle}>{examTitle || 'Assessment'}</Text>
                                    <View style={styles.pdfInfo}>
                                        <Text style={styles.pdfInfoText}>Curriculum: ${selectedCurriculum || 'N/A'}</Text>
                                        <Text style={styles.pdfInfoText}>Class: ${selectedStandard || 'N/A'}</Text>
                                        <Text style={styles.pdfInfoText}>Subject: ${selectedSubject || 'N/A'}</Text>
                                        <Text style={styles.pdfInfoText}>Chapters: ${selectedChapters.length > 0 ? selectedChapters.join(', ') : 'N/A'}</Text>
                                    </View>
                                    <View style={styles.pdfInfo}>
                                        <Text style={styles.pdfInfoText}>Total Marks: ${calculateTotalMarks()}</Text>
                                        <Text style={styles.pdfInfoText}>Duration: ${examConfig.duration} minutes</Text>
                                    </View>
                                </View>
                                {Object.entries(examConfig.questionTypes).map(([type, values]) => {
                                    const sectionQuestions = generatedQuestions.filter(q => q.type === type);
                                    if (sectionQuestions.length === 0) return null;
                                    const title = type.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
                                    return (
                                        <View key={type} style={styles.pdfSection}>
                                            <Text style={styles.pdfSectionTitle}>Section: ${title} (${values.count * values.marks} marks)</Text>
                                            {sectionQuestions.map((q, qIndex) => (
                                                <View key={q.id} style={styles.pdfQuestion}>
                                                    <Text style={styles.pdfQuestionText}>{qIndex + 1}. ${q.question}</Text>
                                                    {q.type === 'multiple-choice' && 'options' in q && q.options && (
                                                        <View style={styles.pdfOptions}>
                                                            {q.options.map((option, oIndex) => (
                                                                <Text key={oIndex} style={styles.pdfOptionText}>({String.fromCharCode(65 + oIndex)}) ${option}</Text>
                                                            ))}
                                                        </View>
                                                    )}
                                                    {q.type === 'true-false' && 'options' in q && (
                                                        <Text style={styles.pdfOptionText}>(True/False)</Text>
                                                    )}
                                                    {q.type === 'match-the-following' && 'leftColumn' in q && 'rightColumn' in q && (
                                                        <View style={styles.pdfMatchContainer}>
                                                            <View style={styles.pdfMatchColumn}>
                                                                <Text style={styles.pdfMatchColumnTitle}>Column A</Text>
                                                                {q.leftColumn.map((item, i) => (
                                                                    <Text key={i} style={styles.pdfMatchItem}>{i + 1}. ${item}</Text>
                                                                ))}
                                                            </View>
                                                            <View style={styles.pdfMatchColumn}>
                                                                <Text style={styles.pdfMatchColumnTitle}>Column B</Text>
                                                                {q.rightColumn.map((item, i) => (
                                                                    <Text key={i} style={styles.pdfMatchItem}>{String.fromCharCode(65 + i)}. ${item}</Text>
                                                                ))}
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            ))}
                                        </View>
                                    );
                                })}
                                <View style={styles.pdfAnswerKey}>
                                    <Text style={styles.pdfAnswerKeyTitle}>Answer Key</Text>
                                    {generatedQuestions.map((q, index) => (
                                        <Text key={q.id} style={styles.pdfAnswerKeyText}>Q${index + 1}: ${getAnswerForQuestion(q)}</Text>
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

// Placeholder for styles (not included as per request)

const styles = StyleSheet.create({
    safeArea: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    mainContainer: {
        flex: 1,
    },
    header: {
        paddingVertical: scale(16),
        paddingHorizontal: scale(20),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    mainTitle: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: '#111827',
    },
    progressContainer: {
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    progressSteps: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    progressStepContainer: {
        alignItems: 'center',
        flex: 1,
    },
    progressCircle: {
        width: scale(40),
        height: scale(40),
        borderRadius: scale(20),
        backgroundColor: '#f3f4f6',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#d1d5db',
    },
    activeProgressCircle: {
        backgroundColor: '#2563eb',
        borderColor: '#2563eb',
    },
    completedProgressCircle: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    progressLabel: {
        fontSize: scale(12),
        marginTop: scale(4),
        color: '#6b7280',
        fontWeight: '500',
    },
    activeProgressLabel: {
        color: '#2563eb',
    },
    completedProgressLabel: {
        color: '#10b981',
    },
    progressLine: {
        height: 2,
        backgroundColor: '#d1d5db',
        flex: 1,
        marginHorizontal: -scale(16),
    },
    progressLineActive: {
        backgroundColor: '#2563eb',
    },
    container: {
        flex: 1,
        backgroundColor: '#f9fafb',
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 12,
        margin: scale(16),
        padding: scale(20),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
        elevation: 5,
    },
    title: {
        fontSize: scale(22),
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: scale(8),
    },
    subtitle: {
        fontSize: scale(14),
        color: '#6b7280',
        marginBottom: scale(20),
    },
    breadcrumb: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
        marginBottom: scale(20),
    },
    breadcrumbText: {
        fontSize: scale(14),
        color: '#6b7280',
        marginHorizontal: scale(4),
    },
    inputGroup: {
        marginBottom: scale(16),
    },
    inputLabel: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#374151',
        marginBottom: scale(8),
    },
    input: {
        height: scale(48),
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        paddingHorizontal: scale(16),
        fontSize: scale(16),
        color: '#111827',
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    fileNameContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: scale(12),
        backgroundColor: '#ECF0F3',
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#D1D5DB',
    },
    fileNameText: {
        marginLeft: scale(8),
        fontSize: scale(14),
        color: '#111827',
        flexShrink: 1,
    },
    uploadButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4C51BF',
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
    },
    uploadButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    section: {
        marginBottom: scale(24),
    },
    sectionTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: scale(16),
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(8),
    },
    selectionButton: {
        paddingVertical: scale(10),
        paddingHorizontal: scale(16),
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    selectedButton: {
        backgroundColor: '#e0e7ff',
        borderColor: '#3b82f6',
    },
    buttonText: {
        fontSize: scale(14),
        fontWeight: '500',
        color: '#374151',
    },
    selectedButtonText: {
        color: '#3b82f6',
    },
    actionContainer: {
        marginTop: scale(20),
    },
    primaryButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4C51BF',
        borderRadius: 8,
        paddingVertical: 14,
        paddingHorizontal: 24,
    },
    primaryButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginRight: 8,
    },
    summaryCard: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: scale(16),
        marginBottom: scale(20),
    },
    summaryTitle: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: scale(12),
    },
    summaryGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: scale(16),
    },
    summaryItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    summaryLabel: {
        fontSize: scale(14),
        color: '#4b5563',
        fontWeight: '600',
    },
    summaryValue: {
        fontSize: scale(14),
        color: '#111827',
        marginLeft: scale(4),
    },
    difficultyContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        borderRadius: 8,
        backgroundColor: '#e5e7eb',
        padding: scale(4),
    },
    difficultyButton: {
        flex: 1,
        paddingVertical: scale(12),
        borderRadius: 8,
    },
    selectedDifficultyButton: {
        backgroundColor: '#fff',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    difficultyButtonText: {
        textAlign: 'center',
        fontSize: scale(14),
        fontWeight: '600',
        color: '#6b7280',
    },
    selectedDifficultyButtonText: {
        color: '#111827',
    },
    questionTypeCard: {
        backgroundColor: '#f9fafb',
        borderRadius: 8,
        padding: scale(12),
        marginBottom: scale(12),
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    questionTypeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    questionTypeTitle: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#1f2937',
    },
    questionTypeMarks: {
        fontSize: scale(14),
        color: '#4b5563',
    },
    questionTypeInputs: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(8),
    },
    halfInput: {
        flex: 1,
    },
    smallLabel: {
        fontSize: scale(12),
        color: '#6b7280',
        marginBottom: scale(4),
    },
    smallInput: {
        height: scale(40),
        backgroundColor: '#fff',
        borderRadius: 8,
        paddingHorizontal: scale(12),
        fontSize: scale(14),
        color: '#111827',
        borderWidth: 1,
        borderColor: '#d1d5db',
    },
    totalMarksCard: {
        backgroundColor: '#2563eb',
        borderRadius: 12,
        padding: scale(16),
        marginTop: scale(20),
        alignItems: 'center',
    },
    totalMarksText: {
        fontSize: scale(20),
        fontWeight: 'bold',
        color: '#fff',
    },
    totalDurationText: {
        fontSize: scale(14),
        color: '#bfdbfe',
        marginTop: scale(4),
    },
    actionButtonsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: scale(24),
    },
    secondaryButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#e5e7eb',
        borderRadius: 8,
        paddingVertical: 14,
        marginRight: scale(8),
    },
    secondaryButtonText: {
        color: '#374151',
        fontSize: 18,
        fontWeight: '600',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: scale(20),
    },
    generatingTitle: {
        fontSize: scale(20),
        fontWeight: 'bold',
        color: '#111827',
        marginTop: scale(16),
        textAlign: 'center',
    },
    generatingSubtitle: {
        fontSize: scale(14),
        color: '#6b7280',
        textAlign: 'center',
        marginTop: scale(8),
    },
    previewHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: scale(20),
    },
    previewHeaderInfo: {
        flex: 1,
    },
    previewActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: scale(12),
    },
    iconButton: {
        backgroundColor: '#f3f4f6',
        borderRadius: 20,
        padding: scale(8),
        borderWidth: 1,
        borderColor: '#e5e7eb',
    },
    assessmentInfo: {
        backgroundColor: '#f3f4f6',
        borderRadius: 12,
        padding: scale(16),
        marginBottom: scale(20),
    },
    infoItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: scale(8),
    },
    infoLabel: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#4b5563',
    },
    infoValue: {
        fontSize: scale(14),
        color: '#111827',
        flexShrink: 1,
        marginLeft: scale(8),
        textAlign: 'right',
    },
    questionsContainer: {
        marginTop: scale(20),
    },
    questionCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
        padding: scale(16),
        marginBottom: scale(16),
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
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
        gap: scale(8),
    },
    questionNumber: {
        backgroundColor: '#4C51BF',
        borderRadius: 6,
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
    },
    questionNumberText: {
        color: '#fff',
        fontSize: scale(12),
        fontWeight: 'bold',
    },
    marksBadge: {
        backgroundColor: '#10b981',
        borderRadius: 6,
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
    },
    marksBadgeText: {
        color: '#fff',
        fontSize: scale(12),
        fontWeight: 'bold',
    },
    difficultyBadge: {
        backgroundColor: '#fcd34d',
        borderRadius: 6,
        paddingHorizontal: scale(8),
        paddingVertical: scale(4),
    },
    difficultyBadgeText: {
        color: '#111827',
        fontSize: scale(12),
        fontWeight: 'bold',
    },
    questionActions: {
        flexDirection: 'row',
        gap: scale(8),
    },
    actionButton: {
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: scale(8),
    },
    questionText: {
        fontSize: scale(16),
        fontWeight: '500',
        color: '#111827',
        marginBottom: scale(16),
    },
    optionsContainer: {
        marginBottom: scale(16),
    },
    optionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: scale(8),
    },
    optionCircle: {
        width: scale(24),
        height: scale(24),
        borderRadius: scale(12),
        borderWidth: 2,
        borderColor: '#d1d5db',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: scale(12),
    },
    correctOptionCircle: {
        backgroundColor: '#10b981',
        borderColor: '#10b981',
    },
    optionLetter: {
        fontSize: scale(12),
        fontWeight: 'bold',
        color: '#6b7280',
    },
    correctOptionLetter: {
        color: '#fff',
    },
    optionText: {
        fontSize: scale(16),
        color: '#374151',
        flex: 1,
    },
    correctOptionText: {
        fontWeight: '600',
        color: '#10b981',
    },
    trueFalseContainer: {
        flexDirection: 'row',
        gap: scale(12),
    },
    trueFalseOption: {
        paddingVertical: scale(8),
        paddingHorizontal: scale(16),
        borderRadius: 20,
        backgroundColor: '#e5e7eb',
    },
    correctTrueFalse: {
        backgroundColor: '#10b981',
    },
    trueFalseText: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#6b7280',
    },
    correctTrueFalseText: {
        color: '#fff',
    },
    matchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    matchColumn: {
        flex: 1,
    },
    matchColumnTitle: {
        fontSize: scale(16),
        fontWeight: 'bold',
        color: '#1f2937',
        marginBottom: scale(8),
    },
    matchItem: {
        flexDirection: 'row',
        marginBottom: scale(4),
        alignItems: 'center',
    },
    matchItemNumber: {
        fontSize: scale(14),
        color: '#374151',
        marginRight: scale(4),
    },
    matchItemLetter: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#374151',
        marginRight: scale(4),
    },
    matchItemText: {
        fontSize: scale(14),
        color: '#374151',
        flex: 1,
    },
    previewActionsBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: scale(24),
    },
    greenButton: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#10b981',
        borderRadius: 8,
        paddingVertical: 14,
        marginLeft: scale(8),
    },
    greenButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: scale(16),
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    modalTitle: {
        fontSize: scale(20),
        fontWeight: 'bold',
        color: '#111827',
    },
    closeButton: {
        padding: scale(8),
    },
    closeButtonText: {
        fontSize: scale(20),
        color: '#6b7280',
    },
    pdfPreview: {
        flex: 1,
    },
    pdfContent: {
        padding: scale(20),
    },
    pdfHeader: {
        marginBottom: scale(24),
        borderBottomWidth: 1,
        borderBottomColor: '#d1d5db',
        paddingBottom: scale(16),
    },
    pdfTitle: {
        fontSize: scale(24),
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: scale(8),
    },
    pdfInfo: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'center',
        gap: scale(16),
        marginTop: scale(4),
    },
    pdfInfoText: {
        fontSize: scale(14),
        color: '#4b5563',
    },
    pdfSection: {
        marginBottom: scale(24),
    },
    pdfSectionTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: scale(8),
    },
    pdfQuestion: {
        marginBottom: scale(16),
    },
    pdfQuestionText: {
        fontSize: scale(16),
        fontWeight: '500',
        color: '#111827',
        marginBottom: scale(8),
    },
    pdfOptions: {
        marginTop: scale(4),
        marginLeft: scale(12),
    },
    pdfOptionText: {
        fontSize: scale(14),
        color: '#374151',
        marginBottom: scale(4),
    },
    pdfMatchContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: scale(8),
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
    addButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#4C51BF',
        borderRadius: 8,
        paddingVertical: 12,
        marginTop: 16,
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 8,
    },
    centeredView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.5)',
    },
    modalView: {
        width: '80%',
        backgroundColor: 'white',
        borderRadius: 20,
        padding: scale(20),
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    modalTitle: {
        fontSize: scale(18),
        fontWeight: 'bold',
        marginBottom: scale(16),
    },
    picker: {
        width: '100%',
        height: scale(50),
        marginBottom: scale(16),
        backgroundColor: '#F3F4F6',
        borderRadius: 8,
    },
    textInput: {
        width: '100%',
        height: scale(40),
        borderColor: '#E5E7EB',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: scale(12),
        marginBottom: scale(16),
    },
    buttonRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: '100%',
    },
    modalButton: {
        borderRadius: 8,
        paddingVertical: 12,
        paddingHorizontal: 20,
        elevation: 2,
        flex: 1,
        marginHorizontal: 5,
    },
    buttonClose: {
        backgroundColor: '#9CA3AF',
    },
    buttonAdd: {
        backgroundColor: '#4C51BF',
    },
    textStyle: {
        color: 'white',
        fontWeight: 'bold',
        textAlign: 'center',
    },
    deleteButton: {
        padding: scale(8),
    },
    // uploadButtonText: {
    //     color: '#fff',
    //     fontSize: 16,
    //     fontWeight: '600',
    //     marginLeft: 8,
    // },
});

export default CustomizerAssessment;