import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';
import { useState } from 'react';
import Navigation from './Screens/Navigation';

export default function App() {
  const [authed, setAuthed] = useState(true);

  if (authed)
    return <Navigation></Navigation>
 
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
