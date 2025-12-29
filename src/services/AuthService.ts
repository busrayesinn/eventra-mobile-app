/* eslint-disable @typescript-eslint/no-unused-vars */
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface User {
  name: string;
  email: string;
  password: string;
  points: number;
}

const USERS_DB_KEY = 'users_database'; // Tüm kullanıcıların tutulduğu yer
const SESSION_KEY = 'active_session';  // Şu an giriş yapmış kullanıcı

export const AuthService = {
  checkUserExists: async (email: string): Promise<boolean> => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_DB_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      return users.some(user => user.email === email);
    } catch (error: any) {
      return false;
    }
  },

  register: async (newUser: User): Promise<boolean> => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_DB_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];
      
      users.push(newUser);
      
      await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      return true;
    } catch (error: any) {
      console.error('Register Error:', error);
      return false;
    }
  },

  login: async (email: string, pass: string): Promise<User | null> => {
    try {
      const usersJson = await AsyncStorage.getItem(USERS_DB_KEY);
      const users: User[] = usersJson ? JSON.parse(usersJson) : [];

      const foundUser = users.find(u => u.email === email && u.password === pass);

      if (foundUser) {
        // Oturumu başlat
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(foundUser));
        return foundUser;
      }
      return null;
    } catch (error: any) {
      console.error('Login Error:', error);
      return null;
    }
  },

  logout: async () => {
    try {
      await AsyncStorage.removeItem(SESSION_KEY);
    } catch (error: any) {
      console.error('Logout Error:', error);
    }
  },

  getCurrentUser: async (): Promise<User | null> => {
    try {
      const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
      return sessionJson ? JSON.parse(sessionJson) : null;
    } catch (error: any) {
      return null;
    }
  },

  spendPoints: async (amount: number): Promise<number | null> => {
    try {
      // 1. Aktif oturumu bul
      const sessionJson = await AsyncStorage.getItem(SESSION_KEY);
      if (!sessionJson) return null;
      
      const currentUser: User = JSON.parse(sessionJson);
      
      // 2. Veritabanını çek ve kullanıcıyı bul
      const usersJson = await AsyncStorage.getItem(USERS_DB_KEY);
      let users: User[] = usersJson ? JSON.parse(usersJson) : [];
      
      const userIndex = users.findIndex(u => u.email === currentUser.email);

      if (userIndex !== -1 && users[userIndex].points >= amount) {
        // 3. Puanı düş
        users[userIndex].points -= amount;
        
        // 4. Hem veritabanını hem oturumu güncelle
        await AsyncStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
        await AsyncStorage.setItem(SESSION_KEY, JSON.stringify(users[userIndex]));
        
        return users[userIndex].points;
      }
      
      return null;
    } catch (error: any) {
      console.error('Spend Points Error:', error);
      return null;
    }
  }
};