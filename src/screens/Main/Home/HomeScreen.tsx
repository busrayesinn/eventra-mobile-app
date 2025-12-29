/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TOKEN } from '@env';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../navigation/HomeStack';

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

interface Venue {
  name?: string;
  city?: string;
}

interface Category {
  name?: string;
}

interface EventItem {
  id: number;
  name?: string;
  start_at?: string;
  poster_url?: string;
  venue?: Venue;
  category?: Category;
  is_free?: boolean;
}

const FILTERS = [
  { key: 'ALL', label: 'Tümü' },
  { key: 'FREE', label: 'Ücretsiz' },
  { key: 'EDU', label: 'Eğitim' },
  { key: 'MUSIC', label: 'Konser' },
];

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp>();

  const [allEvents, setAllEvents] = useState<EventItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('ALL');

  useEffect(() => {
    if (!TOKEN || TOKEN.trim() === '') {
      console.warn('TOKEN bulunamadı');
      setLoading(false);
      return;
    }
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch(
        'https://backend.etkinlik.io/api/v2/events',
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Etkinlik-Token': TOKEN,
          },
        },
      );

      if (!response.ok) {
        Alert.alert('Hata', 'Etkinlikler alınamadı.');
        return;
      }

      const json = await response.json();
      const safeEvents: EventItem[] = Array.isArray(json?.items)
        ? json.items
        : [];

      setAllEvents(safeEvents);
      setEvents(safeEvents);
    } catch {
      Alert.alert('Hata', 'Etkinlikler yüklenemedi.');
    } finally {
      setLoading(false);
    }
  };

  const applyFilter = (key: string) => {
    setActiveFilter(key);

    if (key === 'ALL') return setEvents(allEvents);
    if (key === 'FREE')
      return setEvents(allEvents.filter(e => e.is_free === true));
    if (key === 'EDU')
      return setEvents(
        allEvents.filter(e =>
          e.category?.name?.toLowerCase().includes('eğitim'),
        ),
      );
    if (key === 'MUSIC')
      return setEvents(
        allEvents.filter(e =>
          e.category?.name?.toLowerCase().includes('müzik'),
        ),
      );
  };

  const renderEventItem = ({ item }: { item: EventItem }) => (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.85}
      onPress={() =>
        navigation.navigate('EventDetail', { eventId: item.id })
      }
    >
      <Image
        source={{
          uri:
            item.poster_url ??
            'https://via.placeholder.com/300x200?text=Etkinlik',
        }}
        style={styles.cardImage}
      />

      <View style={styles.cardInfo}>
        <Text style={styles.cardTitle} numberOfLines={2}>
          {item.name ?? 'İsimsiz Etkinlik'}
        </Text>

        <View style={styles.row}>
          <Ionicons name="calendar-outline" size={14} color="#666" />
          <Text style={styles.detailText}>
            {item.start_at
              ? new Date(item.start_at).toLocaleDateString('tr-TR')
              : 'Tarih Yok'}
          </Text>
        </View>

        <View style={styles.row}>
          <Ionicons name="location-outline" size={14} color="#666" />
          <Text style={styles.detailText}>
            {item.venue?.name ?? 'Mekan Yok'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Keşfet 🔥</Text>

      <View style={styles.filterContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterContent}
        >
          {FILTERS.map(f => (
            <TouchableOpacity
              key={f.key}
              style={[
                styles.filterButton,
                activeFilter === f.key && styles.filterActive,
              ]}
              onPress={() => applyFilter(f.key)}
            >
              <Text
                style={[
                  styles.filterText,
                  activeFilter === f.key && styles.filterTextActive,
                ]}
              >
                {f.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#6200ea" style={{ marginTop: 30 }} />
      ) : (
        <FlatList
          data={events}
          renderItem={renderEventItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={{ padding: 16 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },

  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    padding: 16,
    paddingBottom: 6,
  },

  filterContainer: {
    height: 35,               
    justifyContent: 'center',
  },
  filterContent: {
    paddingHorizontal: 10,
  },
  filterButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#eee',
    marginRight: 8,
  },
  filterActive: {
    backgroundColor: '#6200ea',
  },
  filterText: {
    color: '#333',
    fontWeight: '500',
    fontSize: 13,
  },
  filterTextActive: {
    color: '#fff',
  },

  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    elevation: 3,
  },
  cardImage: {
    width: '100%',
    height: 160,
  },
  cardInfo: {
    padding: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  detailText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
});

export default HomeScreen;
