import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  Animated,
  ScrollView,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { COLORS, SHADOW } from '../theme/colors';
import { ScreenBackground } from './UI';

/**
 * Onboarding Carousel (Figma Screen 1)
 *
 * Explanation for Viva:
 * - A horizontal, paging FlatList shows 3 intro slides; the user swipes left/right.
 * - The dots under the image follow the swipe: the active dot stretches into the
 *   long line from the design (Animated width linked to the horizontal scroll).
 * - Sizes come from `useWindowDimensions`, so the page fits small and large phones,
 *   and the whole page can scroll vertically if a phone is very short.
 */

const SLIDES = [
  {
    key: 'shop',
    image: require('../../assets/images/hero_fruits.png'),
    title: 'Grocery Shop',
    subtitle: 'The easiest way to buy your\ngrocery shopping',
  },
  {
    key: 'fresh',
    image: require('../../assets/images/bellpepper.png'),
    title: 'Fresh Vegetables',
    subtitle: 'Farm-fresh vegetables picked\nevery morning for your kitchen',
  },
  {
    key: 'delivery',
    image: require('../../assets/images/orange.png'),
    title: 'Fast Delivery',
    subtitle: 'Juicy fruits delivered to your\ndoorstep in 30 minutes',
  },
];

const DOT = 8;
const DOT_ACTIVE = 48;

export default function OnboardingCarousel({ onDone }) {
  const { width, height } = useWindowDimensions();
  const insets = useSafeAreaInsets();
  const listRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;
  const indexRef = useRef(0);
  const [index, setIndex] = useState(0);

  // Responsive sizes
  const imageHeight = Math.max(180, Math.min(height * 0.42, width * 1.05, 420));
  const titleSize = width < 360 ? 26 : 30;
  const subtitleSize = width < 360 ? 16 : 19;
  const isLast = index === SLIDES.length - 1;

  // Only re-render when the slide number really changes (not on every scroll frame)
  const updateIndex = (newIndex) => {
    if (newIndex !== indexRef.current) {
      indexRef.current = newIndex;
      setIndex(newIndex);
    }
  };

  const goNext = () => {
    if (isLast) {
      onDone();
      return;
    }
    listRef.current?.scrollToOffset({ offset: (indexRef.current + 1) * width, animated: true });
  };

  // Each slide carries its own image AND text, so the text slides with the picture
  const renderSlide = ({ item, index: i }) => {
    const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
    const imageStyle = {
      transform: [
        { translateX: scrollX.interpolate({ inputRange, outputRange: [width * 0.25, 0, -width * 0.25] }) },
        { scale: scrollX.interpolate({ inputRange, outputRange: [0.8, 1, 0.8], extrapolate: 'clamp' }) },
      ],
    };
    const textStyle = {
      opacity: scrollX.interpolate({ inputRange, outputRange: [0, 1, 0], extrapolate: 'clamp' }),
      transform: [
        { translateY: scrollX.interpolate({ inputRange, outputRange: [20, 0, 20], extrapolate: 'clamp' }) },
      ],
    };

    return (
      <View style={[styles.slide, { width }]}>
        <Animated.Image
          source={item.image}
          style={[{ width: width - 48, height: imageHeight }, imageStyle]}
          resizeMode="contain"
        />
        <View style={styles.dotsSpace} />
        <Animated.View style={[styles.textBlock, textStyle]}>
          <Text style={[styles.title, { fontSize: titleSize }]}>{item.title}</Text>
          <Text style={[styles.subtitle, { fontSize: subtitleSize, lineHeight: subtitleSize * 1.4 }]}>
            {item.subtitle}
          </Text>
        </Animated.View>
      </View>
    );
  };

  return (
    <ScreenBackground>
      <ScrollView
        contentContainerStyle={[
          styles.page,
          { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 },
        ]}
        showsVerticalScrollIndicator={false}
        bounces={false}
      >
        {/* Skip button (hidden on the last slide) */}
        <View style={styles.topRow}>
          {!isLast && (
            <TouchableOpacity onPress={onDone} hitSlop={10}>
              <Text style={styles.skipText}>Skip</Text>
            </TouchableOpacity>
          )}
        </View>

        <View style={{ width }}>
          {/* Swipeable slides */}
          <Animated.FlatList
            ref={listRef}
            data={SLIDES}
            keyExtractor={(item) => item.key}
            renderItem={renderSlide}
            horizontal
            pagingEnabled
            decelerationRate="fast"
            showsHorizontalScrollIndicator={false}
            bounces={false}
            getItemLayout={(_, i) => ({ length: width, offset: width * i, index: i })}
            onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
              useNativeDriver: false,
              // Works for finger swipes and for the Next button
              listener: (e) => updateIndex(Math.round(e.nativeEvent.contentOffset.x / width)),
            })}
            scrollEventThrottle={16}
            style={{ flexGrow: 0, width }}
          />

          {/* Page indicator: active dot stretches into a line (stays fixed under the image) */}
          <View pointerEvents="none" style={[styles.dotsRow, { top: imageHeight + 20 }]}>
            {SLIDES.map((slide, i) => {
              const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
              const dotWidth = scrollX.interpolate({
                inputRange,
                outputRange: [DOT, DOT_ACTIVE, DOT],
                extrapolate: 'clamp',
              });
              const opacity = scrollX.interpolate({
                inputRange,
                outputRange: [0.35, 1, 0.35],
                extrapolate: 'clamp',
              });
              return <Animated.View key={slide.key} style={[styles.dot, { width: dotWidth, opacity }]} />;
            })}
          </View>
        </View>

        <View style={styles.spacer} />

        <TouchableOpacity style={styles.button} onPress={goNext} activeOpacity={0.85}>
          <Text style={styles.buttonText}>{isLast ? 'Get Started' : 'Next'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </ScreenBackground>
  );
}

const styles = StyleSheet.create({
  page: {
    flexGrow: 1,
    alignItems: 'center',
  },
  topRow: {
    alignSelf: 'stretch',
    alignItems: 'flex-end',
    paddingHorizontal: 24,
    height: 28,
  },
  skipText: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  slide: {
    alignItems: 'center',
  },
  dotsRow: {
    position: 'absolute',
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  dotsSpace: {
    height: 28,
  },
  textBlock: {
    alignItems: 'center',
  },
  dot: {
    height: DOT,
    borderRadius: DOT / 2,
    backgroundColor: COLORS.textDark,
  },
  title: {
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 24,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  subtitle: {
    color: COLORS.textMedium,
    textAlign: 'center',
    marginTop: 8,
    paddingHorizontal: 24,
  },
  spacer: {
    flex: 1,
    minHeight: 24,
  },
  button: {
    alignSelf: 'stretch',
    marginHorizontal: 32,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.primaryDark,
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW,
  },
  buttonText: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.white,
  },
});
