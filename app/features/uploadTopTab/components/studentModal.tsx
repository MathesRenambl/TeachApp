import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
  FlatList,
  TextInput,
  Alert,
} from 'react-native';
import { MaterialIcons as Icon } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

interface Student {
  id: string;
  name: string;
  rollNumber: string;
  email?: string;
  phone?: string;
  avatar?: string;
  attendance: number;
  lastSeen: string;
  performance: 'excellent' | 'good' | 'average' | 'needs_improvement';
}

interface Section {
  id: string;
  name: string;
  students: Student[];
}

interface Class {
  id: string;
  name: string;
  sections: Section[];
  totalStudents: number;
}

interface StudentModalProps {
  visible: boolean;
  onClose: () => void;
  classes?: Class[];
}

// Mock data for demonstration
const mockClasses: Class[] = [
  {
    id: '1',
    name: 'Class 8',
    totalStudents: 84,
    sections: [
      {
        id: '8A',
        name: 'Section A',
        students: [
          {
            id: '1',
            name: 'Aarav Sharma',
            rollNumber: '8A001',
            email: 'aarav@school.edu',
            attendance: 95,
            lastSeen: '2 hours ago',
            performance: 'excellent'
          },
          {
            id: '2',
            name: 'Priya Patel',
            rollNumber: '8A002',
            email: 'priya@school.edu',
            attendance: 88,
            lastSeen: '1 day ago',
            performance: 'good'
          },
          {
            id: '3',
            name: 'Rahul Kumar',
            rollNumber: '8A003',
            email: 'rahul@school.edu',
            attendance: 78,
            lastSeen: '3 hours ago',
            performance: 'average'
          }
        ]
      },
      {
        id: '8B',
        name: 'Section B',
        students: [
          {
            id: '4',
            name: 'Ananya Singh',
            rollNumber: '8B001',
            email: 'ananya@school.edu',
            attendance: 92,
            lastSeen: '5 hours ago',
            performance: 'excellent'
          },
          {
            id: '5',
            name: 'Vikram Joshi',
            rollNumber: '8B002',
            email: 'vikram@school.edu',
            attendance: 85,
            lastSeen: '1 day ago',
            performance: 'good'
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Class 9',
    totalStudents: 76,
    sections: [
      {
        id: '9A',
        name: 'Section A',
        students: [
          {
            id: '6',
            name: 'Kavya Reddy',
            rollNumber: '9A001',
            email: 'kavya@school.edu',
            attendance: 96,
            lastSeen: '1 hour ago',
            performance: 'excellent'
          },
          {
            id: '7',
            name: 'Arjun Gupta',
            rollNumber: '9A002',
            email: 'arjun@school.edu',
            attendance: 82,
            lastSeen: '6 hours ago',
            performance: 'good'
          }
        ]
      }
    ]
  }
];

const StudentModal: React.FC<StudentModalProps> = ({
  visible,
  onClose,
  classes = mockClasses
}) => {
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [selectedSection, setSelectedSection] = useState<Section | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);

  useEffect(() => {
    if (selectedSection) {
      const filtered = selectedSection.students.filter(student =>
        student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.rollNumber.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredStudents(filtered);
    }
  }, [selectedSection, searchQuery]);

  const getPerformanceColor = (performance: Student['performance']) => {
    switch (performance) {
      case 'excellent': return '#43e97b';
      case 'good': return '#4facfe';
      case 'average': return '#f093fb';
      case 'needs_improvement': return '#ff6b6b';
      default: return '#BDC3C7';
    }
  };

  const getPerformanceText = (performance: Student['performance']) => {
    switch (performance) {
      case 'excellent': return 'Excellent';
      case 'good': return 'Good';
      case 'average': return 'Average';
      case 'needs_improvement': return 'Needs Help';
      default: return 'Unknown';
    }
  };

  const renderClassCard = ({ item }: { item: Class }) => (
    <TouchableOpacity
      style={styles.classCard}
      onPress={() => setSelectedClass(item)}
      activeOpacity={0.8}
    >
      <LinearGradient
        colors={['#667eea', '#764ba2']}
        style={styles.classCardGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.classCardHeader}>
          <Icon name="school" size={24} color="#FFFFFF" />
          <Text style={styles.classCardTitle}>{item.name}</Text>
        </View>
        <Text style={styles.classCardCount}>{item.totalStudents} Students</Text>
        <Text style={styles.classCardSections}>
          {item.sections.length} Section{item.sections.length > 1 ? 's' : ''}
        </Text>
      </LinearGradient>
    </TouchableOpacity>
  );

  const renderSectionCard = ({ item }: { item: Section }) => (
    <TouchableOpacity
      style={styles.sectionCard}
      onPress={() => setSelectedSection(item)}
      activeOpacity={0.8}
    >
      <View style={styles.sectionCardContent}>
        <View style={styles.sectionIcon}>
          <Icon name="group" size={20} color="#4facfe" />
        </View>
        <View style={styles.sectionInfo}>
          <Text style={styles.sectionName}>{item.name}</Text>
          <Text style={styles.sectionCount}>{item.students.length} Students</Text>
        </View>
        <Icon name="arrow-forward-ios" size={16} color="#BDC3C7" />
      </View>
    </TouchableOpacity>
  );

  const renderStudentCard = ({ item }: { item: Student }) => (
    <TouchableOpacity
      style={styles.studentCard}
      onPress={() => Alert.alert('Student Details', `Name: ${item.name}\nRoll: ${item.rollNumber}`)}
      activeOpacity={0.8}
    >
      <View style={styles.studentAvatar}>
        <Text style={styles.studentAvatarText}>
          {item.name.split(' ').map(n => n[0]).join('').toUpperCase()}
        </Text>
      </View>
      <View style={styles.studentInfo}>
        <Text style={styles.studentName}>{item.name}</Text>
        <Text style={styles.studentRoll}>Roll: {item.rollNumber}</Text>
        <View style={styles.studentMeta}>
          <View style={styles.attendanceContainer}>
            <Icon name="schedule" size={12} color="#7F8C8D" />
            <Text style={styles.attendanceText}>{item.attendance}% Attendance</Text>
          </View>
          <View style={[
            styles.performanceChip,
            { backgroundColor: `${getPerformanceColor(item.performance)}15` }
          ]}>
            <Text style={[
              styles.performanceText,
              { color: getPerformanceColor(item.performance) }
            ]}>
              {getPerformanceText(item.performance)}
            </Text>
          </View>
        </View>
        <Text style={styles.lastSeen}>Last seen: {item.lastSeen}</Text>
      </View>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        {selectedClass && (
          <TouchableOpacity
            onPress={() => {
              if (selectedSection) {
                setSelectedSection(null);
              } else {
                setSelectedClass(null);
              }
              setSearchQuery('');
            }}
            style={styles.backButton}
          >
            <Icon name="arrow-back" size={24} color="#2C3E50" />
          </TouchableOpacity>
        )}
        <Text style={styles.headerTitle}>
          {!selectedClass
            ? 'All Classes'
            : !selectedSection
            ? selectedClass.name
            : `${selectedClass.name} - ${selectedSection.name}`
          }
        </Text>
      </View>
      <TouchableOpacity onPress={onClose} style={styles.closeButton}>
        <Icon name="close" size={24} color="#2C3E50" />
      </TouchableOpacity>
    </View>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {renderHeader()}
        
        {/* Search Bar - Only show when viewing students */}
        {selectedSection && (
          <View style={styles.searchContainer}>
            <Icon name="search" size={20} color="#7F8C8D" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search students..."
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
        )}

        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {!selectedClass ? (
            // Class List View
            <View>
              <Text style={styles.sectionTitle}>Select a Class</Text>
              <FlatList
                data={classes}
                renderItem={renderClassCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          ) : !selectedSection ? (
            // Section List View
            <View>
              <Text style={styles.sectionTitle}>Sections in {selectedClass.name}</Text>
              <FlatList
                data={selectedClass.sections}
                renderItem={renderSectionCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
              />
            </View>
          ) : (
            // Student List View
            <View>
              <Text style={styles.sectionTitle}>
                Students in {selectedClass.name} - {selectedSection.name}
              </Text>
              <Text style={styles.studentCount}>
                {filteredStudents.length} of {selectedSection.students.length} students
              </Text>
              <FlatList
                data={filteredStudents}
                renderItem={renderStudentCard}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ paddingBottom: 20 }}
              />
            </View>
          )}
        </ScrollView>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: width * 0.04,
    paddingTop: height * 0.06,
    paddingBottom: height * 0.02,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  backButton: {
    marginRight: width * 0.03,
    padding: 8,
  },
  headerTitle: {
    fontSize: width * 0.05,
    fontWeight: '700',
    color: '#2C3E50',
  },
  closeButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: width * 0.04,
    marginTop: height * 0.02,
    marginBottom: height * 0.01,
    paddingHorizontal: width * 0.04,
    paddingVertical: height * 0.015,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: width * 0.03,
    fontSize: width * 0.04,
    color: '#2C3E50',
  },
  content: {
    flex: 1,
    paddingHorizontal: width * 0.04,
  },
  sectionTitle: {
    fontSize: width * 0.045,
    fontWeight: '600',
    color: '#2C3E50',
    marginTop: height * 0.02,
    marginBottom: height * 0.015,
  },
  studentCount: {
    fontSize: width * 0.035,
    color: '#7F8C8D',
    marginBottom: height * 0.02,
  },

  // Class Cards
  classCard: {
    marginBottom: height * 0.015,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  classCardGradient: {
    padding: width * 0.05,
    minHeight: height * 0.12,
  },
  classCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: height * 0.01,
  },
  classCardTitle: {
    fontSize: width * 0.045,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: width * 0.03,
  },
  classCardCount: {
    fontSize: width * 0.06,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  classCardSections: {
    fontSize: width * 0.035,
    color: 'rgba(255, 255, 255, 0.8)',
  },

  // Section Cards
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: height * 0.012,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  sectionCardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: width * 0.04,
  },
  sectionIcon: {
    width: width * 0.1,
    height: width * 0.1,
    backgroundColor: '#4facfe15',
    borderRadius: width * 0.05,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.03,
  },
  sectionInfo: {
    flex: 1,
  },
  sectionName: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  sectionCount: {
    fontSize: width * 0.032,
    color: '#7F8C8D',
  },

  // Student Cards
  studentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: height * 0.012,
    padding: width * 0.04,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  studentAvatar: {
    width: width * 0.12,
    height: width * 0.12,
    backgroundColor: '#667eea',
    borderRadius: width * 0.06,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: width * 0.03,
  },
  studentAvatarText: {
    fontSize: width * 0.035,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  studentInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: width * 0.04,
    fontWeight: '600',
    color: '#2C3E50',
    marginBottom: 2,
  },
  studentRoll: {
    fontSize: width * 0.032,
    color: '#7F8C8D',
    marginBottom: height * 0.008,
  },
  studentMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: height * 0.006,
  },
  attendanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  attendanceText: {
    fontSize: width * 0.028,
    color: '#7F8C8D',
    marginLeft: 4,
  },
  performanceChip: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  performanceText: {
    fontSize: width * 0.028,
    fontWeight: '500',
  },
  lastSeen: {
    fontSize: width * 0.028,
    color: '#BDC3C7',
  },
});

export default StudentModal;