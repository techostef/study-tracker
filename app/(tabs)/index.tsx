import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/Colors';
import { motivationalQuotes } from '@/utils/fakeData';
import ProgressRing from '@/components/ProgressRing';
import RewardModal from '@/components/RewardModal';

export default function TrackerScreen() {
  const { studies, categories, profile, incrementProgress, isLoading } = useApp();
  const [rewardVisible, setRewardVisible] = useState(false);
  const [rewardStudyTitle, setRewardStudyTitle] = useState('');

  const activeStudies = useMemo(
    () => studies.filter((s) => !s.completed),
    [studies]
  );
  const completedStudies = useMemo(
    () => studies.filter((s) => s.completed),
    [studies]
  );

  const totalProgress = useMemo(() => {
    const totalTarget = studies.reduce((sum, s) => sum + s.target, 0);
    const totalDone = studies.reduce((sum, s) => sum + s.progress, 0);
    return { totalTarget, totalDone };
  }, [studies]);

  const quote = useMemo(
    () => motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)],
    []
  );

  const getCategoryName = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.name ?? 'Uncategorized';
  };

  const getCategoryColor = (categoryId: string) => {
    const cat = categories.find((c) => c.id === categoryId);
    return cat?.color ?? Colors.textLight;
  };

  const handleTap = async (studyId: string) => {
    const justCompleted = await incrementProgress(studyId);
    if (justCompleted) {
      const study = studies.find((s) => s.id === studyId);
      setRewardStudyTitle(study?.title ?? 'Study');
      setRewardVisible(true);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.quoteCard}>
        <Ionicons name="sparkles" size={20} color={Colors.accent} />
        <Text style={styles.quoteText}>"{quote}"</Text>
      </View>

      <View style={styles.overviewCard}>
        <ProgressRing
          progress={totalProgress.totalDone}
          target={totalProgress.totalTarget || 1}
          size={140}
          strokeWidth={12}
          color={Colors.primary}
        />
        <View style={styles.overviewStats}>
          <View style={styles.statRow}>
            <Ionicons name="book" size={18} color={Colors.primary} />
            <Text style={styles.statText}>
              {studies.length} Total Studies
            </Text>
          </View>
          <View style={styles.statRow}>
            <Ionicons name="hourglass" size={18} color={Colors.accent} />
            <Text style={styles.statText}>
              {activeStudies.length} In Progress
            </Text>
          </View>
          <View style={styles.statRow}>
            <Ionicons name="checkmark-circle" size={18} color={Colors.success} />
            <Text style={styles.statText}>
              {completedStudies.length} Completed
            </Text>
          </View>
        </View>
      </View>

      <Text style={styles.sectionTitle}>
        Active Studies ({activeStudies.length})
      </Text>

      {activeStudies.length === 0 ? (
        <View style={styles.emptyCard}>
          <Ionicons name="book-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>No active studies yet</Text>
          <Text style={styles.emptySubtext}>
            Go to Studies tab to create one!
          </Text>
        </View>
      ) : (
        activeStudies.map((study) => {
          const percentage = Math.round((study.progress / study.target) * 100);
          return (
            <Pressable
              key={study.id}
              style={styles.studyCard}
              onPress={() => handleTap(study.id)}
            >
              <View style={styles.studyHeader}>
                <View style={styles.studyTitleRow}>
                  <Text style={styles.studyTitle} numberOfLines={1}>
                    {study.title}
                  </Text>
                  <View
                    style={[
                      styles.categoryBadge,
                      { backgroundColor: getCategoryColor(study.categoryId) + '20' },
                    ]}
                  >
                    <Text
                      style={[
                        styles.categoryBadgeText,
                        { color: getCategoryColor(study.categoryId) },
                      ]}
                    >
                      {getCategoryName(study.categoryId)}
                    </Text>
                  </View>
                </View>
                {study.description ? (
                  <Text style={styles.studyDesc} numberOfLines={1}>
                    {study.description}
                  </Text>
                ) : null}
              </View>

              <View style={styles.progressSection}>
                <View style={styles.progressBarBg}>
                  <View
                    style={[
                      styles.progressBarFill,
                      {
                        width: `${percentage}%`,
                        backgroundColor: getCategoryColor(study.categoryId),
                      },
                    ]}
                  />
                </View>
                <View style={styles.progressInfo}>
                  <Text style={styles.progressText}>
                    {study.progress} / {study.target}
                  </Text>
                  <Text style={styles.percentText}>{percentage}%</Text>
                </View>
              </View>

              <View style={styles.tapHint}>
                <Ionicons
                  name="add-circle"
                  size={28}
                  color={Colors.primary}
                />
                <Text style={styles.tapHintText}>Tap to log progress</Text>
              </View>
            </Pressable>
          );
        })
      )}

      {completedStudies.length > 0 && (
        <>
          <Text style={styles.sectionTitle}>
            Completed ({completedStudies.length})
          </Text>
          {completedStudies.map((study) => (
            <View key={study.id} style={[styles.studyCard, styles.completedCard]}>
              <View style={styles.completedHeader}>
                <Ionicons name="trophy" size={24} color={Colors.accent} />
                <Text style={styles.completedTitle}>{study.title}</Text>
              </View>
              <Text style={styles.completedInfo}>
                {study.target}/{study.target} completed
              </Text>
            </View>
          ))}
        </>
      )}

      <View style={{ height: 30 }} />

      <RewardModal
        visible={rewardVisible}
        studyTitle={rewardStudyTitle}
        userName={profile.name}
        onClose={() => setRewardVisible(false)}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background,
  },
  quoteCard: {
    backgroundColor: Colors.warningLight,
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 16,
  },
  quoteText: {
    flex: 1,
    fontSize: 14,
    fontStyle: 'italic',
    color: Colors.text,
    lineHeight: 20,
  },
  overviewCard: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  overviewStats: {
    flex: 1,
    gap: 12,
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  statText: {
    fontSize: 14,
    color: Colors.text,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  emptySubtext: {
    fontSize: 13,
    color: Colors.textLight,
  },
  studyCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  studyHeader: {
    marginBottom: 12,
  },
  studyTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  studyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.text,
    flex: 1,
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  categoryBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  studyDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  progressSection: {
    gap: 6,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  progressText: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  percentText: {
    fontSize: 13,
    fontWeight: '700',
    color: Colors.primary,
  },
  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  tapHintText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.primary,
  },
  completedCard: {
    opacity: 0.7,
  },
  completedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  completedTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    textDecorationLine: 'line-through',
  },
  completedInfo: {
    fontSize: 13,
    color: Colors.success,
    fontWeight: '500',
    marginTop: 4,
    marginLeft: 32,
  },
});
