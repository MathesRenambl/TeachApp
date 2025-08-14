 
import { MaterialIcons as Icon } from '@expo/vector-icons';

import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  Animated,
  PanResponder,
  Dimensions,
  Alert,
  TextInput,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import Svg, { Line, Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

interface Question {
  id: number;
  question: string;
  options?: string[];
  answer: string | { [key: string]: string };
  left?: string[];
  right?: string[];
}

interface Section {
  sectionTitle: string;
  marksPerQuestion: number;
  type: string;
  questions: Question[];
}

interface ExamData {
  examTitle: string;
  subject: string;
  totalMarks: number;
  durationMinutes: number;
  sections: Section[];
}

const examData: ExamData = {
  examTitle: "Sample Question Paper",
  subject: "Computer Science",
  totalMarks: 100,
  durationMinutes: 180,
  sections: [
    {
      sectionTitle: "Choose the Correct Answer",
      marksPerQuestion: 1,
      type: "mcq",
      questions: [
        {
          id: 1,
          question: "Which language is used for web page styling?",
          options: ["HTML", "CSS", "JavaScript", "Python"],
          answer: "CSS"
        },
        {
          id: 2,
          question: "Which protocol is used for secure communication over the internet?",
          options: ["HTTP", "HTTPS", "FTP", "SMTP"],
          answer: "HTTPS"
        }
      ]
    },
    {
      sectionTitle: "Fill in the Blanks",
      marksPerQuestion: 1,
      type: "fill_in_the_blanks",
      questions: [
        {
          id: 3,
          question: "The brain of the computer is the _______.",
          answer: "CPU"
        },
        {
          id: 4,
          question: "In HTML, <img> tag is used to insert _______.",
          answer: "images"
        }
      ]
    },
    {
      sectionTitle: "Match the Following",
      marksPerQuestion: 2,
      type: "match_the_following",
      questions: [
        {
          id: 5,
          left: ["Python", "HTML", "CSS", "SQL"],
          right: ["Web Styling", "Database Querying", "Web Structure", "General Programming"],
          answer: {
            "Python": "General Programming",
            "HTML": "Web Structure",
            "CSS": "Web Styling",
            "SQL": "Database Querying"
          }
        }
      ]
    },
    {
      sectionTitle: "2 Mark Questions",
      marksPerQuestion: 2,
      type: "short_answer",
      questions: [
        {
          id: 6,
          question: "Define operating system.",
          answer: "An operating system is software that manages computer hardware and software resources and provides common services for computer programs."
        },
        {
          id: 7,
          question: "What is a compiler?",
          answer: "A compiler is a program that translates source code into executable machine code."
        }
      ]
    },
    {
      sectionTitle: "5 Mark Questions",
      marksPerQuestion: 5,
      type: "long_answer",
      questions: [
        {
          id: 8,
          question: "Explain the differences between RAM and ROM.",
          answer: "RAM is volatile memory used for temporary data storage while a program is running, whereas ROM is non-volatile memory used to store firmware."
        }
      ]
    },
    {
      sectionTitle: "10 Mark Questions",
      marksPerQuestion: 10,
      type: "essay",
      questions: [
        {
          id: 9,
          question: "Explain the working of the internet with a neat diagram.",
          answer: "The internet works by connecting devices through a network of servers, routers, and communication protocols such as TCP/IP..."
        }
      ]
    }
  ]
};

interface MatchConnection {
  left: string;
  right: string;
  leftIndex: number;
  rightIndex: number;
}

const ExamApp: React.FC = () => {
  const [currentSection, setCurrentSection] = useState(0);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: any }>({});
  const [textAnswers, setTextAnswers] = useState<{ [key: number]: string }>({});
  const [matchConnections, setMatchConnections] = useState<{ [key: string]: MatchConnection[] }>({});
  const [timeLeft, setTimeLeft] = useState(examData.durationMinutes * 60);
  const [dragLine, setDragLine] = useState<{ start: { x: number; y: number }; end: { x: number; y: number } } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartItem, setDragStartItem] = useState<{ item: string; index: number; type: 'left' | 'right' } | null>(null);

  React.useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => prev > 0 ? prev - 1 : 0);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const MatchItem: React.FC<{
    item: string;
    index: number;
    type: 'left' | 'right';
    onStartDrag: (item: string, index: number, type: 'left' | 'right', coordinates: { x: number; y: number }) => void;
    onDrag: (coordinates: { x: number; y: number }) => void;
    onEndDrag: (item: string, index: number, type: 'left' | 'right', coordinates: { x: number; y: number }) => void;
  }> = ({ item, index, type, onStartDrag, onDrag, onEndDrag }) => {
    const pan = useRef(new Animated.ValueXY()).current;
    const [itemPosition, setItemPosition] = useState({ x: 0, y: 0 });

    const panResponder = PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        const coordinates = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
        setItemPosition(coordinates);
        onStartDrag(item, index, type, coordinates);
      },
      onPanResponderMove: (evt, gestureState) => {
        const coordinates = {
          x: itemPosition.x + gestureState.dx,
          y: itemPosition.y + gestureState.dy
        };
        onDrag(coordinates);
        Animated.event([null, { dx: pan.x, dy: pan.y }], { useNativeDriver: false })(evt, gestureState);
      },
      onPanResponderRelease: (evt) => {
        const coordinates = { x: evt.nativeEvent.pageX, y: evt.nativeEvent.pageY };
        onEndDrag(item, index, type, coordinates);
        Animated.spring(pan, {
          toValue: { x: 0, y: 0 },
          useNativeDriver: false,
        }).start();
      },
    });

    return (
      <Animated.View
        style={[
          styles.matchItem,
          type === 'left' ? styles.leftMatchItem : styles.rightMatchItem,
          { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
        ]}
        {...panResponder.panHandlers}
        onLayout={(event) => {
          const layout = event.nativeEvent.layout;
          setItemPosition({ x: layout.x, y: layout.y });
        }}
      >
        <View style={[styles.matchDot, type === 'left' ? styles.rightDot : styles.leftDot]} />
        <Text style={styles.matchItemText}>{item}</Text>
      </Animated.View>
    );
  };

  const MatchTheFollowing: React.FC = () => {
    const question = examData.sections[currentSection].questions[currentQuestion];
    const leftItems = question.left || [];
    const rightItems = question.right || [];
    const questionKey = `${currentSection}-${currentQuestion}`;

    const handleStartDrag = (item: string, index: number, type: 'left' | 'right', coordinates: { x: number; y: number }) => {
      setIsDragging(true);
      setDragStartItem({ item, index, type });
      setDragLine({ start: coordinates, end: coordinates });
    };

    const handleDrag = (coordinates: { x: number; y: number }) => {
      if (dragLine) {
        setDragLine(prev => prev ? { ...prev, end: coordinates } : null);
      }
    };

    const handleEndDrag = (item: string, index: number, type: 'left' | 'right', coordinates: { x: number; y: number }) => {
      if (dragStartItem && dragStartItem.type !== type) {
        const connection: MatchConnection = {
          left: type === 'left' ? item : dragStartItem.item,
          right: type === 'right' ? item : dragStartItem.item,
          leftIndex: type === 'left' ? index : dragStartItem.index,
          rightIndex: type === 'right' ? index : dragStartItem.index,
        };

        setMatchConnections(prev => {
          const existing = prev[questionKey] || [];
          // Remove any existing connections for these items
          const filtered = existing.filter(conn =>
            conn.left !== connection.left && conn.right !== connection.right
          );
          return { ...prev, [questionKey]: [...filtered, connection] };
        });
      }

      setIsDragging(false);
      setDragLine(null);
      setDragStartItem(null);
    };

    const connections = matchConnections[questionKey] || [];

    return (
      <View style={styles.matchContainer}>
        <Text style={styles.questionText}>Draw lines to match the items:</Text>
       
        <View style={styles.matchContent}>
          <View style={styles.leftColumn}>
            <Text style={styles.columnHeader}>Column A</Text>
            {leftItems.map((item, index) => (
              <MatchItem
                key={`left-${index}`}
                item={item}
                index={index}
                type="left"
                onStartDrag={handleStartDrag}
                onDrag={handleDrag}
                onEndDrag={handleEndDrag}
              />
            ))}
          </View>

          <View style={styles.matchMiddle}>
            <Svg height="300" width="100" style={styles.svgContainer}>
              {/* Draw existing connections */}
              {connections.map((conn, index) => (
                <Line
                  key={index}
                  x1="10"
                  y1={40 + conn.leftIndex * 60}
                  x2="90"
                  y2={40 + conn.rightIndex * 60}
                  stroke="#4CAF50"
                  strokeWidth="3"
                  strokeDasharray="5,5"
                />
              ))}
             
              {/* Draw drag line */}
              {isDragging && dragLine && (
                <Line
                  x1={dragLine.start.x}
                  y1={dragLine.start.y}
                  x2={dragLine.end.x}
                  y2={dragLine.end.y}
                  stroke="#ff6b6b"
                  strokeWidth="2"
                  strokeDasharray="3,3"
                />
              )}
            </Svg>
          </View>

          <View style={styles.rightColumn}>
            <Text style={styles.columnHeader}>Column B</Text>
            {rightItems.map((item, index) => (
              <MatchItem
                key={`right-${index}`}
                item={item}
                index={index}
                type="right"
                onStartDrag={handleStartDrag}
                onDrag={handleDrag}
                onEndDrag={handleEndDrag}
              />
            ))}
          </View>
        </View>

        {connections.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setMatchConnections(prev => ({ ...prev, [questionKey]: [] }))}
          >
            <Icon name="clear" size={20} color="#fff" />
            <Text style={styles.clearButtonText}>Clear All</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  const MCQQuestion: React.FC = () => {
    const question = examData.sections[currentSection].questions[currentQuestion];
   
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>Q{question.id}.</Text>
        <Text style={styles.questionText}>{question.question}</Text>
       
        <View style={styles.optionsContainer}>
          {question.options?.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionButton,
                selectedAnswers[question.id] === option && styles.selectedOption
              ]}
              onPress={() => setSelectedAnswers(prev => ({...prev, [question.id]: option}))}
            >
              <View style={[
                styles.optionIndicator,
                selectedAnswers[question.id] === option && styles.selectedIndicator
              ]}>
                <Text style={[
                  styles.optionLabel,
                  selectedAnswers[question.id] === option && styles.selectedLabel
                ]}>
                  {String.fromCharCode(65 + index)}
                </Text>
              </View>
              <Text style={[
                styles.optionText,
                selectedAnswers[question.id] === option && styles.selectedOptionText
              ]}>
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const FillInTheBlanks: React.FC = () => {
    const question = examData.sections[currentSection].questions[currentQuestion];
   
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>Q{question.id}.</Text>
        <Text style={styles.questionText}>{question.question}</Text>
       
        <View style={styles.textInputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Type your answer here..."
            value={textAnswers[question.id] || ''}
            onChangeText={(text) => setTextAnswers(prev => ({...prev, [question.id]: text}))}
            multiline={false}
            placeholderTextColor="#999"
          />
        </View>
      </View>
    );
  };

  const ShortAnswer: React.FC = () => {
    const question = examData.sections[currentSection].questions[currentQuestion];
   
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>Q{question.id}.</Text>
        <Text style={styles.questionText}>{question.question}</Text>
       
        <View style={styles.textInputContainer}>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            placeholder="Write your answer here..."
            value={textAnswers[question.id] || ''}
            onChangeText={(text) => setTextAnswers(prev => ({...prev, [question.id]: text}))}
            multiline={true}
            numberOfLines={4}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
          <Text style={styles.characterCount}>
            {textAnswers[question.id]?.length || 0} characters
          </Text>
        </View>
      </View>
    );
  };

  const LongAnswer: React.FC = () => {
    const question = examData.sections[currentSection].questions[currentQuestion];
   
    return (
      <View style={styles.questionContainer}>
        <Text style={styles.questionNumber}>Q{question.id}.</Text>
        <Text style={styles.questionText}>{question.question}</Text>
       
        <View style={styles.textInputContainer}>
          <TextInput
            style={[styles.textInput, styles.longInput]}
            placeholder="Write your detailed answer here..."
            value={textAnswers[question.id] || ''}
            onChangeText={(text) => setTextAnswers(prev => ({...prev, [question.id]: text}))}
            multiline={true}
            numberOfLines={8}
            textAlignVertical="top"
            placeholderTextColor="#999"
          />
          <Text style={styles.characterCount}>
            {textAnswers[question.id]?.length || 0} characters
          </Text>
        </View>
      </View>
    );
  };

  const renderQuestion = () => {
    const section = examData.sections[currentSection];
   
    switch (section.type) {
      case 'mcq':
        return <MCQQuestion />;
      case 'fill_in_the_blanks':
        return <FillInTheBlanks />;
      case 'match_the_following':
        return <MatchTheFollowing />;
      case 'short_answer':
        return <ShortAnswer />;
      case 'long_answer':
        return <LongAnswer />;
      case 'essay':
        return <LongAnswer />;
      default:
        return <ShortAnswer />;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#1a237e" />
     
      <LinearGradient
        colors={['#667eea', '#764ba2', '#f093fb']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.examInfo}>
            <Text style={styles.examTitle}>{examData.examTitle}</Text>
            <Text style={styles.subjectText}>{examData.subject}</Text>
            <Text style={styles.totalMarks}>Total Marks: {examData.totalMarks}</Text>
          </View>
          <View style={styles.timerContainer}>
            <Icon name="access-time" size={24} color="#fff" />
            <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
          </View>
        </View>
       
        <View style={styles.progressContainer}>
          <Text style={styles.progressText}>
            Section {currentSection + 1} of {examData.sections.length} • Question {currentQuestion + 1} of {examData.sections[currentSection].questions.length}
          </Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                { width: `${((currentSection * examData.sections[currentSection].questions.length + currentQuestion + 1) /
                  examData.sections.reduce((total, section) => total + section.questions.length, 0)) * 100}%` }
              ]}
            />
          </View>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleContainer}>
            <Text style={styles.sectionTitle}>
              {examData.sections[currentSection].sectionTitle}
            </Text>
            <View style={styles.marksContainer}>
              <Icon name="star" size={16} color="#ff6b6b" />
              <Text style={styles.marksText}>
                {examData.sections[currentSection].marksPerQuestion} mark{examData.sections[currentSection].marksPerQuestion > 1 ? 's' : ''}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.questionCard}>
          {renderQuestion()}
        </View>
      </ScrollView>

      <View style={styles.navigationContainer}>
        <TouchableOpacity
          style={[styles.navButton, styles.prevButton, (currentSection === 0 && currentQuestion === 0) && styles.disabledButton]}
          disabled={currentSection === 0 && currentQuestion === 0}
          onPress={() => {
            if (currentQuestion > 0) {
              setCurrentQuestion(currentQuestion - 1);
            } else if (currentSection > 0) {
              setCurrentSection(currentSection - 1);
              setCurrentQuestion(examData.sections[currentSection - 1].questions.length - 1);
            }
          }}
        >
          <Icon name="chevron-left" size={24} color="#fff" />
          <Text style={styles.navButtonText}>Previous</Text>
        </TouchableOpacity>

        <View style={styles.questionIndicator}>
          <Text style={styles.questionIndicatorText}>
            {currentQuestion + 1} / {examData.sections[currentSection].questions.length}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.navButton, styles.nextButton]}
          onPress={() => {
            if (currentQuestion < examData.sections[currentSection].questions.length - 1) {
              setCurrentQuestion(currentQuestion + 1);
            } else if (currentSection < examData.sections.length - 1) {
              setCurrentSection(currentSection + 1);
              setCurrentQuestion(0);
            } else {
              Alert.alert('Exam Complete', 'You have completed all questions!', [
                { text: 'Submit Exam', onPress: () => console.log('Exam submitted') }
              ]);
            }
          }}
        >
          <Text style={styles.navButtonText}>
            {currentSection === examData.sections.length - 1 &&
             currentQuestion === examData.sections[currentSection].questions.length - 1
             ? 'Submit' : 'Next'}
          </Text>
          <Icon name="chevron-right" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fc',
  },
  header: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  examInfo: {
    flex: 1,
  },
  examTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 5,
  },
  subjectText: {
    fontSize: 18,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 2,
  },
  totalMarks: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
  },
  timerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 25,
    backdropFilter: 'blur(10px)',
  },
  timerText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 8,
  },
  progressContainer: {
    marginTop: 10,
  },
  progressText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.9)',
    marginBottom: 10,
    fontWeight: '500',
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 3,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#fff',
    borderRadius: 3,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  sectionHeader: {
    marginBottom: 25,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#2d3436',
    flex: 1,
  },
  marksContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff3e0',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  marksText: {
    fontSize: 14,
    color: '#f57c00',
    fontWeight: '600',
    marginLeft: 5,
  },
  questionCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    marginBottom: 20,
  },
  questionContainer: {
    marginBottom: 15,
  },
  questionNumber: {
    fontSize: 20,
    fontWeight: '800',
    color: '#6c5ce7',
    marginBottom: 15,
  },
  questionText: {
    fontSize: 18,
    lineHeight: 28,
    color: '#2d3436',
    marginBottom: 25,
    fontWeight: '500',
  },
  optionsContainer: {
    marginTop: 10,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 18,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: 'transparent',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  selectedOption: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4CAF50',
    elevation: 4,
  },
  optionIndicator: {
    width: 35,
    height: 35,
    borderRadius: 18,
    backgroundColor: '#e0e0e0',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
  },
  selectedIndicator: {
    backgroundColor: '#4CAF50',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#666',
  },
  selectedLabel: {
    color: '#fff',
  },
  optionText: {
    fontSize: 16,
    color: '#2d3436',
    flex: 1,
    fontWeight: '500',
  },
  selectedOptionText: {
    color: '#2e7d32',
    fontWeight: '600',
  },
  textInputContainer: {
    marginTop: 20,
  },
  textInput: {
    backgroundColor: '#f8f9fa',
    borderRadius: 15,
    padding: 18,
    fontSize: 16,
    color: '#2d3436',
    borderWidth: 2,
    borderColor: '#e9ecef',
    fontWeight: '500',
  },
  multilineInput: {
    minHeight: 100,
  },
  longInput: {
    minHeight: 200,
  },
  characterCount: {
    fontSize: 12,
    color: '#6c757d',
    textAlign: 'right',
    marginTop: 8,
  },
  matchContainer: {
    marginBottom: 20,
  },
  matchContent: {
    flexDirection: 'row',
    marginTop: 25,
    minHeight: 300,
  },
  leftColumn: {
    flex: 1,
  },
  rightColumn: {
    flex: 1,
  },
  matchMiddle: {
    width: 100,
    alignItems: 'center',
    justifyContent: 'center',
  },
  svgContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  columnHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6c5ce7',
    marginBottom: 20,
    textAlign: 'center',
  },
  matchItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#e9ecef',
  },
  leftMatchItem: {
    marginRight: 10,
  },
  rightMatchItem: {
    marginLeft: 10,
  },
  matchDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#6c5ce7',
  },
  rightDot: {
    marginRight: 12,
  },
  leftDot: {
    marginLeft: 12,
  },
  matchItemText: {
    fontSize: 16,
    color: '#2d3436',
    fontWeight: '500',
    flex: 1,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ff6b6b',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    alignSelf: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  clearButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },
  navigationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 20,
    backgroundColor: '#fff',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
  },
  navButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 25,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  prevButton: {
    backgroundColor: '#74b9ff',
  },
  nextButton: {
    backgroundColor: '#00b894',
  },
  disabledButton: {
    backgroundColor: '#ddd',
    elevation: 0,
  },
  navButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    marginHorizontal: 8,
  },
  questionIndicator: {
    backgroundColor: '#f1f2f6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: '#ddd',
  },
  questionIndicatorText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
  },
});

export default ExamApp;