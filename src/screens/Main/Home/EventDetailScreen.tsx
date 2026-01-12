import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { HomeStackParamList } from '../../../navigation/HomeStack';
import { TOKEN } from '@env';
import Ionicons from 'react-native-vector-icons/Ionicons';
import {
  toggleFavorite,
  getFavorites,
  addParticipation,
  getParticipations,
} from '../../../storage/appStorage';

type DetailRouteProp = RouteProp<HomeStackParamList, 'EventDetail'>;

interface EventDetail {
  id: number;
  name: string;
  content?: string;
  start?: string;
  poster_url?: string;
  is_free?: boolean;
  category?: {
    name?: string;
  };
}

export default function EventDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isFavorite, setIsFavorite] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    fetchDetail();
    checkFavorite();
    checkParticipation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchDetail = async () => {
    try {
      const response = await fetch(
        `https://backend.etkinlik.io/api/v2/events/${eventId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-Etkinlik-Token': TOKEN,
          },
        },
      );

      const json = await response.json();
      const data = Array.isArray(json) ? json[0] : json;
      setEvent(data);
    } finally {
      setLoading(false);
    }
  };

  const checkFavorite = async () => {
    const favs = await getFavorites();
    setIsFavorite(favs.some(e => e.id === eventId));
  };

  const checkParticipation = async () => {
    const parts = await getParticipations();
    setJoined(parts.some(p => p.eventId === eventId));
  };

  const handleFavorite = async () => {
    if (!event) return;
    const updated = await toggleFavorite(event);
    setIsFavorite(updated.some(e => e.id === event.id));
  };

  const handleJoin = async () => {
    if (!event || joined) return;

    await addParticipation({
      eventId: event.id,
      name: event.name,
      category: event.category?.name || 'Diğer',
      date: new Date().toISOString(),
    });

    setJoined(true);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6200ea" />
      </View>
    );
  }

  if (!event) {
    return (
      <View style={styles.center}>
        <Text>Etkinlik bulunamadı.</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Image
        source={{
          uri:
            event.poster_url ||
            'https://via.placeholder.com/400x250?text=Etkinlik',
        }}
        style={styles.image}
      />

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{event.name}</Text>

          <TouchableOpacity onPress={handleFavorite}>
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={26}
              color="#e91e63"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.date}>
          {event.start
            ? new Date(event.start).toLocaleString('tr-TR')
            : 'Tarih bilgisi yok'}
        </Text>

        <Text style={styles.free}>
          {event.is_free ? 'Ücretsiz 🎉' : 'Ücretli 🎟️'}
        </Text>

        {/* KATILDIM */}
        <TouchableOpacity
          style={[styles.joinButton, joined && styles.joinedButton]}
          onPress={handleJoin}
          disabled={joined}
        >
          <Text style={styles.joinText}>
            {joined ? 'Katıldın ✅' : 'Katıldım'}
          </Text>
        </TouchableOpacity>

        <Text style={styles.description}>
          {event.content
            ? event.content.replace(/<[^>]+>/g, '')
            : 'Açıklama bulunmuyor.'}
        </Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 250 },
  content: { padding: 16 },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  title: { fontSize: 22, fontWeight: 'bold', flex: 1 },
  date: { color: '#666', marginVertical: 6 },
  free: { marginBottom: 10, fontWeight: '600' },

  joinButton: {
    backgroundColor: '#6200ea',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 12,
  },
  joinedButton: {
    backgroundColor: '#2ecc71',
  },
  joinText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  description: { fontSize: 15, lineHeight: 22 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
});
