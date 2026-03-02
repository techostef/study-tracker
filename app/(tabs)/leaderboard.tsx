import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/Colors';
import { fakeLeaderboard, LeaderboardEntry } from '@/utils/fakeData';
import { useLang } from '@/contexts/LanguageContext';
import AdBanner from '@/components/AdBanner';

export default function LeaderboardScreen() {
  const { rewards, profile } = useApp();
  const { t } = useLang();

  const leaderboard = useMemo(() => {
    const userEntry: LeaderboardEntry = {
      rank: 0,
      name: `${profile.name} (You)`,
      studiesCompleted: rewards.length,
      avatar: '🧑‍🎓',
      country: '🏠',
    };

    const combined = [...fakeLeaderboard, userEntry];
    combined.sort((a, b) => b.studiesCompleted - a.studiesCompleted);
    combined.forEach((entry, index) => {
      entry.rank = index + 1;
    });

    return combined;
  }, [rewards.length, profile.name]);

  const getMedalEmoji = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return null;
  };

  const renderItem = ({ item }: { item: LeaderboardEntry }) => {
    const isUser = item.name.includes('(You)');
    const medal = getMedalEmoji(item.rank);

    return (
      <View style={[styles.row, isUser && styles.userRow]}>
        <View style={styles.rankCol}>
          {medal ? (
            <Text style={styles.medal}>{medal}</Text>
          ) : (
            <Text style={styles.rankText}>{item.rank}</Text>
          )}
        </View>
        <Text style={styles.avatar}>{item.avatar}</Text>
        <View style={styles.infoCol}>
          <Text style={[styles.name, isUser && styles.userName]} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.country}>{item.country}</Text>
        </View>
        <View style={styles.scoreCol}>
          <Text style={[styles.score, isUser && styles.userScore]}>
            {item.studiesCompleted}
          </Text>
          <Text style={styles.scoreLabel}>{t.leaderboard.done}</Text>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Ionicons name="trophy" size={28} color={Colors.accent} />
        <Text style={styles.headerTitle}>{t.leaderboard.title}</Text>
        <Text style={styles.headerSubtitle}>
          {t.leaderboard.subtitle}
        </Text>
      </View>

      <FlatList
        data={leaderboard}
        keyExtractor={(item) => `${item.rank}-${item.name}`}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListFooterComponent={<AdBanner />}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    backgroundColor: Colors.white,
    padding: 20,
    alignItems: 'center',
    gap: 4,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: Colors.text,
    marginTop: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  list: {
    padding: 16,
    paddingBottom: 30,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 3,
    elevation: 1,
  },
  userRow: {
    backgroundColor: '#EEF2FF',
    borderWidth: 2,
    borderColor: Colors.primary,
  },
  rankCol: {
    width: 36,
    alignItems: 'center',
  },
  rankText: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textSecondary,
  },
  medal: {
    fontSize: 24,
  },
  avatar: {
    fontSize: 28,
  },
  infoCol: {
    flex: 1,
  },
  name: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  userName: {
    color: Colors.primary,
    fontWeight: '800',
  },
  country: {
    fontSize: 16,
    marginTop: 2,
  },
  scoreCol: {
    alignItems: 'center',
  },
  score: {
    fontSize: 18,
    fontWeight: '800',
    color: Colors.text,
  },
  userScore: {
    color: Colors.primary,
  },
  scoreLabel: {
    fontSize: 11,
    color: Colors.textLight,
  },
});
