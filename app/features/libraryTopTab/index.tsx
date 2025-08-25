import React, { useState } from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    TextInput,
    Image,
    StyleSheet,
    Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

// Button Component
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

// Card Component
interface CardProps {
    children: React.ReactNode;
    style?: any;
    padding?: 'sm' | 'md' | 'lg';
}

const Card: React.FC<CardProps> = ({ children, style, padding = 'md' }) => {
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
    const [activeSection, setActiveSection] = useState<'public' | 'private'>('private');
    const [searchQuery, setSearchQuery] = useState('');

    const [selectedCurriculum, setSelectedCurriculum] = useState<string | null>(null);
    const [selectedMedium, setSelectedMedium] = useState<string | null>(null);
    const [selectedClass, setSelectedClass] = useState<string | null>(null);
    const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
    const [selectedChapter, setSelectedChapter] = useState<string | null>(null);

    const curriculums = [
        {
            id: 'stateboard',
            label: 'State Board',
            bookCount: 25,
            media: [
                {
                    id: 'tamil',
                    label: 'Tamil Medium',
                    bookCount: 15
                },
                {
                    id: 'english',
                    label: 'English Medium',
                    bookCount: 10
                }
            ]
        },
        {
            id: 'cbse',
            label: 'CBSE',
            bookCount: 20,
            media: [
                {
                    id: 'english',
                    label: 'English medium',
                    bookCount: 20
                }
            ]
        }
    ];

    const classes = [
        { id: 'class1', label: 'Class 1', bookCount: 8 },
        { id: 'class2', label: 'Class 2', bookCount: 12 },
        { id: 'class3', label: 'Class 3', bookCount: 15 },
        { id: 'class4', label: 'Class 4', bookCount: 18 },
        { id: 'class5', label: 'Class 5', bookCount: 20 },
    ];

    const tamil_classes = [
        {
            id: 'class1_tamil',
            label: 'class 1',
            bookCount: 8
        },
        {
            id: 'class2_tamil',
            label: 'class 2',
            bookCount: 12
        },
        {
            id: 'class3_tamil',
            label: 'class 3',
            bookCount: 15
        }
    ];

    const subjects = {
        class1: [
            { id: 'english', label: 'English', chapterCount: 5 },
            { id: 'maths', label: 'Mathematics', chapterCount: 6 },
            { id: 'science', label: 'Science', chapterCount: 4 },
        ],
        class2: [
            { id: 'english', label: 'English', chapterCount: 6 },
            { id: 'maths', label: 'Mathematics', chapterCount: 8 },
            { id: 'science', label: 'Science', chapterCount: 5 },
            { id: 'social', label: 'Social Studies', chapterCount: 4 },
        ],
        class3: [
            { id: 'english', label: 'English', chapterCount: 8 },
            { id: 'maths', label: 'Mathematics', chapterCount: 10 },
            { id: 'science', label: 'Science', chapterCount: 7 },
            { id: 'social', label: 'Social Studies', chapterCount: 6 },
        ],
        class4: [
            { id: 'english', label: 'English', chapterCount: 10 },
            { id: 'maths', label: 'Mathematics', chapterCount: 12 },
            { id: 'science', label: 'Science', chapterCount: 9 },
            { id: 'social', label: 'Social Studies', chapterCount: 8 },
        ],
        class5: [
            { id: 'english', label: 'English', chapterCount: 12 },
            { id: 'maths', label: 'Mathematics', chapterCount: 15 },
            { id: 'science', label: 'Science', chapterCount: 11 },
            { id: 'social', label: 'Social Studies', chapterCount: 10 },
        ],
    };

    const tamil_subjects = {
        class1_tamil: [
            { id: 'tamil_s1', label: 'Tamil', chapterCount: 5 },
            { id: 'maths_s1', label: 'Maths', chapterCount: 6 },
            { id: 'science_s1', label: 'Science', chapterCount: 4 }
        ],
        class2_tamil: [
            { id: 'tamil_s2', label: 'Tamil', chapterCount: 6 },
            { id: 'maths_s2', label: 'Maths', chapterCount: 8 },
            { id: 'science_s2', label: 'Science', chapterCount: 5 }
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
            { id: 'ch1_tamil_s1', title: 'Basics', pdfCount: 3 },
            { id: 'ch2_tamil_s1', title: 'Grammer', pdfCount: 2 }
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

    const currentClasses = selectedMedium === 'tamil' ? tamil_classes : classes;
    const currentSubjects = selectedMedium === 'tamil' ? tamil_subjects[selectedClass as keyof typeof tamil_subjects] : subjects[selectedClass as keyof typeof subjects];
    const currentChapters = selectedMedium === 'tamil' ? tamil_chapters[selectedSubject as keyof typeof tamil_chapters] : chapters[selectedSubject as keyof typeof chapters];
    const currentPdfs = selectedMedium === 'tamil' ? tamil_pdfs : uploadedPdfs;


    return (
        <ScrollView style={styles.container}>
            {/* Section Toggle */}
            <View style={styles.sectionToggle}>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        activeSection === 'private' && styles.toggleButtonActive,
                    ]}
                    onPress={() => setActiveSection('private')}
                >
                    <Ionicons
                        name="globe"
                        size={16}
                        color={activeSection === 'private' ? '#10b981' : isDark ? '#9ca3af' : '#6b7280'}
                    />
                    <Text
                        style={[
                            styles.toggleButtonText,
                            activeSection === 'private' && styles.toggleButtonTextActive,
                            !isDark && { color: activeSection === 'private' ? '#10b981' : '#6b7280' },
                        ]}
                    >
                        Public Library
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[
                        styles.toggleButton,
                        activeSection === 'public' && styles.toggleButtonActive,
                    ]}
                    onPress={() => setActiveSection('public')}
                >
                    <Ionicons
                        name="lock-closed"
                        size={16}
                        color={activeSection === 'public' ? '#10b981' : isDark ? '#9ca3af' : '#6b7280'}
                    />
                    <Text
                        style={[
                            styles.toggleButtonText,
                            activeSection === 'public' && styles.toggleButtonTextActive,
                            !isDark && { color: activeSection === 'public' ? '#10b981' : '#6b7280' },
                        ]}
                    >
                        Private Library
                    </Text>
                </TouchableOpacity>
            </View>

            {activeSection === 'private' ? (
                <>
                    {/* Navigation Header */}
                    {(selectedCurriculum || selectedMedium || selectedClass || selectedSubject || selectedChapter) && (
                        <View style={styles.navigationHeader}>
                            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                                <Ionicons name="arrow-back" size={20} color={isDark ? '#ADD8E6' : '#0f3be8ff'} />
                            </TouchableOpacity>
                            <View style={styles.breadcrumbContainer}>
                                {/* <Text style={styles.breadcrumbLabel}>
                                    Navigate:
                                </Text> */}
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

                    {/* Curriculum Selection */}
                    {!selectedCurriculum && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Select Curriculum</Text>
                                <Button variant="outline" size="sm">
                                    Upload PDF
                                </Button>
                            </View>
                            <View style={styles.grid}>
                                {curriculums.map(item => (
                                    <Card key={item.id} style={styles.gridItem}>
                                        <TouchableOpacity
                                            onPress={() => setSelectedCurriculum(item.id)}
                                            style={styles.classItem}
                                        >
                                            <View style={styles.classItemHeader}>
                                                <Image
                                                    source={{ uri: `https://picsum.photos/seed/${item.id}/48` }}
                                                    style={styles.itemIcon}
                                                />
                                                <View style={styles.classInfo}>
                                                    <Text style={styles.classLabel}>
                                                        {item.label}
                                                    </Text>
                                                    <Text style={styles.classCount}>
                                                        {item.bookCount} books
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.classFooter}>
                                                <Text style={styles.classFooterText}>
                                                    📚 {item.bookCount} PDFs
                                                </Text>
                                                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                                            </View>
                                        </TouchableOpacity>
                                    </Card>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Medium Selection */}
                    {selectedCurriculum && !selectedMedium && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Medium</Text>
                            <View style={styles.grid}>
                                {(curriculums.find(c => c.id === selectedCurriculum)?.media || []).map(medium => (
                                    <Card key={medium.id} style={styles.gridItem}>
                                        <TouchableOpacity
                                            onPress={() => setSelectedMedium(medium.id)}
                                            style={styles.classItem}
                                        >
                                            <View style={styles.classItemHeader}>
                                                <Image
                                                    source={{ uri: `https://picsum.photos/seed/${medium.id}-${selectedCurriculum}/48` }}
                                                    style={styles.itemIcon}
                                                />
                                                <View style={styles.classInfo}>
                                                    <Text style={styles.classLabel}>
                                                        {medium.label}
                                                    </Text>
                                                    <Text style={styles.classCount}>
                                                        {medium.bookCount} books
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.classFooter}>
                                                <Text style={styles.classFooterText}>
                                                    📚 {medium.bookCount} PDFs
                                                </Text>
                                                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                                            </View>
                                        </TouchableOpacity>
                                    </Card>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Class Selection */}
                    {selectedMedium && !selectedClass && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Select Class</Text>
                            </View>
                            <View style={styles.grid}>
                                {currentClasses.map(classItem => (
                                    <Card key={classItem.id} style={styles.gridItem}>
                                        <TouchableOpacity
                                            onPress={() => setSelectedClass(classItem.id)}
                                            style={styles.classItem}
                                        >
                                            <View style={styles.classItemHeader}>
                                                <Image
                                                    source={{ uri: `https://picsum.photos/seed/${classItem.id}/48` }}
                                                    style={styles.itemIcon}
                                                />
                                                <View style={styles.classInfo}>
                                                    <Text style={styles.classLabel}>
                                                        {classItem.label}
                                                    </Text>
                                                    <Text style={styles.classCount}>
                                                        {classItem.bookCount} books
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.classFooter}>
                                                <Text style={styles.classFooterText}>
                                                    📚 {classItem.bookCount} PDFs
                                                </Text>
                                                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                                            </View>
                                        </TouchableOpacity>
                                    </Card>
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
                                    <Card key={subject.id} style={styles.gridItem}>
                                        <TouchableOpacity
                                            onPress={() => setSelectedSubject(subject.id)}
                                            style={styles.classItem}
                                        >
                                            <View style={styles.classItemHeader}>
                                                <Image
                                                    source={{ uri: `https://picsum.photos/seed/${subject.id}-${selectedClass}/48` }}
                                                    style={styles.itemIcon}
                                                />
                                                <View style={styles.classInfo}>
                                                    <Text style={styles.classLabel}>
                                                        {subject.label}
                                                    </Text>
                                                    <Text style={styles.classCount}>
                                                        {subject.chapterCount} chapters
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.classFooter}>
                                                <Text style={styles.classFooterText}>
                                                    📄 {subject.chapterCount} chapters
                                                </Text>
                                                <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                                            </View>
                                        </TouchableOpacity>
                                    </Card>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* Chapter Selection */}
                    {selectedSubject && !selectedChapter && (
                        <View style={styles.section}>
                            <Text style={styles.sectionTitle}>Select Chapter</Text>
                            <View style={styles.chapterList}>
                                {(currentChapters || []).map(chapter => (
                                    <Card key={chapter.id}>
                                        <TouchableOpacity
                                            onPress={() => setSelectedChapter(chapter.id)}
                                            style={styles.chapterItem}
                                        >
                                            <View style={styles.chapterItemHeader}>
                                                <Image
                                                    source={{ uri: `https://picsum.photos/seed/${chapter.id}-${selectedSubject}/40` }}
                                                    style={styles.chapterItemIcon}
                                                />
                                                <View>
                                                    <Text style={styles.chapterTitle}>
                                                        {chapter.title}
                                                    </Text>
                                                    <Text style={styles.chapterCount}>
                                                        {chapter.pdfCount} PDFs uploaded
                                                    </Text>
                                                </View>
                                            </View>
                                            <Ionicons name="chevron-forward" size={16} color="#9ca3af" />
                                        </TouchableOpacity>
                                    </Card>
                                ))}
                            </View>
                        </View>
                    )}

                    {/* PDF List */}
                    {selectedChapter && (
                        <View style={styles.section}>
                            <View style={styles.sectionHeader}>
                                <Text style={styles.sectionTitle}>Uploaded PDFs</Text>
                                <Button size="sm">Add PDF</Button>
                            </View>
                            <View style={styles.pdfList}>
                                {currentPdfs.map(pdf => (
                                    <Card key={pdf.id}>
                                        <View style={styles.pdfItem}>
                                            <Image
                                                source={{ uri: `https://picsum.photos/seed/${pdf.fileName}/48` }}
                                                style={styles.pdfItemIcon}
                                            />
                                            <View style={styles.pdfInfo}>
                                                <Text style={styles.pdfTitle}>
                                                    {pdf.title}
                                                </Text>
                                                <Text style={styles.pdfFileName}>
                                                    {pdf.fileName}
                                                </Text>
                                                <View style={styles.pdfMeta}>
                                                    <Text style={styles.pdfMetaText}>📄 {pdf.pages} pages</Text>
                                                    <Text style={styles.pdfMetaText}>💾 {pdf.size}</Text>
                                                    <Text style={styles.pdfMetaText}>
                                                        📅 {new Date(pdf.uploadDate).toLocaleDateString()}
                                                    </Text>
                                                </View>
                                            </View>
                                            <View style={styles.pdfActions}>
                                                <TouchableOpacity style={styles.pdfActionButton}>
                                                    <Ionicons name="download" size={16} color="#9ca3af" />
                                                </TouchableOpacity>
                                                <TouchableOpacity style={styles.pdfActionButton}>
                                                    <Ionicons name="ellipsis-vertical" size={16} color="#9ca3af" />
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
                    {/* Public Library Section */}
                    <View style={styles.searchContainer}>
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Search private books..."
                            placeholderTextColor={isDark ? '#9ca3af' : '#6b7280'}
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                        <Ionicons
                            name="search"
                            size={20}
                            color="#9ca3af"
                            style={styles.searchIcon}
                        />
                    </View>

                    <View style={styles.section}>
                        <Text style={styles.sectionTitle}>Featured Books</Text>
                        <View style={styles.bookList}>
                            {publicBooks.map(book => (
                                <Card key={book.id}>
                                    <View style={styles.bookItem}>
                                        <Image source={{ uri: book.thumbnail }} style={styles.bookThumbnail} />
                                        <View style={styles.bookInfo}>
                                            <Text style={styles.bookTitle}>
                                                {book.title}
                                            </Text>
                                            <Text style={styles.bookAuthor}>
                                                by {book.author}
                                            </Text>
                                            <Text style={styles.bookGrade}>{book.grade}</Text>
                                            <View style={styles.bookMeta}>
                                                <Text style={styles.bookMetaText}>⭐ {book.rating}</Text>
                                                <Text style={styles.bookMetaText}>⬇️ {book.downloads}</Text>
                                            </View>
                                        </View>
                                        <View style={styles.bookActions}>
                                            <Button size="sm" style={styles.downloadButton}>
                                                ⬇️ Download
                                            </Button>
                                            <TouchableOpacity style={styles.favoriteButton}>
                                                <Ionicons name="heart-outline" size={16} color="#9ca3af" />
                                            </TouchableOpacity>
                                        </View>
                                    </View>
                                </Card>
                            ))}
                        </View>
                    </View>
                </>
            )}
        </ScrollView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        // paddingHorizontal: 16,
        paddingTop: 16,
        // paddingBottom: 80,
    },

    // Button Styles
    buttonBase: {
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    buttonPrimary: {
        backgroundColor: '#10b981',
    },
    buttonSecondary: {
        backgroundColor: '#e5e7eb',
    },
    buttonOutline: {
        borderWidth: 2,
        borderColor: '#10b981',
        backgroundColor: 'transparent',
    },
    buttonSm: {
        paddingHorizontal: 12,
        paddingVertical: 6,
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
        fontWeight: '500',
    },
    buttonTextPrimary: {
        color: '#ffffff',
    },
    buttonTextSecondary: {
        color: '#374151',
    },
    buttonTextOutline: {
        color: '#10b981',
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
        backgroundColor: '#ffffff',
        borderRadius: 12,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 0.5,
        borderWidth: 1,
        borderColor: '#f3f4f6',
    },
    cardPaddingSm: {
        padding: 12,
    },
    cardPaddingMd: {
        padding: 16,
    },
    cardPaddingLg: {
        padding: 24,
    },

    // Section Toggle
    sectionToggle: {
        flexDirection: 'row',
        backgroundColor: '#f3f4f6',
        borderRadius: 8,
        padding: 4,
        marginBottom: 16,
    },
    toggleButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 6,
    },
    toggleButtonActive: {
        backgroundColor: '#ffffff',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 1,
        },
        shadowOpacity: 0.1,
        shadowRadius: 2,
        elevation: 2,
    },
    toggleButtonText: {
        fontSize: 14,
        fontWeight: '500',
        marginLeft: 8,
        color: '#6b7280',
    },
    toggleButtonTextActive: {
        color: '#10b981',
    },

    // Navigation
    navigationHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: 8,
        marginBottom: 6,
    },
    backButton: {
        padding: 8,
        marginRight: 12,
    },
    breadcrumbContainer: {
        flex: 1,
    },
    breadcrumbLabel: {
        fontSize: 12,
        color: '#6b7280',
    },
    breadcrumbText: {
        fontSize: 14,
        fontWeight: '400',
        color: 'black'
    },

    breadcrumbTextContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        alignItems: 'center',
    },
    breadcrumbSeparator: {
        fontSize: 16,
        color: '#6b7280',
        marginHorizontal: 4,
    },


    // Section
    section: {
        // marginBottom: 16,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        marginBottom: width * 0.03
    },

    // Grid
    grid: {
        flexDirection: 'row',
        // flexWrap: 'wrap',
    },
    gridItem: {
        width: (width - 44) / 2,
        marginHorizontal: 3,
        marginBottom: 12,
    },

    // Class Item
    classItem: {
        flex: 1,
    },
    classItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    // ADDED: New styles for the images
    itemIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f3f4f6', // Light gray background for loading
    },
    classInfo: {
        flex: 1,
    },
    classLabel: {
        fontSize: 16,
        fontWeight: '600',
    },
    classCount: {
        fontSize: 12,
        color: '#6b7280',
    },
    classFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    classFooterText: {
        fontSize: 12,
        color: '#9ca3af',
    },

    // Chapter List
    chapterList: {
        gap: 12,
    },
    chapterItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    chapterItemHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    //styles for chapter images
    chapterItemIcon: {
        width: 40,
        height: 40,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#f3f4f6', // Light gray background for loading
    },
    chapterTitle: {
        fontSize: 16,
        fontWeight: '600',
    },
    chapterCount: {
        fontSize: 12,
        color: '#6b7280',
    },

    // PDF List
    pdfList: {
        gap: 12,
    },
    pdfItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    // styles for PDF images
    pdfItemIcon: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 16,
        backgroundColor: '#f3f4f6', // Light gray background for loading
    },
    pdfInfo: {
        flex: 1,
    },
    pdfTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    pdfFileName: {
        fontSize: 12,
        color: '#6b7280',
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
        flexDirection: 'column',
        gap: 8,
    },
    pdfActionButton: {
        padding: 8,
    },

    // Search
    searchContainer: {
        position: 'relative',
        marginBottom: 16,
        borderWidth: 1,
        borderColor: "#374151",
        borderRadius: 8,
    },
    searchInput: {
        paddingLeft: 40,
        paddingRight: 16,
        paddingVertical: 12,
        borderRadius: 8,
        fontSize: 16,
    },
    searchIcon: {
        position: 'absolute',
        left: 12,
        top: 12,
    },

    // Book List
    bookList: {
        gap: 12,
    },
    bookItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    bookThumbnail: {
        width: 64,
        height: 80,
        borderRadius: 8,
        marginRight: 16,
    },
    bookInfo: {
        flex: 1,
    },
    bookTitle: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 4,
    },
    bookAuthor: {
        fontSize: 12,
        color: '#6b7280',
        marginBottom: 4,
    },
    bookGrade: {
        fontSize: 12,
        color: '#9ca3af',
        marginBottom: 8,
    },
    bookMeta: {
        flexDirection: 'row',
        gap: 16,
    },
    bookMetaText: {
        fontSize: 12,
        color: '#9ca3af',
    },
    bookActions: {
        alignItems: 'center',
        gap: 8,
    },
    downloadButton: {
        paddingHorizontal: 12,
        paddingVertical: 4,
    },
    favoriteButton: {
        padding: 4,
    },
});

export default LibraryTab;