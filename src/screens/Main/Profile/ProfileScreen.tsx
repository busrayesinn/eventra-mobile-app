import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ActivityIndicator,
  FlatList,
  ScrollView,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { REWARDS } from '../../../data/rewardsData';

const CHART_COLORS = [
  '#6c5ce7',
  '#00b894',
  '#0984e3',
  '#e17055',
  '#fdcb6e',
  '#e84393',
  '#2d3436',
];

export default function ProfileScreen() {
  const [nickname, setNickname] = useState('');
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ownedIds, setOwnedIds] = useState<string[]>([]);
  const [categoryStats, setCategoryStats] = useState<Record<string, number>>(
    {},
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      const nicknameVal = await AsyncStorage.getItem('nickname');
      const pointsVal = await AsyncStorage.getItem('points');
      const streakVal = await AsyncStorage.getItem('streak');
      const ownedVal = await AsyncStorage.getItem('ownedRewards');
      const participationVal = await AsyncStorage.getItem('participations');

      // --- ROZETLER ---
      const rawOwned: string[] = ownedVal ? JSON.parse(ownedVal) : [];
      const validOwned = rawOwned.filter(id => REWARDS.some(r => r.id === id));

      // --- İSTATİSTİKLER ---
      const participations = participationVal
        ? JSON.parse(participationVal)
        : [];

      const stats: Record<string, number> = {};
      participations.forEach((p: any) => {
        const key = p.category || 'Genel';
        stats[key] = (stats[key] || 0) + 1;
      });

      setNickname(nicknameVal || 'Kullanıcı');
      setPoints(Number(pointsVal) || 0);
      setStreak(Number(streakVal) || 0);
      setOwnedIds(validOwned);
      setCategoryStats(stats);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  const streakPercent = Math.min((streak / 30) * 100, 100);

  // Grafik hesaplamaları
  const totalActivities = Object.values(categoryStats).reduce(
    (a, b) => a + b,
    0,
  );
  // En yüksek değeri bul ki çubukların doluluk oranını buna göre ayarlayalım
  const maxCategoryValue = Math.max(...Object.values(categoryStats), 1);

  return (
    <ScrollView
      style={styles.container}
      // eslint-disable-next-line react-native/no-inline-styles
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* HEADER */}
      <View style={styles.headerCard}>
        <Image
          source={{ uri: 'https://i.pravatar.cc/300' }}
          style={styles.avatar}
        />
        <Text style={styles.nickname}>{nickname}</Text>
        <Text style={styles.subTitle}>Eventra Profili</Text>
      </View>

      {/* STATS */}
      <View style={styles.row}>
        <View style={styles.statCard}>
          <Ionicons name="trophy" size={24} color="#6c5ce7" />
          <Text style={styles.statValue}>{points}</Text>
          <Text style={styles.statLabel}>Toplam Puan</Text>
        </View>

        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color="#ff7675" />
          <Text style={styles.statValue}>{streak}</Text>
          <Text style={styles.statLabel}>Günlük Streak</Text>
        </View>
      </View>

      {/* STREAK */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Streak İlerlemesi</Text>
          <Text style={styles.cardValue}>{streak}/30</Text>
        </View>

        <View style={styles.progressBg}>
          <View style={[styles.progressFill, { width: `${streakPercent}%` }]} />
        </View>

        <Text style={styles.hint}>
          Her gün giriş yaparak streak rozetleri kazanabilirsin 🔥
        </Text>
      </View>

      {/* BADGES */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Kazanılan Rozetler</Text>
          <Text style={styles.cardValue}>{ownedIds.length}</Text>
        </View>

        {ownedIds.length === 0 ? (
          <Text style={styles.hint}>Henüz rozet kazanmadın.</Text>
        ) : (
          <FlatList
            horizontal
            showsHorizontalScrollIndicator={false}
            data={REWARDS.filter(r => ownedIds.includes(r.id))}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <View style={styles.badgeCircle}>
                <Image source={item.image} style={styles.badgeImage} />
              </View>
            )}
          />
        )}
      </View>

      {/* --- KÜTÜPHANESİZ ÖZEL GRAFİK ALANI --- */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Etkinlik İlgi Dağılımı</Text>
          <Text style={styles.cardValue}>{totalActivities} Toplam</Text>
        </View>

        {Object.keys(categoryStats).length > 0 ? (
          <View style={styles.chartContainer}>
            {Object.entries(categoryStats).map(([category, value], index) => {
              const widthPercent = (value / maxCategoryValue) * 100;
              const barColor = CHART_COLORS[index % CHART_COLORS.length];

              return (
                <View key={category} style={styles.barRow}>
                  {/* Sol Kısım: Kategori Adı ve Sayı */}
                  <View style={styles.barInfo}>
                    <Text style={styles.barLabel}>{category}</Text>
                    <Text style={[styles.barCount, { color: barColor }]}>
                      {value} adet
                    </Text>
                  </View>

                  {/* Sağ Kısım: Grafik Çubuğu */}
                  <View style={styles.barTrack}>
                    <View
                      style={[
                        styles.barIndicator,
                        {
                          width: `${widthPercent}%`,
                          backgroundColor: barColor,
                        },
                      ]}
                    />
                  </View>
                </View>
              );
            })}
          </View>
        ) : (
          // Veri Yoksa Gösterilecek Alan
          <View style={styles.emptyState}>
            <Ionicons name="bar-chart-outline" size={48} color="#dcdde1" />
            <Text style={styles.emptyText}>Henüz grafik verisi oluşmadı.</Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f3f7',
    paddingHorizontal: 16,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    alignItems: 'center',
    paddingVertical: 28,
    marginTop: 20,
    marginBottom: 16,
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    marginBottom: 12,
  },
  nickname: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2d3436',
  },
  subTitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 4,
  },
  row: {
    flexDirection: 'row',
    gap: 14,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingVertical: 20,
    alignItems: 'center',
    elevation: 3,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 22,
    padding: 16,
    marginBottom: 16,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2d3436',
  },
  cardValue: {
    fontSize: 13,
    fontWeight: '600',
    color: '#636e72',
  },
  progressBg: {
    height: 10,
    backgroundColor: '#e0e0e0',
    borderRadius: 5,
    overflow: 'hidden',
    marginTop: 6,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#6c5ce7',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: '#777',
  },
  badgeCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  badgeImage: {
    width: 42,
    height: 42,
    resizeMode: 'contain',
  },

  chartContainer: {
    marginTop: 4,
  },
  barRow: {
    marginBottom: 16,
  },
  barInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#2d3436',
  },
  barCount: {
    fontSize: 14,
    fontWeight: '700',
  },
  barTrack: {
    height: 12,
    backgroundColor: '#f1f2f6',
    borderRadius: 6,
    overflow: 'hidden',
  },
  barIndicator: {
    height: '100%',
    borderRadius: 6,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  emptyText: {
    color: '#b2bec3',
    marginTop: 8,
    fontSize: 14,
  },
});
