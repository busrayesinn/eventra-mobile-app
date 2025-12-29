import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/Main/Home/HomeScreen';
import EventDetailScreen from '../screens/Main/Home/EventDetailScreen';

export type HomeStackParamList = {
  Home: undefined;
  EventDetail: { eventId: number };
};

const Stack = createNativeStackNavigator<HomeStackParamList>();

export default function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ headerShown: false }}
      />

      <Stack.Screen
        name="EventDetail"
        component={EventDetailScreen}
        options={{ title: 'Etkinlik Detayı' }}
      />
    </Stack.Navigator>
  );
}
