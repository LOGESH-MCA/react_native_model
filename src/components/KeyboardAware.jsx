import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
  useWindowDimensions,
} from 'react-native';

/**
 * Keyboard handling (keeps the typed-in field visible above the phone keyboard)
 *
 * Explanation for Viva:
 * - Some Android phones (edge-to-edge screens) do not shrink the app when the keyboard
 *   opens, so the keyboard simply covers the bottom of the screen.
 * - To be safe on every phone we do NOT depend on the keyboard size. Instead:
 *   1. When a TextInput is focused we add empty space (half the screen) under the form,
 *      so the page always has room to scroll.
 *   2. We scroll the page so the focused field sits near the top of the screen,
 *      which is always above the keyboard.
 *   3. When the keyboard closes, the input is blurred and the extra space is removed.
 */

const FIELD_TOP_MARGIN = 110; // where the focused field should end up (px from top of list)

// Currently focused input (this helper only exists on Android/iOS, not on web)
const getFocusedInput = () =>
  typeof TextInput.State?.currentlyFocusedInput === 'function'
    ? TextInput.State.currentlyFocusedInput()
    : null;

export function useFocusScroll() {
  const { height } = useWindowDimensions();
  const scrollRef = useRef(null);
  const containerRef = useRef(null);
  const offsetY = useRef(0);
  const blurTimer = useRef(null);
  const [focused, setFocused] = useState(false);

  // Scroll so the focused field sits near the top of the visible list
  // `inputRef` is the ref of the TextInput that was tapped (works on phone and web)
  const scrollToFocused = useCallback((inputRef) => {
    setTimeout(() => {
      const input = inputRef?.current || getFocusedInput();
      const list = scrollRef.current;
      const container = containerRef.current;
      if (!input?.measureInWindow || !list || !container?.measureInWindow) return;

      container.measureInWindow((cx, containerY) => {
        input.measureInWindow((x, inputY) => {
          const target = Math.max(0, offsetY.current + (inputY - containerY) - FIELD_TOP_MARGIN);
          if (list.scrollTo) list.scrollTo({ y: target, animated: true });
          else if (list.scrollToOffset) list.scrollToOffset({ offset: target, animated: true });
        });
      });
    }, 120);
  }, []);

  const onFocus = useCallback(
    (inputRef) => {
      clearTimeout(blurTimer.current);
      setFocused(true);
      scrollToFocused(inputRef);
    },
    [scrollToFocused]
  );

  // Small delay so moving to the next field does not make the page jump
  const onBlur = useCallback(() => {
    blurTimer.current = setTimeout(() => setFocused(false), 150);
  }, []);

  // Android back button closes the keyboard but keeps focus: blur so the space goes away
  useEffect(() => {
    const sub = Keyboard.addListener('keyboardDidHide', () => {
      getFocusedInput()?.blur();
    });
    return () => {
      sub.remove();
      clearTimeout(blurTimer.current);
    };
  }, []);

  const onScroll = useCallback((e) => {
    offsetY.current = e.nativeEvent.contentOffset.y;
  }, []);

  return {
    scrollRef,
    containerRef,
    onScroll,
    onFocus,
    onBlur,
    extraSpace: focused ? Math.round(height * 0.5) : 0,
  };
}

const FocusContext = createContext({ onFocus: () => {}, onBlur: () => {} });

export function KeyboardAwareScrollView({ children, contentContainerStyle, style, ...props }) {
  const { scrollRef, containerRef, onScroll, onFocus, onBlur, extraSpace } = useFocusScroll();
  const basePadding = StyleSheet.flatten(contentContainerStyle)?.paddingBottom || 0;

  return (
    <FocusContext.Provider value={{ onFocus, onBlur }}>
      <View ref={containerRef} style={[styles.flex, style]} collapsable={false}>
        <ScrollView
          ref={scrollRef}
          onScroll={onScroll}
          scrollEventThrottle={16}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
          {...props}
          contentContainerStyle={[contentContainerStyle, { paddingBottom: basePadding + extraSpace }]}
        >
          {children}
        </ScrollView>
      </View>
    </FocusContext.Provider>
  );
}

// TextInput that scrolls itself into view inside a KeyboardAwareScrollView
export function KeyboardInput({ onFocus, onBlur, ...props }) {
  const focus = useContext(FocusContext);
  const inputRef = useRef(null);
  return (
    <TextInput
      ref={inputRef}
      {...props}
      onFocus={(e) => {
        focus.onFocus(inputRef);
        if (onFocus) onFocus(e);
      }}
      onBlur={(e) => {
        focus.onBlur();
        if (onBlur) onBlur(e);
      }}
    />
  );
}

// Dark modal backdrop whose card scrolls above the keyboard
export function KeyboardAwareOverlay({ children }) {
  return (
    <View style={styles.backdrop}>
      <KeyboardAwareScrollView contentContainerStyle={styles.overlayContent}>
        {children}
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  overlayContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
});
