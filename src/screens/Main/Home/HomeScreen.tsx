/* eslint-disable react-native/no-inline-styles */
import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
  Modal,
  TextInput,
  Dimensions,
  Platform,
  StatusBar,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { TOKEN } from '@env';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { HomeStackParamList } from '../../../navigation/HomeStack';
import { getFavorites } from '../../../storage/appStorage';

const PAGE_SIZE = 15;

const TURKISH_CITIES = [
  'Tümü', 'İstanbul', 'Ankara', 'İzmir', 'Adana', 'Adıyaman', 'Afyonkarahisar', 'Ağrı',
  'Aksaray', 'Amasya', 'Antalya', 'Ardahan', 'Artvin', 'Aydın', 'Balıkesir', 'Bartın',
  'Batman', 'Bayburt', 'Bilecik', 'Bingöl', 'Bitlis', 'Bolu', 'Burdur', 'Bursa',
  'Çanakkale', 'Çankırı', 'Çorum', 'Denizli', 'Diyarbakır', 'Düzce', 'Edirne', 'Elazığ',
  'Erzincan', 'Erzurum', 'Eskişehir', 'Gaziantep', 'Giresun', 'Gümüşhane', 'Hakkari',
  'Hatay', 'Iğdır', 'Isparta', 'Kahramanmaraş', 'Karabük', 'Karaman', 'Kars', 'Kastamonu',
  'Kayseri', 'Kırıkkale', 'Kırklareli', 'Kırşehir', 'Kilis', 'Kocaeli', 'Konya',
  'Kütahya', 'Malatya', 'Manisa', 'Mardin', 'Mersin', 'Muğla', 'Muş', 'Nevşehir',
  'Niğde', 'Ordu', 'Osmaniye', 'Rize', 'Sakarya', 'Samsun', 'Siirt', 'Sinop', 'Sivas',
  'Şanlıurfa', 'Şırnak', 'Tekirdağ', 'Tokat', 'Trabzon', 'Tunceli', 'Uşak', 'Van',
  'Yalova', 'Yozgat', 'Zonguldak',
];

const CATEGORY_FILTERS = [
  { key: 'ALL', label: '🔥 Hepsi' },
  { key: 'MUSIC', label: '🎵 Konser' },
  { key: 'THEATER', label: '🎭 Tiyatro' },
  { key: 'EDU', label: '🎓 Eğitim' },
  { key: 'FESTIVAL', label: '🎉 Festival' },
  { key: 'FREE', label: '🎁 Ücretsiz' },
];

const DATE_FILTERS = [
  { key: 'ALL', label: 'Tüm Tarihler' },
  { key: 'TODAY', label: 'Bugün' },
  { key: 'WEEK', label: 'Bu Hafta' },
  { key: 'MONTH', label: 'Bu Ay' },
];

type NavigationProp = NativeStackNavigationProp<HomeStackParamList, 'Home'>;

interface EventItem {
  id: number;
  name?: string;
  start_at?: string;
  poster_url?: string;
  venue?: { name?: string; city?: string | { name: string } };
  category?: { name?: string };
  format?: { name?: string };
  is_free?: boolean;
}

const { height } = Dimensions.get('window');

/* ================== COMPONENT ================== */

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [allFetchedEvents, setAllFetchedEvents] = useState<EventItem[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventItem[]>([]);
  const [displayedEvents, setDisplayedEvents] = useState<EventItem[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);

  const [activeCity, setActiveCity] = useState('Tümü');
  const [activeCategory, setActiveCategory] = useState('ALL');
  const [activeDateFilter, setActiveDateFilter] = useState('ALL');

  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [citySearchText, setCitySearchText] = useState('');
  const [page, setPage] = useState(1);

  /* ---------------- FETCH ---------------- */

  useEffect(() => {
    if (!TOKEN) {
      setIsLoading(false);
      return;
    }

    const fetchEvents = async () => {
      try {
        const response = await fetch(
          'https://backend.etkinlik.io/api/v2/events?take=500',
          {
            headers: {
              'Content-Type': 'application/json',
              'X-Etkinlik-Token': TOKEN,
            },
          },
        );

        if (!response.ok) throw new Error('Network error');

        const json = await response.json();
        const rawEvents: EventItem[] = Array.isArray(json?.items)
          ? json.items
          : [];

        const sorted = rawEvents.sort((a, b) => {
          const da = new Date(a.start_at?.replace(' ', 'T') || 0);
          const db = new Date(b.start_at?.replace(' ', 'T') || 0);
          return da.getTime() - db.getTime();
        });

        setAllFetchedEvents(sorted);
      } catch {
        Alert.alert('Hata', 'Etkinlikler yüklenemedi.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchEvents();
  }, []);

  /* ---------------- FAVORITES ---------------- */

  useFocusEffect(
    useCallback(() => {
      loadFavorites();
    }, []),
  );

  const loadFavorites = async () => {
    const favs = await getFavorites();
    setFavoriteIds(favs.map(f => f.id));
  };

  /* ---------------- DATE PARSER ---------------- */

  const parseEventDate = (dateString?: string) => {
    if (!dateString) return null;
    try {
      const d = new Date(dateString.replace(' ', 'T'));
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  };

  /* ---------------- FILTER LOGIC ---------------- */

  useEffect(() => {
    let result = [...allFetchedEvents];

    // 1. Şehir Filtresi
    if (activeCity !== 'Tümü') {
      result = result.filter(e => {
        const city =
          typeof e.venue?.city === 'string'
            ? e.venue.city
            : e.venue?.city?.name;
        return city?.toLowerCase() === activeCity.toLowerCase();
      });
    }

    // 2. Kategori Filtresi
    if (activeCategory === 'FREE') {
      result = result.filter(e => e.is_free);
    } else if (activeCategory !== 'ALL') {
      result = result.filter(e => {
        const catName = e.category?.name?.toLowerCase() || '';
        const formatName = e.format?.name?.toLowerCase() || '';
        const combined = `${catName} ${formatName}`;

        if (activeCategory === 'MUSIC') return combined.includes('müzik') || combined.includes('konser');
        if (activeCategory === 'THEATER') return combined.includes('tiyatro') || combined.includes('sahne') || combined.includes('gösteri');
        if (activeCategory === 'EDU') return combined.includes('eğitim') || combined.includes('atölye') || combined.includes('seminer');
        if (activeCategory === 'FESTIVAL') return combined.includes('festival');
        return true;
      });
    }

    setFilteredEvents(result);
    setDisplayedEvents(result.slice(0, PAGE_SIZE));
    setPage(1);
  }, [allFetchedEvents, activeCity, activeCategory]);

  /* ---------------- LOAD MORE ---------------- */

  const loadMoreEvents = () => {
    if (isLoadingMore || displayedEvents.length >= filteredEvents.length)
      return;

    setIsLoadingMore(true);

    setTimeout(() => {
      const nextPage = page + 1;
      setDisplayedEvents(filteredEvents.slice(0, nextPage * PAGE_SIZE));
      setPage(nextPage);
      setIsLoadingMore(false);
    }, 500);
  };

  /* ---------------- CITY FILTER ---------------- */

  const filteredCities = useMemo(() => {
    if (!citySearchText) return TURKISH_CITIES;
    return TURKISH_CITIES.filter(c =>
      c.toLowerCase().includes(citySearchText.toLocaleLowerCase('tr')),
    );
  }, [citySearchText]);

  const handleCitySelect = (city: string) => {
    setActiveCity(city);
    setModalVisible(false);
  };

  /* ---------------- EMPTY STATE ---------------- */

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <View style={styles.emptyIconContainer}>
         <Ionicons name="search-outline" size={48} color="#a29bfe" />
      </View>
      <Text style={styles.emptyTitle}>Etkinlik Bulunamadı</Text>
      <Text style={styles.emptyText}>
        Seçtiğin kriterlere uygun etkinlik yok.{'\n'}
        Filtreleri değiştirip tekrar deneyebilirsin. 🚀
      </Text>
    </View>
  );

  /* ---------------- RENDER ITEM ---------------- */

  const renderEventItem = ({ item }: { item: EventItem }) => {
    const isFav = favoriteIds.includes(item.id);
    const eventDate = parseEventDate(item.start_at);
    const displayCategory = item.format?.name || item.category?.name || 'ETKİNLİK';

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.9}
        onPress={() => navigation.navigate('EventDetail', { eventId: item.id })}
      >
        <Image
          source={{
            uri: item.poster_url ?? 'https://via.placeholder.com/300x200',
          }}
          style={styles.cardImage}
        />
        <View style={styles.cardOverlay} />

        {isFav && (
          <View style={styles.favoriteBadge}>
            <Ionicons name="heart" size={14} color="#fff" />
          </View>
        )}

        {eventDate && (
          <View style={styles.dateBadge}>
            <Text style={styles.dateDay}>{eventDate.getDate()}</Text>
            <Text style={styles.dateMonth}>
              {eventDate
                .toLocaleDateString('tr-TR', { month: 'short' })
                .toUpperCase()}
            </Text>
          </View>
        )}

        <View style={styles.cardContent}>
          <Text style={styles.cardCategory}>{displayCategory.toUpperCase()}</Text>
          <Text style={styles.cardTitle} numberOfLines={2}>{item.name}</Text>
          <View style={styles.locationRow}>
            <Ionicons name="location" size={14} color="#ddd" />
            <Text style={styles.locationText}>
              {typeof item.venue?.city === 'string'
                ? item.venue.city
                : item.venue?.city?.name ?? 'Şehir Yok'}
            </Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8f9fa" />

      {/* HEADER */}
      <View style={styles.header}>
        <View style={{ flex: 1 }}>
          <Text style={styles.greeting}>Keşfetmeye Başla</Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={() => {
              setCitySearchText('');
              setModalVisible(true);
            }}
          >
            <Ionicons name="location-sharp" size={20} color="#6c5ce7" />
            <Text style={styles.activeCityText}>
              {activeCity === 'Tümü' ? 'Tüm Türkiye' : activeCity}
            </Text>
            <Ionicons name="chevron-down" size={16} color="#333" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.profileButton}
          onPress={() => navigation.navigate('Profile')}
        >
          <Image
            source={{ uri: 'https://i.pravatar.cc/300' }}
            style={styles.headerAvatar}
          />
        </TouchableOpacity>
      </View>

      {/* DATE FILTER */}
      <View style={styles.dateFilterContainer}>
        <FlatList
          data={DATE_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
          keyExtractor={item => item.key}
          renderItem={({ item }) => {
            const isActive = activeDateFilter === item.key;
            return (
              <TouchableOpacity
                style={[styles.dateChip, isActive && styles.dateChipActive]}
                onPress={() => setActiveDateFilter(item.key)}
              >
                <Text style={[styles.dateChipText, isActive && styles.dateChipTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* CATEGORY FILTER */}
      <View style={styles.categoryContainer}>
        <FlatList
          data={CATEGORY_FILTERS}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.horizontalListPadding}
          keyExtractor={item => item.key}
          renderItem={({ item }) => {
            const isActive = activeCategory === item.key;
            return (
              <TouchableOpacity
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setActiveCategory(item.key)}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* LIST */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#6c5ce7" style={styles.loadingIndicator} />
      ) : (
        <FlatList
          data={displayedEvents}
          renderItem={renderEventItem}
          keyExtractor={item => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          onEndReached={loadMoreEvents}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmptyState}
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator size="small" color="#6c5ce7" style={{ marginVertical: 20 }} />
            ) : (
              <View style={{ height: 20 }} />
            )
          }
        />
      )}

      {/* CITY MODAL */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setModalVisible(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Şehir Seç</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={28} color="#999" />
              </TouchableOpacity>
            </View>
            <View style={styles.searchBox}>
              <Ionicons name="search" size={20} color="#999" />
              <TextInput
                placeholder="Şehir ara..."
                style={styles.searchInput}
                value={citySearchText}
                onChangeText={setCitySearchText}
              />
            </View>
            <FlatList
              data={filteredCities}
              keyExtractor={(item, index) => `${item}-${index}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.cityItem}
                  onPress={() => handleCitySelect(item)}
                >
                  <Text style={[styles.cityText, activeCity === item && styles.cityTextActive]}>
                    {item}
                  </Text>
                  {activeCity === item && (
                    <Ionicons name="checkmark-circle" size={20} color="#6c5ce7" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f8f9fa' },
  header: {
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 20 : 60,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  greeting: { fontSize: 14, color: '#888', marginBottom: 4 },
  locationSelector: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  activeCityText: { fontSize: 20, fontWeight: '700', color: '#2d3436' },
  profileButton: { paddingLeft: 12 },
  headerAvatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    borderWidth: 2,
    borderColor: '#6c5ce7',
  },
  dateFilterContainer: { marginBottom: 10 },
  horizontalListPadding: { paddingHorizontal: 20 },
  categoryContainer: { marginBottom: 10, height: 40 },
  categoryChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#fff',
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    height: 36,
    justifyContent: 'center',
  },
  categoryChipActive: { backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' },
  categoryText: { fontSize: 13, fontWeight: '600', color: '#636e72' },
  categoryTextActive: { color: '#fff' },
  dateChip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 8,
    backgroundColor: '#f1f2f6',
    marginRight: 8,
    height: 34,
    justifyContent: 'center',
  },
  dateChipActive: { backgroundColor: '#2d3436' },
  dateChipText: { fontSize: 13, fontWeight: '500', color: '#636e72' },
  dateChipTextActive: { color: '#fff' },
  loadingIndicator: { marginTop: 50 },
  listContent: { paddingHorizontal: 20, paddingBottom: 30, paddingTop: 10, minHeight: 300 }, // minHeight eklendi ki boş liste ortalansın

  card: {
    backgroundColor: '#000',
    borderRadius: 20,
    marginBottom: 20,
    height: 220,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 5,
    overflow: 'hidden',
  },
  cardImage: { width: '100%', height: '100%', resizeMode: 'cover', opacity: 0.8 },
  cardOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.3)' },
  dateBadge: {
    position: 'absolute',
    top: 15,
    left: 15,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingVertical: 6,
    paddingHorizontal: 10,
    alignItems: 'center',
    minWidth: 50,
  },
  dateDay: { fontSize: 18, fontWeight: 'bold', color: '#2d3436' },
  dateMonth: { fontSize: 10, fontWeight: '700', color: '#6c5ce7' },
  favoriteBadge: {
    position: 'absolute',
    top: 15,
    right: 15,
    backgroundColor: 'rgba(233,30,99,0.9)',
    padding: 8,
    borderRadius: 50,
  },
  cardContent: { position: 'absolute', bottom: 0, left: 0, right: 0, padding: 20 },
  cardCategory: { color: '#a29bfe', fontSize: 12, fontWeight: '700', marginBottom: 4 },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 6,
    textShadowColor: 'rgba(0,0,0,0.75)',
    textShadowOffset: { width: -1, height: 1 },
    textShadowRadius: 10,
  },
  locationRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  locationText: { color: '#ddd', fontSize: 13, fontWeight: '500' },

  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: 30,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#f1f2f6',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2d3436',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    lineHeight: 20,
  },

  modalContainer: { flex: 1, justifyContent: 'flex-end' },
  modalOverlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.5)' },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: height * 0.75,
    padding: 20,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2d3436' },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f2f6',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 46,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 16, color: '#333' },
  cityItem: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f2f6',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cityText: { fontSize: 16, color: '#2d3436' },
  cityTextActive: { color: '#6c5ce7', fontWeight: 'bold' },
});