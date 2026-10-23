import React, { useEffect, useRef } from 'react';
import { Animated, Easing } from 'react-native';

/**
 * Reusable animations (React Native Animated API, runs on the native thread)
 *
 * Explanation for Viva:
 * - `FadeInUp`: a card fades in and slides up when it first appears. FlatList renders
 *   rows lazily, so new cards animate in as the user scrolls down.
 * - `scrollItemStyle`: links a card to the scroll position. While a card scrolls off the
 *   top of the list it shrinks and fades out; cards entering stay full size.
 */

export function FadeInUp({ children, index = 0, style }) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(progress, {
      toValue: 1,
      duration: 450,
      // Stagger the first cards, cap the delay so late cards are not slow
      delay: Math.min(index, 6) * 80,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [progress, index]);

  const animatedStyle = {
    opacity: progress,
    transform: [
      { translateY: progress.interpolate({ inputRange: [0, 1], outputRange: [40, 0] }) },
      { scale: progress.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
    ],
  };

  return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>;
}

// Scroll-linked style: item at `index` (row height `itemSize`) shrinks as it leaves the top
export function scrollItemStyle(scrollY, index, itemSize, offset = 0) {
  const start = offset + itemSize * index;
  const inputRange = [-1, 0, start, start + itemSize];
  return {
    opacity: scrollY.interpolate({
      inputRange,
      outputRange: [1, 1, 1, 0],
      extrapolate: 'clamp',
    }),
    transform: [
      {
        scale: scrollY.interpolate({
          inputRange,
          outputRange: [1, 1, 1, 0.8],
          extrapolate: 'clamp',
        }),
      },
    ],
  };
}
