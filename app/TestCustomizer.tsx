import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  StyleSheet,
} from 'react-native';
import { Path, Svg } from 'react-native-svg';

interface Question {
  count: number;
  totalMarks: number;
  customMarks: string;
}

interface CustomExam {
  totalMarks: string;
  questions: {
    oneMarks: Question;
    twoMarks: Question;
    fiveMarks: Question;
    tenMarks: Question;
  };
}

interface PredefinedExam {
  id: string;
  title: string;
  description: string;
  marks: number;
}

interface QuestionType {
  key: keyof CustomExam['questions'];
  title: string;
  subtitle: string;
  defaultMarks: number;
  doubleMarks: number;
}

// SVG Icon Components
const FileText = ({ size = 16, color = "#6b7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14 3v4a1 1 0 0 0 1 1h4"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M17 21H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h7l5 5v11a2 2 0 0 1-2 2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M9 9h1m0 0h1m-1 0v1m0-1V8m4 5H9m6 4H9"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const ChevronRight = ({ size = 24, color = "#9ca3af" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="m9 18 6-6-6-6"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Settings = ({ size = 16, color = "#6b7280" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <Path
      d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Minus = ({ size = 16, color = "white" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M5 12h14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const Plus = ({ size = 16, color = "white" }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M12 5v14m-7-7h14"
      stroke={color}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

const TestCustomizer: React.FC = () => {
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const [customExam, setCustomExam] = useState<CustomExam>({
    totalMarks: '',
    questions: {
      oneMarks: { count: 0, totalMarks: 0, customMarks: '' },
      twoMarks: { count: 0, totalMarks: 0, customMarks: '' },
      fiveMarks: { count: 0, totalMarks: 0, customMarks: '' },
      tenMarks: { count: 0, totalMarks: 0, customMarks: '' }
    }
  });

  const predefinedExams: PredefinedExam[] = [
    { id: '25', title: '25 Marks Exam', description: 'Quick assessment test', marks: 25 },
    { id: '50', title: '50 Marks Exam', description: 'Standard test format', marks: 50 },
    { id: '75', title: '75 Marks Exam', description: 'Comprehensive test', marks: 75 },
    { id: '100', title: '100 Marks Exam', description: 'Full assessment', marks: 100 }
  ];

  const questionTypes: QuestionType[] = [
    {
      key: 'oneMarks',
      title: '1 Mark Questions',
      subtitle: 'MCQ, Fill in the blanks, Match the following',
      defaultMarks: 1,
      doubleMarks: 2
    },
    {
      key: 'twoMarks',
      title: '2 Mark Questions',
      subtitle: 'Short answer questions',
      defaultMarks: 2,
      doubleMarks: 4
    },
    {
      key: 'fiveMarks',
      title: '5 Mark Questions',
      subtitle: 'Detailed answer questions',
      defaultMarks: 5,
      doubleMarks: 10
    },
    {
      key: 'tenMarks',
      title: '10 Mark Questions',
      subtitle: 'Essay type questions',
      defaultMarks: 10,
      doubleMarks: 20
    }
  ];

  const updateQuestionCount = (type: keyof CustomExam['questions'], increment: number): void => {
    setCustomExam(prev => {
      const newCount = Math.max(0, prev.questions[type].count + increment);
      const questionData = questionTypes.find(q => q.key === type);
      const defaultTotal = newCount * (questionData?.defaultMarks || 0);

      return {
        ...prev,
        questions: {
          ...prev.questions,
          [type]: {
            ...prev.questions[type],
            count: newCount,
            totalMarks: defaultTotal,
            customMarks: defaultTotal.toString()
          }
        }
      };
    });
  };

  const updateCustomMarks = (type: keyof CustomExam['questions'], marks: string): void => {
    setCustomExam(prev => ({
      ...prev,
      questions: {
        ...prev.questions,
        [type]: {
          ...prev.questions[type],
          customMarks: marks,
          totalMarks: parseInt(marks) || 0
        }
      }
    }));
  };

  const calculateTotalMarks = (): number => {
    return Object.values(customExam.questions).reduce((total, question) => {
      return total + question.totalMarks;
    }, 0);
  };

  const handleProceed = (): void => {
    if (selectedType === 'custom') {
      const totalCalculated = calculateTotalMarks();
      if (totalCalculated === 0) {
        Alert.alert('Error', 'Please add at least one question type');
        return;
      }
      Alert.alert('Success', `Custom exam created with ${totalCalculated} marks`);
    } else {
      const exam = predefinedExams.find(e => e.id === selectedType);
      if (exam) {
        Alert.alert('Success', `${exam.title} selected`);
      }
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Test Customizer</Text>
        <Text style={styles.headerSubtitle}>Choose your exam format</Text>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Predefined Exams */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Setup</Text>

          {predefinedExams.map((exam) => (
            <TouchableOpacity
              key={exam.id}
              style={[
                styles.examCard,
                selectedType === exam.id && styles.examCardSelected
              ]}
              onPress={() => setSelectedType(exam.id)}
            >
              <View style={styles.examCardContent}>
                <View style={styles.examCardInfo}>
                  <Text style={styles.examCardTitle}>{exam.title}</Text>
                  <Text style={styles.examCardDescription}>{exam.description}</Text>
                  <View style={styles.examCardMeta}>
                    <FileText size={16} color="#6b7280" />
                    <Text style={styles.examCardMetaText}>{exam.marks} marks total</Text>
                  </View>
                </View>
                <ChevronRight
                  size={24}
                  color={selectedType === exam.id ? "#3b82f6" : "#9ca3af"}
                />
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Custom Exam Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Custom Exam</Text>

          <TouchableOpacity
            style={[
              styles.examCard,
              selectedType === 'custom' && styles.examCardCustomSelected
            ]}
            onPress={() => setSelectedType('custom')}
          >
            <View style={styles.examCardContent}>
              <View style={styles.examCardInfo}>
                <Text style={styles.examCardTitle}>Custom Exam Builder</Text>
                <Text style={styles.examCardDescription}>Create your own exam format</Text>
                <View style={styles.examCardMeta}>
                  <Settings size={16} color="#6b7280" />
                  <Text style={styles.examCardMetaText}>Fully customizable</Text>
                </View>
              </View>
              <ChevronRight
                size={24}
                color={selectedType === 'custom' ? "#8b5cf6" : "#9ca3af"}
              />
            </View>
          </TouchableOpacity>

          {/* Custom Exam Details */}
          {selectedType === 'custom' && (
            <View style={styles.customExamDetails}>
              <Text style={styles.configTitle}>Exam Configuration</Text>

              {/* Total Marks Input */}
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Target Total Marks (Optional)</Text>
                <TextInput
                  style={styles.input}
                  placeholder="Enter total marks"
                  value={customExam.totalMarks}
                  onChangeText={(text) => setCustomExam(prev => ({ ...prev, totalMarks: text }))}
                  keyboardType="numeric"
                />
                <Text style={styles.helpText}>
                  Current total: {calculateTotalMarks()} marks
                </Text>
              </View>

              {/* Question Types */}
              {questionTypes.map((questionType) => {
                const question = customExam.questions[questionType.key];
                return (
                  <View key={questionType.key} style={styles.questionTypeCard}>
                    <Text style={styles.questionTypeTitle}>{questionType.title}</Text>
                    <Text style={styles.questionTypeSubtitle}>{questionType.subtitle}</Text>

                    {/* Question Count Controls */}
                    <View style={styles.questionCountRow}>
                      <Text style={styles.questionCountLabel}>Number of Questions</Text>
                      <View style={styles.questionCountControls}>
                        <TouchableOpacity
                          style={[styles.countButton, styles.minusButton]}
                          onPress={() => updateQuestionCount(questionType.key, -1)}
                          disabled={question.count === 0}
                        >
                          <Minus size={16} />
                        </TouchableOpacity>
                        <Text style={styles.countDisplay}>{question.count}</Text>
                        <TouchableOpacity
                          style={[styles.countButton, styles.plusButton]}
                          onPress={() => updateQuestionCount(questionType.key, 1)}
                        >
                          <Plus size={16} />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Marks Configuration */}
                    {question.count > 0 && (
                      <View style={styles.marksConfig}>
                        <Text style={styles.marksConfigLabel}>
                          Total Marks for this section
                        </Text>
                        <View style={styles.marksButtonGrid}>
                          <TouchableOpacity
                            style={[styles.marksButton, styles.marksButtonBlue]}
                            onPress={() => updateCustomMarks(questionType.key, (question.count * questionType.defaultMarks).toString())}
                          >
                            <Text style={styles.marksButtonBlueText}>
                              {question.count} × {questionType.defaultMarks} = {question.count * questionType.defaultMarks}
                            </Text>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={[styles.marksButton, styles.marksButtonPurple]}
                            onPress={() => updateCustomMarks(questionType.key, (question.count * questionType.doubleMarks).toString())}
                          >
                            <Text style={styles.marksButtonPurpleText}>
                              {question.count} × {questionType.doubleMarks} = {question.count * questionType.doubleMarks}
                            </Text>
                          </TouchableOpacity>
                        </View>
                        <Text style={styles.customMarksText}>or enter custom marks</Text>
                        <TextInput
                          style={styles.customMarksInput}
                          placeholder="Custom marks"
                          value={question.customMarks}
                          onChangeText={(text) => updateCustomMarks(questionType.key, text)}
                          keyboardType="numeric"
                        />
                      </View>
                    )}
                  </View>
                );
              })}

              {/* Summary */}
              <View style={styles.summary}>
                <Text style={styles.summaryText}>
                  Total Questions: {Object.values(customExam.questions).reduce((sum, q) => sum + q.count, 0)}
                </Text>
                <Text style={styles.summaryText}>
                  Total Marks: {calculateTotalMarks()}
                </Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Action Button */}
      {selectedType && (
        <View style={styles.bottomAction}>
          <TouchableOpacity
            style={styles.proceedButton}
            onPress={handleProceed}
          >
            <Text style={styles.proceedButtonText}>
              {selectedType === 'custom' ? 'Create Custom Exam' : 'Proceed with Selected Exam'}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  headerSubtitle: {
    color: '#6b7280',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  section: {
    padding: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  examCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#e5e7eb',
  },
  examCardSelected: {
    borderColor: '#3b82f6',
    backgroundColor: '#eff6ff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  examCardCustomSelected: {
    borderColor: '#8b5cf6',
    backgroundColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  examCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  examCardInfo: {
    flex: 1,
  },
  examCardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
  },
  examCardDescription: {
    color: '#6b7280',
    marginTop: 4,
  },
  examCardMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  examCardMetaText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 4,
  },
  customExamDetails: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    borderWidth: 1,
    borderColor: '#d8b4fe',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 1,
  },
  configTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 24,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  helpText: {
    fontSize: 12,
    color: '#6b7280',
    marginTop: 4,
  },
  questionTypeCard: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f9fafb',
    borderRadius: 8,
  },
  questionTypeTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  questionTypeSubtitle: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 12,
  },
  questionCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  questionCountLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
  },
  questionCountControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  countButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  minusButton: {
    backgroundColor: '#ef4444',
  },
  plusButton: {
    backgroundColor: '#22c55e',
  },
  countDisplay: {
    fontSize: 18,
    fontWeight: '600',
    color: '#111827',
    minWidth: 32,
    textAlign: 'center',
  },
  marksConfig: {
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 12,
  },
  marksConfigLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#374151',
    marginBottom: 8,
  },
  marksButtonGrid: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  marksButton: {
    flex: 1,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  marksButtonBlue: {
    backgroundColor: '#dbeafe',
  },
  marksButtonBlueText: {
    color: '#1d4ed8',
    fontWeight: '500',
  },
  marksButtonPurple: {
    backgroundColor: '#e9d5ff',
  },
  marksButtonPurpleText: {
    color: '#7c3aed',
    fontWeight: '500',
  },
  customMarksText: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
    marginBottom: 8,
  },
  customMarksInput: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 8,
    textAlign: 'center',
    fontSize: 14,
    backgroundColor: '#ffffff',
  },
  summary: {
    backgroundColor: '#e9d5ff',
    borderRadius: 8,
    padding: 16,
    marginTop: 16,
  },
  summaryText: {
    textAlign: 'center',
    color: '#581c87',
    fontWeight: '600',
    marginVertical: 4,
  },
  bottomAction: {
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 4,
  },
  proceedButton: {
    backgroundColor: '#2563eb',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  proceedButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
  },
});

export default TestCustomizer;