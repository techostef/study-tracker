import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  Pressable,
  Animated,
} from 'react-native';
import { Colors } from '@/constants/Colors';

interface RewardModalProps {
  visible: boolean;
  studyTitle: string;
  userName: string;
  onClose: () => void;
}

export default function RewardModal({
  visible,
  studyTitle,
  userName,
  onClose,
}: RewardModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      scaleAnim.setValue(0);
      rotateAnim.setValue(0);
      Animated.sequence([
        Animated.spring(scaleAnim, {
          toValue: 1,
          friction: 4,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, scaleAnim, rotateAnim]);

  const rotate = rotateAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: ['0deg', '10deg', '0deg'],
  });

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.card,
            { transform: [{ scale: scaleAnim }, { rotate }] },
          ]}
        >
          <Text style={styles.trophy}>🏆</Text>
          <Text style={styles.title}>Congratulations!</Text>
          <Text style={styles.subtitle}>{userName}</Text>
          <View style={styles.divider} />
          <Text style={styles.message}>You completed</Text>
          <Text style={styles.studyTitle}>"{studyTitle}"</Text>
          <Text style={styles.stars}>⭐ ⭐ ⭐</Text>
          <Text style={styles.xp}>+100 XP Earned!</Text>
          <Pressable style={styles.button} onPress={onClose}>
            <Text style={styles.buttonText}>Awesome!</Text>
          </Pressable>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 30,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 32,
    alignItems: 'center',
    width: '100%',
    maxWidth: 340,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 12,
  },
  trophy: {
    fontSize: 64,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
  },
  subtitle: {
    fontSize: 16,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  divider: {
    width: 60,
    height: 3,
    backgroundColor: Colors.accent,
    borderRadius: 2,
    marginVertical: 16,
  },
  message: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  studyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    textAlign: 'center',
    marginTop: 4,
  },
  stars: {
    fontSize: 32,
    marginTop: 16,
  },
  xp: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.secondary,
    marginTop: 8,
  },
  button: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 40,
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 20,
  },
  buttonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
