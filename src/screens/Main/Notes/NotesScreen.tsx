import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
} from 'react-native';
import { addNote, getNotes, addPoints } from '../../../storage/appStorage';

export default function NotesScreen() {
  const [note, setNote] = useState('');
  const [notes, setNotes] = useState<string[]>([]);

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    const data = await getNotes();
    setNotes(data);
  };

  const handleAdd = async () => {
    if (!note.trim()) return;
    const updated = await addNote(note);
    await addPoints(5);
    setNotes(updated);
    setNote('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Notlarım 📝</Text>

      <TextInput
        style={styles.input}
        placeholder="Yeni not"
        value={note}
        onChangeText={setNote}
      />

      <TouchableOpacity style={styles.button} onPress={handleAdd}>
        <Text style={styles.buttonText}>Ekle</Text>
      </TouchableOpacity>

      <FlatList
        data={notes}
        renderItem={({ item }) => <Text style={styles.note}>• {item}</Text>}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: { fontSize: 24, marginBottom: 10 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  button: {
    backgroundColor: '#6200ea',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontWeight: '600' },
  note: { fontSize: 16, marginVertical: 4 },
});
