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
} from 'lucide-react-native';

const { width } = Dimensions.get('window');

// Helper function for responsive sizing
const scale = (size: number) => (width / 375) * size;

// Data Types
interface ContentTags {
  standard: string;
  subject: string;
  chapter: string;
  language: string;
}

interface PdfFile {
  id: string;
  fileName: string;
  tags: ContentTags;
  type: string;
  size: string;
  uploadDate: string;
}

// Mock PDF Data (same as before)
const mockPdfData: PdfFile[] = [
  {
    id: '1',
    fileName: 'Algebra_Chapter_1_Notes.pdf',
    tags: { standard: 'Class 10', subject: 'Mathematics', chapter: 'Algebra', language: 'English' },
    type: 'pdf',
    size: '1.2 MB',
    uploadDate: '2024-05-20',
  },
  {
    id: '2',
    fileName: 'Algebra_Practice_Problems.pdf',
    tags: { standard: 'Class 10', subject: 'Mathematics', chapter: 'Algebra', language: 'English' },
    type: 'pdf',
    size: '0.8 MB',
    uploadDate: '2024-05-18',
  },
  {
    id: '3',
    fileName: 'Geometry_Theorems.pdf',
    tags: { standard: 'Class 10', subject: 'Mathematics', chapter: 'Geometry', language: 'English' },
    type: 'pdf',
    size: '2.5 MB',
    uploadDate: '2024-05-15',
  },
  {
    id: '4',
    fileName: 'Physics_Waves_in_Tamil.pdf',
    tags: { standard: 'Class 12', subject: 'Physics', chapter: 'Waves', language: 'Tamil' },
    type: 'pdf',
    size: '1.8 MB',
    uploadDate: '2024-05-10',
  },
  {
    id: '5',
    fileName: 'Physics_Thermodynamics_Notes.pdf',
    tags: { standard: 'Class 12', subject: 'Physics', chapter: 'Thermodynamics', language: 'English' },
    type: 'pdf',
    size: '3.1 MB',
    uploadDate: '2024-05-08',
  },
  {
    id: '6',
    fileName: 'History_Ancient_Civilizations.pdf',
    tags: { standard: 'Class 8', subject: 'Social Studies', chapter: 'History', language: 'English' },
    type: 'pdf',
    size: '1.5 MB',
    uploadDate: '2024-05-05',
  },
  {
    id: '7',
    fileName: 'History_Ancient_Civilizations_Tamil.pdf',
    tags: { standard: 'Class 8', subject: 'Social Studies', chapter: 'History', language: 'Tamil' },
    type: 'pdf',
    size: '1.6 MB',
    uploadDate: '2024-05-04',
  },
];

const LibraryTab: React.FC = () => {
  const [selectedStandard, setSelectedStandard] = useState<string>('');
  const [selectedSubject, setSelectedSubject] = useState<string>('');
  const [selectedChapter, setSelectedChapter] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');

  const availableStandards = [...new Set(mockPdfData.map(item => item.tags.standard))].sort();

  const availableSubjects = selectedStandard
    ? [...new Set(mockPdfData.filter(item => item.tags.standard === selectedStandard).map(item => item.tags.subject))].sort()
    : [];

  const availableChapters = selectedSubject
    ? [...new Set(mockPdfData.filter(item => item.tags.standard === selectedStandard && item.tags.subject === selectedSubject).map(item => item.tags.chapter))].sort()
    : [];

  const availableLanguages = selectedChapter
    ? [...new Set(mockPdfData.filter(item => item.tags.standard === selectedStandard && item.tags.subject === selectedSubject && item.tags.chapter === selectedChapter).map(item => item.tags.language))].sort()
    : [];
  
  const filteredPdfs = selectedLanguage
    ? mockPdfData.filter(item => 
        item.tags.standard === selectedStandard && 
        item.tags.subject === selectedSubject && 
        item.tags.chapter === selectedChapter && 
        item.tags.language === selectedLanguage
      )
    : [];

  // Reset selections
  const resetSubject = () => {
    setSelectedSubject('');
    setSelectedChapter('');
    setSelectedLanguage('');
  };

  const resetChapter = () => {
    setSelectedChapter('');
    setSelectedLanguage('');
  };
  
  const resetLanguage = () => {
    setSelectedLanguage('');
  };

  const renderContent = () => {
    if (!selectedStandard) {
      return (
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>Select a Standard/Class</Text>
          <View style={styles.grid}>
            {availableStandards.map((standard) => (
              <TouchableOpacity
                key={standard}
                style={[styles.selectionButton, selectedStandard === standard && styles.selectedButton]}
                onPress={() => setSelectedStandard(standard)}
              >
                <Text style={styles.buttonText}>{standard}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } else if (!selectedSubject) {
      return (
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>Select a Subject</Text>
          <View style={styles.grid}>
            {availableSubjects.map((subject) => (
              <TouchableOpacity
                key={subject}
                style={[styles.selectionButton, selectedSubject === subject && styles.selectedButton]}
                onPress={() => setSelectedSubject(subject)}
              >
                <Text style={styles.buttonText}>{subject}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } else if (!selectedChapter) {
      return (
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>Select a Chapter</Text>
          <View style={styles.grid}>
            {availableChapters.map((chapter) => (
              <TouchableOpacity
                key={chapter}
                style={[styles.selectionButton, selectedChapter === chapter && styles.selectedButton]}
                onPress={() => setSelectedChapter(chapter)}
              >
                <Text style={styles.buttonText}>{chapter}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } else if (!selectedLanguage) {
      return (
        <View style={styles.selectionSection}>
          <Text style={styles.sectionTitle}>Select a Language</Text>
          <View style={styles.grid}>
            {availableLanguages.map((language) => (
              <TouchableOpacity
                key={language}
                style={[styles.selectionButton, selectedLanguage === language && styles.selectedButton]}
                onPress={() => setSelectedLanguage(language)}
              >
                <Text style={styles.buttonText}>{language}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      );
    } else {
      const libraryFiles = filteredPdfs;
      if (libraryFiles.length === 0) {
        return (
          <View style={styles.emptyState}>
            <FolderOpen size={width * 0.16} color="#B0BEC5" />
            <Text style={styles.emptyStateTitle}>No Files Found</Text>
            <Text style={styles.emptyStateDescription}>
              There are no documents that match your selection.
            </Text>
          </View>
        );
      } else {
        return (
          <ScrollView
            style={styles.tabContent}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.filesSection}>
              <Text style={styles.sectionTitle}>Available Documents ({libraryFiles.length})</Text>
              {libraryFiles.map(file => (
                <View key={file.id} style={styles.fileItem}>
                  <View style={styles.fileIcon}>
                    <FileText size={24} color="#D32F2F" />
                  </View>
                  <View style={styles.fileInfo}>
                    <Text style={styles.fileName}>{file.fileName}</Text>
                    <View style={styles.fileDetails}>
                      <Text style={styles.fileSize}>{file.size}</Text>
                      <Text style={styles.fileDot}>•</Text>
                      <Text style={styles.fileDate}>{file.uploadDate}</Text>
                    </View>
                  </View>
                  <TouchableOpacity style={styles.downloadButton}>
                    <Download size={20} color="#1976D2" />
                  </TouchableOpacity>
                </View>
              ))}
            </View>
          </ScrollView>
        );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <Text style={styles.mainTitle}>Content Library</Text>
      </View>
      <View style={styles.mainContainer}>
        {/* Breadcrumb Navigation */}
        <View style={styles.breadcrumb}>
          <TouchableOpacity onPress={() => { setSelectedStandard(''); resetSubject(); }}>
            <Text style={!selectedStandard ? styles.breadcrumbActiveText : styles.breadcrumbText}>Standards</Text>
          </TouchableOpacity>
          {selectedStandard && (
            <>
              <ChevronRight size={scale(16)} color="#B0BEC5" />
              <TouchableOpacity onPress={resetSubject}>
                <Text style={!selectedSubject ? styles.breadcrumbActiveText : styles.breadcrumbText}>{selectedStandard}</Text>
              </TouchableOpacity>
            </>
          )}
          {selectedSubject && (
            <>
              <ChevronRight size={scale(16)} color="#B0BEC5" />
              <TouchableOpacity onPress={resetChapter}>
                <Text style={!selectedChapter ? styles.breadcrumbActiveText : styles.breadcrumbText}>{selectedSubject}</Text>
              </TouchableOpacity>
            </>
          )}
          {selectedChapter && (
            <>
              <ChevronRight size={scale(16)} color="#B0BEC5" />
              <TouchableOpacity onPress={resetLanguage}>
                <Text style={!selectedLanguage ? styles.breadcrumbActiveText : styles.breadcrumbText}>{selectedChapter}</Text>
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
  safeArea: {
    flex: 1,
    backgroundColor: '#ECEFF1',
  },
  header: {
    paddingVertical: 20,
    paddingHorizontal: width * 0.05,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#CFD8DC',
  },
  mainTitle: {
    fontSize: scale(24),
    fontWeight: 'bold',
    color: '#263238',
  },
  mainContainer: {
    flex: 1,
    paddingHorizontal: width * 0.05,
    paddingTop: 20,
  },
  breadcrumb: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: scale(20),
    flexWrap: 'wrap',
  },
  breadcrumbText: {
    fontSize: scale(14),
    fontWeight: '500',
    color: '#78909C',
  },
  breadcrumbActiveText: {
    fontSize: scale(14),
    fontWeight: 'bold',
    color: '#1976D2',
  },
  selectionSection: {
    marginBottom: scale(20),
  },
  sectionTitle: {
    fontSize: scale(18),
    fontWeight: '600',
    color: '#263238',
    marginBottom: scale(16),
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  selectionButton: {
    width: '48%',
    marginBottom: scale(12),
    padding: scale(18),
    borderRadius: scale(10),
    borderWidth: 1,
    borderColor: '#CFD8DC',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  selectedButton: {
    borderColor: '#1976D2',
    backgroundColor: '#E3F2FD',
  },
  buttonText: {
    fontSize: scale(16),
    fontWeight: '600',
    color: '#455A64',
    textAlign: 'center',
  },
  tabContent: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 50,
  },
  emptyStateTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#546E7A',
    marginTop: 15,
  },
  emptyStateDescription: {
    fontSize: 14,
    textAlign: 'center',
    color: '#90A4AE',
    marginTop: 5,
    paddingHorizontal: 30,
  },
  filesSection: {
    marginTop: 10,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 18,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  fileIcon: {
    marginRight: 15,
  },
  fileInfo: {
    flex: 1,
  },
  fileName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#37474F',
  },
  fileDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  fileSize: {
    fontSize: 12,
    color: '#78909C',
  },
  fileDot: {
    fontSize: 12,
    color: '#78909C',
    marginHorizontal: 5,
  },
  fileDate: {
    fontSize: 12,
    color: '#78909C',
  },
  downloadButton: {
    padding: 5,
  },
});

export default LibraryTab;