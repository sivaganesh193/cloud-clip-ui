import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, Platform } from 'react-native';

interface AlertProps {
  message: string;
  visible: boolean;
}

const Alert: React.FC<AlertProps> = ({ message, visible }) => {
  const [showing, setShowing] = useState(visible);
  const fadeAnim = new Animated.Value(0);

  useEffect(() => {
    if (visible) {
      setShowing(true);
    } else {
      setShowing(false);
    }
  }, [visible]);

  if (!showing) return null;

  return (
    <View style={[styles.container]}>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: Platform.OS === 'web' ? 30 : 70,
    alignSelf: 'center',
    backgroundColor: 'black',
    padding: 16,
    borderRadius: 5,
    zIndex: 9999,
    alignItems: 'center',
  },
  message: {
    color: '#fff',
  },
});

export default Alert;
