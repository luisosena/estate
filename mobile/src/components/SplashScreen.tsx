import React, { useEffect } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
  runOnJS,
} from 'react-native-reanimated';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.95);

  useEffect(() => {
    // Elegant slow fade in and delicate scale up
    opacity.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    scale.value = withTiming(1, { duration: 1200, easing: Easing.out(Easing.cubic) });

    // Hold the screen for a moment, then fade out gracefully
    const timeout = setTimeout(() => {
      opacity.value = withTiming(0, { duration: 600, easing: Easing.inOut(Easing.quad) }, (finished) => {
        if (finished) {
          runOnJS(onFinish)();
        }
      });
    }, 2500);

    return () => clearTimeout(timeout);
  }, [opacity, scale, onFinish]);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ scale: scale.value }],
  }));

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.content, animatedStyle]}>
        <View style={styles.logoContainer}>
          <Text style={styles.brandAccent}>E</Text>
        </View>
        <Text style={styles.title}>Estate Practice</Text>
        <Text style={styles.subtitle}>Curated property management</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f4c4c', // Deep Teal background to match brand primary color
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
  },
  logoContainer: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: '#d4a853', // Rich Gold accent
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 4,
  },
  brandAccent: {
    fontSize: 32,
    fontWeight: '400',
    color: '#0f4c4c',
    letterSpacing: -0.5,
  },
  title: {
    fontSize: 26,
    fontWeight: '300',
    color: '#ffffff',
    letterSpacing: 2,
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '400',
    color: '#d4a853',
    letterSpacing: 1.5,
    textTransform: 'uppercase',
    opacity: 0.9,
  },
});
