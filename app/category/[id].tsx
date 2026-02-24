import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
  ScrollView,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Colors, CategoryColors } from '@/constants/Colors';

export default function EditCategoryScreen() {
  const { categories, updateCategory } = useApp();
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();

  const category = categories.find((c) => c.id === id);

  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState(CategoryColors[0]);

  useEffect(() => {
    if (category) {
      setName(category.name);
      setSelectedColor(category.color);
    }
  }, [category]);

  const handleSave = async () => {
    if (!category) return;
    if (!name.trim()) {
      Alert.alert('Error', 'Please enter a category name');
      return;
    }

    await updateCategory({
      ...category,
      name: name.trim(),
      color: selectedColor,
    });

    router.back();
  };

  if (!category) {
    return (
      <View style={styles.notFound}>
        <Text style={styles.notFoundText}>Category not found</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>Category Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Category name"
        placeholderTextColor={Colors.textLight}
      />

      <Text style={styles.label}>Color</Text>
      <View style={styles.colorGrid}>
        {CategoryColors.map((color) => (
          <Pressable
            key={color}
            style={[
              styles.colorItem,
              { backgroundColor: color },
              selectedColor === color && styles.colorSelected,
            ]}
            onPress={() => setSelectedColor(color)}
          />
        ))}
      </View>

      <View style={styles.preview}>
        <View style={[styles.previewDot, { backgroundColor: selectedColor }]} />
        <Text style={styles.previewText}>
          {name.trim() || 'Category Name'}
        </Text>
      </View>

      <Pressable style={styles.saveBtn} onPress={handleSave}>
        <Text style={styles.saveBtnText}>Save Changes</Text>
      </Pressable>
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
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 8,
  },
  colorItem: {
    width: 44,
    height: 44,
    borderRadius: 12,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: Colors.text,
  },
  preview: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginTop: 24,
  },
  previewDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  previewText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
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
