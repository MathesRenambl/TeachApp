import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Dimensions,
} from 'react-native';
import {
  ChevronRight,
  FileText,
  Download,
  FolderOpen,
  BookOpen,
  GraduationCap,
  Notebook,
  Globe,
  Languages, 
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Helper function for responsive sizing
const scale = (size: number) => (width / 375) * size;

// Data Types
interface ContentTags {
  curriculum: string;
  language?: string; // optional tag
  standard: string;
  subject: string;
  chapter: string;
}

interface PdfFile {
  id: string;
  fileName: string;
  tags: ContentTags;
  type: string;
  size: string;
  uploadDate: string;
}

// Mock PDF Data with "language" tag for State Board
const mockPdfData: PdfFile[] = [
  {
    id: '1',
    fileName: 'Algebra_Chapter_1_Notes.pdf',
    tags: { curriculum: 'State Board', language: 'English', standard: 'Class 10', subject: 'Mathematics', chapter: 'Algebra' },
    type: 'pdf',
    size: '1.2 MB',
    uploadDate: '2024-05-20',
  },
  {
    id: '2',
    fileName: 'இயற்கணிதம்_பாடம்_1_குறிப்புகள்.pdf',
    tags: { curriculum: 'State Board', language: 'Tamil', standard: 'Class 10', subject: 'Mathematics', chapter: 'Algebra' },
    type: 'pdf',
    size: '1.5 MB',
    uploadDate: '2024-05-21',
  },
  {
    id: '3',
    fileName: 'Geometry_Theorems.pdf',
    tags: { curriculum: 'CBSE', standard: 'Class 10', subject: 'Mathematics', chapter: 'Geometry' },
    type: 'pdf',
    size: '2.5 MB',
    uploadDate: '2024-05-15',
  },
  {
    id: '4',
    fileName: 'Physics_Waves_CBSE.pdf',
    tags: { curriculum: 'CBSE', standard: 'Class 12', subject: 'Physics', chapter: 'Waves' },
    type: 'pdf',
    size: '1.8 MB',
    uploadDate: '2024-05-10',
  },
  {
    id: '5',
    fileName: 'Thermodynamics_State_Board.pdf',
    tags: { curriculum: 'State Board', language: 'English', standard: 'Class 12', subject: 'Physics', chapter: 'Thermodynamics' },
    type: 'pdf',
    size: '3.1 MB',
    uploadDate: '2024-05-08',
  },
   {
    id: '6',
    fileName: 'வெப்ப இயக்கவியல்_குறிப்புகள்.pdf',
    tags: { curriculum: 'State Board', language: 'Tamil', standard: 'Class 12', subject: 'Physics', chapter: 'Thermodynamics' },
    type: 'pdf',
    size: '3.5 MB',
    uploadDate: '2024-05-09',
  },
  {
    id: '7',
    fileName: 'Ancient_Civilizations_History.pdf',
    tags: { curriculum: 'CBSE', standard: 'Class 8', subject: 'Social Studies', chapter: 'Ancient Civilizations' },
    type: 'pdf',
    size: '1.5 MB',
    uploadDate: '2024-05-05',
  },
  {
    id: '8',
    fileName: 'Ancient_Civilizations_State_Board.pdf',
    tags: { curriculum: 'State Board', language: 'English', standard: 'Class 8', subject: 'Social Studies', chapter: 'Ancient Civilizations' },
    type: 'pdf',
    size: '1.6 MB',
    uploadDate: '2024-05-04',
  },
];


const LibraryTab: React.FC = () => {
  const [selectedCurriculum, setSelectedCurriculum] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [selectedStandard, setSelectedStandard] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');

  // --- Reset Functions ---
  const resetAllSelections = () => {
    setSelectedCurriculum('');
    setSelectedLanguage('');
    setSelectedStandard('');
    setSelectedSubject('');
    setSelectedChapter('');
  };

  const resetFromLanguage = () => {
    setSelectedLanguage('');
    setSelectedStandard('');
    setSelectedSubject('');
    setSelectedChapter('');
  };
  
  const resetFromStandard = () => {
    setSelectedStandard('');
    setSelectedSubject('');
    setSelectedChapter('');
  };

  const resetFromSubject = () => {
    setSelectedSubject('');
    setSelectedChapter('');
  };

  const resetFromChapter = () => {
    setSelectedChapter('');
  };

  // --- Data Filtering Logic ---
  const availableCurriculums = [...new Set(mockPdfData.map(item => item.tags.curriculum))].sort();

  const filesAfterCurriculum = selectedCurriculum
    ? mockPdfData.filter(item => item.tags.curriculum === selectedCurriculum)
    : [];
  
  // For State Board, available languages are static. For others, this step is skipped.
  const availableLanguages = ['English', 'Tamil'];

  const filesAfterLanguage = selectedCurriculum === 'State Board'
    ? filesAfterCurriculum.filter(item => item.tags.language === selectedLanguage)
    : filesAfterCurriculum;

  const availableStandards = selectedCurriculum
    ? [...new Set(filesAfterLanguage.map(item => item.tags.standard))].sort()
    : [];

  const filesAfterStandard = selectedStandard
    ? filesAfterLanguage.filter(item => item.tags.standard === selectedStandard)
    : filesAfterLanguage;

  const availableSubjects = selectedStandard
    ? [...new Set(filesAfterStandard.map(item => item.tags.subject))].sort()
    : [];

  const filesAfterSubject = selectedSubject
    ? filesAfterStandard.filter(item => item.tags.subject === selectedSubject)
    : filesAfterStandard;

  const availableChapters = selectedSubject
    ? [...new Set(filesAfterSubject.map(item => item.tags.chapter))].sort()
    : [];
  
  const filteredPdfs = selectedChapter ? filesAfterSubject.filter(item => item.tags.chapter === selectedChapter) : [];

  // Get subject color based on subject name
  const getSubjectColor = (subject: string) => {
    const colors = {
      'Mathematics': '#6366F1',
      'Physics': '#10B981',
      'Social Studies': '#F59E0B',
      'Chemistry': '#EF4444',
      'Biology': '#8B5CF6',
      'English': '#06B6D4',
    };
    return colors[subject] || '#6B7280';
  };

  const renderContent = () => {
    if (!selectedCurriculum) {
      return (
        <View style={styles.selectionSection}>
          <View style={styles.sectionHeader}>
            <Globe size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Choose Your Curriculum</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select a curriculum to begin</Text>
          <View style={styles.grid}>
            {availableCurriculums.map((curriculum) => (
              <TouchableOpacity
                key={curriculum}
                style={styles.selectionButton}
                onPress={() => setSelectedCurriculum(curriculum)}
              >
                <View style={styles.buttonIcon}>
                  <Text style={styles.buttonIconText}>{curriculum.substring(0, 2).toUpperCase()}</Text>
                </View>
                <Text style={styles.buttonText}>{curriculum}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } 
    
    if (selectedCurriculum === 'State Board' && !selectedLanguage) {
      return (
        <View style={styles.selectionSection}>
          <View style={styles.sectionHeader}>
            <Languages size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Choose Language</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select the medium of instruction</Text>
          <View style={styles.grid}>
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language}
                style={styles.selectionButton}
                onPress={() => setSelectedLanguage(language)}
              >
                <View style={[styles.buttonIcon, {backgroundColor: '#EF4444'}]}>
                   <Text style={styles.buttonIconText}>{language.substring(0, 2)}</Text>
                </View>
                <Text style={styles.buttonText}>{language}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    }
    
    if (!selectedStandard) {
      return (
        <View style={styles.selectionSection}>
          <View style={styles.sectionHeader}>
            <GraduationCap size={24} color="#4A90E2" />
            <Text style={styles.sectionTitle}>Choose Your Class</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select your standard to find materials</Text>
          <View style={styles.grid}>
            {availableStandards.map((standard) => (
              <TouchableOpacity
                key={standard}
                style={styles.selectionButton}
                onPress={() => setSelectedStandard(standard)}
              >
                <View style={styles.buttonIcon}>
                  <Text style={styles.buttonIconText}>{standard.split(' ')[1]}</Text>
                </View>
                <Text style={styles.buttonText}>{standard}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } 
    
    if (!selectedSubject) {
      return (
        <View style={styles.selectionSection}>
          <View style={styles.sectionHeader}>
            <BookOpen size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Select Subject</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Pick a subject to continue</Text>
          <View style={styles.grid}>
            {availableSubjects.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[styles.subjectButton, { borderLeftColor: getSubjectColor(subject) }]}
                onPress={() => setSelectedSubject(subject)}
              >
                <View style={[styles.subjectIcon, { backgroundColor: getSubjectColor(subject) }]}>
                  <Text style={styles.subjectIconText}>{subject[0]}</Text>
                </View>
                <View style={styles.subjectInfo}>
                  <Text style={styles.subjectText}>{subject}</Text>
                  <Text style={styles.subjectDescription}>
                    {subject === 'Mathematics' ? 'Numbers, Algebra & Geometry' :
                     subject === 'Physics' ? 'Motion, Energy & Waves' :
                     subject === 'Social Studies' ? 'History, Geography & Civics' : 'Study Materials'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } 
    
    if (!selectedChapter) {
      return (
        <View style={styles.selectionSection}>
          <View style={styles.sectionHeader}>
            <FileText size={24} color="#4F46E5" />
            <Text style={styles.sectionTitle}>Choose Chapter</Text>
          </View>
          <Text style={styles.sectionSubtitle}>Select a chapter to explore</Text>
          <View style={styles.grid}>
            {availableChapters.map((chapter, index) => (
              <TouchableOpacity
                key={chapter}
                style={styles.chapterButton}
                onPress={() => setSelectedChapter(chapter)}
              >
                <View style={[styles.chapterIcon, { backgroundColor: getSubjectColor(selectedSubject) }]}>
                  <Text style={styles.chapterNumber}>{index + 1}</Text>
                </View>
                <Text style={styles.chapterText}>{chapter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } 
      
    // --- Render File List ---
    const libraryFiles = filteredPdfs;
    if (libraryFiles.length === 0) {
      return (
        <View style={styles.emptyState}>
          <View style={styles.emptyStateIcon}><FolderOpen size={width * 0.12} color="#9CA3AF" /></View>
          <Text style={styles.emptyStateTitle}>No Documents Found</Text>
          <Text style={styles.emptyStateDescription}>There are no materials for this selection. Please try a different combination.</Text>
        </View>
      );
    } else {
      return (
        <ScrollView style={styles.tabContent} contentContainerStyle={styles.scrollContent}>
          <View style={styles.filesSection}>
            <View style={styles.filesSectionHeader}>
              <View style={styles.sectionHeader}>
                <FileText size={24} color="#4F46E5" />
                <Text style={styles.sectionTitle}>Study Materials</Text>
              </View>
              <View style={styles.filesCount}><Text style={styles.filesCountText}>{libraryFiles.length} files</Text></View>
            </View>
            {libraryFiles.map((file, index) => (
              <View key={file.id} style={[styles.fileItem, { backgroundColor: index % 2 === 0 ? '#FFFFFF' : '#F8FAFC' }]}>
                <View style={[styles.fileIcon, { backgroundColor: getSubjectColor(selectedSubject) + '20' }]}>
                  <FileText size={24} color={getSubjectColor(selectedSubject)} />
                </View>
                <View style={styles.fileInfo}>
                  <Text style={styles.fileName} numberOfLines={2}>{file.fileName}</Text>
                  <View style={styles.fileDetails}>
                    <View style={styles.fileMeta}>
                      <Text style={styles.fileSize}>{file.size}</Text>
                      <Text style={styles.fileDot}>•</Text>
                      <Text style={styles.fileDate}>{file.uploadDate}</Text>
                    </View>
                    <View style={[styles.fileTypeTag, { backgroundColor: getSubjectColor(selectedSubject) }]}><Text style={styles.fileTypeText}>PDF</Text></View>
                  </View>
                </View>
                <TouchableOpacity style={styles.downloadButton}><Download size={22} color="#4F46E5" /></TouchableOpacity>
              </View>
            ))}
          </View>
        </ScrollView>
      );
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View >
        <View style={styles.headerContent}>
          <Text style={styles.mainTitle}><Notebook size={24} color="#4A90E2" /> Study Hub</Text>
          <Text style={styles.mainSubtitle}>Discover your learning materials</Text>
        </View>
      </View>
      <View style={styles.mainContainer}>
        {/* --- Enhanced Breadcrumb Navigation --- */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity style={styles.breadcrumbItem} onPress={resetAllSelections}>
            <Text style={!selectedCurriculum ? styles.breadcrumbActiveText : styles.breadcrumbText}>Curriculum</Text>
          </TouchableOpacity>

          {selectedCurriculum && (
            <>
              <ChevronRight size={scale(14)} color="#9CA3AF" />
              <TouchableOpacity style={styles.breadcrumbItem} onPress={resetFromLanguage}>
                <Text style={!selectedStandard && !(selectedCurriculum === 'State Board' && !selectedLanguage) ? styles.breadcrumbActiveText : styles.breadcrumbText}>
                  {selectedCurriculum}
                </Text>
              </TouchableOpacity>
            </>
          )}

          {selectedCurriculum === 'State Board' && selectedLanguage && (
             <>
              <ChevronRight size={scale(14)} color="#9CA3AF" />
              <TouchableOpacity style={styles.breadcrumbItem} onPress={resetFromStandard}>
                <Text style={!selectedStandard ? styles.breadcrumbActiveText : styles.breadcrumbText}>{selectedLanguage}</Text>
              </TouchableOpacity>
            </>
          )}

          {selectedStandard && (
            <>
              <ChevronRight size={scale(14)} color="#9CA3AF" />
              <TouchableOpacity style={styles.breadcrumbItem} onPress={resetFromSubject}>
                <Text style={!selectedSubject ? styles.breadcrumbActiveText : styles.breadcrumbText}>{selectedStandard}</Text>
              </TouchableOpacity>
            </>
          )}

          {selectedSubject && (
            <>
              <ChevronRight size={scale(14)} color="#9CA3AF" />
              <TouchableOpacity style={styles.breadcrumbItem} onPress={resetFromChapter}>
                <Text style={!selectedChapter ? styles.breadcrumbActiveText : styles.breadcrumbText}>{selectedSubject}</Text>
              </TouchableOpacity>
            </>
          )}

           {selectedChapter && (
            <>
              <ChevronRight size={scale(14)} color="#9CA3AF" />
              <TouchableOpacity style={styles.breadcrumbItem}>
                <Text style={styles.breadcrumbActiveText}>{selectedChapter}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
        {renderContent()}
      </View>
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#F8FAFC' },
  header: {
    paddingVertical: scale(24),
    paddingHorizontal: width * 0.05,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: { alignItems: 'center' },
  mainTitle: { fontSize: scale(24), fontWeight: '700', color: '#1F2937', marginBottom: scale(4) },
  mainSubtitle: { fontSize: scale(14), color: '#6B7280', fontWeight: '500' },
  mainContainer: { flex: 1, paddingHorizontal: width * 0.05, paddingTop: scale(20) },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(24),
    flexWrap: 'wrap',
    paddingHorizontal: scale(8),
    paddingVertical: scale(8),
  },
  breadcrumbItem: { paddingHorizontal: scale(4), paddingVertical: scale(2) },
  breadcrumbText: { fontSize: scale(14), fontWeight: '500', color: '#6B7280' },
  breadcrumbActiveText: { fontSize: scale(14), fontWeight: '700', color: '#4A90E2' },
  selectionSection: { flex: 1 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: scale(8) },
  sectionTitle: { fontSize: scale(22), fontWeight: '700', color: '#1F2937', marginLeft: scale(8) },
  sectionSubtitle: { fontSize: scale(16), color: '#6B7280', marginBottom: scale(24), fontWeight: '500' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  selectionButton: {
    width: '48%',
    marginBottom: scale(16),
    padding: scale(20),
    borderRadius: scale(16),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  buttonIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    backgroundColor: '#4A90E2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(12),
  },
  buttonIconText: { fontSize: scale(20), fontWeight: '700', color: '#FFFFFF' },
  buttonText: { fontSize: scale(16), fontWeight: '600', color: '#374151', textAlign: 'center' },
  subjectButton: {
    width: '100%',
    marginBottom: scale(12),
    padding: scale(20),
    borderRadius: scale(16),
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderLeftWidth: 4,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  subjectIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(24),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  subjectIconText: { fontSize: scale(20), fontWeight: '700', color: '#FFFFFF' },
  subjectInfo: { flex: 1 },
  subjectText: { fontSize: scale(18), fontWeight: '600', color: '#374151', marginBottom: scale(4) },
  subjectDescription: { fontSize: scale(14), color: '#6B7280' },
  // --- IMPROVED CHAPTER STYLES ---
  chapterButton: {
    width: '48%',
    marginBottom: scale(16),
    paddingVertical: scale(16),
    paddingHorizontal: scale(8),
    borderRadius: scale(14),
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: scale(130), // Slightly increased minHeight
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  chapterIcon: {
    width: scale(40),
    height: scale(40),
    borderRadius: scale(20),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(12), // Added margin to space icon and text
  },
  chapterNumber: { fontSize: scale(16), fontWeight: '700', color: '#FFFFFF' },
  chapterText: {
    fontSize: scale(14), // Reduced font size for better fit
    fontWeight: '600',
    color: '#374151',
    textAlign: 'center',
    lineHeight: scale(18), // Adjusted line height for wrapping
    flexShrink: 1, // Ensure text wraps inside the container
  },
  // --- END OF IMPROVED STYLES ---
  tabContent: { flex: 1 },
  scrollContent: { paddingBottom: scale(24) },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: scale(20),
  },
  emptyStateIcon: {
    width: scale(96),
    height: scale(96),
    borderRadius: scale(48),
    backgroundColor: '#F3F4F6',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: scale(24),
  },
  emptyStateTitle: { fontSize: scale(22), fontWeight: '700', color: '#374151', marginBottom: scale(8) },
  emptyStateDescription: {
    fontSize: scale(16),
    textAlign: 'center',
    color: '#6B7280',
    paddingHorizontal: scale(32),
    lineHeight: scale(24),
  },
  filesSection: { flex: 1 },
  filesSectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: scale(20),
  },
  filesCount: {
    backgroundColor: '#4A90E2',
    paddingHorizontal: scale(12),
    paddingVertical: scale(6),
    borderRadius: scale(20),
  },
  filesCountText: { fontSize: scale(12), fontWeight: '600', color: '#FFFFFF' },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: scale(20),
    borderRadius: scale(16),
    marginBottom: scale(12),
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  fileIcon: {
    width: scale(48),
    height: scale(48),
    borderRadius: scale(12),
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: scale(16),
  },
  fileInfo: { flex: 1 },
  fileName: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#1F2937',
    marginBottom: scale(8),
    lineHeight: scale(22),
  },
  fileDetails: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fileMeta: { flexDirection: 'row', alignItems: 'center' },
  fileSize: { fontSize: scale(13), color: '#6B7280', fontWeight: '500' },
  fileDot: { fontSize: scale(13), color: '#6B7280', marginHorizontal: scale(6) },
  fileDate: { fontSize: scale(13), color: '#6B7280', fontWeight: '500' },
  fileTypeTag: { paddingHorizontal: scale(8), paddingVertical: scale(4), borderRadius: scale(6) },
  fileTypeText: { fontSize: scale(10), fontWeight: '700', color: '#FFFFFF' },
  downloadButton: {
    padding: scale(12),
    borderRadius: scale(10),
    backgroundColor: '#EEF2FF',
    marginLeft: scale(12),
  },
});

export default LibraryTab;