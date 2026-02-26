import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';
import Svg, { Rect, Text as SvgText, Line, G } from 'react-native-svg';
import { Ionicons } from '@expo/vector-icons';
import { useApp } from '@/contexts/AppContext';
import { Colors } from '@/constants/Colors';
import { Study } from '@/constants/Types';
import * as Storage from '@/utils/storage';
import { useEffect } from 'react';

type Period = 'weekly' | 'monthly' | 'yearly';

interface DayStats {
  label: string;
  total: number;
  completed: number;
  pct: number;
}

function getWeekDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${day}`);
  }
  return days;
}

function getMonthDays(): string[] {
  const days: string[] = [];
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  for (let d = 1; d <= daysInMonth; d++) {
    const m = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(d).padStart(2, '0');
    days.push(`${today.getFullYear()}-${m}-${day}`);
  }
  return days;
}

function getYearMonths(): string[] {
  const months: string[] = [];
  const today = new Date();
  for (let m = 0; m < 12; m++) {
    const month = String(m + 1).padStart(2, '0');
    months.push(`${today.getFullYear()}-${month}`);
  }
  return months;
}

const WEEK_DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

function BarChart({
  data,
  barColor = Colors.primary,
  width = 340,
}: {
  data: DayStats[];
  barColor?: string;
  width?: number;
}) {
  const chartHeight = 180;
  const paddingLeft = 36;
  const paddingBottom = 32;
  const paddingTop = 16;
  const paddingRight = 8;

  const innerWidth = width - paddingLeft - paddingRight;
  const innerHeight = chartHeight - paddingBottom - paddingTop;

  const barCount = data.length;
  const barWidth = Math.max(4, (innerWidth / barCount) * 0.55);
  const gap = innerWidth / barCount;

  const gridLines = [0, 25, 50, 75, 100];

  return (
    <Svg width={width} height={chartHeight}>
      {gridLines.map((pct) => {
        const y = paddingTop + innerHeight - (pct / 100) * innerHeight;
        return (
          <G key={pct}>
            <Line
              x1={paddingLeft}
              y1={y}
              x2={width - paddingRight}
              y2={y}
              stroke={Colors.border}
              strokeWidth={1}
              strokeDasharray={pct === 0 ? undefined : '4,3'}
            />
            <SvgText
              x={paddingLeft - 4}
              y={y + 4}
              fontSize={9}
              fill={Colors.textLight}
              textAnchor="end"
            >
              {pct}%
            </SvgText>
          </G>
        );
      })}

      {data.map((item, i) => {
        const barH = Math.max(2, (item.pct / 100) * innerHeight);
        const x = paddingLeft + i * gap + (gap - barWidth) / 2;
        const y = paddingTop + innerHeight - barH;
        const isZero = item.total === 0;
        const fillColor = isZero ? Colors.border : item.pct === 100 ? Colors.success : barColor;

        return (
          <G key={i}>
            <Rect
              x={x}
              y={y}
              width={barWidth}
              height={barH}
              rx={3}
              fill={fillColor}
              opacity={isZero ? 0.5 : 1}
            />
            {item.pct > 0 && (
              <SvgText
                x={x + barWidth / 2}
                y={y - 3}
                fontSize={8}
                fill={fillColor}
                textAnchor="middle"
                fontWeight="bold"
              >
                {item.pct}%
              </SvgText>
            )}
            <SvgText
              x={x + barWidth / 2}
              y={chartHeight - 4}
              fontSize={9}
              fill={Colors.textSecondary}
              textAnchor="middle"
            >
              {item.label}
            </SvgText>
          </G>
        );
      })}
    </Svg>
  );
}

export default function HistoryScreen() {
  const { isLoading } = useApp();
  const [period, setPeriod] = useState<Period>('weekly');
  const [historyStudies, setHistoryStudies] = useState<Record<string, Study[]>>({});
  const [loadingHistory, setLoadingHistory] = useState(true);

  useEffect(() => {
    Storage.loadHistoryStudies().then((data) => {
      setHistoryStudies(data);
      setLoadingHistory(false);
    });
  }, []);

  const stats = useMemo((): DayStats[] => {
    if (period === 'weekly') {
      const days = getWeekDays();
      return days.map((dateKey) => {
        const studies = historyStudies[dateKey] ?? [];
        const total = studies.length;
        const completed = studies.filter((s) => s.completed).length;
        const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
        const d = new Date(dateKey);
        return {
          label: WEEK_DAY_LABELS[d.getDay()],
          total,
          completed,
          pct,
        };
      });
    } else if (period === 'monthly') {
      const days = getMonthDays();
      return days.map((dateKey) => {
        const studies = historyStudies[dateKey] ?? [];
        const total = studies.length;
        const completed = studies.filter((s) => s.completed).length;
        const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
        const day = parseInt(dateKey.split('-')[2], 10);
        return {
          label: String(day),
          total,
          completed,
          pct,
        };
      });
    } else {
      const months = getYearMonths();
      return months.map((monthKey) => {
        const matchingDays = Object.keys(historyStudies).filter((k) =>
          k.startsWith(monthKey)
        );
        let total = 0;
        let completed = 0;
        matchingDays.forEach((day) => {
          const studies = historyStudies[day] ?? [];
          total += studies.length;
          completed += studies.filter((s) => s.completed).length;
        });
        const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
        const monthIndex = parseInt(monthKey.split('-')[1], 10) - 1;
        return {
          label: MONTH_LABELS[monthIndex],
          total,
          completed,
          pct,
        };
      });
    }
  }, [period, historyStudies]);

  const overallPct = useMemo(() => {
    const totalAll = stats.reduce((s, d) => s + d.total, 0);
    const completedAll = stats.reduce((s, d) => s + d.completed, 0);
    return totalAll === 0 ? 0 : Math.round((completedAll / totalAll) * 100);
  }, [stats]);

  const activeDays = useMemo(() => stats.filter((d) => d.total > 0).length, [stats]);
  const perfectDays = useMemo(() => stats.filter((d) => d.pct === 100 && d.total > 0).length, [stats]);

  const PERIOD_OPTIONS: { key: Period; label: string }[] = [
    { key: 'weekly', label: 'Weekly' },
    { key: 'monthly', label: 'Monthly' },
    { key: 'yearly', label: 'Yearly' },
  ];

  const periodLabel = period === 'weekly' ? 'This Week' : period === 'monthly' ? 'This Month' : 'This Year';
  const unitLabel = period === 'yearly' ? 'months' : 'days';

  if (isLoading || loadingHistory) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.periodSelector}>
        {PERIOD_OPTIONS.map((opt) => (
          <Pressable
            key={opt.key}
            style={[styles.periodBtn, period === opt.key && styles.periodBtnActive]}
            onPress={() => setPeriod(opt.key)}
          >
            <Text
              style={[
                styles.periodBtnText,
                period === opt.key && styles.periodBtnTextActive,
              ]}
            >
              {opt.label}
            </Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.summaryRow}>
        <View style={[styles.summaryCard, { backgroundColor: Colors.primary + '12' }]}>
          <Text style={[styles.summaryValue, { color: Colors.primary }]}>{overallPct}%</Text>
          <Text style={styles.summaryLabel}>Overall</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: Colors.success + '12' }]}>
          <Text style={[styles.summaryValue, { color: Colors.success }]}>{perfectDays}</Text>
          <Text style={styles.summaryLabel}>Perfect {unitLabel}</Text>
        </View>
        <View style={[styles.summaryCard, { backgroundColor: Colors.accent + '12' }]}>
          <Text style={[styles.summaryValue, { color: Colors.accent }]}>{activeDays}</Text>
          <Text style={styles.summaryLabel}>Active {unitLabel}</Text>
        </View>
      </View>

      <View style={styles.chartCard}>
        <View style={styles.chartHeader}>
          <Ionicons name="bar-chart" size={18} color={Colors.primary} />
          <Text style={styles.chartTitle}>Completion Rate — {periodLabel}</Text>
        </View>
        <View style={styles.chartWrap}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chartScrollContent}
          >
            <BarChart
              data={stats}
              barColor={Colors.primary}
              width={Math.max(340, stats.length * 40)}
            />
          </ScrollView>
        </View>
        <View style={styles.legendRow}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.success }]} />
            <Text style={styles.legendText}>100% complete</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.primary }]} />
            <Text style={styles.legendText}>Partial</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: Colors.border }]} />
            <Text style={styles.legendText}>No data</Text>
          </View>
        </View>
      </View>

      <View style={styles.detailCard}>
        <Text style={styles.detailTitle}>Breakdown</Text>
        {stats.filter((d) => d.total > 0).length === 0 ? (
          <View style={styles.emptyDetail}>
            <Ionicons name="stats-chart-outline" size={36} color={Colors.textLight} />
            <Text style={styles.emptyDetailText}>No study history for {periodLabel.toLowerCase()}</Text>
          </View>
        ) : (
          stats
            .filter((d) => d.total > 0)
            .map((d, i) => (
              <View key={i} style={styles.detailRow}>
                <Text style={styles.detailLabel}>{d.label}</Text>
                <View style={styles.detailBarWrap}>
                  <View style={styles.detailBarBg}>
                    <View
                      style={[
                        styles.detailBarFill,
                        {
                          width: `${d.pct}%`,
                          backgroundColor:
                            d.pct === 100 ? Colors.success : Colors.primary,
                        },
                      ]}
                    />
                  </View>
                  <Text style={styles.detailPct}>{d.pct}%</Text>
                </View>
                <Text style={styles.detailCount}>
                  {d.completed}/{d.total}
                </Text>
              </View>
            ))
        )}
      </View>

      <View style={{ height: 30 }} />
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
  periodSelector: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  periodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  periodBtnActive: {
    backgroundColor: Colors.primary,
  },
  periodBtnText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  periodBtnTextActive: {
    color: Colors.white,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    borderRadius: 14,
    padding: 14,
    alignItems: 'center',
    gap: 4,
  },
  summaryValue: {
    fontSize: 22,
    fontWeight: '800',
  },
  summaryLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  chartCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  chartHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
  },
  chartWrap: {
    overflow: 'hidden',
  },
  chartScrollContent: {
    paddingVertical: 4,
  },
  legendRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 8,
    flexWrap: 'wrap',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  legendText: {
    fontSize: 11,
    color: Colors.textSecondary,
  },
  detailCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  detailTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.text,
    marginBottom: 12,
  },
  emptyDetail: {
    alignItems: 'center',
    paddingVertical: 24,
    gap: 8,
  },
  emptyDetailText: {
    fontSize: 13,
    color: Colors.textLight,
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  detailLabel: {
    width: 36,
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textSecondary,
  },
  detailBarWrap: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailBarBg: {
    flex: 1,
    height: 8,
    backgroundColor: Colors.border,
    borderRadius: 4,
    overflow: 'hidden',
  },
  detailBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  detailPct: {
    width: 34,
    fontSize: 11,
    fontWeight: '700',
    color: Colors.primary,
    textAlign: 'right',
  },
  detailCount: {
    width: 36,
    fontSize: 11,
    color: Colors.textSecondary,
    textAlign: 'right',
  },
});
