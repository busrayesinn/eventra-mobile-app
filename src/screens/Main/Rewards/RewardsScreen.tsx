import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ListRenderItem,
  Alert,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { getPoints, spendPoints } from '../../../storage/appStorage';

interface Reward {
  id: string;
  title: string;
  cost: number;
  icon: string;
}

const SAMPLE_REWARDS: Reward[] = [
  { id: '1', title: 'Neon Lamba', cost: 150, icon: 'bulb-outline' },
  { id: '2', title: 'Konser İndirimi', cost: 300, icon: 'ticket-outline' },
  { id: '3', title: 'Özel Çerçeve', cost: 500, icon: 'image-outline' },
  { id: '4', title: 'VIP Giriş', cost: 750, icon: 'star-outline' },
  { id: '5', title: 'Sürpriz Kutu', cost: 1000, icon: 'gift-outline' },
];

export default function RewardsScreen() {
  const [points, setPoints] = useState<number>(0);

  // 🔁 Ekran her açıldığında puanı güncelle
  useFocusEffect(
    useCallback(() => {
      loadPoints();
    }, [])
  );

  const loadPoints = async () => {
    const currentPoints = await getPoints();
    setPoints(currentPoints);
  };

  const handleBuy = (item: Reward) => {
    Alert.alert(
      'Satın Alma',
      `"${item.title}" ödülünü ${item.cost} puana almak istiyor musun?`,
      [
        { text: 'Vazgeç', style: 'cancel' },
        {
          text: 'Al',
          onPress: async () => {
            const updated = await spendPoints(item.cost);

            if (updated === null) {
              Alert.alert(
                'Olamaz 😔',
                'Bu ödül için yeterli puanın yok.'
              );
            } else {
              setPoints(updated);
              Alert.alert(
                'Başarılı 🎉',
                `"${item.title}" artık senin!`
              );
            }
          },
        },
      ]
    );
  };

  const renderRewardItem: ListRenderItem<Reward> = ({ item }) => {
    const canAfford = points >= item.cost;

    return (
      <TouchableOpacity
        style={styles.card}
        activeOpacity={0.8}
        disabled={!canAfford}
        onPress={() => handleBuy(item)}
      >
        <View
          style={[
            styles.iconContainer,
            !canAfford && styles.iconDisabled,
          ]}
        >
          <Ionicons
            name={item.icon}
            size={28}
            color={canAfford ? '#6200ea' : '#999'}
          />
        </View>

        <View style={styles.infoContainer}>
          <Text
            style={[
              styles.rewardTitle,
              !canAfford && styles.textDisabled,
            ]}
          >
            {item.title}
          </Text>
          <Text style={styles.rewardCost}>
            {item.cost} Puan
          </Text>
        </View>

        <View
          style={[
            styles.button,
            canAfford
              ? styles.buttonEnabled
              : styles.buttonDisabled,
          ]}
        >
          <Text style={styles.buttonText}>
            {canAfford ? 'AL' : '🔒'}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Ödül Mağazası 🛍️
        </Text>

        <View style={styles.pointsContainer}>
          <Ionicons name="diamond" size={20} color="#00e5ff" />
          <Text style={styles.pointsText}>{points} XP</Text>
        </View>
      </View>

      <FlatList
        data={SAMPLE_REWARDS}
        keyExtractor={(item) => item.id}
        renderItem={renderRewardItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#6200ea',
    paddingTop: 50,
    paddingBottom: 25,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: 'center',
    elevation: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
  },
  pointsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginLeft: 8,
  },
  listContent: {
    padding: 20,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 15,
    marginBottom: 15,
    elevation: 3,
  },
  iconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#f3e5f5',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  iconDisabled: {
    backgroundColor: '#eee',
  },
  infoContainer: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
  },
  textDisabled: {
    color: '#999',
  },
  rewardCost: {
    fontSize: 14,
    color: '#666',
    marginTop: 4,
  },
  button: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 12,
    minWidth: 60,
    alignItems: 'center',
  },
  buttonEnabled: {
    backgroundColor: '#6200ea',
  },
  buttonDisabled: {
    backgroundColor: '#e0e0e0',
  },
  buttonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
