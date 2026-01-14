import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Modal,
  Alert,
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
  url?: string;
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

  const [modalVisible, setModalVisible] = useState(false);
  const [targetUrl, setTargetUrl] = useState('');

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

  const handleOpenEventPage = () => {
    if (!event?.url) return;

    let link = event.url.trim();
    if (!link.startsWith('http://') && !link.startsWith('https://')) {
      link = `https://${link}`;
    }

    setTargetUrl(link);
    setModalVisible(true);
  };

  const confirmNavigation = async () => {
    setModalVisible(false);
    try {
      await Linking.openURL(targetUrl);
    } catch {
      Alert.alert('Hata', 'Bağlantı açılamadı.');
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
    // eslint-disable-next-line react-native/no-inline-styles
    <View style={{ flex: 1 }}>
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

          {/* KATILDIM BUTONU */}
          <TouchableOpacity
            style={[styles.joinButton, joined && styles.joinedButton]}
            onPress={handleJoin}
            disabled={joined}
          >
            <Text style={styles.joinText}>
              {joined ? 'Katıldın ✅' : 'Katıldım'}
            </Text>
          </TouchableOpacity>

          {/* BİLET AL / SİTEYE GİT BUTONU */}
          {event.url && (
            <TouchableOpacity
              style={styles.ticketButton}
              onPress={handleOpenEventPage}
            >
              <Ionicons name="open-outline" size={18} color="#6200ea" />
              <Text style={styles.ticketText}>Etkinlik Sayfasına Git</Text>
            </TouchableOpacity>
          )}

          <Text style={styles.description}>
            {event.content
              ? event.content.replace(/<[^>]+>/g, '')
              : 'Açıklama bulunmuyor.'}
          </Text>
        </View>
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalIconContainer}>
              <Ionicons name="information-circle" size={40} color="#6200ea" />
            </View>
            <Text style={styles.modalTitle}>Yönlendirme Bilgisi</Text>
            <Text style={styles.modalMessage}>
              "Etkinlik.io" web sitesine yönlendiriliyorsunuz. Devam etmek
              istiyor musunuz?
            </Text>

            <View style={styles.modalButtonContainer}>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.modalButtonTextCancel}>İptal</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalButton, styles.modalButtonConfirm]}
                onPress={confirmNavigation}
              >
                <Text style={styles.modalButtonTextConfirm}>Devam Et</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
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
  ticketButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1.5,
    borderColor: '#6200ea',
    borderRadius: 14,
    paddingVertical: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  ticketText: {
    color: '#6200ea',
    fontWeight: '700',
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalIconContainer: {
    marginBottom: 16,
    backgroundColor: '#f3e5f5',
    padding: 10,
    borderRadius: 50,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  modalMessage: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 20,
  },
  modalButtonContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalButtonCancel: {
    backgroundColor: '#f5f5f5',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  modalButtonConfirm: {
    backgroundColor: '#6200ea',
  },
  modalButtonTextCancel: {
    color: '#666',
    fontWeight: '600',
  },
  modalButtonTextConfirm: {
    color: '#fff',
    fontWeight: '600',
  },
});
