/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { addNote, getNotes } from '../../../storage/appStorage';

export default function NotesScreen() {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    getNotes().then(setNotes);
  }, []);

  const handleAdd = async () => {
    if (!note.trim()) return;
    const updated = await addNote(note);
    setNotes(updated);
    setNote('');
  };

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24 }}>Notlarım 📝</Text>

      <TextInput placeholder="Yeni not" value={note} onChangeText={setNote} />

      <TouchableOpacity onPress={handleAdd}>
        <Text>Ekle</Text>
      </TouchableOpacity>

      <FlatList data={notes} renderItem={({ item }) => <Text>• {item}</Text>} />
    </View>
  );
}
