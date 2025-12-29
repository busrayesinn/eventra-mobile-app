/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList } from 'react-native';
import { getFavorites } from '../../../storage/appStorage';

export default function FavoritesScreen() {
  const [favorites, setFavorites] = useState<any[]>([]);

  useEffect(() => {
    getFavorites().then(setFavorites);
  }, []);

  return (
    <View style={{ flex: 1, padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold' }}>Favoriler ❤️</Text>

      <FlatList
        data={favorites}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => <Text>• {item.name}</Text>}
        ListEmptyComponent={<Text>Henüz favori yok.</Text>}
      />
    </View>
  );
}
