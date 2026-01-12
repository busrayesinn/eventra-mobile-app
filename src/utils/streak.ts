import AsyncStorage from '@react-native-async-storage/async-storage';

export const checkDailyStreak = async () => {
  const today = new Date().toDateString();

  const lastLogin = await AsyncStorage.getItem('lastLoginDate');
  let streak = Number(await AsyncStorage.getItem('streak')) || 0;

  // Aynı gün tekrar girilmişse
  if (lastLogin === today) return;

  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);

  if (lastLogin === yesterday.toDateString()) {
    streak += 1;
  } else {
    streak = 1;
  }

  await AsyncStorage.setItem('streak', streak.toString());
  await AsyncStorage.setItem('lastLoginDate', today);
};
