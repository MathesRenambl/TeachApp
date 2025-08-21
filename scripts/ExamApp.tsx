import { MaterialIcons as Icon } from '@expo/vector-icons';
import React, { useState, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, Animated, PanResponder, Dimensions, Alert, TextInput, } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Line, Circle } from 'react-native-svg';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types'; 
import { useNavigation } from '@react-navigation/native';
import MatchTheFollowing from './MatchTheFollowing';

const { width, height } = Dimensions.get('window');
type Navigation = NativeStackNavigationProp<RootStackParamList, 'ExamApp'>;

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
    examTitle: "Computer Science Assessment",
    subject: "Grade 10 - Computer Science",
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
        // {
        //     sectionTitle: "Match the Following",
        //     marksPerQuestion: 2,
        //     type: "match_the_following",
        //     questions: [
        //         {
        //             id: 5,
        //             question: "Match the programming languages with their primary uses:",
        //             left: ["Python", "HTML", "CSS", "SQL"],
        //             right: ["Web Styling", "Database Querying", "Web Structure", "General Programming"],
        //             answer: {
        //                 "Python": "General Programming",
        //                 "HTML": "Web Structure",
        //                 "CSS": "Web Styling",
        //                 "SQL": "Database Querying"
        //             }
        //         }
        //     ]
        // },
        {
            sectionTitle: "Short Answer Questions",
            marksPerQuestion: 2,
            type: "short_answer",
            questions: [
                {
                    id: 6,
                    question: "Define operating system and list two examples.",
                    answer: "An operating system is software that manages computer hardware and software resources."
                }
            ]
        },
        {
            sectionTitle: "Long Answer Questions",
            marksPerQuestion: 5,
            type: "long_answer",
            questions: [
                {
                    id: 7,
                    question: "Explain the differences between RAM and ROM with examples.",
                    answer: "RAM is volatile memory used for temporary data storage while a program is running, whereas ROM is non-volatile memory."
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
    const navigation = useNavigation<Navigation>();

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

    const getProgressPercentage = () => {
        const totalQuestions = examData.sections.reduce((total, section) => total + section.questions.length, 0);
        const currentQuestionIndex = examData.sections.slice(0, currentSection).reduce((total, section) => total + section.questions.length, 0) + currentQuestion + 1;
        return (currentQuestionIndex / totalQuestions) * 100;
    };

    const MatchItem: React.FC<{
        item: string;
        index: number;
        type: 'left' | 'right';
        onStartDrag: (item: string, index: number, type: 'left' | 'right', coordinates: { x: number; y: number }) => void;
        onDrag: (coordinates: { x: number; y: number }) => void;
        onEndDrag: (item: string, index: number, type: 'left' | 'right', coordinates: { x: number; y: number }) => void;
        isConnected: boolean;
    }> = ({ item, index, type, onStartDrag, onDrag, onEndDrag, isConnected }) => {
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
                    isConnected && styles.connectedMatchItem,
                    { transform: [{ translateX: pan.x }, { translateY: pan.y }] }
                ]}
                {...panResponder.panHandlers}
                onLayout={(event) => {
                    const layout = event.nativeEvent.layout;
                    setItemPosition({ x: layout.x, y: layout.y });
                }}
            >
                <View style={styles.matchItemContent}>
                    <View style={[
                        styles.matchDot, 
                        type === 'left' ? styles.rightDot : styles.leftDot,
                        isConnected && styles.connectedDot
                    ]} />
                    <Text style={[styles.matchItemText, isConnected && styles.connectedText]}>
                        {item}
                    </Text>
                </View>
            </Animated.View>
        );
    };

    // const MatchTheFollowing: React.FC = () => {
    //     const question = examData.sections[currentSection].questions[currentQuestion];
    //     const leftItems = question.left || [];
    //     const rightItems = question.right || [];
    //     const questionKey = `${currentSection}-${currentQuestion}`;

    //     const handleStartDrag = (item: string, index: number, type: 'left' | 'right', coordinates: { x: number; y: number }) => {
    //         setIsDragging(true);
    //         setDragStartItem({ item, index, type });
    //         setDragLine({ start: coordinates, end: coordinates });
    //     };

    //     const handleDrag = (coordinates: { x: number; y: number }) => {
    //         if (dragLine) {
    //             setDragLine(prev => prev ? { ...prev, end: coordinates } : null);
    //         }
    //     };

    //     const handleEndDrag = (item: string, index: number, type: 'left' | 'right', coordinates: { x: number; y: number }) => {
    //         if (dragStartItem && dragStartItem.type !== type) {
    //             const connection: MatchConnection = {
    //                 left: type === 'left' ? item : dragStartItem.item,
    //                 right: type === 'right' ? item : dragStartItem.item,
    //                 leftIndex: type === 'left' ? index : dragStartItem.index,
    //                 rightIndex: type === 'right' ? index : dragStartItem.index,
    //             };

    //             setMatchConnections(prev => {
    //                 const existing = prev[questionKey] || [];
    //                 const filtered = existing.filter(conn =>
    //                     conn.left !== connection.left && conn.right !== connection.right
    //                 );
    //                 return { ...prev, [questionKey]: [...filtered, connection] };
    //             });
    //         }

    //         setIsDragging(false);
    //         setDragLine(null);
    //         setDragStartItem(null);
    //     };

    //     const connections = matchConnections[questionKey] || [];

    //     return (
    //         <View style={styles.matchContainer}>
    //             <Text style={styles.matchInstructions}>
    //                 {question.question}
    //             </Text>
    //             <Text style={styles.matchSubInstructions}>
    //                 Drag items from Column A to Column B to create matches
    //             </Text>

    //             <View style={styles.matchContent}>
    //                 <View style={styles.leftColumn}>
    //                     <View style={styles.columnHeader}>
    //                         <Icon name="radio-button-checked" size={16} color="#3B82F6" />
    //                         <Text style={styles.columnHeaderText}>Column A</Text>
    //                     </View>
    //                     {leftItems.map((item, index) => {
    //                         const isConnected = connections.some(conn => conn.left === item);
    //                         return (
    //                             <MatchItem
    //                                 key={`left-${index}`}
    //                                 item={item}
    //                                 index={index}
    //                                 type="left"
    //                                 onStartDrag={handleStartDrag}
    //                                 onDrag={handleDrag}
    //                                 onEndDrag={handleEndDrag}
    //                                 isConnected={isConnected}
    //                             />
    //                         );
    //                     })}
    //                 </View>

    //                 <View style={styles.matchMiddle}>
    //                     <Svg height="300" width="60" style={styles.svgContainer}>
    //                         {connections.map((conn, index) => (
    //                             <Line
    //                                 key={index}
    //                                 x1="10"
    //                                 y1={40 + conn.leftIndex * 70}
    //                                 x2="50"
    //                                 y2={40 + conn.rightIndex * 70}
    //                                 stroke="#10B981"
    //                                 strokeWidth="3"
    //                                 strokeDasharray="5,5"
    //                             />
    //                         ))}
    //                         {isDragging && dragLine && (
    //                             <Line
    //                                 x1={dragLine.start.x}
    //                                 y1={dragLine.start.y}
    //                                 x2={dragLine.end.x}
    //                                 y2={dragLine.end.y}
    //                                 stroke="#EF4444"
    //                                 strokeWidth="2"
    //                                 strokeDasharray="3,3"
    //                             />
    //                         )}
    //                     </Svg>
    //                 </View>

    //                 <View style={styles.rightColumn}>
    //                     <View style={styles.columnHeader}>
    //                         <Icon name="radio-button-checked" size={16} color="#8B5CF6" />
    //                         <Text style={styles.columnHeaderText}>Column B</Text>
    //                     </View>
    //                     {rightItems.map((item, index) => {
    //                         const isConnected = connections.some(conn => conn.right === item);
    //                         return (
    //                             <MatchItem
    //                                 key={`right-${index}`}
    //                                 item={item}
    //                                 index={index}
    //                                 type="right"
    //                                 onStartDrag={handleStartDrag}
    //                                 onDrag={handleDrag}
    //                                 onEndDrag={handleEndDrag}
    //                                 isConnected={isConnected}
    //                             />
    //                         );
    //                     })}
    //                 </View>
    //             </View>

    //             {connections.length > 0 && (
    //                 <TouchableOpacity
    //                     style={styles.clearButton}
    //                     onPress={() => setMatchConnections(prev => ({ ...prev, [questionKey]: [] }))}
    //                 >
    //                     <Icon name="refresh" size={20} color="#fff" />
    //                     <Text style={styles.clearButtonText}>Clear All Matches</Text>
    //                 </TouchableOpacity>
    //             )}

    //             <View style={styles.matchProgress}>
    //                 <Text style={styles.matchProgressText}>
    //                     {connections.length} of {leftItems.length} matches completed
    //                 </Text>
    //             </View>
    //         </View>
    //     );
    // };

    const MCQQuestion: React.FC = () => {
        const question = examData.sections[currentSection].questions[currentQuestion];

        return (
            <View style={styles.questionContainer}>
                <View style={styles.questionHeader}>
                    <View style={styles.questionNumberBadge}>
                        <Text style={styles.questionNumber}>Q{question.id}</Text>
                    </View>
                    <Text style={styles.questionText}>{question.question}</Text>
                </View>

                <View style={styles.optionsContainer}>
                    {question.options?.map((option, index) => {
                        const isSelected = selectedAnswers[question.id] === option;
                        const optionLetter = String.fromCharCode(65 + index);
                        
                        return (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.optionButton,
                                    isSelected && styles.selectedOption
                                ]}
                                onPress={() => setSelectedAnswers(prev => ({ ...prev, [question.id]: option }))}
                            >
                                <View style={styles.optionContent}>
                                    <View style={[
                                        styles.optionIndicator,
                                        isSelected && styles.selectedIndicator
                                    ]}>
                                        <Text style={[
                                            styles.optionLabel,
                                            isSelected && styles.selectedLabel
                                        ]}>
                                            {optionLetter}
                                        </Text>
                                    </View>
                                    <Text style={[
                                        styles.optionText,
                                        isSelected && styles.selectedOptionText
                                    ]}>
                                        {option}
                                    </Text>
                                    {isSelected && (
                                        <Icon name="check-circle" size={24} color="#10B981" style={styles.checkIcon} />
                                    )}
                                </View>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>
        );
    };

    const FillInTheBlanks: React.FC = () => {
        const question = examData.sections[currentSection].questions[currentQuestion];

        return (
            <View style={styles.questionContainer}>
                <View style={styles.questionHeader}>
                    <View style={[styles.questionNumberBadge, styles.fillBadge]}>
                        <Text style={styles.questionNumber}>Q{question.id}</Text>
                    </View>
                    <Text style={styles.questionText}>{question.question}</Text>
                </View>

                <View style={styles.textInputContainer}>
                    <TextInput
                        style={styles.textInput}
                        placeholder="Type your answer here..."
                        value={textAnswers[question.id] || ''}
                        onChangeText={(text) => setTextAnswers(prev => ({ ...prev, [question.id]: text }))}
                        multiline={false}
                        placeholderTextColor="#94A3B8"
                    />
                    <View style={styles.inputFooter}>
                        <Text style={styles.characterCount}>
                            {textAnswers[question.id]?.length || 0} characters
                        </Text>
                        {textAnswers[question.id] && (
                            <Icon name="check-circle" size={16} color="#10B981" />
                        )}
                    </View>
                </View>
            </View>
        );
    };

    const ShortAnswer: React.FC = () => {
        const question = examData.sections[currentSection].questions[currentQuestion];

        return (
            <View style={styles.questionContainer}>
                <View style={styles.questionHeader}>
                    <View style={[styles.questionNumberBadge, styles.shortBadge]}>
                        <Text style={styles.questionNumber}>Q{question.id}</Text>
                    </View>
                    <Text style={styles.questionText}>{question.question}</Text>
                </View>

                <View style={styles.textInputContainer}>
                    <TextInput
                        style={[styles.textInput, styles.multilineInput]}
                        placeholder="Write your detailed answer here..."
                        value={textAnswers[question.id] || ''}
                        onChangeText={(text) => setTextAnswers(prev => ({ ...prev, [question.id]: text }))}
                        multiline={true}
                        numberOfLines={6}
                        textAlignVertical="top"
                        placeholderTextColor="#94A3B8"
                    />
                    <View style={styles.inputFooter}>
                        <Text style={styles.characterCount}>
                            {textAnswers[question.id]?.length || 0} characters
                        </Text>
                        <Text style={styles.recommendedLength}>
                            Recommended: 100-200 words
                        </Text>
                    </View>
                </View>
            </View>
        );
    };

    const LongAnswer: React.FC = () => {
        const question = examData.sections[currentSection].questions[currentQuestion];

        return (
            <View style={styles.questionContainer}>
                <View style={styles.questionHeader}>
                    <View style={[styles.questionNumberBadge, styles.longBadge]}>
                        <Text style={styles.questionNumber}>Q{question.id}</Text>
                    </View>
                    <Text style={styles.questionText}>{question.question}</Text>
                </View>

                <View style={styles.textInputContainer}>
                    <TextInput
                        style={[styles.textInput, styles.longInput]}
                        placeholder="Write your comprehensive answer here..."
                        value={textAnswers[question.id] || ''}
                        onChangeText={(text) => setTextAnswers(prev => ({ ...prev, [question.id]: text }))}
                        multiline={true}
                        numberOfLines={10}
                        textAlignVertical="top"
                        placeholderTextColor="#94A3B8"
                    />
                    <View style={styles.inputFooter}>
                        <Text style={styles.characterCount}>
                            {textAnswers[question.id]?.length || 0} characters
                        </Text>
                        <Text style={styles.recommendedLength}>
                            Recommended: 300-500 words
                        </Text>
                    </View>
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
                return navigation.navigate("MatchTheFollowing")
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
            <StatusBar barStyle="light-content" backgroundColor="#1E40AF" />

            {/* Header */}
            <LinearGradient
                colors={['#1E40AF', '#3B82F6', '#60A5FA']}
                style={styles.header}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
            >
                <View style={styles.headerContent}>
                    <View style={styles.examInfo}>
                        <View style={styles.examTitleRow}>
                            <Icon name="school" size={24} color="#fff" />
                            <Text style={styles.examTitle}>{examData.examTitle}</Text>
                        </View>
                        <Text style={styles.subjectText}>{examData.subject}</Text>
                        <View style={styles.examMetrics}>
                            <View style={styles.metricItem}>
                                <Icon name="star" size={16} color="#FCD34D" />
                                <Text style={styles.metricText}>{examData.totalMarks} marks</Text>
                            </View>
                            <View style={styles.metricItem}>
                                <Icon name="schedule" size={16} color="#FCD34D" />
                                <Text style={styles.metricText}>{examData.durationMinutes} min</Text>
                            </View>
                        </View>
                    </View>
                    
                    <LinearGradient
                        colors={['#EF4444', '#F97316']}
                        style={styles.timerContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <Icon name="access-time" size={20} color="#fff" />
                        <Text style={styles.timerText}>{formatTime(timeLeft)}</Text>
                    </LinearGradient>
                </View>

                <View style={styles.progressContainer}>
                    <Text style={styles.progressText}>
                        Section {currentSection + 1} of {examData.sections.length} • Question {currentQuestion + 1} of {examData.sections[currentSection].questions.length}
                    </Text>
                    <View style={styles.progressBar}>
                        <Animated.View
                            style={[
                                styles.progressFill,
                                { width: `${getProgressPercentage()}%` }
                            ]}
                        />
                    </View>
                    <Text style={styles.progressPercentage}>
                        {Math.round(getProgressPercentage())}% Complete
                    </Text>
                </View>
            </LinearGradient>

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Section Header */}
                <View style={styles.sectionHeader}>
                    <LinearGradient
                        colors={['#F8FAFC', '#EEF2FF']}
                        style={styles.sectionTitleContainer}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                    >
                        <View style={styles.sectionTitleContent}>
                            <Text style={styles.sectionTitle}>
                                {examData.sections[currentSection].sectionTitle}
                            </Text>
                            <View style={styles.marksContainer}>
                                <Icon name="star" size={16} color="#F59E0B" />
                                <Text style={styles.marksText}>
                                    {examData.sections[currentSection].marksPerQuestion} mark{examData.sections[currentSection].marksPerQuestion > 1 ? 's' : ''}
                                </Text>
                            </View>
                        </View>
                    </LinearGradient>
                </View>

                {/* Question Card */}
                <View style={styles.questionCard}>
                    {renderQuestion()}
                </View>
            </ScrollView>

            {/* Navigation */}
            <View style={styles.navigationContainer}>
                <TouchableOpacity
                    style={[
                        styles.navButton, 
                        styles.prevButton, 
                        (currentSection === 0 && currentQuestion === 0) && styles.disabledButton
                    ]}
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
                            // Alert.alert(
                            //     'Submit Exam', 
                            //     'Are you sure you want to submit your exam? You cannot make changes after submission.',
                            //     [
                            //         { text: 'Cancel', style: 'cancel' },
                            //         { text: 'Submit', onPress: () => console.log('Exam submitted') }
                            //     ]
                            // );
                            navigation.navigate("MatchTheFollowing")
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
        backgroundColor: '#F8FAFC',
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
        marginRight: 15,
    },
    examTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    examTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#fff',
        marginLeft: 8,
        flex: 1,
    },
    subjectText: {
        fontSize: 16,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 12,
        fontWeight: '500',
    },
    examMetrics: {
        flexDirection: 'row',
        gap: 16,
    },
    metricItem: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    metricText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        fontWeight: '500',
    },
    timerContainer: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderRadius: 20,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        minWidth: 120,
        alignItems: 'center',
    },
    timerText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#fff',
        marginTop: 2,
    },
    progressContainer: {
        marginTop: 10,
    },
    progressText: {
        fontSize: 14,
        color: 'rgba(255,255,255,0.9)',
        marginBottom: 8,
        fontWeight: '500',
    },
    progressBar: {
        height: 6,
        backgroundColor: 'rgba(255,255,255,0.3)',
        borderRadius: 3,
        marginBottom: 4,
    },
    progressFill: {
        height: '100%',
        backgroundColor: '#10B981',
        borderRadius: 3,
    },
    progressPercentage: {
        fontSize: 12,
        color: 'rgba(255,255,255,0.8)',
        textAlign: 'right',
        fontWeight: '600',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    sectionHeader: {
        marginBottom: 20,
    },
    sectionTitleContainer: {
        borderRadius: 16,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
    },
    sectionTitleContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '700',
        color: '#1E293B',
        flex: 1,
    },
    marksContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FEF3C7',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    marksText: {
        fontSize: 14,
        color: '#D97706',
        fontWeight: '600',
        marginLeft: 4,
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
    questionHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 20,
        gap: 12,
    },
    questionNumberBadge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#3B82F6',
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    fillBadge: {
        backgroundColor: '#10B981',
    },
    shortBadge: {
        backgroundColor: '#8B5CF6',
    },
    longBadge: {
        backgroundColor: '#F59E0B',
    },
    questionNumber: {
        fontSize: 14,
        fontWeight: '800',
        color: '#fff',
    },
    questionText: {
        fontSize: 18,
        lineHeight: 26,
        color: '#1E293B',
        fontWeight: '500',
        flex: 1,
    },
    optionsContainer: {
        gap: 12,
    },
    optionButton: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 18,
        borderWidth: 2,
        borderColor: '#E2E8F0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
    },
    selectedOption: {
        backgroundColor: '#EFF6FF',
        borderColor: '#3B82F6',
        elevation: 4,
    },
    optionContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 15,
    },
    optionIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#CBD5E1',
        justifyContent: 'center',
        alignItems: 'center',
    },
    selectedIndicator: {
        backgroundColor: '#3B82F6',
    },
    optionLabel: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
    },
    selectedLabel: {
        color: '#fff',
    },
    optionText: {
        fontSize: 16,
        color: '#334155',
        flex: 1,
        fontWeight: '500',
    },
    selectedOptionText: {
        color: '#1E40AF',
        fontWeight: '600',
    },
    checkIcon: {
        marginLeft: 'auto',
    },
    textInputContainer: {
        marginTop: 20,
    },
    textInput: {
        backgroundColor: '#F8FAFC',
        borderRadius: 16,
        padding: 18,
        fontSize: 16,
        color: '#1E293B',
        borderWidth: 2,
        borderColor: '#E2E8F0',
        fontWeight: '500',
    },
    multilineInput: {
        minHeight: 120,
        textAlignVertical: 'top',
    },
    longInput: {
        minHeight: 200,
        textAlignVertical: 'top',
    },
    inputFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 8,
    },
    characterCount: {
        fontSize: 12,
        color: '#64748B',
        fontWeight: '500',
    },
    recommendedLength: {
        fontSize: 12,
        color: '#8B5CF6',
        fontWeight: '500',
    },
    matchContainer: {
        marginBottom: 20,
    },
    matchInstructions: {
        fontSize: 18,
        fontWeight: '600',
        color: '#1E293B',
        marginBottom: 8,
        lineHeight: 24,
    },
    matchSubInstructions: {
        fontSize: 14,
        color: '#64748B',
        marginBottom: 20,
        backgroundColor: '#EEF2FF',
        padding: 12,
        borderRadius: 12,
    },
    matchContent: {
        flexDirection: 'row',
        marginTop: 20,
        minHeight: 300,
    },
    leftColumn: {
        flex: 1,
        paddingRight: 10,
    },
    rightColumn: {
        flex: 1,
        paddingLeft: 10,
    },
    matchMiddle: {
        width: 60,
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
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
        paddingVertical: 8,
        paddingHorizontal: 12,
        backgroundColor: '#F1F5F9',
        borderRadius: 12,
        gap: 6,
    },
    columnHeaderText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#475569',
    },
    matchItem: {
        backgroundColor: '#fff',
        borderRadius: 16,
        marginBottom: 12,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    connectedMatchItem: {
        borderColor: '#10B981',
        backgroundColor: '#F0FDF4',
    },
    leftMatchItem: {
        marginRight: 5,
    },
    rightMatchItem: {
        marginLeft: 5,
    },
    matchItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 12,
    },
    matchDot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: '#CBD5E1',
    },
    connectedDot: {
        backgroundColor: '#10B981',
    },
    rightDot: {
        order: 1,
    },
    leftDot: {
        order: 2,
    },
    matchItemText: {
        fontSize: 15,
        color: '#334155',
        fontWeight: '500',
        flex: 1,
    },
    connectedText: {
        color: '#059669',
        fontWeight: '600',
    },
    clearButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#EF4444',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        alignSelf: 'center',
        marginTop: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 3,
        gap: 8,
    },
    clearButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
    matchProgress: {
        backgroundColor: '#EEF2FF',
        padding: 12,
        borderRadius: 12,
        marginTop: 16,
        alignItems: 'center',
    },
    matchProgressText: {
        fontSize: 14,
        color: '#3B82F6',
        fontWeight: '600',
    },
    navigationContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: '#fff',
        elevation: 12,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        borderTopWidth: 1,
        borderTopColor: '#E2E8F0',
    },
    navButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 24,
        paddingVertical: 14,
        borderRadius: 25,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        gap: 8,
    },
    prevButton: {
        backgroundColor: '#64748B',
    },
    nextButton: {
        backgroundColor: '#10B981',
    },
    disabledButton: {
        backgroundColor: '#CBD5E1',
        elevation: 0,
    },
    navButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
    },
    questionIndicator: {
        backgroundColor: '#F1F5F9',
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 2,
        borderColor: '#E2E8F0',
    },
    questionIndicatorText: {
        fontSize: 16,
        fontWeight: '700',
        color: '#475569',
    },
});

export default ExamApp;