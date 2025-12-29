import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { HomeStackParamList } from '../../../navigation/HomeStack';
import { TOKEN } from '@env';

type DetailRouteProp = RouteProp<HomeStackParamList, 'EventDetail'>;

interface EventDetail {
  id: number;
  name: string;
  content?: string;
  start?: string;
  end?: string;
  poster_url?: string;
  is_free?: boolean;
}

export default function EventDetailScreen() {
  const route = useRoute<DetailRouteProp>();
  const { eventId } = route.params;

  const [event, setEvent] = useState<EventDetail | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const response = await fetch(
          `https://backend.etkinlik.io/api/v2/events/${eventId}`,
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Etkinlik-Token': TOKEN,
            },
          }
        );

        const json = await response.json();

        // API bazen array döndürüyor
        const data = Array.isArray(json) ? json[0] : json;

        setEvent(data);
      } catch (e) {
        console.error('Detail fetch error:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [eventId]);

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
        <Text style={styles.title}>{event.name}</Text>

        <Text style={styles.date}>
          {event.start
            ? new Date(event.start).toLocaleString('tr-TR')
            : 'Tarih bilgisi yok'}
        </Text>

        <Text style={styles.free}>
          {event.is_free ? 'Ücretsiz 🎉' : 'Ücretli 🎟️'}
        </Text>

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
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  date: { color: '#666', marginBottom: 6 },
  free: { marginBottom: 10, fontWeight: '600' },
  description: { fontSize: 15, lineHeight: 22 },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
