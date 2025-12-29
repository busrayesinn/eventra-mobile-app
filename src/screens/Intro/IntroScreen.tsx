import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { saveNickname } from '../../storage/appStorage';

export default function IntroScreen({ navigation }: any) {
  const [nickname, setNickname] = useState('');

  const handleStart = async () => {
    if (!nickname.trim()) return;
    await saveNickname(nickname);
    navigation.replace('MainTabs');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Eventra 🎉</Text>
      <Text style={styles.subtitle}>Seni nasıl çağıralım?</Text>

      <TextInput
        style={styles.input}
        placeholder="Takma adın"
        value={nickname}
        onChangeText={setNickname}
      />

      <TouchableOpacity style={styles.button} onPress={handleStart}>
        <Text style={styles.buttonText}>Başla</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 32, fontWeight: 'bold', marginBottom: 10 },
  subtitle: { fontSize: 16, marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#6200ea',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
});
