import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  Modal,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';
import { getPoints, spendPoints, getStreak } from '../../../storage/appStorage';
import { Reward, REWARDS } from '../../../data/rewardsData';

export default function RewardsScreen() {
  const [points, setPoints] = useState(0);
  const [streak, setStreak] = useState(0);
  const [ownedRewards, setOwnedRewards] = useState<string[]>([]);
  const [selectedReward, setSelectedReward] = useState<Reward | null>(null);

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const loadData = async () => {
    const p = await getPoints();
    const s = await getStreak();
    const owned = await AsyncStorage.getItem('ownedRewards');

    setPoints(p);
    setStreak(s);
    setOwnedRewards(owned ? JSON.parse(owned) : []);
  };

  const buyReward = async (reward: Reward) => {
    if (reward.type !== 'SHOP') return;
    if (ownedRewards.includes(reward.id)) return;

    const updated = await spendPoints(reward.cost!);
    if (updated === null) return;

    const newOwned = [...ownedRewards, reward.id];
    await AsyncStorage.setItem('ownedRewards', JSON.stringify(newOwned));

    setPoints(updated);
    setOwnedRewards(newOwned);
    setSelectedReward(reward);
  };

  const renderItem = ({ item }: { item: Reward }) => {
    const owned = ownedRewards.includes(item.id);

    const isShop = item.type === 'SHOP';
    const canAfford = isShop && points >= (item.cost ?? 0);

    const isStreakLocked =
      item.type === 'STREAK' && streak < (item.streakRequired ?? 0);

    return (
      <View style={styles.card}>
        <Image
          source={item.image}
          style={[
            styles.rewardImage,
            isStreakLocked && styles.imageLocked,
          ]}
        />

        {/* 🔒 KİLİT */}
        {!owned && (isStreakLocked || (!canAfford && isShop)) && (
          <View style={styles.lockOverlay}>
            <Ionicons name="lock-closed" size={22} color="#fff" />
          </View>
        )}

        <View style={styles.info}>
          <Text style={styles.title}>{item.title}</Text>
          <Text style={styles.desc}>{item.description}</Text>

          {/* DURUM */}
          {owned ? (
            <Text style={styles.ownedText}>Kazanıldı ✅</Text>
          ) : item.type === 'SHOP' ? (
            <Text style={styles.cost}>{item.cost} Puan</Text>
          ) : (
            <Text style={styles.streakReq}>
              {item.streakRequired} gün streak gerekli
            </Text>
          )}
        </View>

        {/* 🛒 AL BUTONU – SADECE SHOP */}
        {!owned && isShop && canAfford && (
          <TouchableOpacity
            style={styles.buyButton}
            onPress={() => buyReward(item)}
          >
            <Text style={styles.buyButtonText}>AL</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Ödüller 🏆</Text>
        <View style={styles.pointsBox}>
          <Ionicons name="diamond" size={18} color="#00e5ff" />
          <Text style={styles.pointsText}>{points} XP</Text>
        </View>
      </View>

      <FlatList
        data={REWARDS}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        // eslint-disable-next-line react-native/no-inline-styles
        contentContainerStyle={{ padding: 20 }}
        showsVerticalScrollIndicator={false}
      />

      {/* 🎉 TEBRİK MODALI */}
      <Modal visible={!!selectedReward} transparent animationType="fade">
        <View style={styles.modalBg}>
          <View style={styles.modalCard}>
            {selectedReward && (
              <>
                <Image
                  source={selectedReward.image}
                  style={styles.modalImage}
                />
                <Text style={styles.modalTitle}>Tebrikler 🎉</Text>
                <Text style={styles.modalText}>
                  "{selectedReward.title}" ödülünü kazandın!
                </Text>

                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={() => setSelectedReward(null)}
                >
                  <Text style={styles.modalButtonText}>Harika!</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </Modal>
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
    alignItems: 'center',
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#fff',
  },
  pointsBox: {
    flexDirection: 'row',
    marginTop: 10,
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pointsText: {
    color: '#fff',
    fontWeight: 'bold',
    marginLeft: 6,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 14,
    marginBottom: 16,
    flexDirection: 'row',
    elevation: 3,
  },
  rewardImage: {
    width: 64,
    height: 64,
    marginRight: 14,
  },
  imageLocked: {
    opacity: 0.4,
  },
  info: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  desc: {
    fontSize: 13,
    color: '#777',
    marginTop: 4,
  },
  cost: {
    marginTop: 6,
    fontWeight: '600',
    color: '#6200ea',
  },
  streakReq: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: '600',
    color: '#999',
  },
  lockOverlay: {
    position: 'absolute',
    right: 16,
    top: 16,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 20,
    padding: 6,
  },
  ownedText: {
    marginTop: 6,
    fontWeight: '600',
    color: '#2ecc71',
  },
  buyButton: {
    backgroundColor: '#6200ea',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 14,
    alignSelf: 'center',
  },
  buyButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalCard: {
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 24,
    alignItems: 'center',
    width: '80%',
  },
  modalImage: {
    width: 90,
    height: 90,
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  modalText: {
    textAlign: 'center',
    marginTop: 8,
    color: '#555',
  },
  modalButton: {
    marginTop: 20,
    backgroundColor: '#6200ea',
    paddingHorizontal: 30,
    paddingVertical: 10,
    borderRadius: 20,
  },
  modalButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
