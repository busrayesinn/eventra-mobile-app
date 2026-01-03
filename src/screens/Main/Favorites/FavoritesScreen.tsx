import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import {
  getFavorites,
  toggleFavorite,
} from '../../../storage/appStorage';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import Ionicons from 'react-native-vector-icons/Ionicons';

export default function FavoritesScreen() {
  const navigation = useNavigation<any>();
  const [favorites, setFavorites] = useState<any[]>([]);

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, [])
  );

  const loadFavorites = async () => {
    const data = await getFavorites();
    setFavorites(data);
  };

  const handleRemove = (item: any) => {
    Alert.alert(
      'Favoriden Kaldır',
      `"${item.name}" favorilerden çıkarılsın mı?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Kaldır',
          onPress: async () => {
            await toggleFavorite(item);
            loadFavorites();
          },
        },
      ]
    );
  };

  const renderItem = ({ item }: any) => (
    <View style={styles.card}>
      <TouchableOpacity
        onPress={() =>
          navigation.navigate('EventDetail', { eventId: item.id })
        }
      >
        <Image
          source={{
            uri:
              item.poster_url ||
              'https://via.placeholder.com/300x200?text=Etkinlik',
          }}
          style={styles.image}
        />
      </TouchableOpacity>

      <View style={styles.cardFooter}>
        <Text style={styles.title} numberOfLines={1}>
          {item.name}
        </Text>

        <TouchableOpacity onPress={() => handleRemove(item)}>
          <Ionicons name="trash-outline" size={22} color="#e53935" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Favorilerim ❤️</Text>

      {favorites.length === 0 ? (
        <Text style={styles.emptyText}>
          Henüz favori eklemedin.
        </Text>
      ) : (
        <FlatList
          data={favorites}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderItem}
          // eslint-disable-next-line react-native/no-inline-styles
          contentContainerStyle={{ padding: 16 }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    padding: 16,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 40,
    color: '#666',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: { width: '100%', height: 150 },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  title: {
    fontWeight: '600',
    flex: 1,
    marginRight: 10,
  },
});
