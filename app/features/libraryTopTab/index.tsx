import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    StyleSheet,
    Dimensions,
    Modal,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as DocumentPicker from "expo-document-picker";
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

// Button Component with gradient styling
interface ButtonProps {
    children: React.ReactNode;
    onPress?: () => void;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    style?: any;
}

const Button: React.FC<ButtonProps> = ({
    children,
    onPress,
    variant = 'primary',
    size = 'md',
    disabled = false,
    style,
}) => {
    const buttonStyle = [
        styles.buttonBase,
        styles[`button${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
        styles[`button${size.charAt(0).toUpperCase() + size.slice(1)}`],
        disabled && styles.buttonDisabled,
        style,
    ];

    const textStyle = [
        styles.buttonTextBase,
        styles[`buttonText${variant.charAt(0).toUpperCase() + variant.slice(1)}`],
        styles[`buttonText${size.charAt(0).toUpperCase() + size.slice(1)}`],
    ];

    if (variant === 'primary') {
        return (
            <TouchableOpacity
                onPress={disabled ? undefined : onPress}
                disabled={disabled}
                activeOpacity={0.7}
                style={[styles.buttonBase, styles.buttonSm, style]}
            >
                <LinearGradient
                    colors={['#667eea', '#764ba2']}
                    style={styles.gradientButton}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    <Text style={[styles.buttonTextBase, styles.buttonTextPrimary, styles.buttonTextSm]}>
                        {children}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
        );
    }

    return (
        <TouchableOpacity
            style={buttonStyle}
            onPress={disabled ? undefined : onPress}
            disabled={disabled}
            activeOpacity={0.7}
        >
            <Text style={textStyle}>{children}</Text>
        </TouchableOpacity>
    );
};

// Card Component with gradient styling
interface CardProps {
    children: React.ReactNode;
    style?: any;
    padding?: 'sm' | 'md' | 'lg';
    gradient?: string[];
}

const Card: React.FC<CardProps> = ({ children, style, padding = 'md', gradient }) => {
    if (gradient) {
        return (
            <View style={[styles.cardBase, style]}>
                <LinearGradient
                    colors={gradient}
                    style={[
                        styles.gradientCard,
                        styles[`cardPadding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
                    ]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                >
                    {children}
                </LinearGradient>
            </View>
        );
    }

    const cardStyle = [
        styles.cardBase,
        styles[`cardPadding${padding.charAt(0).toUpperCase() + padding.slice(1)}`],
        style,
    ];

    return <View style={cardStyle}>{children}</View>;
};

// Main Library Component
interface LibraryTabProps {
    isDark?: boolean;
}

const LibraryTab: React.FC<LibraryTabProps> = ({ isDark = false }) => {
    const [activeSection, setActiveSection] = useState<'public' | 'private'>('public');
    const [searchQuery, setSearchQuery] = useState('');
    const [myDocs, setMyDocs] = useState<{ id: string; title: string; url: string }[]>([]);
    const [isAddPdfModalVisible, setAddPdfModalVisible] = useState(false);
    const [newPdfTitle, setNewPdfTitle] = useState('');
    const [uploadedFile, setUploadedFile] = useState<DocumentPicker.DocumentPickerAsset | null>(null);
    const [selectedPdf, setSelectedPdf] = useState<{ title: string; url: string } | null>(null);

    // Public Library State
    const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);
    const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

    // Private Library State
    const [privateCurriculum, setPrivateCurriculum] = useState<string | null>(null);
    const [privateMedium, setPrivateMedium] = useState<string | null>(null);
    const [privateClass, setPrivateClass] = useState<string | null>(null);
    const [privateSubject, setPrivateSubject] = useState<string | null>(null);
    const [privateSearchQuery, setPrivateSearchQuery] = useState('');

    // Load My Docs and Selected PDF from AsyncStorage
    useEffect(() => {
        const loadData = async () => {
            try {
                // Load My Docs
                const storedDocs = await AsyncStorage.getItem('myDocs');
                if (storedDocs) {
                    setMyDocs(JSON.parse(storedDocs));
                }

                // Load Selected PDF
                const storedPdf = await AsyncStorage.getItem('selectedPdf');
                if (storedPdf) {
                    setSelectedPdf(JSON.parse(storedPdf));
                }
            } catch (error) {
                console.error('Error loading data from AsyncStorage:', error);
            }
        };
        loadData();
    }, []);

    // Save My Docs to AsyncStorage
    const saveMyDocs = async (docs: { id: string; title: string; url: string }[]) => {
        try {
            await AsyncStorage.setItem('myDocs', JSON.stringify(docs));
            setMyDocs(docs);
        } catch (error) {
            console.error('Error saving docs to AsyncStorage:', error);
        }
    };

    const handleUpload = async () => {
        try {
            const result = await DocumentPicker.getDocumentAsync({
                type: 'application/pdf',
            });

            if (!result.canceled && result.assets && result.assets.length > 0) {
                const file = result.assets[0];
                setUploadedFile(file);
                if (!newPdfTitle) {
                    setNewPdfTitle(file.name);
                }
            }
        } catch (err) {
            console.error('Document Picker Error: ', err);
            Alert.alert('Error', 'Failed to pick document.');
        }
    };

    // Handle adding a new PDF
    const handleAddPdf = () => {
        if (!newPdfTitle || !uploadedFile) {
            Alert.alert('Error', 'Please provide title and upload a PDF');
            return;
        }

        const newDoc = {
            id: `${Date.now()}`,
            title: newPdfTitle,
            url: uploadedFile.uri,
        };

        const updatedDocs = [...myDocs, newDoc];
        saveMyDocs(updatedDocs);
        setSelectedPdf({ title: newDoc.title, url: newDoc.url });
        storeSelected(newDoc);
        setNewPdfTitle('');
        setUploadedFile(null);
        setAddPdfModalVisible(false);
    };

    const storeSelected = async (doc: { id: string; title: string; url: string }) => {
        try {
            await AsyncStorage.setItem('selectedPdf', JSON.stringify({title: doc.title, url: doc.url}));
            setSelectedPdf({ title: doc.title, url: doc.url });
            Alert.alert('Selected', 'PDF selected for assessment');
        } catch (error) {
            console.error('Error storing selected PDF:', error);
        }
    };

    // Handle PDF view action
    const handleViewPdf = (url: string) => {
        // Implement PDF viewing logic here
        // For now, we'll show an alert to indicate the view action
        Alert.alert('View PDF', `Opening PDF: ${url}`);
        // In a real implementation, you might use a library like react-native-pdf
        // to display the PDF or open it in a native viewer
    };

    const curriculums = [
        {
            id: 'stateboard',
            label: 'State Board',
            bookCount: 25,
            gradient: ['#667eea', '#764ba2'],
            media: [
                {
                    id: 'tamil',
                    label: 'Tamil Medium',
                    bookCount: 15,
                    gradient: ['#f093fb', '#f5576c']
                },
                {
                    id: 'english',
                    label: 'English Medium',
                    bookCount: 10,
                    gradient: ['#4facfe', '#00f2fe']
                }
            ]
        },
        {
            id: 'cbse',
            label: 'CBSE',
            bookCount: 20,
            gradient: ['#43e97b', '#38f9d7'],
            media: [
                {
                    id: 'english',
                    label: 'English medium',
                    bookCount: 20,
                    gradient: ['#4facfe', '#00f2fe']
                }
            ]
        }
    ];

    const classes = [
        { id: 'class1', label: 'Class 1', bookCount: 8, gradient: ['#667eea', '#764ba2'] },
        { id: 'class2', label: 'Class 2', bookCount: 12, gradient: ['#f093fb', '#f5576c'] },
        { id: 'class3', label: 'Class 3', bookCount: 15, gradient: ['#4facfe', '#00f2fe'] },
        { id: 'class4', label: 'Class 4', bookCount: 18, gradient: ['#43e97b', '#38f9d7'] },
        { id: 'class5', label: 'Class 5', bookCount: 20, gradient: ['#ff6b6b', '#feca57'] },
    ];

    const tamil_classes = [
        {
            id: 'class1_tamil',
            label: 'class 1',
            bookCount: 8,
            gradient: ['#667eea', '#764ba2']
        },
        {
            id: 'class2_tamil',
            label: 'class 2',
            bookCount: 12,
            gradient: ['#f093fb', '#f5576c']
        },
        {
            id: 'class3_tamil',
            label: 'class 3',
            bookCount: 15,
            gradient: ['#4facfe', '#00f2fe']
        }
    ];

    const subjects = {
        class1: [
            { id: 'english', label: 'English', chapterCount: 5, gradient: ['#667eea', '#764ba2'] },
            { id: 'maths', label: 'Mathematics', chapterCount: 6, gradient: ['#f093fb', '#f5576c'] },
            { id: 'science', label: 'Science', chapterCount: 4, gradient: ['#4facfe', '#00f2fe'] },
        ],
        class2: [
            { id: 'english', label: 'English', chapterCount: 6, gradient: ['#667eea', '#764ba2'] },
            { id: 'maths', label: 'Mathematics', chapterCount: 8, gradient: ['#f093fb', '#f5576c'] },
            { id: 'science', label: 'Science', chapterCount: 5, gradient: ['#4facfe', '#00f2fe'] },
            { id: 'social', label: 'Social Studies', chapterCount: 4, gradient: ['#43e97b', '#38f9d7'] },
        ],
        class3: [
            { id: 'english', label: 'English', chapterCount: 8, gradient: ['#667eea', '#764ba2'] },
            { id: 'maths', label: 'Mathematics', chapterCount: 10, gradient: ['#f093fb', '#f5576c'] },
            { id: 'science', label: 'Science', chapterCount: 7, gradient: ['#4facfe', '#00f2fe'] },
            { id: 'social', label: 'Social Studies', chapterCount: 6, gradient: ['#43e97b', '#38f9d7'] },
        ],
        class4: [
            { id: 'english', label: 'English', chapterCount: 10, gradient: ['#667eea', '#764ba2'] },
            { id: 'maths', label: 'Mathematics', chapterCount: 12, gradient: ['#f093fb', '#f5576c'] },
            { id: 'science', label: 'Science', chapterCount: 9, gradient: ['#4facfe', '#00f2fe'] },
            { id: 'social', label: 'Social Studies', chapterCount: 8, gradient: ['#43e97b', '#38f9d7'] },
        ],
        class5: [
            { id: 'english', label: 'English', chapterCount: 12, gradient: ['#667eea', '#764ba2'] },
            { id: 'maths', label: 'Mathematics', chapterCount: 15, gradient: ['#f093fb', '#f5576c'] },
            { id: 'science', label: 'Science', chapterCount: 11, gradient: ['#4facfe', '#00f2fe'] },
            { id: 'social', label: 'Social Studies', chapterCount: 10, gradient: ['#43e97b', '#38f9d7'] },
        ],
    };

    const tamil_subjects = {
        class1_tamil: [
            { id: 'tamil_s1', label: 'Tamil', chapterCount: 5, gradient: ['#667eea', '#764ba2'] },
            { id: 'maths_s1', label: 'Maths', chapterCount: 6, gradient: ['#f093fb', '#f5576c'] },
            { id: 'science_s1', label: 'Science', chapterCount: 4, gradient: ['#4facfe', '#00f2fe'] }
        ],
        class2_tamil: [
            { id: 'tamil_s2', label: 'Tamil', chapterCount: 6, gradient: ['#667eea', '#764ba2'] },
            { id: 'maths_s2', label: 'Maths', chapterCount: 8, gradient: ['#f093fb', '#f5576c'] },
            { id: 'science_s2', label: 'Science', chapterCount: 5, gradient: ['#4facfe', '#00f2fe'] }
        ]
    };

    const chapters = {
        english: [
            { id: 'ch1', title: 'Reading Basics', pdfCount: 3 },
            { id: 'ch2', title: 'Grammar Fundamentals', pdfCount: 2 },
            { id: 'ch3', title: 'Story Writing', pdfCount: 4 },
            { id: 'ch4', title: 'Poetry', pdfCount: 2 },
        ],
        maths: [
            { id: 'ch1', title: 'Numbers and Operations', pdfCount: 4 },
            { id: 'ch2', title: 'Geometry', pdfCount: 3 },
            { id: 'ch3', title: 'Measurement', pdfCount: 2 },
            { id: 'ch4', title: 'Data and Graphs', pdfCount: 3 },
        ],
        science: [
            { id: 'ch1', title: 'Living Things', pdfCount: 3 },
            { id: 'ch2', title: 'Earth and Space', pdfCount: 2 },
            { id: 'ch3', title: 'Matter and Energy', pdfCount: 4 },
        ],
        social: [
            { id: 'ch1', title: 'Our Community', pdfCount: 2 },
            { id: 'ch2', title: 'History Basics', pdfCount: 3 },
            { id: 'ch3', title: 'Geography', pdfCount: 2 },
        ],
    };

    const tamil_chapters = {
        tamil_s1: [
            { id: 'ch1_tamil_s1', title: 'Basics', pdfCount: 3 },
            { id: 'ch2_tamil_s1', title: 'Grammer', pdfCount: 2 }
        ],
        tamil_s2: [
            { id: 'ch1_tamil_s2', title: 'Basics', pdfCount: 3 },
            { id: 'ch2_tamil_s2', title: 'Grammer', pdfCount: 2 }
        ],
        maths_s2: [
            { id: "ch1_maths_s2", title: "Numbers", pdfCount: 3 },
            { id: "ch2_maths_s2", title: "Addition and Subtraction", pdfCount: 4 }
        ]
    };

    const uploadedPdfs = [
        {
            id: 1,
            title: 'Reading Fundamentals - Lesson 1',
            fileName: 'reading_lesson1.pdf',
            uploadDate: '2024-01-15',
            size: '2.4 MB',
            pages: 24,
            class: 'Class 1',
            subject: 'English',
            chapter: 'Reading Basics',
        },
        {
            id: 2,
            title: 'Addition and Subtraction',
            fileName: 'math_add_sub.pdf',
            uploadDate: '2024-01-14',
            size: '1.8 MB',
            pages: 18,
            class: 'Class 1',
            subject: 'Mathematics',
            chapter: 'Numbers and Operations',
        },
        {
            id: 3,
            title: 'Plants Around Us',
            fileName: 'plants_basics.pdf',
            uploadDate: '2024-01-12',
            size: '3.2 MB',
            pages: 32,
            class: 'Class 1',
            subject: 'Science',
            chapter: 'Living Things',
        },
    ];

    const tamil_pdfs = [
        {
            id: 1,
            title: 'Tamil Grammer - Lesson 1',
            fileName: 'tamil_grammar_lesson1.pdf',
            uploadDate: '2024-08-25',
            size: '2.4 MB',
            pages: 24,
            class: 'class 1',
            subject: 'Tamil',
            chapter: 'Grammer'
        },
        {
            id: 2,
            title: "Poem - PDF 1",
            fileName: "tamil_class2_chapter1_pdf1.pdf",
            uploadDate: "2024-08-26",
            size: "1.5 MB",
            pages: 15,
            class: "class 2",
            subject: "Tamil",
            chapter: "Poem"
        },
        {
            id: 3,
            title: "Nature - PDF 1",
            fileName: "tamil_class2_chapter2_pdf1.pdf",
            uploadDate: "2024-08-26",
            size: "1.8 MB",
            pages: 18,
            class: "class 2",
            subject: "tamil",
            chapter: "Nature"
        },
        {
            id: 4,
            title: "Numbers - PDF 1",
            fileName: "maths_class2_chapter1_pdf1.pdf",
            uploadDate: "2024-08-26",
            size: "2.1 MB",
            pages: 21,
            class: "class 2",
            subject: "maths",
            chapter: "Numbers"
        }
    ];

    const publicBooks = [
        {
            id: 1,
            title: 'Complete English Grammar Guide',
            author: 'Dr. Sarah Williams',
            grade: 'Grades 1-5',
            rating: 4.8,
            downloads: 1250,
            thumbnail: 'https://picsum.photos/80/100?random=1',
        },
        {
            id: 2,
            title: 'Fun with Mathematics',
            author: 'Prof. Michael Chen',
            grade: 'Grades 2-4',
            rating: 4.6,
            downloads: 980,
            thumbnail: 'https://picsum.photos/80/100?random=2',
        },
        {
            id: 3,
            title: 'Science Experiments for Kids',
            author: 'Dr. Emily Johnson',
            grade: 'Grades 3-5',
            rating: 4.9,
            downloads: 1540,
            thumbnail: 'https://picsum.photos/80/100?random=3',
        },
    ];

    const handleBack = () => {
        if (selectedChapter) {
            setSelectedChapter(null);
        } else if (selectedSubject) {
            setSelectedSubject(null);
        } else if (selectedClass) {
            setSelectedClass(null);
        } else if (selectedMedium) {
            setSelectedMedium(null);
        } else if (selectedCurriculum) {
            setSelectedCurriculum(null);
        }
    };

    const handlePrivateBack = () => {
        if (privateSubject) {
            setPrivateSubject(null);
        } else if (privateClass) {
            setPrivateClass(null);
        } else if (privateMedium) {
            setPrivateMedium(null);
        } else if (privateCurriculum) {
            setPrivateCurriculum(null);
        }
    };

    const renderBreadcrumb = () => {
        const breadcrumbs = [];
        if (selectedCurriculum) {
            breadcrumbs.push({
                label: curriculums.find(c => c.id === selectedCurriculum)?.label || '',
                onPress: () => {
                    setSelectedCurriculum(null);
                    setSelectedMedium(null);
                    setSelectedClass(null);
                    setSelectedSubject(null);
                    setSelectedChapter(null);
                },
            });
        }
        if (selectedMedium) {
            const curriculum = curriculums.find(c => c.id === selectedCurriculum);
            const medium = curriculum?.media.find(m => m.id === selectedMedium);
            if (medium) {
                breadcrumbs.push({
                    label: medium.label,
                    onPress: () => {
                        setSelectedMedium(null);
                        setSelectedClass(null);
                        setSelectedSubject(null);
                        setSelectedChapter(null);
                    },
                });
            }
        }
        if (selectedClass) {
            const classList = selectedMedium === 'tamil' ? tamil_classes : classes;
            breadcrumbs.push({
                label: classList.find(c => c.id === selectedClass)?.label || '',
                onPress: () => {
                    setSelectedClass(null);
                    setSelectedSubject(null);
                    setSelectedChapter(null);
                },
            });
        }
        if (selectedSubject) {
            const subjectList = selectedMedium === 'tamil' ? tamil_subjects[selectedClass as keyof typeof tamil_subjects] : subjects[selectedClass as keyof typeof subjects];
            breadcrumbs.push({
                label: subjectList?.find(s => s.id === selectedSubject)?.label || '',
                onPress: () => {
                    setSelectedSubject(null);
                    setSelectedChapter(null);
                },
            });
        }
        if (selectedChapter) {
            const chapterList = selectedMedium === 'tamil' ? tamil_chapters[selectedSubject as keyof typeof tamil_chapters] : chapters[selectedSubject as keyof typeof chapters];
            breadcrumbs.push({
                label: chapterList?.find(c => c.id === selectedChapter)?.title || '',
                onPress: () => {
                    setSelectedChapter(null);
                },
            });
        }
        return breadcrumbs;
    };

    const renderPrivateBreadcrumb = () => {
        const breadcrumbs = [];
        if (privateCurriculum) {
            breadcrumbs.push({
                label: curriculums.find(c => c.id === privateCurriculum)?.label || '',
                onPress: () => {
                    setPrivateCurriculum(null);
                    setPrivateMedium(null);
                    setPrivateClass(null);
                    setPrivateSubject(null);
                },
            });
        }
        if (privateMedium) {
            const curriculum = curriculums.find(c => c.id === privateCurriculum);
            const medium = curriculum?.media.find(m => m.id === privateMedium);
            if (medium) {
                breadcrumbs.push({
                    label: medium.label,
                    onPress: () => {
                        setPrivateMedium(null);
                        setPrivateClass(null);
                        setPrivateSubject(null);
                    },
                });
            }
        }
        if (privateClass) {
            const classList = privateMedium === 'tamil' ? tamil_classes : classes;
            breadcrumbs.push({
                label: classList.find(c => c.id === privateClass)?.label || '',
                onPress: () => {
                    setPrivateClass(null);
                    setPrivateSubject(null);
                },
            });
        }
        if (privateSubject) {
            const subjectList = privateMedium === 'tamil' ? tamil_subjects[privateClass as keyof typeof tamil_subjects] : subjects[privateClass as keyof typeof subjects];
            breadcrumbs.push({
                label: subjectList?.find(s => s.id === privateSubject)?.label || '',
                onPress: () => {
                    setPrivateSubject(null);
                },
            });
        }
        return breadcrumbs;
    };

    const currentClasses = selectedMedium === 'tamil' ? tamil_classes : classes;
    const currentSubjects = selectedMedium === 'tamil' ? tamil_subjects[selectedClass as keyof typeof tamil_subjects] : subjects[selectedClass as keyof typeof subjects];
    const currentChapters = selectedMedium === 'tamil' ? tamil_chapters[selectedSubject as keyof typeof tamil_chapters] : chapters[selectedSubject as keyof typeof chapters];
    const currentPdfs = selectedMedium === 'tamil' ? tamil_pdfs : uploadedPdfs;

    const privateCurrentClasses = privateMedium === 'tamil' ? tamil_classes : classes;
    const privateCurrentSubjects = privateMedium === 'tamil' ? tamil_subjects[privateClass as keyof typeof tamil_subjects] : subjects[privateClass as keyof typeof subjects];
    const privateCurrentChapters = privateMedium === 'tamil' ? tamil_chapters[privateSubject as keyof typeof tamil_chapters] : chapters[privateSubject as keyof typeof chapters];

    // Filter chapters based on search query
    const filteredPrivateChapters = privateCurrentChapters?.filter(chapter =>
        chapter.title.toLowerCase().includes(privateSearchQuery.toLowerCase())
    ) || [];

    return (
        <View style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false}>
                {/* Section Toggle */}
                <View style={styles.sectionToggle}>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            activeSection === 'public' && styles.toggleButtonActive,
                        ]}
                        onPress={() => setActiveSection('public')}
                    >
                        <Ionicons
                            name="globe"
                            size={16}
                            color={activeSection === 'public' ? '#667eea' : '#9ca3af'}
                        />
                        <Text
                            style={[
                                styles.toggleButtonText,
                                activeSection === 'public' && styles.toggleButtonTextActive,
                            ]}
                        >
                            Public Library
                        </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[
                            styles.toggleButton,
                            activeSection === 'private' && styles.toggleButtonActive,
                        ]}
                        onPress={() => setActiveSection('private')}
                    >
                        <Ionicons
                            name="lock-closed"
                            size={16}
                            color={activeSection === 'private' ? '#667eea' : '#9ca3af'}
                        />
                        <Text
                            style={[
                                styles.toggleButtonText,
                                activeSection === 'private' && styles.toggleButtonTextActive,
                            ]}
                        >
                            Private Library
                        </Text>
                    </TouchableOpacity>
                </View>

                {activeSection === 'public' ? (
                    <>
                        {/* Navigation Header */}
                        {(selectedCurriculum || selectedMedium || selectedClass || selectedSubject || selectedChapter) && (
                            <View style={styles.navigationHeader}>
                                <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                    <Ionicons name="arrow-back" size={24} color="#667eea" />
                                </TouchableOpacity>
                                <View style={styles.breadcrumbContainer}>
                                    <View style={styles.breadcrumbTextContainer}>
                                        {renderBreadcrumb().map((crumb, index, arr) => (
                                            <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <TouchableOpacity onPress={crumb.onPress}>
                                                    <Text style={styles.breadcrumbText}>{crumb.label}</Text>
                                                </TouchableOpacity>
                                                {index < arr.length - 1 && (
                                                    <Text style={styles.breadcrumbSeparator}> {'>'} </Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Curriculum Selection and My Docs */}
                        {!selectedCurriculum && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Select Curriculum</Text>
                                    <Button variant="primary" size="sm" onPress={() => setAddPdfModalVisible(true)}>
                                        Upload PDF
                                    </Button>
                                </View>
                                <View style={styles.grid}>
                                    {/* My Docs Card */}
                                    <TouchableOpacity
                                        onPress={() => {
                                            if (myDocs.length > 0 || selectedPdf) {
                                                // Scroll to My Docs section or handle view action
                                                Alert.alert('My Docs', 'Viewing My Documents section');
                                            } else {
                                                setAddPdfModalVisible(true);
                                            }
                                        }}
                                        style={styles.gridItem}
                                        activeOpacity={0.8}
                                    >
                                        <Card gradient={['#776bffff', '#5797feff']} padding="md">
                                            <View style={styles.gradientCardContent}>
                                                <View style={styles.cardHeader}>
                                                    <View style={styles.iconContainer}>
                                                        <Ionicons name="documents" size={24} color="#FFFFFF" />
                                                    </View>
                                                    <Text style={styles.cardCount}>{myDocs.length + (selectedPdf ? 1 : 0)}</Text>
                                                </View>
                                                <Text style={styles.cardTitle}>My Docs</Text>
                                                <Text style={styles.cardSubtitle}>{myDocs.length + (selectedPdf ? 1 : 0)} PDFs saved</Text>
                                            </View>
                                        </Card>
                                    </TouchableOpacity>
                                    {curriculums.map(item => (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => setSelectedCurriculum(item.id)}
                                            style={styles.gridItem}
                                            activeOpacity={0.8}
                                        >
                                            <Card gradient={item.gradient} padding="md">
                                                <View style={styles.gradientCardContent}>
                                                    <View style={styles.cardHeader}>
                                                        <View style={styles.iconContainer}>
                                                            <Ionicons name="school" size={24} color="#FFFFFF" />
                                                        </View>
                                                        <Text style={styles.cardCount}>{item.bookCount}</Text>
                                                    </View>
                                                    <Text style={styles.cardTitle}>{item.label}</Text>
                                                    <Text style={styles.cardSubtitle}>{item.bookCount} books available</Text>
                                                </View>
                                            </Card>
                                        </TouchableOpacity>
                                    ))}
                                </View>

                                {/* My Docs List */}
                                {(myDocs.length > 0 || selectedPdf) && (
                                    <View style={styles.section}>
                                        <Text style={styles.sectionTitle}>My Documents</Text>
                                        <View style={styles.pdfList}>
                                            {selectedPdf && (
                                                <TouchableOpacity
                                                    key="selected-pdf"
                                                    onPress={() => handleViewPdf(selectedPdf.url)}
                                                >
                                                    <Card style={styles.pdfCard}>
                                                        <View style={styles.pdfItemContent}>
                                                            <View style={styles.pdfIconWrapper}>
                                                                <LinearGradient
                                                                    colors={['#FF6B6B', '#FF8E8E']}
                                                                    style={styles.pdfIconGradient}
                                                                    start={{ x: 0, y: 0 }}
                                                                    end={{ x: 1, y: 1 }}
                                                                >
                                                                    <Ionicons name="document" size={24} color="#FFFFFF" />
                                                                </LinearGradient>
                                                            </View>
                                                            <View style={styles.pdfInfo}>
                                                                <Text style={styles.pdfTitle}>{selectedPdf.title}</Text>
                                                                <Text style={styles.pdfFileName}>{selectedPdf.url}</Text>
                                                            </View>
                                                            <View style={styles.pdfActions}>
                                                                <TouchableOpacity
                                                                    style={styles.pdfActionButton}
                                                                    onPress={() => handleViewPdf(selectedPdf.url)}
                                                                >
                                                                    <Ionicons name="eye" size={20} color="#667eea" />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    style={styles.pdfActionButton}
                                                                    onPress={() => storeSelected({ id: 'selected', ...selectedPdf })}
                                                                >
                                                                    <Ionicons name="download" size={20} color="#43e97b" />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    </Card>
                                                </TouchableOpacity>
                                            )}
                                            {myDocs.map(doc => (
                                                <TouchableOpacity
                                                    key={doc.id}
                                                    onPress={() => handleViewPdf(doc.url)}
                                                >
                                                    <Card style={styles.pdfCard}>
                                                        <View style={styles.pdfItemContent}>
                                                            <View style={styles.pdfIconWrapper}>
                                                                <LinearGradient
                                                                    colors={['#FF6B6B', '#FF8E8E']}
                                                                    style={styles.pdfIconGradient}
                                                                    start={{ x: 0, y: 0 }}
                                                                    end={{ x: 1, y: 1 }}
                                                                >
                                                                    <Ionicons name="document" size={24} color="#FFFFFF" />
                                                                </LinearGradient>
                                                            </View>
                                                            <View style={styles.pdfInfo}>
                                                                <Text style={styles.pdfTitle}>{doc.title}</Text>
                                                                <Text style={styles.pdfFileName}>{doc.url}</Text>
                                                            </View>
                                                            <View style={styles.pdfActions}>
                                                                <TouchableOpacity
                                                                    style={styles.pdfActionButton}
                                                                    onPress={() => handleViewPdf(doc.url)}
                                                                >
                                                                    <Ionicons name="eye" size={20} color="#667eea" />
                                                                </TouchableOpacity>
                                                                <TouchableOpacity
                                                                    style={styles.pdfActionButton}
                                                                    onPress={() => storeSelected(doc)}
                                                                >
                                                                    <Ionicons name="download" size={20} color="#43e97b" />
                                                                </TouchableOpacity>
                                                            </View>
                                                        </View>
                                                    </Card>
                                                </TouchableOpacity>
                                            ))}
                                        </View>
                                    </View>
                                )}
                            </View>
                        )}

                        {/* Add PDF Modal */}
                        <Modal
                            visible={isAddPdfModalVisible}
                            animationType="slide"
                            transparent={true}
                            onRequestClose={() => setAddPdfModalVisible(false)}
                        >
                            <View style={styles.modalContainer}>
                                <View style={styles.modalContent}>
                                    <Text style={styles.sectionTitle}>Add New PDF</Text>
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="PDF Title"
                                        placeholderTextColor="#9ca3af"
                                        value={newPdfTitle}
                                        onChangeText={setNewPdfTitle}
                                    />
                                    <TouchableOpacity style={styles.uploadButton} onPress={handleUpload}>
                                        <Ionicons name="cloud-upload" size={20} color="#FFFFFF" />
                                        <Text style={styles.uploadButtonText}>Upload PDF</Text>
                                    </TouchableOpacity>
                                    {uploadedFile && (
                                        <Text style={styles.fileNameText}>{uploadedFile.name}</Text>
                                    )}
                                    <View style={styles.modalButtonContainer}>
                                        <Button
                                            variant="secondary"
                                            onPress={() => setAddPdfModalVisible(false)}
                                        >
                                            Cancel
                                        </Button>
                                        <Button variant="primary" onPress={handleAddPdf}>
                                            Add PDF
                                        </Button>
                                    </View>
                                </View>
                            </View>
                        </Modal>

                        {/* Medium Selection */}
                        {selectedCurriculum && !selectedMedium && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Select Medium</Text>
                                <View style={styles.grid}>
                                    {(curriculums.find(c => c.id === selectedCurriculum)?.media || []).map(medium => (
                                        <TouchableOpacity
                                            key={medium.id}
                                            onPress={() => setSelectedMedium(medium.id)}
                                            style={styles.gridItem}
                                            activeOpacity={0.8}
                                        >
                                            <Card gradient={medium.gradient} padding="md">
                                                <View style={styles.gradientCardContent}>
                                                    <View style={styles.cardHeader}>
                                                        <View style={styles.iconContainer}>
                                                            <Ionicons name="language" size={24} color="#FFFFFF" />
                                                        </View>
                                                        <Text style={styles.cardCount}>{medium.bookCount}</Text>
                                                    </View>
                                                    <Text style={styles.cardTitle}>{medium.label}</Text>
                                                    <Text style={styles.cardSubtitle}>{medium.bookCount} books available</Text>
                                                </View>
                                            </Card>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Class Selection */}
                        {selectedMedium && !selectedClass && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Select Class</Text>
                                <View style={styles.grid}>
                                    {currentClasses.map(classItem => (
                                        <TouchableOpacity
                                            key={classItem.id}
                                            onPress={() => setSelectedClass(classItem.id)}
                                            style={styles.gridItem}
                                            activeOpacity={0.8}
                                        >
                                            <Card gradient={classItem.gradient} padding="md">
                                                <View style={styles.gradientCardContent}>
                                                    <View style={styles.cardHeader}>
                                                        <View style={styles.iconContainer}>
                                                            <Ionicons name="library" size={24} color="#FFFFFF" />
                                                        </View>
                                                        <Text style={styles.cardCount}>{classItem.bookCount}</Text>
                                                    </View>
                                                    <Text style={styles.cardTitle}>{classItem.label}</Text>
                                                    <Text style={styles.cardSubtitle}>{classItem.bookCount} books available</Text>
                                                </View>
                                            </Card>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Subject Selection */}
                        {selectedClass && !selectedSubject && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Select Subject</Text>
                                <View style={styles.grid}>
                                    {(currentSubjects || []).map(subject => (
                                        <TouchableOpacity
                                            key={subject.id}
                                            onPress={() => setSelectedSubject(subject.id)}
                                            style={styles.gridItem}
                                            activeOpacity={0.8}
                                        >
                                            <Card gradient={subject.gradient} padding="md">
                                                <View style={styles.gradientCardContent}>
                                                    <View style={styles.cardHeader}>
                                                        <View style={styles.iconContainer}>
                                                            <Ionicons name="book" size={24} color="#FFFFFF" />
                                                        </View>
                                                        <Text style={styles.cardCount}>{subject.chapterCount}</Text>
                                                    </View>
                                                    <Text style={styles.cardTitle}>{subject.label}</Text>
                                                    <Text style={styles.cardSubtitle}>{subject.chapterCount} chapters</Text>
                                                </View>
                                            </Card>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Chapter Selection */}
                        {selectedSubject && !selectedChapter && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Select Chapter</Text>
                                <View style={styles.chapterList}>
                                    {(currentChapters || []).map((chapter, index) => (
                                        <TouchableOpacity
                                            key={chapter.id}
                                            onPress={() => setSelectedChapter(chapter.id)}
                                            activeOpacity={0.8}
                                        >
                                            <Card style={styles.chapterCard}>
                                                <View style={styles.chapterItemContent}>
                                                    <View style={styles.chapterIconWrapper}>
                                                        <LinearGradient
                                                            colors={['#667eea', '#764ba2']}
                                                            style={styles.chapterIconGradient}
                                                            start={{ x: 0, y: 0 }}
                                                            end={{ x: 1, y: 1 }}
                                                        >
                                                            <Ionicons name="document-text" size={24} color="#FFFFFF" />
                                                        </LinearGradient>
                                                    </View>
                                                    <View style={styles.chapterInfo}>
                                                        <Text style={styles.chapterTitleText}>{chapter.title}</Text>
                                                        <Text style={styles.chapterCountText}>{chapter.pdfCount} PDFs available</Text>
                                                    </View>
                                                    <Ionicons name="chevron-forward" size={20} color="#667eea" />
                                                </View>
                                            </Card>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* PDF List */}
                        {selectedChapter && (
                            <View style={styles.section}>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Uploaded PDFs</Text>
                                    <Button size="sm" onPress={() => setAddPdfModalVisible(true)}>Add PDF</Button>
                                </View>
                                <View style={styles.pdfList}>
                                    {currentPdfs.map(pdf => (
                                        <Card key={pdf.id} style={styles.pdfCard}>
                                            <View style={styles.pdfItemContent}>
                                                <View style={styles.pdfIconWrapper}>
                                                    <LinearGradient
                                                        colors={['#FF6B6B', '#FF8E8E']}
                                                        style={styles.pdfIconGradient}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 1 }}
                                                    >
                                                        <Ionicons name="document" size={24} color="#FFFFFF" />
                                                    </LinearGradient>
                                                </View>
                                                <View style={styles.pdfInfo}>
                                                    <Text style={styles.pdfTitle}>{pdf.title}</Text>
                                                    <Text style={styles.pdfFileName}>{pdf.fileName}</Text>
                                                    <View style={styles.pdfMeta}>
                                                        <Text style={styles.pdfMetaText}>{pdf.pages} pages</Text>
                                                        <Text style={styles.pdfMetaText}>{pdf.size}</Text>
                                                        <Text style={styles.pdfMetaText}>
                                                            {new Date(pdf.uploadDate).toLocaleDateString()}
                                                        </Text>
                                                    </View>
                                                </View>
                                                <View style={styles.pdfActions}>
                                                    <TouchableOpacity
                                                        style={styles.pdfActionButton}
                                                        onPress={() => handleViewPdf(pdf.fileName)}
                                                    >
                                                        <Ionicons name="eye" size={20} color="#667eea" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.pdfActionButton}>
                                                        <Ionicons name="download" size={20} color="#43e97b" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </Card>
                                    ))}
                                </View>
                            </View>
                        )}
                    </>
                ) : (
                    <>
                        {/* Private Library Navigation Header */}
                        {(privateCurriculum || privateMedium || privateClass || privateSubject) && (
                            <View style={styles.navigationHeader}>
                                <TouchableOpacity onPress={handlePrivateBack} style={styles.backButton}>
                                    <Ionicons name="arrow-back" size={24} color="#667eea" />
                                </TouchableOpacity>
                                <View style={styles.breadcrumbContainer}>
                                    <View style={styles.breadcrumbTextContainer}>
                                        {renderPrivateBreadcrumb().map((crumb, index, arr) => (
                                            <View key={index} style={{ flexDirection: 'row', alignItems: 'center' }}>
                                                <TouchableOpacity onPress={crumb.onPress}>
                                                    <Text style={styles.breadcrumbText}>{crumb.label}</Text>
                                                </TouchableOpacity>
                                                {index < arr.length - 1 && (
                                                    <Text style={styles.breadcrumbSeparator}> {'>'} </Text>
                                                )}
                                            </View>
                                        ))}
                                    </View>
                                </View>
                            </View>
                        )}

                        {/* Private Library - Curriculum Selection */}
                        {!privateCurriculum && (
                            <View style={styles.section}>
                                <View style={styles.searchContainer}>
                                    <TextInput
                                        style={styles.searchInput}
                                        placeholder="Search books..."
                                        placeholderTextColor="#9ca3af"
                                        value={privateSearchQuery}
                                        onChangeText={setPrivateSearchQuery}
                                    />
                                    <Ionicons
                                        name="search"
                                        size={20}
                                        color="#9ca3af"
                                        style={styles.searchIcon}
                                    />
                                </View>
                                <View style={styles.sectionHeader}>
                                    <Text style={styles.sectionTitle}>Select Curriculum</Text>
                                </View>
                                <View style={styles.grid}>
                                    {curriculums.map(item => (
                                        <TouchableOpacity
                                            key={item.id}
                                            onPress={() => setPrivateCurriculum(item.id)}
                                            style={styles.gridItem}
                                            activeOpacity={0.8}
                                        >
                                            <Card gradient={item.gradient} padding="md">
                                                <View style={styles.gradientCardContent}>
                                                    <View style={styles.cardHeader}>
                                                        <View style={styles.iconContainer}>
                                                            <Ionicons name="lock-closed" size={24} color="#FFFFFF" />
                                                        </View>
                                                        <Text style={styles.cardCount}>{item.bookCount}</Text>
                                                    </View>
                                                    <Text style={styles.cardTitle}>{item.label}</Text>
                                                    <Text style={styles.cardSubtitle}>{item.bookCount} books available</Text>
                                                </View>
                                            </Card>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Private Library - Medium Selection */}
                        {privateCurriculum && !privateMedium && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Select Medium</Text>
                                <View style={styles.grid}>
                                    {(curriculums.find(c => c.id === privateCurriculum)?.media || []).map(medium => (
                                        <TouchableOpacity
                                            key={medium.id}
                                            onPress={() => setPrivateMedium(medium.id)}
                                            style={styles.gridItem}
                                            activeOpacity={0.8}
                                        >
                                            <Card gradient={medium.gradient} padding="md">
                                                <View style={styles.gradientCardContent}>
                                                    <View style={styles.cardHeader}>
                                                        <View style={styles.iconContainer}>
                                                            <Ionicons name="language" size={24} color="#FFFFFF" />
                                                        </View>
                                                        <Text style={styles.cardCount}>{medium.bookCount}</Text>
                                                    </View>
                                                    <Text style={styles.cardTitle}>{medium.label}</Text>
                                                    <Text style={styles.cardSubtitle}>{medium.bookCount} books available</Text>
                                                </View>
                                            </Card>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Private Library - Class Selection */}
                        {privateMedium && !privateClass && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Select Class</Text>
                                <View style={styles.grid}>
                                    {privateCurrentClasses.map(classItem => (
                                        <TouchableOpacity
                                            key={classItem.id}
                                            onPress={() => setPrivateClass(classItem.id)}
                                            style={styles.gridItem}
                                            activeOpacity={0.8}
                                        >
                                            <Card gradient={classItem.gradient} padding="md">
                                                <View style={styles.gradientCardContent}>
                                                    <View style={styles.cardHeader}>
                                                        <View style={styles.iconContainer}>
                                                            <Ionicons name="library" size={24} color="#FFFFFF" />
                                                        </View>
                                                        <Text style={styles.cardCount}>{classItem.bookCount}</Text>
                                                    </View>
                                                    <Text style={styles.cardTitle}>{classItem.label}</Text>
                                                    <Text style={styles.cardSubtitle}>{classItem.bookCount} books available</Text>
                                                </View>
                                            </Card>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Private Library - Subject Selection */}
                        {privateClass && !privateSubject && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Select Subject</Text>
                                <View style={styles.grid}>
                                    {(privateCurrentSubjects || []).map(subject => (
                                        <TouchableOpacity
                                            key={subject.id}
                                            onPress={() => setPrivateSubject(subject.id)}
                                            style={styles.gridItem}
                                            activeOpacity={0.8}
                                        >
                                            <Card gradient={subject.gradient} padding="md">
                                                <View style={styles.gradientCardContent}>
                                                    <View style={styles.cardHeader}>
                                                        <View style={styles.iconContainer}>
                                                            <Ionicons name="book" size={24} color="#FFFFFF" />
                                                        </View>
                                                        <Text style={styles.cardCount}>{subject.chapterCount}</Text>
                                                    </View>
                                                    <Text style={styles.cardTitle}>{subject.label}</Text>
                                                    <Text style={styles.cardSubtitle}>{subject.chapterCount} chapters</Text>
                                                </View>
                                            </Card>
                                        </TouchableOpacity>
                                    ))}
                                </View>
                            </View>
                        )}

                        {/* Private Library - Chapter List with Search */}
                        {privateSubject && (
                            <View style={styles.section}>
                                <Text style={styles.sectionTitle}>Chapters</Text>
                                <View style={styles.chapterList}>
                                    {filteredPrivateChapters.map(chapter => (
                                        <Card key={chapter.id} style={styles.chapterCard}>
                                            <View style={styles.chapterItemContent}>
                                                <View style={styles.chapterIconWrapper}>
                                                    <LinearGradient
                                                        colors={['#43e97b', '#38f9d7']}
                                                        style={styles.chapterIconGradient}
                                                        start={{ x: 0, y: 0 }}
                                                        end={{ x: 1, y: 1 }}
                                                    >
                                                        <Ionicons name="folder" size={24} color="#FFFFFF" />
                                                    </LinearGradient>
                                                </View>
                                                <View style={styles.chapterInfo}>
                                                    <Text style={styles.chapterTitleText}>{chapter.title}</Text>
                                                    <Text style={styles.chapterCountText}>{chapter.pdfCount} PDFs available</Text>
                                                </View>
                                                <View style={styles.chapterActions}>
                                                    <TouchableOpacity style={styles.pdfActionButton}>
                                                        <Ionicons name="eye" size={20} color="#667eea" />
                                                    </TouchableOpacity>
                                                    <TouchableOpacity style={styles.pdfActionButton}>
                                                        <Ionicons name="download" size={20} color="#43e97b" />
                                                    </TouchableOpacity>
                                                </View>
                                            </View>
                                        </Card>
                                    ))}
                                </View>

                                {filteredPrivateChapters.length === 0 && privateSearchQuery && (
                                    <View style={styles.noResultsContainer}>
                                        <LinearGradient
                                            colors={['#f093fb', '#f5576c']}
                                            style={styles.noResultsIconContainer}
                                            start={{ x: 0, y: 0 }}
                                            end={{ x: 1, y: 1 }}
                                        >
                                            <Ionicons name="search" size={32} color="#FFFFFF" />
                                        </LinearGradient>
                                        <Text style={styles.noResultsText}>
                                            No chapters found for "{privateSearchQuery}"
                                        </Text>
                                        <Text style={styles.noResultsSubText}>
                                            Try searching with different keywords
                                        </Text>
                                    </View>
                                )}
                            </View>
                        )}
                    </>
                )}
            </ScrollView>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
        paddingTop: 16,
    },

    // Gradient Button Styles
    gradientButton: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },

    // Button Styles
    buttonBase: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        overflow: 'hidden',
    },
    buttonPrimary: {
        backgroundColor: 'transparent',
    },
    buttonSecondary: {
        backgroundColor: '#e5e7eb',
    },
    buttonOutline: {
        borderWidth: 2,
        borderColor: '#667eea',
        backgroundColor: 'transparent',
    },
    buttonSm: {
        borderRadius: 8,
    },
    buttonMd: {
        paddingHorizontal: 16,
        paddingVertical: 8,
    },
    buttonLg: {
        paddingHorizontal: 24,
        paddingVertical: 12,
    },
    buttonDisabled: {
        opacity: 0.5,
    },
    buttonTextBase: {
        fontWeight: '600',
    },
    buttonTextPrimary: {
        color: '#ffffff',
    },
    buttonTextSecondary: {
        color: '#374151',
    },
    buttonTextOutline: {
        color: '#667eea',
    },
    buttonTextSm: {
        fontSize: 14,
    },
    buttonTextMd: {
        fontSize: 16,
    },
    buttonTextLg: {
        fontSize: 18,
    },

    // Card Styles
    cardBase: {
        borderRadius: 16,
        overflow: 'hidden',
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    gradientCard: {
        borderRadius: 16,
    },
    cardPaddingSm: {
        padding: 12,
    },
    cardPaddingMd: {
        padding: width * 0.04,
    },
    cardPaddingLg: {
        padding: 24,
    },

    // Gradient Card Content
    gradientCardContent: {
        flex: 1,
    },
    cardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: height * 0.01,
    },
    iconContainer: {
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        padding: 8,
        borderRadius: 12,
    },
    cardCount: {
        fontSize: width * 0.08,
        fontWeight: '800',
        color: '#FFFFFF',
    },
    cardTitle: {
        fontSize: width * 0.035,
        fontWeight: '600',
        color: '#FFFFFF',
        marginBottom: 2,
    },
    cardSubtitle: {
        fontSize: width * 0.03,
        color: 'rgba(255, 255, 255, 0.8)',
    },

    // Section Toggle
    sectionToggle: {
        flexDirection: 'row',
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 4,
        marginBottom: 20,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 4,
        elevation: 2,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
    },
    toggleButtonActive: {
        backgroundColor: '#F0F4FF',
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '600',
        marginLeft: 8,
        color: '#9ca3af',
    },
    toggleButtonTextActive: {
        color: '#667eea',
    },

    // Navigation
    navigationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 12,
        marginBottom: 16,
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        paddingHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
        borderRadius: 8,
        backgroundColor: '#F0F4FF',
    },
    breadcrumbContainer: {
        flex: 1,
    },
    breadcrumbText: {
        fontSize: 16,
        fontWeight: '500',
        color: '#2C3E50',
    },
    breadcrumbTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    breadcrumbSeparator: {
        fontSize: 16,
        color: '#667eea',
        marginHorizontal: 8,
        fontWeight: '600',
    },

    // Section
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: width * 0.05,
        fontWeight: '700',
        color: '#2C3E50',
    },

    // Grid
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: width * 0.015,
    },
    gridItem: {
        width: (width - 44) / 2,
    },

    // Chapter List
    chapterList: {
        gap: 12,
    },
    chapterCard: {
        backgroundColor: '#FFFFFF',
    },
    chapterItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    chapterIconWrapper: {
        marginRight: 16,
    },
    chapterIconGradient: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    chapterInfo: {
        flex: 1,
    },
    chapterTitleText: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 4,
    },
    chapterCountText: {
        fontSize: 14,
        color: '#7F8C8D',
    },
    chapterActions: {
        flexDirection: 'row',
        gap: 8,
    },

    // PDF List
    pdfList: {
        gap: 12,
    },
    pdfCard: {
        backgroundColor: '#FFFFFF',
    },
    pdfItemContent: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
    },
    pdfIconWrapper: {
        marginRight: 16,
    },
    pdfIconGradient: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    pdfInfo: {
        flex: 1,
    },
    pdfTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 4,
    },
    pdfFileName: {
        fontSize: 12,
        color: '#7F8C8D',
        marginBottom: 8,
    },
    pdfMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    pdfMetaText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    pdfActions: {
        flexDirection: 'row',
        gap: 12,
    },
    pdfActionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: '#F8F9FA',
    },

    // Search
    searchContainer: {
        position: 'relative',
        marginBottom: 16,
    },
    searchInput: {
        backgroundColor: '#FFFFFF',
        paddingLeft: 48,
        paddingRight: 16,
        paddingVertical: 16,
        borderRadius: 12,
        fontSize: 16,
        color: '#2C3E50',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
        elevation: 1,
    },
    searchIcon: {
        position: 'absolute',
        left: 16,
        top: 16,
    },

    // No Results
    noResultsContainer: {
        alignItems: 'center',
        paddingVertical: 48,
    },
    noResultsIconContainer: {
        width: 80,
        height: 80,
        borderRadius: 40,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 16,
    },
    noResultsText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#2C3E50',
        marginBottom: 8,
        textAlign: 'center',
    },
    noResultsSubText: {
        fontSize: 14,
        color: '#7F8C8D',
        textAlign: 'center',
    },

    // Modal Styles
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: '#FFFFFF',
        borderRadius: 16,
        padding: 24,
        width: width * 0.9,
        gap: 16,
    },
    modalButtonContainer: {
        flexDirection: 'row',
        justifyContent: 'flex-end',
        gap: 16,
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
    fileNameText: {
        fontSize: 14,
        color: '#2C3E50',
        textAlign: 'center',
    },
});

export default LibraryTab;