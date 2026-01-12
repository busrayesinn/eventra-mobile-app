import React, { useEffect, useState } from 'react';
import {
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  View,
  Keyboard,
  TouchableWithoutFeedback,
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withDelay,
  withSpring,
  interpolate,
  useDerivedValue,
  withSequence,
  Easing,
} from 'react-native-reanimated';
import { saveNickname } from '../../storage/appStorage';

const { width, height } = Dimensions.get('window');

export default function IntroScreen({ navigation }: any) {
  const [nickname, setNickname] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  const logoPhase = useSharedValue(0);
  const contentPhase = useSharedValue(0);
  const buttonScale = useSharedValue(1);

  const titleOpacity = useDerivedValue(() => {
    return withDelay(100, withTiming(contentPhase.value, { duration: 500 }));
  });

  const inputOpacity = useDerivedValue(() => {
    return withDelay(300, withTiming(contentPhase.value, { duration: 500 }));
  });

  const buttonEnterScale = useDerivedValue(() => {
    return withDelay(500, withSpring(contentPhase.value ? 1 : 0));
  });

  useEffect(() => {
    logoPhase.value = withTiming(1, {
      duration: 1200,
      easing: Easing.out(Easing.exp),
    });

    setTimeout(() => {
      logoPhase.value = withTiming(2, {
        duration: 800,
        easing: Easing.inOut(Easing.cubic),
      });

      contentPhase.value = withTiming(1, { duration: 800 });
    }, 800);
  }, [logoPhase, contentPhase]);

  const handleStart = async () => {
    if (!nickname.trim()) {
      buttonScale.value = withSequence(
        withTiming(0.9, { duration: 50 }),
        withTiming(1.1, { duration: 50 }),
        withTiming(1, { duration: 50 }),
      );
      return;
    }

    logoPhase.value = withTiming(0, { duration: 300 });
    contentPhase.value = withTiming(0, { duration: 300 });

    setTimeout(async () => {
      await saveNickname(nickname);
      navigation.replace('Onboarding');
    }, 300);
  };

  const logoStyle = useAnimatedStyle(() => {
    const opacity = interpolate(logoPhase.value, [0, 0.2, 2], [0, 1, 1]);

    const scale = interpolate(logoPhase.value, [0, 1, 2], [0.8, 1.3, 1]);

    const translateY = interpolate(
      logoPhase.value,
      [0, 1, 2],
      [50, height * 0.22, 0],
    );

    return {
      opacity,
      transform: [{ translateY }, { scale }],
    };
  });

  const titleStyle = useAnimatedStyle(() => ({
    opacity: titleOpacity.value,
    transform: [
      { translateY: interpolate(titleOpacity.value, [0, 1], [20, 0]) },
    ],
  }));

  const inputStyle = useAnimatedStyle(() => ({
    opacity: inputOpacity.value,
    transform: [
      { translateY: interpolate(inputOpacity.value, [0, 1], [30, 0]) },
    ],
  }));

  const buttonAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonEnterScale.value * buttonScale.value }],
    opacity: contentPhase.value,
  }));

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.keyboardView}
        >
          <View style={styles.topSection}>
            <Animated.View style={[styles.logoContainer, logoStyle]}>
              <Image
                source={require('../../assets/logo.png')}
                style={styles.logoImage}
                resizeMode="contain"
              />
            </Animated.View>
          </View>

          <View style={styles.bottomSection}>
            <Animated.View style={[styles.titleContainer, titleStyle]}>
              <Text style={styles.mainTitle}>
                Şehrindeki etkinlikleri keşfet
              </Text>
              <Text style={styles.subTitle}>Sana nasıl hitap edelim?</Text>
            </Animated.View>

            <Animated.View style={[styles.inputWrapper, inputStyle]}>
              <TextInput
                style={[styles.input, isFocused && styles.inputFocused]}
                placeholder="Takma adın"
                placeholderTextColor="#666"
                value={nickname}
                onChangeText={setNickname}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                autoCorrect={false}
              />
            </Animated.View>

            <Animated.View style={buttonAnimatedStyle}>
              <TouchableOpacity
                style={styles.button}
                onPress={handleStart}
                activeOpacity={0.8}
              >
                <Text style={styles.buttonText}>Keşfetmeye Başla</Text>
              </TouchableOpacity>
            </Animated.View>
          </View>
        </KeyboardAvoidingView>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f0f14',
  },
  keyboardView: {
    flex: 1,
    justifyContent: 'space-between',
  },
  topSection: {
    flex: 1.2,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  bottomSection: {
    flex: 0.9,
    paddingHorizontal: 30,
    justifyContent: 'flex-start',
    paddingTop: 10,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    width: width * 0.85,
    height: width * 0.85,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  mainTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  subTitle: {
    fontSize: 15,
    color: '#888',
    textAlign: 'center',
    fontWeight: '400',
  },
  inputWrapper: {
    width: '100%',
    marginBottom: 24,
  },
  input: {
    backgroundColor: '#1c1c24',
    borderRadius: 20,
    paddingVertical: 18,
    paddingHorizontal: 24,
    fontSize: 16,
    color: '#fff',
    borderWidth: 1.5,
    borderColor: 'transparent',
    textAlign: 'center',
  },
  inputFocused: {
    borderColor: '#6c5ce7',
    backgroundColor: '#23232d',
  },
  button: {
    backgroundColor: '#6c5ce7',
    paddingVertical: 18,
    borderRadius: 20,
    alignItems: 'center',
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
});
