import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import TeacherApp from './TeacherApp';
// import ExamApp from './ExamApp';

export default function App() {
  return (
  //  <ExamApp/>
  <TeacherApp/>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
