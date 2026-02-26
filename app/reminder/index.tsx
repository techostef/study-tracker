import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  Switch,
  TextInput,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/Colors';
import { Reminder } from '@/constants/Types';

type SortKey = 'label' | 'time' | 'createdAt';

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const MINUTES = Array.from({ length: 60 }, (_, i) => i);

function TimePickerColumn({
  values,
  selected,
  onSelect,
  label,
}: {
  values: number[];
  selected: number;
  onSelect: (v: number) => void;
  label: string;
}) {
  return (
    <View style={styles.pickerCol}>
      <Text style={styles.pickerColLabel}>{label}</Text>
      <ScrollView
        style={styles.pickerScroll}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.pickerScrollContent}
      >
        {values.map((v) => (
          <Pressable
            key={v}
            style={[styles.pickerItem, selected === v && styles.pickerItemSelected]}
            onPress={() => onSelect(v)}
          >
            <Text
              style={[
                styles.pickerItemText,
                selected === v && styles.pickerItemTextSelected,
              ]}
            >
              {v.toString().padStart(2, '0')}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

export default function ReminderScreen() {
  const { reminders, addReminder, updateReminder, deleteReminder } = useApp();
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newHour, setNewHour] = useState(8);
  const [newMinute, setNewMinute] = useState(0);
  const [sortKey, setSortKey] = useState<SortKey>('time');

  const sortedReminders = useMemo(() => {
    const copy = [...reminders];
    if (sortKey === 'label') {
      copy.sort((a, b) => a.label.localeCompare(b.label));
    } else if (sortKey === 'time') {
      copy.sort((a, b) => a.hour * 60 + a.minute - (b.hour * 60 + b.minute));
    } else if (sortKey === 'createdAt') {
      copy.sort((a, b) => a.id.localeCompare(b.id));
    }
    return copy;
  }, [reminders, sortKey]);

  const handleAdd = async () => {
    await addReminder({
      hour: newHour,
      minute: newMinute,
      enabled: true,
      label: newLabel.trim() || 'Study Reminder',
    });
    setShowAdd(false);
    setNewLabel('');
    setNewHour(8);
    setNewMinute(0);
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

  const SORT_OPTIONS: { key: SortKey; label: string; icon: string }[] = [
    { key: 'time', label: 'Time', icon: 'time-outline' },
    { key: 'label', label: 'Label', icon: 'text-outline' },
    { key: 'createdAt', label: 'Created', icon: 'calendar-outline' },
  ];

  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Ionicons name="information-circle" size={20} color={Colors.primary} />
        <Text style={styles.infoText}>
          Reminders will notify you daily at the set times if you have incomplete
          studies. They work even when the app is closed.
        </Text>
      </View>

      <View style={styles.sortBar}>
        <Text style={styles.sortBarLabel}>Sort by:</Text>
        {SORT_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            style={[styles.sortBtn, sortKey === opt.key && styles.sortBtnActive]}
            onPress={() => setSortKey(opt.key)}
          >
            <Ionicons
              name={opt.icon as any}
              size={14}
              color={sortKey === opt.key ? Colors.white : Colors.textSecondary}
            />
            <Text
              style={[
                styles.sortBtnText,
                sortKey === opt.key && styles.sortBtnTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <FlatList
        data={sortedReminders}
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
        renderItem={({ item }: { item: Reminder }) => (
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

      <Pressable style={styles.fab} onPress={() => setShowAdd(true)}>
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>

      <Modal
        visible={showAdd}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAdd(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowAdd(false)}>
          <Pressable style={styles.modalCard} onPress={(e) => e.stopPropagation()}>
            <Text style={styles.addTitle}>New Reminder</Text>

            <TextInput
              style={styles.input}
              value={newLabel}
              onChangeText={setNewLabel}
              placeholder="Label (optional)"
              placeholderTextColor={Colors.textLight}
            />

            <Text style={styles.timePickerTitle}>Select Time</Text>
            <View style={styles.timePickerPreview}>
              <Text style={styles.timePickerPreviewText}>
                {formatTime(newHour, newMinute)}
              </Text>
            </View>

            <View style={styles.timePickerRow}>
              <TimePickerColumn
                values={HOURS}
                selected={newHour}
                onSelect={setNewHour}
                label="Hour"
              />
              <View style={styles.timeSeparator}>
                <Text style={styles.timeSeparatorText}>:</Text>
              </View>
              <TimePickerColumn
                values={MINUTES}
                selected={newMinute}
                onSelect={setNewMinute}
                label="Minute"
              />
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
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
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
  sortBar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 8,
  },
  sortBarLabel: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
    marginRight: 4,
  },
  sortBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  sortBtnActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  sortBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  sortBtnTextActive: {
    color: Colors.white,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalCard: {
    backgroundColor: Colors.white,
    borderRadius: 24,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 12,
  },
  addTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 16,
  },
  timePickerTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 8,
    textAlign: 'center',
  },
  timePickerPreview: {
    backgroundColor: Colors.primary + '15',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignSelf: 'center',
    marginBottom: 12,
  },
  timePickerPreviewText: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.primary,
    letterSpacing: 1,
  },
  timePickerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 16,
  },
  pickerCol: {
    flex: 1,
    alignItems: 'center',
  },
  pickerColLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
    marginBottom: 6,
  },
  pickerScroll: {
    height: 160,
    width: '100%',
  },
  pickerScrollContent: {
    paddingVertical: 4,
  },
  pickerItem: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    marginVertical: 2,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  pickerItemSelected: {
    backgroundColor: Colors.primary,
  },
  pickerItemText: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.text,
  },
  pickerItemTextSelected: {
    color: Colors.white,
    fontWeight: '700',
  },
  timeSeparator: {
    paddingBottom: 20,
  },
  timeSeparatorText: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  addActions: {
    flexDirection: 'row',
    gap: 12,
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
});
