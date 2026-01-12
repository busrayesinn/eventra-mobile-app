import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  TextInput,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { deleteNote, updateNote, togglePinNote} from '../../../storage/appStorage';


export default function NoteDetailScreen({ route, navigation }: any) {
  const { note } = route.params;

  // 🔹 düzenleme state’leri
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);

  const handleTogglePin = async () => {
  await togglePinNote(note.id);
  navigation.goBack();
  };


  const handleDelete = () => {
    Alert.alert('Not silinsin mi?', 'Bu işlem geri alınamaz', [
      { text: 'Vazgeç', style: 'cancel' },
      {
        text: 'Sil',
        style: 'destructive',
        onPress: async () => {
          await deleteNote(note.id);
          navigation.goBack();
        },
      },
    ]);
  };

  // 🔹 kaydetme
  const handleUpdate = async () => {
    if (!title.trim() || !content.trim()) return;

    await updateNote({
      ...note,
      title,
      content,
    });

    navigation.goBack();
  };

  return (
    <ScrollView
      contentContainerStyle={detailStyles.container}
      showsVerticalScrollIndicator={false}
    >
      {isEditing ? (
        <TextInput
          style={detailStyles.title}
          value={title}
          onChangeText={setTitle}
        />
      ) : (
        <View style={detailStyles.titleRow}>
        <Text style={detailStyles.title}>{note.title}</Text>

        <TouchableOpacity onPress={handleTogglePin}>
            <Ionicons
            name={note.isPinned ? 'pin' : 'pin-outline'}
            size={40}
            color={note.isPinned ? '#f1c40f' : '#999'}
            />
        </TouchableOpacity>
        </View>
      )}

      <Text style={detailStyles.date}>{note.createdAt}</Text>

      {isEditing ? (
        <TextInput
          style={[detailStyles.content, { minHeight: 200 }]}
          multiline
          value={content}
          onChangeText={setContent}
        />
      ) : (
        <Text style={detailStyles.content}>{note.content}</Text>
      )}

      {/* 🔹 DÜZENLE / KAYDET */}
      <TouchableOpacity
        style={detailStyles.edit}
        onPress={isEditing ? handleUpdate : () => setIsEditing(true)}
      >
        <Text style={{ color: '#fff' }}>
          {isEditing ? 'Kaydet' : 'Düzenle'}
        </Text>
      </TouchableOpacity>
    
        {/* <TouchableOpacity
        style={detailStyles.pin}
        onPress={handleTogglePin}
        >
        <Text style={{ color: '#fff' }}>
            {note.isPinned ? 'Sabitlemeyi Kaldır' : 'Sabitle'}
        </Text>
        </TouchableOpacity> */}

      {/* 🔹 SİL */}
      <TouchableOpacity style={detailStyles.delete} onPress={handleDelete}>
        <Text style={{ color: '#fff' }}>Notu Sil</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const detailStyles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 50,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginTop: 20,
  },
  date: {
    fontSize: 12,
    color: '#888',
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 22,
  },
  edit: {
    marginTop: 30,
    backgroundColor: '#6c5ce7',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  delete: {
    marginTop: 14,
    backgroundColor: '#D50000',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  pin: {
  marginTop: 20,
  backgroundColor: '#f1c40f',
  padding: 14,
  borderRadius: 10,
  alignItems: 'center',
  },
  titleRow: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  },

});
