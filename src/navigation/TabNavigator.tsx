/* eslint-disable react/no-unstable-nested-components */
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Ionicons from 'react-native-vector-icons/Ionicons'; 

import RewardsScreen from '../screens/Main/Rewards/RewardsScreen';
import FavoritesScreen from '../screens/Main/Favorites/FavoritesScreen';
import NotesScreen from '../screens/Main/Notes/NotesScreen';
import HomeStack from './HomeStack';

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#6200ea', 
        tabBarInactiveTintColor: 'gray',
        tabBarIcon: ({ focused, color, size }) => {
          let iconName = '';

          if (route.name === 'Anasayfa') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Favoriler') {
            iconName = focused ? 'heart' : 'heart-outline';
          } else if (route.name === 'Notlar') {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === 'Ödüller') {
            iconName = focused ? 'gift' : 'gift-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Anasayfa" component={HomeStack} />
      <Tab.Screen name="Favoriler" component={FavoritesScreen} />
      <Tab.Screen name="Notlar" component={NotesScreen} />
      <Tab.Screen name="Ödüller" component={RewardsScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
