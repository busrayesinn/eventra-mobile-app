import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  nickname: 'nickname',
  favorites: 'favorites',
  notes: 'notes',
  points: 'points',
};

/* ---------- NICKNAME ---------- */
export const saveNickname = async (nickname: string) => {
  await AsyncStorage.setItem(KEYS.nickname, nickname);
};

export const getNickname = async (): Promise<string | null> => {
  return await AsyncStorage.getItem(KEYS.nickname);
};

/* ---------- POINTS ---------- */
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

/* ---------- FAVORITES ---------- */
export const getFavorites = async (): Promise<any[]> => {
  const data = await AsyncStorage.getItem(KEYS.favorites);
  return data ? JSON.parse(data) : [];
};

export const toggleFavorite = async (event: any) => {
  const favorites = await getFavorites();
  const exists = favorites.find((e) => e.id === event.id);

  const updated = exists
    ? favorites.filter((e) => e.id !== event.id)
    : [...favorites, event];

  await AsyncStorage.setItem(KEYS.favorites, JSON.stringify(updated));
  return updated;
};

/* ---------- NOTES ---------- */
export const getNotes = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(KEYS.notes);
  return data ? JSON.parse(data) : [];
};

export const addNote = async (note: string) => {
  const notes = await getNotes();
  const updated = [...notes, note];
  await AsyncStorage.setItem(KEYS.notes, JSON.stringify(updated));
  return updated;
};
