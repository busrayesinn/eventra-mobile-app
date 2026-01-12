import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotesScreen from '../screens/Main/Notes/NotesScreen';
import NoteDetailScreen from '../screens/Main/Notes/NotesDetailScreen';

export type NotesStackParamList = {
  Notes: undefined;
  NoteDetail: { note: any };
};

const Stack = createNativeStackNavigator<NotesStackParamList>();

export default function NotesStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Notes"
        component={NotesScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="NoteDetail"
        component={NoteDetailScreen}
        options={{ title: 'Not Detayı' }}
      />
    </Stack.Navigator>
  );
}
