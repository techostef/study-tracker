import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/Colors';
import { Study } from '@/constants/Types';
import { useLang } from '@/contexts/LanguageContext';

export default function EditStudyScreen() {
  const { studies, categories, updateStudy } = useApp();
  const { t } = useLang();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const study = studies.find((s) => s.id === id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [notes, setNotes] = useState('');
  const [target, setTarget] = useState('');

  useEffect(() => {
    if (study) {
      setTitle(study.title);
      setDescription(study.description);
      setCategoryId(study.categoryId);
      setNotes(study.notes);
      setTarget(study.target.toString());
    }
  }, [study]);

  const handleSave = async () => {
    if (!study) return;
    if (!title.trim()) {
      Alert.alert(t.studyForm.error, t.studyForm.titleRequired);
      return;
    }
    const targetNum = parseInt(target, 10);
    if (!targetNum || targetNum < 1) {
      Alert.alert(t.studyForm.error, t.studyForm.targetRequired);
      return;
    }

    const updated: Study = {
      ...study,
      title: title.trim(),
      description: description.trim(),
      categoryId,
      notes: notes.trim(),
      target: targetNum,
      completed: study.progress >= targetNum,
    };

    await updateStudy(updated);
    router.back();
  };

  if (!study) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Study not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.progressBanner}>
        <Text style={styles.progressLabel}>
          Progress: {study.progress} / {study.target}
        </Text>
        {study.completed && (
          <Text style={styles.completedBadge}>✅ Completed</Text>
        )}
      </View>

      <Text style={styles.label}>{t.studyForm.title} *</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        placeholder={t.studyForm.titlePlaceholder}
        placeholderTextColor={Colors.textLight}
      />

      <Text style={styles.label}>{t.studyForm.description}</Text>
      <TextInput
        style={[styles.input, styles.textArea]}
        value={description}
        onChangeText={setDescription}
        placeholder={t.studyForm.descPlaceholder}
        placeholderTextColor={Colors.textLight}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>{t.studyForm.category}</Text>
      {categories.length === 0 ? (
        <Text style={styles.hint}>{t.studyForm.selectCategory}</Text>
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
        placeholder="Notes"
        placeholderTextColor={Colors.textLight}
        multiline
        numberOfLines={3}
      />

      <Text style={styles.label}>{t.studyForm.targetSessions} *</Text>
      <TextInput
        style={styles.input}
        value={target}
        onChangeText={setTarget}
        placeholder="e.g. 10"
        placeholderTextColor={Colors.textLight}
        keyboardType="number-pad"
      />

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>{t.studyForm.update}</Text>
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
  notFound: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  notFoundText: {
    fontSize: 18,
    color: Colors.textSecondary,
  },
  progressBanner: {
    backgroundColor: Colors.primaryLight + '20',
    borderRadius: 12,
    padding: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  progressLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.primary,
  },
  completedBadge: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.success,
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
  saveBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    marginTop: 28,
  },
  saveBtnText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: '700',
  },
});
