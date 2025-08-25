import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, ActivityIndicator, SafeAreaView, Dimensions, } from 'react-native';
import { ChevronRight, Plus, Edit3, Trash2, Download, Eye, FileText, Settings, Save, } from 'lucide-react-native';
import { useNavigation } from '@react-navigation/native';

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
    correctAnswer: { [key: number]: number };
    marks: number;
    difficulty: string;
}

interface OtherQuestion {
    id: string;
    type: string;
    question: string;
    options?: string[];
    correctAnswer?: number | boolean;
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

const mockQuestions: Question[] = [
    {
        id: 'q1',
        type: 'multiple-choice',
        question: 'What is the value of x in the equation 2x + 5 = 15?',
        options: ['5', '10', '7.5', '20'],
        correctAnswer: 0,
        marks: 2,
        difficulty: 'medium'
    },
    {
        id: 'q2',
        type: 'short-answer',
        question: 'Explain the quadratic formula and when it is used.',
        marks: 5,
        difficulty: 'hard'
    },
    {
        id: 'q3',
        type: 'true-false',
        question: 'All quadratic equations have real solutions.',
        correctAnswer: false,
        marks: 1,
        difficulty: 'easy'
    },
    {
        id: 'q4',
        type: 'multiple-choice',
        question: 'What is the capital of France?',
        options: ['London', 'Paris', 'Berlin', 'Madrid'],
        correctAnswer: 1,
        marks: 2,
        difficulty: 'easy'
    },
    {
        id: 'q5',
        type: 'short-answer',
        question: 'Describe the process of photosynthesis.',
        marks: 5,
        difficulty: 'medium'
    },
    { // New Match the Following Question
        id: 'q6',
        type: 'match-the-following',
        question: 'Match the following inventors with their inventions.',
        leftColumn: ['Alexander Graham Bell', 'Thomas Edison', 'Guglielmo Marconi', 'Karl Benz'],
        rightColumn: ['Light Bulb', 'Telephone', 'Radio', 'Automobile'],
        correctAnswer: { 0: 1, 1: 0, 2: 2, 3: 3 }, // Maps index of left column to index of right column
        marks: 4,
        difficulty: 'easy',
    }
];

// Define SelectionStep component outside of Assessment
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
}) => {

    // Memoized component for chapter buttons to prevent unnecessary re-renders
    const MemoizedChapterButton = React.memo(({ chapter, isSelected, onPress }: { chapter: string; isSelected: boolean; onPress: (chapter: string) => void }) => {
        return (
            <TouchableOpacity
                style={[
                    styles.selectionButton,
                    isSelected && styles.selectedButton
                ]}
                onPress={() => onPress(chapter)}
            >
                <Text style={[
                    styles.buttonText,
                    isSelected && styles.selectedButtonText
                ]}>
                    {chapter}
                </Text>
            </TouchableOpacity>
        );
    });

    // Memoized component for standard/subject/language buttons
    const MemoizedSelectionButton = React.memo(({ item, isSelected, onPress }: { item: string; isSelected: boolean; onPress: (item: string) => void }) => {
        return (
            <TouchableOpacity
                style={[
                    styles.selectionButton,
                    isSelected && styles.selectedButton
                ]}
                onPress={() => onPress(item)}
            >
                <Text style={[
                    styles.buttonText,
                    isSelected && styles.selectedButtonText
                ]}>
                    {item}
                </Text>
            </TouchableOpacity>
        );
    });

    return (
        <ScrollView
            style={styles.container}
            keyboardShouldPersistTaps="handled"
            // Added scrollEventThrottle for smoother scrolling, doesn't change functionality
            scrollEventThrottle={16}
            // maintainVisibleContentPosition might not prevent jumps if layout changes above the visible content
            // but it's good practice to keep it if there's a specific need for keeping an index visible
            maintainVisibleContentPosition={{ minIndexForVisible: 0, autoscrollToTopThreshold: 10 }}
        >
            <View style={styles.card}>
                <Text style={styles.title}>Create Assessment</Text>
                <Text style={styles.subtitle}>
                    Select the content parameters for your assessment based on your uploaded materials.
                </Text>

                {/* Breadcrumb */}
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

                {/* Curriculum Selection */}
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
                                    setSelectedLanguage(''); // Reset language when curriculum changes
                                    setSelectedStandard('');
                                    setSelectedSubject('');
                                    setSelectedChapters([]);
                                    if (item === 'CBSE') {
                                        setSelectedLanguage('English'); // Automatically select English for CBSE
                                    }
                                }}
                            />
                        ))}
                    </View>
                </View>

                {/* Language Selection */}
                {selectedCurriculum && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Language</Text>
                        <View style={styles.grid}>
                            {selectedCurriculum === 'CBSE' ? (
                                // Only English for CBSE
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
                                // Both Tamil and English for State Board
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

                {/* Standard Selection */}
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

                {/* Subject Selection */}
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

                {/* Chapter Selection (Multi-select) */}
                {selectedSubject && (
                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Select Chapter(s)</Text>
                        <View style={styles.grid}>
                            {availableChapters.map((chapter) => (
                                <MemoizedChapterButton
                                    key={chapter}
                                    chapter={chapter}
                                    isSelected={selectedChapters.includes(chapter)}
                                    onPress={toggleChapterSelection} // Passed memoized callback
                                />
                            ))}
                        </View>
                    </View>
                )}

                {/* Continue Button */}
                {selectedChapters.length > 0 && (
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

// Define ConfigureStep component outside of Assessment
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

                {/* Selected Content Summary */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryTitle}>Selected Content</Text>
                    <View style={styles.summaryGrid}>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Curriculum:</Text>
                            <Text style={styles.summaryValue}>{selectedCurriculum}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Standard:</Text>
                            <Text style={styles.summaryValue}>{selectedStandard}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Subject:</Text>
                            <Text style={styles.summaryValue}>{selectedSubject}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Chapters:</Text>
                            <Text style={styles.summaryValue}>{selectedChapters.join(', ')}</Text>
                        </View>
                        <View style={styles.summaryItem}>
                            <Text style={styles.summaryLabel}>Language:</Text>
                            <Text style={styles.summaryValue}>{selectedLanguage}</Text>
                        </View>
                    </View>
                </View>

                {/* Basic Settings */}
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

                {/* Question Types */}
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

                {/* Action Buttons */}
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

const PreviewStep: React.FC = ({
    selectedCurriculum,
    selectedStandard,
    selectedSubject,
    selectedChapters,
    selectedLanguage,
    examConfig,
    setExamConfig,
    setCurrentStep,
    calculateTotalMarks,
    generatedQuestions,
    setGeneratedQuestions,
    showPdfPreview,
    setShowPdfPreview,
    navigate,
}) => {
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

                {/* Assessment Info */}
                <View style={styles.assessmentInfo}>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Curriculum:</Text>
                        <Text style={styles.infoValue}>{selectedCurriculum}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Standard:</Text>
                        <Text style={styles.infoValue}>{selectedStandard}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Subject:</Text>
                        <Text style={styles.infoValue}>{selectedSubject}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Chapters:</Text>
                        <Text style={styles.infoValue}>{selectedChapters.join(', ')}</Text>
                    </View>
                    <View style={styles.infoItem}>
                        <Text style={styles.infoLabel}>Language:</Text>
                        <Text style={styles.infoValue}>{selectedLanguage}</Text>
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

                {/* Questions List */}
                <View style={styles.questionsContainer}>
                    {generatedQuestions.map((question, index) => (
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

                            {question.type === 'multiple-choice' && question.options && (
                                <View style={styles.optionsContainer}>
                                    {question.options.map((option, optionIndex) => (
                                        <View key={optionIndex} style={styles.optionRow}>
                                            <View style={[
                                                styles.optionCircle,
                                                optionIndex === question.correctAnswer && styles.correctOptionCircle
                                            ]}>
                                                <Text style={[
                                                    styles.optionLetter,
                                                    optionIndex === question.correctAnswer && styles.correctOptionLetter
                                                ]}>
                                                    {String.fromCharCode(65 + optionIndex)}
                                                </Text>
                                            </View>
                                            <Text style={[
                                                styles.optionText,
                                                optionIndex === question.correctAnswer && styles.correctOptionText
                                            ]}>
                                                {option}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            )}

                            {question.type === 'true-false' && (
                                <View style={styles.trueFalseContainer}>
                                    <View style={[
                                        styles.trueFalseOption,
                                        question.correctAnswer === true && styles.correctTrueFalse
                                    ]}>
                                        <Text style={[
                                            styles.trueFalseText,
                                            question.correctAnswer === true && styles.correctTrueFalseText
                                        ]}>
                                            True
                                        </Text>
                                    </View>
                                    <View style={[
                                        styles.trueFalseOption,
                                        question.correctAnswer === false && styles.correctTrueFalse
                                    ]}>
                                        <Text style={[
                                            styles.trueFalseText,
                                            question.correctAnswer === false && styles.correctTrueFalseText
                                        ]}>
                                            False
                                        </Text>
                                    </View>
                                </View>
                            )}

                            {question.type === 'match-the-following' && (
                                <View style={styles.matchContainer}>
                                    <View style={styles.matchColumn}>
                                        <Text style={styles.matchColumnTitle}>Column A</Text>
                                        {(question as MatchQuestion).leftColumn.map((item, i) => (
                                            <View key={i} style={styles.matchItem}>
                                                <Text style={styles.matchItemNumber}>{i + 1}.</Text>
                                                <Text style={styles.matchItemText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                    <View style={styles.matchColumn}>
                                        <Text style={styles.matchColumnTitle}>Column B</Text>
                                        {(question as MatchQuestion).rightColumn.map((item, i) => (
                                            <View key={i} style={styles.matchItem}>
                                                <Text style={styles.matchItemLetter}>{String.fromCharCode(65 + i)}.</Text>
                                                <Text style={styles.matchItemText}>{item}</Text>
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            )}
                        </View>
                    ))}
                </View>

                {/* Action Buttons */}
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


const CustomizerAssessment: React.FC = () => {
    const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
    const [selectedStandard, setSelectedStandard] = useState<string>('');
    const [selectedSubject, setSelectedSubject] = useState<string>('');
    const [selectedChapters, setSelectedChapters] = useState<string[]>([]);
    const [selectedLanguage, setSelectedLanguage] = useState<string>('');
    const [currentStep, setCurrentStep] = useState<CurrentStep>('selection');
    const [examConfig, setExamConfig] = useState<ExamConfig>({
        totalMarks: 50,
        duration: 60,
        questionTypes: {
            'multiple-choice': { count: 5, marks: 2 },
            'short-answer': { count: 3, marks: 5 },
            'true-false': { count: 5, marks: 1 },
            'match-the-following': { count: 1, marks: 4 },
        },
        difficulty: 'mixed'
    });

    console.log(examConfig)
    const [generatedQuestions, setGeneratedQuestions] = useState<Question[]>([]);
    const [isGenerating, setIsGenerating] = useState<boolean>(false);
    const [showPdfPreview, setShowPdfPreview] = useState<boolean>(false);
    const navigate = useNavigation();

    // Extract unique values from uploaded content
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

    const availableLanguagesForStateBoard = ['Tamil', 'English']; // Defined here for passing to SelectionStep
    const availableLanguagesForCBSE = ['English']; // Defined here for passing to SelectionStep

    // Memoized callback for toggling chapter selection
    const toggleChapterSelection = useCallback((chapter: string) => {
        setSelectedChapters(prev => {
            if (prev.includes(chapter)) {
                return prev.filter(c => c !== chapter);
            } else {
                return [...prev, chapter];
            }
        });
    }, []);

    const generateQuestions = async (): Promise<void> => {
        setIsGenerating(true);
        setCurrentStep('generate');

        setTimeout(() => {
            setGeneratedQuestions(mockQuestions);
            setIsGenerating(false);
            setCurrentStep('preview');
        }, 3000);
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
                        setCurrentStep={setCurrentStep}
                        availableStandards={availableStandards}
                        availableSubjects={availableSubjects}
                        availableChapters={availableChapters}
                        availableLanguagesForStateBoard={availableLanguagesForStateBoard}
                        availableLanguagesForCBSE={availableLanguagesForCBSE}
                        toggleChapterSelection={toggleChapterSelection}
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
                        setExamConfig={setExamConfig} // Although not used directly in PreviewStep, good to pass consistent props
                        setCurrentStep={setCurrentStep}
                        calculateTotalMarks={calculateTotalMarks}
                        generatedQuestions={generatedQuestions}
                        setGeneratedQuestions={setGeneratedQuestions} // Although not used directly in PreviewStep, good to pass consistent props
                        showPdfPreview={showPdfPreview}
                        setShowPdfPreview={setShowPdfPreview}
                        navigate={navigate}
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
                        setCurrentStep={setCurrentStep}
                        availableStandards={availableStandards}
                        availableSubjects={availableSubjects}
                        availableChapters={availableChapters}
                        availableLanguagesForStateBoard={availableLanguagesForStateBoard}
                        availableLanguagesForCBSE={availableLanguagesForCBSE}
                        toggleChapterSelection={toggleChapterSelection}
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
                {/* Header */}
                <View style={styles.header}>
                    <Text style={styles.mainTitle}>Create Assessment</Text>
                </View>

                {/* Progress Steps */}
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

                {/* Step Content */}
                {renderStep()}

                {/* PDF Preview Modal */}
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
                                    <Text style={styles.pdfTitle}>{selectedSubject} Assessment</Text>
                                    <View style={styles.pdfInfo}>
                                        <Text style={styles.pdfInfoText}>Curriculum: {selectedCurriculum}</Text>
                                        <Text style={styles.pdfInfoText}>Class: {selectedStandard}</Text>
                                        <Text style={styles.pdfInfoText}>Chapters: {selectedChapters.join(', ')}</Text>
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

                                            {question.type === 'multiple-choice' && 'options' in question && (
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
                                            {question.type === 'match-the-following' && 'leftColumn' in question && (
                                                <View style={styles.pdfMatch}>
                                                    <View style={styles.pdfMatchColumn}>
                                                        {question.leftColumn.map((item, i) => (
                                                            <Text key={i} style={styles.pdfMatchItem}>
                                                                {i + 1}. {item}
                                                            </Text>
                                                        ))}
                                                    </View>
                                                    <View style={styles.pdfMatchColumn}>
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
                                    {generatedQuestions.map((q, i) => {
                                        let answer = '';
                                        if (q.type === 'multiple-choice' && 'correctAnswer' in q) {
                                            answer = String.fromCharCode(97 + (q.correctAnswer as number));
                                        } else if (q.type === 'true-false' && 'correctAnswer' in q) {
                                            answer = String(q.correctAnswer);
                                        } else if (q.type === 'match-the-following' && 'correctAnswer' in q) {
                                            answer = Object.entries(q.correctAnswer)
                                                .map(([left, right]) => `${parseInt(left) + 1}-${String.fromCharCode(65 + right)}`)
                                                .join(', ');
                                        }
                                        return (
                                            <Text key={q.id} style={styles.pdfAnswerKeyText}>
                                                {i + 1}: {answer}
                                            </Text>
                                        );
                                    })}
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
        paddingHorizontal: width * 0.05, // Responsive padding
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
        margin: -scale(4), // Negative margin for spacing
    },
    selectionButton: {
        flexGrow: 1,
        flexBasis: '40%', // Ensure at least two columns
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
    },
    matchColumn: {
        flex: 1,
    },
    matchColumnTitle: {
        fontSize: scale(14),
        fontWeight: '600',
        color: '#111827',
        marginBottom: scale(8),
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
        width: scale(20),
    },
    matchItemLetter: {
        fontSize: scale(14),
        fontWeight: 'bold',
        color: '#374151',
        width: scale(20),
    },
    matchItemText: {
        flex: 1,
        fontSize: scale(14),
        color: '#374151',
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
});

export default CustomizerAssessment;
