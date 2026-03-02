import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/Colors';
import { useLang } from '@/contexts/LanguageContext';
import { Language } from '@/constants/i18n';
import AdBanner from '@/components/AdBanner';

export default function ProfileScreen() {
  const { profile, updateProfile, studies, rewards, exportData, importData } = useApp();
  const { t, language, setLanguage } = useLang();
  const router = useRouter();
  const [name, setName] = useState(profile.name);
  const [editing, setEditing] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);
  const [langModalVisible, setLangModalVisible] = useState(false);

  const completedCount = studies.filter((s) => s.completed).length;
  const activeCount = studies.filter((s) => !s.completed).length;
  const totalProgress = studies.reduce((sum, s) => sum + s.progress, 0);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportData();
    } catch (e: any) {
      Alert.alert(t.profile.exportFailed, e?.message ?? t.profile.couldNotExport);
    } finally {
      setExporting(false);
    }
  };

  const handleImport = async () => {
    Alert.alert(
      t.profile.importData,
      t.profile.importWarning,
      [
        { text: t.profile.cancel, style: 'cancel' },
        {
          text: t.profile.import,
          style: 'destructive',
          onPress: async () => {
            setImporting(true);
            try {
              await importData();
              Alert.alert(t.profile.success, t.profile.importSuccess);
            } catch (e: any) {
              if (e?.message !== 'CANCELLED') {
                Alert.alert(t.profile.importFailed, e?.message ?? t.profile.couldNotImport);
              }
            } finally {
              setImporting(false);
            }
          },
        },
      ]
    );
  };

  const handleSave = async () => {
    if (!name.trim()) {
      Alert.alert(t.profile.error, t.profile.pleaseEnterName);
      return;
    }
    await updateProfile({ name: name.trim() });
    setEditing(false);
    Alert.alert(t.profile.success, `${t.profile.profileUpdated}, ${name.trim()}!`);
  };

  const handleSelectLanguage = async (lang: Language) => {
    await setLanguage(lang);
    setLangModalVisible(false);
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.avatarSection}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>🧑‍🎓</Text>
        </View>
        {editing ? (
          <View style={styles.editRow}>
            <TextInput
              style={styles.nameInput}
              value={name}
              onChangeText={setName}
              placeholder={t.profile.enterName}
              autoFocus
            />
            <Pressable style={styles.saveBtn} onPress={handleSave}>
              <Ionicons name="checkmark" size={20} color={Colors.white} />
            </Pressable>
            <Pressable
              style={styles.cancelBtn}
              onPress={() => {
                setName(profile.name);
                setEditing(false);
              }}
            >
              <Ionicons name="close" size={20} color={Colors.danger} />
            </Pressable>
          </View>
        ) : (
          <Pressable onPress={() => setEditing(true)} style={styles.nameRow}>
            <Text style={styles.profileName}>{profile.name}</Text>
            <Ionicons name="pencil" size={16} color={Colors.primary} />
          </Pressable>
        )}
        <Text style={styles.subtitle}>{t.profile.adventureScholar}</Text>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <Ionicons name="book" size={24} color={Colors.primary} />
          <Text style={styles.statValue}>{studies.length}</Text>
          <Text style={styles.statLabel}>{t.profile.totalStudies}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="checkmark-circle" size={24} color={Colors.success} />
          <Text style={styles.statValue}>{completedCount}</Text>
          <Text style={styles.statLabel}>{t.profile.completed}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="hourglass" size={24} color={Colors.accent} />
          <Text style={styles.statValue}>{activeCount}</Text>
          <Text style={styles.statLabel}>{t.profile.inProgress}</Text>
        </View>
        <View style={styles.statCard}>
          <Ionicons name="flame" size={24} color={Colors.danger} />
          <Text style={styles.statValue}>{totalProgress}</Text>
          <Text style={styles.statLabel}>{t.profile.sessionsDone}</Text>
        </View>
      </View>

      <Pressable
        style={styles.menuItem}
        onPress={() => router.push('/reminder' as any)}
      >
        <Ionicons name="notifications" size={22} color={Colors.primary} />
        <Text style={styles.menuLabel}>{t.profile.manageReminders}</Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </Pressable>

      <Pressable
        style={styles.menuItem}
        onPress={() => setLangModalVisible(true)}
      >
        <Ionicons name="language" size={22} color={Colors.primary} />
        <Text style={styles.menuLabel}>{t.profile.language}</Text>
        <Text style={styles.langBadge}>
          {language === 'en' ? '🇬🇧 English' : '🇮🇩 Indonesia'}
        </Text>
        <Ionicons name="chevron-forward" size={20} color={Colors.textLight} />
      </Pressable>

      <Text style={styles.sectionTitle}>{t.profile.dataManagement}</Text>

      <View style={styles.dataRow}>
        <Pressable
          style={[styles.dataBtn, styles.exportBtn]}
          onPress={handleExport}
          disabled={exporting}
        >
          {exporting ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Ionicons name="share-outline" size={20} color={Colors.white} />
          )}
          <Text style={styles.dataBtnText}>{t.profile.exportBackup}</Text>
        </Pressable>

        <Pressable
          style={[styles.dataBtn, styles.importBtn]}
          onPress={handleImport}
          disabled={importing}
        >
          {importing ? (
            <ActivityIndicator size="small" color={Colors.white} />
          ) : (
            <Ionicons name="download-outline" size={20} color={Colors.white} />
          )}
          <Text style={styles.dataBtnText}>{t.profile.importBackup}</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionTitle}>
        {t.profile.rewards} ({rewards.length})
      </Text>

      {rewards.length === 0 ? (
        <View style={styles.emptyRewards}>
          <Ionicons name="trophy-outline" size={48} color={Colors.textLight} />
          <Text style={styles.emptyText}>{t.profile.noRewardsYet}</Text>
          <Text style={styles.emptySubtext}>{t.profile.completeToEarn}</Text>
        </View>
      ) : (
        rewards.map((reward) => (
          <View key={reward.id} style={styles.rewardCard}>
            <Text style={styles.rewardEmoji}>🏆</Text>
            <View style={styles.rewardInfo}>
              <Text style={styles.rewardTitle}>{reward.studyTitle}</Text>
              <Text style={styles.rewardDate}>
                {t.common.completedAt} {new Date(reward.completedAt).toLocaleDateString()}
              </Text>
            </View>
            <Text style={styles.rewardXP}>{t.common.xp}</Text>
          </View>
        ))
      )}

      <AdBanner />

      <View style={{ height: 30 }} />

      <Modal
        visible={langModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setLangModalVisible(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setLangModalVisible(false)}>
          <View style={styles.langModal}>
            <Text style={styles.langModalTitle}>{t.profile.selectLanguage}</Text>
            <Pressable
              style={[styles.langOption, language === 'en' && styles.langOptionActive]}
              onPress={() => handleSelectLanguage('en')}
            >
              <Text style={styles.langOptionFlag}>🇬🇧</Text>
              <Text style={[styles.langOptionText, language === 'en' && styles.langOptionTextActive]}>
                English
              </Text>
              {language === 'en' && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </Pressable>
            <Pressable
              style={[styles.langOption, language === 'id' && styles.langOptionActive]}
              onPress={() => handleSelectLanguage('id')}
            >
              <Text style={styles.langOptionFlag}>🇮🇩</Text>
              <Text style={[styles.langOptionText, language === 'id' && styles.langOptionTextActive]}>
                Indonesia
              </Text>
              {language === 'id' && (
                <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
              )}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
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
  avatarSection: {
    alignItems: 'center',
    marginBottom: 24,
    paddingTop: 8,
  },
  avatarCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.primaryLight + '30',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarEmoji: {
    fontSize: 44,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileName: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  editRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    fontSize: 18,
    fontWeight: '600',
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    minWidth: 180,
    backgroundColor: Colors.white,
    color: Colors.text,
  },
  saveBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.dangerLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.text,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 16,
    gap: 12,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  menuLabel: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyRewards: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 8,
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
  rewardCard: {
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
  rewardEmoji: {
    fontSize: 28,
  },
  rewardInfo: {
    flex: 1,
  },
  rewardTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
  },
  rewardDate: {
    fontSize: 12,
    color: Colors.textLight,
    marginTop: 2,
  },
  rewardXP: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.secondary,
  },
  dataRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  dataBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderRadius: 14,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 3,
  },
  exportBtn: {
    backgroundColor: Colors.primary,
  },
  importBtn: {
    backgroundColor: Colors.secondary,
  },
  dataBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: Colors.white,
  },
  langBadge: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontWeight: '500',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: Colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 32,
  },
  langModal: {
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: 24,
    width: '100%',
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  langModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 4,
    textAlign: 'center',
  },
  langOption: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: Colors.border,
    backgroundColor: Colors.background,
  },
  langOptionActive: {
    borderColor: Colors.primary,
    backgroundColor: '#EEF2FF',
  },
  langOptionFlag: {
    fontSize: 28,
  },
  langOptionText: {
    flex: 1,
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
  },
  langOptionTextActive: {
    color: Colors.primary,
  },
});
