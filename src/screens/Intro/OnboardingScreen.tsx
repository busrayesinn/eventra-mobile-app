import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Dimensions,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedScrollHandler,
  useAnimatedStyle,
  interpolate,
  Extrapolation,
  SharedValue,
} from 'react-native-reanimated';
import Ionicons from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

// Tanıtım Verileri
const SLIDES = [
  {
    id: 1,
    title: 'Şehrini Keşfet',
    description: 'Etrafındaki konserleri, tiyatroları ve festivalleri anında bul. Hiçbir etkinliği kaçırma.',
    icon: 'map',
  },
  {
    id: 2,
    title: 'Puanları Topla',
    description: 'Etkinliklere katılarak, notlar alarak ve beğendiğin etkinlikleri favorilere ekleyerek puan topla. Rozet kazan.',
    icon: 'trophy',
  },
  {
    id: 3,
    title: 'Rozetlerin Kilidini Aç',
    description: 'Düzenli giriş yap, "Streak" yakala ve profilini havalı rozetlerle süsle.',
    icon: 'ribbon',
  },
];

// --- ALT BİLEŞEN 1: TEK BİR SLAYT (Item) ---
const OnboardingItem = ({ item, index, x }: { item: typeof SLIDES[0], index: number, x: SharedValue<number> }) => {
  const imageAnimatedStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      x.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0, 1, 0],
      Extrapolation.CLAMP
    );
    const translateY = interpolate(
      x.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [100, 0, 100],
      Extrapolation.CLAMP
    );
    return {
      opacity,
      transform: [{ translateY }],
    };
  });

  return (
    <View style={styles.slideContainer}>
      <Animated.View style={[styles.imageContainer, imageAnimatedStyle]}>
        <View style={styles.iconCircle}>
          <Ionicons name={item.icon} size={80} color="#fff" />
        </View>
      </Animated.View>

      <View style={styles.textContainer}>
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </View>
    </View>
  );
};

// --- ALT BİLEŞEN 2: TEK BİR NOKTA (Dot) ---
const PaginationDot = ({ index, x }: { index: number, x: SharedValue<number> }) => {
  const dotStyle = useAnimatedStyle(() => {
    const widthAnim = interpolate(
      x.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [8, 20, 8],
      Extrapolation.CLAMP
    );
    const opacity = interpolate(
      x.value,
      [(index - 1) * width, index * width, (index + 1) * width],
      [0.3, 1, 0.3],
      Extrapolation.CLAMP
    );
    return {
      width: widthAnim,
      opacity,
    };
  });

  return <Animated.View style={[styles.dot, dotStyle]} />;
};

// --- ALT BİLEŞEN 3: SAYFALAMA (Pagination Wrapper) ---
const Pagination = ({ x }: { x: SharedValue<number> }) => {
  return (
    <View style={styles.paginationContainer}>
      {SLIDES.map((_, index) => (
        <PaginationDot key={index} index={index} x={x} />
      ))}
    </View>
  );
};

// --- ANA EKRAN ---
export default function OnboardingScreen({ navigation }: any) {
  const flatListRef = useRef<FlatList>(null);
  const x = useSharedValue(0);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      x.value = event.contentOffset.x;
    },
  });

  const handleNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(currentIndex + 1);
    } else {
      navigation.replace('MainTabs');
    }
  };

  const renderItem = ({ item, index }: { item: typeof SLIDES[0], index: number }) => {
    return <OnboardingItem item={item} index={index} x={x} />;
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />

      <View style={styles.bgGlow} />

      <Animated.FlatList
        ref={flatListRef}
        data={SLIDES}
        renderItem={renderItem}
        keyExtractor={(item) => item.id.toString()}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        onMomentumScrollEnd={(event) => {
          const index = Math.round(event.nativeEvent.contentOffset.x / width);
          setCurrentIndex(index);
        }}
      />

      <View style={styles.footer}>
        <Pagination x={x} />

        <TouchableOpacity
          style={styles.button}
          onPress={handleNext}
          activeOpacity={0.8}
        >
          <Text style={styles.buttonText}>
            {currentIndex === SLIDES.length - 1 ? 'Başlayalım' : 'Devam Et'}
          </Text>
          <Ionicons
            name={currentIndex === SLIDES.length - 1 ? 'rocket-outline' : 'arrow-forward'}
            size={20}
            color="#fff"
            style={styles.iconMargin} 
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  bgGlow: {
    position: 'absolute',
    top: -100,
    left: -100,
    width: 400,
    height: 400,
    borderRadius: 200,
    backgroundColor: '#6c5ce7',
    opacity: 0.15,
    transform: [{ scale: 1.5 }],
  },
  slideContainer: {
    width: width,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  imageContainer: {
    marginBottom: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconCircle: {
    width: 180,
    height: 180,
    backgroundColor: '#1c1c24',
    borderRadius: 90,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#2d2d3a',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  textContainer: {
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 12,
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    lineHeight: 24,
    paddingHorizontal: 10,
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    paddingHorizontal: 30,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  paginationContainer: {
    flexDirection: 'row',
    height: 10,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    backgroundColor: '#6c5ce7',
    marginRight: 6,
  },
  button: {
    flexDirection: 'row',
    backgroundColor: '#6c5ce7',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  iconMargin: {
    marginLeft: 8,
  },
});