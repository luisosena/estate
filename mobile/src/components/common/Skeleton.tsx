import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  interpolate,
} from 'react-native-reanimated';
import { colors } from '../../constants/colors';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  borderRadius?: number;
  style?: ViewStyle;
  variant?: 'rectangle' | 'circle' | 'text';
  testID?: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

/**
 * A shimmering Skeleton component for elegant loading states.
 * Uses Reanimated for high-performance animation.
 */
export const Skeleton: React.FC<SkeletonProps> = ({
  width = '100%',
  height = 20,
  borderRadius = 8,
  style,
  variant = 'rectangle',
  testID,
}) => {
  const shimmerValue = useSharedValue(0);

  useEffect(() => {
    shimmerValue.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1, // Infinite
      false // Do not reverse, just restart
    );
  }, [shimmerValue]);

  const animatedStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      shimmerValue.value,
      [0, 1],
      [-SCREEN_WIDTH * 0.5, SCREEN_WIDTH]
    );

    return {
      transform: [{ translateX }],
    };
  });

  const getBorderRadius = () => {
    if (variant === 'circle') return typeof height === 'number' ? height / 2 : 50;
    if (variant === 'text') return 4;
    return borderRadius;
  };

  return (
    <View
      style={[
        styles.container,
        {
          width: width as any,
          height: height as any,
          borderRadius: getBorderRadius(),
          backgroundColor: colors.gray[200], // Darkened from 100 to 200 for better visibility
        },
        style,
      ]}
      testID={testID}
    >
      <Animated.View style={[styles.shimmerContainer, animatedStyle]}>
        <View style={styles.shimmer} />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    position: 'relative',
  },
  shimmerContainer: {
    ...StyleSheet.absoluteFillObject,
    width: '100%',
  },
  shimmer: {
    height: '100%',
    width: '40%', // Slightly narrower for a sharper shimmer
    backgroundColor: 'rgba(255, 255, 255, 0.6)', // Increased from 0.4 to 0.6
  },
});
