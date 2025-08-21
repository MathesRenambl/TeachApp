export type RootStackParamList = {
  TeacherApp: undefined;
  MatchTheFollowing : undefined;
  TestCustomizer: undefined;
  ExamApp: undefined;
  Assessment: undefined;
  Library:undefined;
  CustomizerAssessment : undefined;
  Home : undefined;
};

// File types
export interface UploadedFile {
    id: string;
    name: string;
    type: 'pdf' | 'image';
    size: string;
    uploadDate: string;
    status: 'processing' | 'completed' | 'failed';
    tags: {
        standard: string;
        subject: string;
        chapter: string;
        language: string;
    };
}

// Tag types
export interface TagOptions {
    standards: string[];
    subjects: string[];
    chapters: string[];
    languages: string[];
}

export interface TagSelection {
    standard: string;
    subject: string;
    chapter: string;
    language: string;
}

// Modal types
export interface TagModalState {
    visible: boolean;
    uploadType: 'pdf' | 'image' | null;
}

// Assessment types
export interface AssessmentCreationState {
    showSlider: boolean;
    selectedStandard: string;
    selectedSubject: string;
    selectedChapter: string;
    showAssessmentOptions: boolean;
}

// Tab types
export type TabType = 'upload' | 'library' | 'assessment';

// Component Props
export interface UploadProps {
    onFilesProcessed?: (files: UploadedFile[]) => void;
}

export interface LibraryProps {
    libraryFiles?: UploadedFile[];
    onFileSelect?: (file: UploadedFile) => void;
}

export interface AssessmentProps {
    onNavigateToAssessment?: () => void;
}