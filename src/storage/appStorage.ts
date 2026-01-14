import AsyncStorage from '@react-native-async-storage/async-storage';
import { showToast } from '../components/CustomToast';

const KEYS = {
  nickname: 'nickname',
  favorites: 'favorites',
  notes: 'notes',
  points: 'points',
  streak: 'streak',
  lastLoginDate: 'lastLoginDate',
  ownedRewards: 'ownedRewards',
  participations: 'participations',
};

const getTodayKey = () => {
  return new Date().toISOString().split('T')[0]; // YYYY-MM-DD
};

const canGiveDailyPoint = async (type: 'note' | 'favorite') => {
  const key = `daily_${type}_point_${getTodayKey()}`;
  const value = await AsyncStorage.getItem(key);
  return !value;
};

const markDailyPointGiven = async (type: 'note' | 'favorite') => {
  const key = `daily_${type}_point_${getTodayKey()}`;
  await AsyncStorage.setItem(key, 'true');
};

/* ================= USER ================= */

export const saveNickname = async (nickname: string) => {
  await AsyncStorage.setItem(KEYS.nickname, nickname);
};

export const getNickname = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(KEYS.nickname);
};

/* ================= POINTS ================= */

export const getPoints = async (): Promise<number> => {
  const value = await AsyncStorage.getItem(KEYS.points);
  return value ? Number(value) : 0;
};

export const addPoints = async (amount: number) => {
  const current = await getPoints();
  const updated = current + amount;
  await AsyncStorage.setItem(KEYS.points, updated.toString());
  return updated;
};

export const spendPoints = async (amount: number) => {
  const current = await getPoints();
  if (current < amount) return null;

  const updated = current - amount;
  await AsyncStorage.setItem(KEYS.points, updated.toString());
  return updated;
};

/* ================= FAVORITES ================= */

export const getFavorites = async (): Promise<any[]> => {
  const data = await AsyncStorage.getItem(KEYS.favorites);
  return data ? JSON.parse(data) : [];
};

export const toggleFavorite = async (event: any) => {
  const favorites = await getFavorites();
  const exists = favorites.some(e => e.id === event.id);

  const updated = exists
    ? favorites.filter(e => e.id !== event.id)
    : [...favorites, event];

  await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(updated));

  // SADECE EKLEMEDE + GÜNLÜK 1 KEZ PUAN
  if (!exists) {
    const canGive = await canGiveDailyPoint('favorite');

    if (canGive) {
      await addPoints(5);
      await markDailyPointGiven('favorite');

      showToast(
        'Favorilere Eklendi ❤️',
        'Bugünün ilk favorisi! +5 Puan kazandın.',
      );
    }
  }

  return updated;
};

/* ================= NOTES ================= */

export interface NoteItem {
  id: string;
  title: string;
  content: string;
  eventId?: number;
  eventName?: string;
  createdAt: string;
  isPinned?: boolean;
}

export const getNotes = async (): Promise<NoteItem[]> => {
  const data = await AsyncStorage.getItem(KEYS.notes);
  return data ? JSON.parse(data) : [];
};

export const saveNotes = async (notes: NoteItem[]) => {
  await AsyncStorage.setItem(KEYS.notes, JSON.stringify(notes));
  return notes;
};

export const addNote = async (note: NoteItem) => {
  const notes = await getNotes();
  const updated = [note, ...notes];
  await saveNotes(updated);

  // GÜNLÜK 1 KEZ PUAN
  const canGive = await canGiveDailyPoint('note');

  if (canGive) {
    await addPoints(5);
    await markDailyPointGiven('note');

    showToast(
      'Tebrikler! 🎉',
      'Bugünün ilk notunu ekledin ve +5 Puan kazandın!',
    );
  }

  return updated;
};

export const deleteNote = async (id: string) => {
  const notes = await getNotes();
  const updated = notes.filter(n => n.id !== id);
  await saveNotes(updated);
  return updated;
};

export const updateNote = async (updatedNote: NoteItem) => {
  const notes = await getNotes();
  const updated = notes.map(n =>
    n.id === updatedNote.id ? updatedNote : n,
  );
  await saveNotes(updated);
  return updated;
};

export const togglePinNote = async (id: string) => {
  const notes = await getNotes();
  const updated = notes.map(note =>
    note.id === id ? { ...note, isPinned: !note.isPinned } : note,
  );
  await saveNotes(updated);
  return updated;
};

/* ================= STREAK + ROZET ================= */

const addRewardIfNotOwned = async (rewardId: string) => {
  const raw = await AsyncStorage.getItem(KEYS.ownedRewards);
  const owned: string[] = raw ? JSON.parse(raw) : [];

  if (!owned.includes(rewardId)) {
    owned.push(rewardId);
    await AsyncStorage.setItem(
      KEYS.ownedRewards,
      JSON.stringify(owned),
    );

    showToast('🏆 Yeni Rozet!', 'Başarın kilidi açıldı, profiline bak!');
  }
};

export const checkDailyLogin = async (): Promise<number> => {
  const today = new Date().toDateString();
  const lastLogin = await AsyncStorage.getItem(KEYS.lastLoginDate);
  let streak = Number(await AsyncStorage.getItem(KEYS.streak)) || 0;

  if (lastLogin === today) return streak;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastLogin === yesterday.toDateString()) {
    streak += 1;
  } else {
    streak = 1;
  }

  await AsyncStorage.setItem(KEYS.streak, streak.toString());
  await AsyncStorage.setItem(KEYS.lastLoginDate, today);

  await addPoints(10);
  showToast(
    `Günlük Giriş Başarılı 🔥`,
    `Streak: ${streak} Gün | +10 Puan Kazandın`,
  );

  if (streak === 10) await addRewardIfNotOwned('streak10');
  if (streak === 20) await addRewardIfNotOwned('streak20');
  if (streak === 30) await addRewardIfNotOwned('streak30');

  return streak;
};

export const getStreak = async (): Promise<number> => {
  const value = await AsyncStorage.getItem(KEYS.streak);
  return value ? Number(value) : 0;
};

/* ================= PARTICIPATIONS ================= */

export interface Participation {
  eventId: number;
  name: string;
  category: string;
  date: string;
}

export const getParticipations = async (): Promise<Participation[]> => {
  const value = await AsyncStorage.getItem(KEYS.participations);
  return value ? JSON.parse(value) : [];
};

export const addParticipation = async (p: Participation) => {
  const list = await getParticipations();

  if (list.some(e => e.eventId === p.eventId)) {
    showToast('Zaten Katıldın ⚠️', 'Bu etkinlik zaten listende.');
    return list;
  }

  const updated = [p, ...list];
  await AsyncStorage.setItem(
    KEYS.participations,
    JSON.stringify(updated),
  );

  await addPoints(20);
  showToast('Etkinliğe Katıldın! 🎟️', '+20 Puan hesabına eklendi!');

  return updated;
};
