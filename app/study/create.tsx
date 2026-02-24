import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/Colors';

export default function CreateStudyScreen() {
  const { categories, addStudy } = useApp();
  const router = useRouter();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [target, setTarget] = useState('');

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a study title');
      return;
    }
    const targetNum = parseInt(target, 10);
    if (!targetNum || targetNum < 1) {
      Alert.alert('Error', 'Please enter a valid target (minimum 1)');
      return;
    }

    await addStudy({
      title: title.trim(),
      description: description.trim(),
      categoryId,
      notes: notes.trim(),
      target: targetNum,
    });

    router.back();
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Title *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder="e.g. Learn React Native"
        placeholderTextColor={Colors.textLight}
      />

      <Text style={styles.label}>Description</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder="What is this study about?"
        placeholderTextColor={Colors.textLight}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Category</Text>
      {categories.length === 0 ? (
        <Text style={styles.hint}>
          No categories yet. Create one in the Categories tab first.
        </Text>
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((cat) => (
            <Pressable
              key={cat.id}
              style={[
                styles.categoryChip,
                {
                  backgroundColor:
                    categoryId === cat.id ? cat.color : cat.color + '20',
                },
              ]}
              onPress={() =>
                setCategoryId(categoryId === cat.id ? '' : cat.id)
              }
            >
              <Text
                style={[
                  styles.categoryChipText,
                  {
                    color: categoryId === cat.id ? Colors.white : cat.color,
                  },
                ]}
              >
                {cat.name}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      )}

      <Text style={styles.label}>Notes</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={notes}
        onChangeText={setNotes}
        placeholder="Additional notes..."
        placeholderTextColor={Colors.textLight}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>Target (how many sessions) *</Text>
      <TextInput
        style={styles.input}
        value={target}
        onChangeText={setTarget}
        placeholder="e.g. 10"
        placeholderTextColor={Colors.textLight}
        keyboardType="number-pad"
      />

      <Pressable style={styles.createBtn} onPress={handleCreate}>
        <Text style={styles.createBtnText}>Create Study</Text>
      </Pressable>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 6,
    marginTop: 16,
  },
  input: {
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 14,
    fontSize: 16,
    color: Colors.text,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  hint: {
    fontSize: 13,
    color: Colors.textLight,
    fontStyle: 'italic',
    marginTop: 4,
  },
  categoryScroll: {
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginRight: 8,
  },
  categoryChipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  createBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  createBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
