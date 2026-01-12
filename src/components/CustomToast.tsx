import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Animated,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { SafeAreaView } from 'react-native-safe-area-context';

let toastRef: any = null;

export const showToast = (title: string, message: string) => {
  if (toastRef) {
    toastRef.show(title, message);
  }
};

export default function CustomToast() {
  const [visible, setVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  
  // (Ekranın yukarısından aşağı inecek)
  const translateY = useRef(new Animated.Value(-150)).current;
 
  useEffect(() => {
    toastRef = {
      show: (t: string, m: string) => {
        setTitle(t);
        setMessage(m);
        setVisible(true);

        // Aşağı inme animasyonu
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          speed: 12,
          bounciness: 5,
        }).start();

        // 3 saniye sonra yukarı çıkma animasyonu
        setTimeout(() => {
          Animated.timing(translateY, {
            toValue: -150,
            duration: 300,
            useNativeDriver: true,
          }).start(() => {
            setVisible(false);
          });
        }, 3000);
      },
    };
  }, [translateY]);

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        { transform: [{ translateY }] },
      ]}
    >

      <SafeAreaView edges={['top']}>
        <View style={styles.contentContainer}>
          <View style={styles.iconContainer}>
             <Ionicons name="trophy" size={24} color="#fff" />
          </View>
          <View style={styles.textContainer}>
            <Text style={styles.title}>{title}</Text>
            <Text style={styles.message}>{message}</Text>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: '#6c5ce7', 
    zIndex: 9999, 
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 0, 
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 6,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10, 
  },
  iconContainer: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    color: '#f0f0f0',
    fontSize: 13,
    marginTop: 2,
  },
});