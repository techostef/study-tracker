import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/Colors';

export default function CategoriesScreen() {
  const { categories, studies, deleteCategory, isLoading } = useApp();
  const router = useRouter();

  const getStudyCount = (categoryId: string) =>
    studies.filter((s) => s.categoryId === categoryId).length;

  const handleDelete = (id: string, name: string) => {
    const count = getStudyCount(id);
    const warning = count > 0
      ? `\n\n⚠️ ${count} ${count === 1 ? 'study uses' : 'studies use'} this category.`
      : '';

    Alert.alert(
      'Delete Category',
      `Are you sure you want to delete "${name}"?${warning}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => deleteCategory(id),
        },
      ]
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={categories}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="folder-outline" size={64} color={Colors.textLight} />
            <Text style={styles.emptyTitle}>No Categories Yet</Text>
            <Text style={styles.emptySubtitle}>
              Create categories to organize your studies
            </Text>
          </View>
        }
        renderItem={({ item }) => {
          const count = getStudyCount(item.id);
          return (
            <Pressable
              style={styles.card}
              onPress={() => router.push(`/category/${item.id}`)}
            >
              <View style={styles.cardContent}>
                <View
                  style={[styles.colorDot, { backgroundColor: item.color }]}
                />
                <View style={styles.cardInfo}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <Text style={styles.cardSubtitle}>
                    {count} {count === 1 ? 'study' : 'studies'}
                  </Text>
                </View>
                <Pressable
                  onPress={() => handleDelete(item.id, item.name)}
                  hitSlop={8}
                >
                  <Ionicons
                    name="trash-outline"
                    size={20}
                    color={Colors.danger}
                  />
                </Pressable>
              </View>
            </Pressable>
          );
        }}
      />

      <Pressable
        style={styles.fab}
        onPress={() => router.push('/category/create')}
      >
        <Ionicons name="add" size={28} color={Colors.white} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 80,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: 8,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  emptySubtitle: {
    fontSize: 14,
    color: Colors.textLight,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  colorDot: {
    width: 40,
    height: 40,
    borderRadius: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
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
