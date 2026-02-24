import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Switch,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/Colors';
import { useNavigation } from 'expo-router';

export default function ReminderScreen() {
  const navigation = useNavigation();
  const { reminders, addReminder, updateReminder, deleteReminder } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newHour, setNewHour] = useState('8');
  const [newMinute, setNewMinute] = useState('0');

  const handleAdd = async () => {
    const hour = parseInt(newHour, 10);
    const minute = parseInt(newMinute, 10);

    if (isNaN(hour) || hour < 0 || hour > 23) {
      Alert.alert('Error', 'Hour must be between 0 and 23');
      return;
    }
    if (isNaN(minute) || minute < 0 || minute > 59) {
      Alert.alert('Error', 'Minute must be between 0 and 59');
      return;
    }

    await addReminder({
      hour,
      minute,
      enabled: true,
      label: newLabel.trim() || 'Study Reminder',
    });

    setShowAdd(false);
    setNewLabel('');
    setNewHour('8');
    setNewMinute('0');
  };

  const handleToggle = async (id: string, enabled: boolean) => {
    const reminder = reminders.find((r) => r.id === id);
    if (reminder) {
      await updateReminder({ ...reminder, enabled });
    }
  };

  const handleDelete = (id: string) => {
    Alert.alert('Delete Reminder', 'Remove this reminder?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteReminder(id),
      },
    ]);
  };

  const formatTime = (hour: number, minute: number) => {
    const h = hour % 12 || 12;
    const m = minute.toString().padStart(2, '0');
    const ampm = hour < 12 ? 'AM' : 'PM';
    return `${h}:${m} ${ampm}`;
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={Colors.text} style={styles.backBtn} />
        </Pressable>
        <Text style={styles.headerTitle}>Reminders</Text>
      </View>
      <View style={styles.info}>
        <Ionicons name="information-circle" size={20} color={Colors.primary} />
        <Text style={styles.infoText}>
          Reminders will notify you daily at the set times if you have incomplete
          studies. They work even when the app is closed.
        </Text>
      </View>

      <FlatList
        data={reminders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons
              name="notifications-off-outline"
              size={48}
              color={Colors.textLight}
            />
            <Text style={styles.emptyText}>No reminders set</Text>
            <Text style={styles.emptySubtext}>
              Add a reminder to stay on track
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.reminderCard}>
            <View style={styles.reminderInfo}>
              <Text style={styles.reminderTime}>
                {formatTime(item.hour, item.minute)}
              </Text>
              <Text style={styles.reminderLabel}>{item.label}</Text>
            </View>
            <Switch
              value={item.enabled}
              onValueChange={(val) => handleToggle(item.id, val)}
              trackColor={{ false: Colors.border, true: Colors.primaryLight }}
              thumbColor={item.enabled ? Colors.primary : Colors.textLight}
            />
            <Pressable
              onPress={() => handleDelete(item.id)}
              hitSlop={8}
              style={styles.deleteBtn}
            >
              <Ionicons name="trash-outline" size={20} color={Colors.danger} />
            </Pressable>
          </View>
        )}
      />

      {showAdd ? (
        <View style={styles.addForm}>
          <Text style={styles.addTitle}>New Reminder</Text>
          <TextInput
            style={styles.input}
            value={newLabel}
            onChangeText={setNewLabel}
            placeholder="Label (optional)"
            placeholderTextColor={Colors.textLight}
          />
          <View style={styles.timeRow}>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>Hour (0-23)</Text>
              <TextInput
                style={styles.input}
                value={newHour}
                onChangeText={setNewHour}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
            <View style={styles.timeInput}>
              <Text style={styles.timeLabel}>Minute (0-59)</Text>
              <TextInput
                style={styles.input}
                value={newMinute}
                onChangeText={setNewMinute}
                keyboardType="number-pad"
                maxLength={2}
              />
            </View>
          </View>
          <View style={styles.addActions}>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => setShowAdd(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </Pressable>
            <Pressable style={styles.confirmBtn} onPress={handleAdd}>
              <Text style={styles.confirmBtnText}>Add Reminder</Text>
            </Pressable>
          </View>
        </View>
      ) : (
        <Pressable style={styles.fab} onPress={() => setShowAdd(true)}>
          <Ionicons name="add" size={28} color={Colors.white} />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  backBtn: {
    marginRight: 16,
  },
  header: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    backgroundColor: Colors.white,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  info: {
    flexDirection: 'row',
    backgroundColor: Colors.primaryLight + '15',
    padding: 14,
    margin: 16,
    marginBottom: 0,
    borderRadius: 12,
    gap: 10,
    alignItems: 'flex-start',
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: Colors.text,
    lineHeight: 18,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 60,
    gap: 8,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textLight,
  },
  reminderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  reminderInfo: {
    flex: 1,
  },
  reminderTime: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
  },
  reminderLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  deleteBtn: {
    marginLeft: 4,
  },
  addForm: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  addTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  timeRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 12,
  },
  timeInput: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginBottom: 4,
  },
  addActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 16,
  },
  cancelBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: Colors.border,
  },
  cancelBtnText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  confirmBtn: {
    flex: 1,
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    backgroundColor: Colors.primary,
  },
  confirmBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.white,
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});
