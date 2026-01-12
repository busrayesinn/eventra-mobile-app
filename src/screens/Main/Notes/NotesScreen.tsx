import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  Modal,
  TextInput,
  StyleSheet,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { addNote, getNotes, NoteItem } from '../../../storage/appStorage';

export default function NotesScreen() {
  const navigation = useNavigation<any>();

  const [notes, setNotes] = useState<NoteItem[]>([]);
  const [modalVisible, setModalVisible] = useState(false);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadNotes();
    }, [])
  );

const loadNotes = async () => {
  const data = await getNotes();

  const sorted = [...data].sort((a, b) => {
    if (a.isPinned && !b.isPinned) return -1;
    if (!a.isPinned && b.isPinned) return 1;
    return 0;
  });

  setNotes(sorted);
};


  const handleSave = async () => {
    if (!title.trim() || !content.trim()) return;

    const newNote: NoteItem = {
      id: Date.now().toString(),
      title,
      content,
      createdAt: new Date().toLocaleString(),
    };

    const updated = await addNote(newNote);
    setNotes(updated);

    setTitle('');
    setContent('');
    setModalVisible(false);
  };

  const renderItem = ({ item }: { item: NoteItem }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('NoteDetail', { note: item })}
    >
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
      <Text style={styles.cardTitle}>{item.title}</Text>
          {item.isPinned && (
      <Ionicons name="pin" size={28} color="#f1c40f" />
    )}
    </View>
      <Text numberOfLines={2} style={styles.cardContent}>
        {item.content}
      </Text>
      <Text style={styles.cardDate}>{item.createdAt}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.header}>Notlarım</Text>
          <Text style={styles.subHeader}>
            {notes.length} not oluşturuldu
          </Text>
        </View>

        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={34} color="#6c5ce7" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={notes}
        extraData={notes}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        showsVerticalScrollIndicator={false}
      />

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Yeni Not</Text>

          <TextInput
            placeholder="Başlık"
            style={styles.input}
            value={title}
            onChangeText={setTitle}
          />

          <TextInput
            placeholder="Not içeriği"
            style={[styles.input, { height: 120 }]}
            multiline
            value={content}
            onChangeText={setContent}
          />

          <View style={styles.modalButtons}>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text style={styles.cancel}>İptal</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleSave}>
              <Text style={styles.save}>Kaydet</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  header: { fontSize: 26, fontWeight: '700' },
  subHeader: { fontSize: 13, color: '#888' },

  card: {
    backgroundColor: '#EDE7F6',
    borderRadius: 14,
    padding: 14,
    marginVertical: 8,
    elevation: 3,
  },
  cardTitle: { fontSize: 16, fontWeight: '700', marginBottom: 4 },
  cardContent: { fontSize: 14, color: '#555' },
  cardDate: { fontSize: 11, color: '#aaa', marginTop: 6 },

  modalContainer: { flex: 1, padding: 20 },
  modalTitle: { fontSize: 22, fontWeight: '700', marginBottom: 16 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 10,
    padding: 12,
    marginBottom: 12,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancel: { fontSize: 16, color: '#999' },
  save: { fontSize: 16, color: '#6c5ce7', fontWeight: '700' },
});
