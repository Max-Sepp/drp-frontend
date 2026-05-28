import { useCallback, useEffect, useState } from 'react'
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { apiClient } from '../api/client'
import type { components } from '../api/schema.d'
import { DEFAULT_STATION } from '../constants/stations'
import { stationPicker } from '../navigation/stationPicker'
import type { HomeScreenProps, Station } from '../navigation/types'

type OutageReport = components['schemas']['OutageReportSummary']

function formatTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

function isToday(iso: string) {
  const d = new Date(iso)
  const now = new Date()
  return d.toDateString() === now.toDateString()
}

function alertLabel(report: OutageReport) {
  const conn = report.connection.toUpperCase()
  const type = report.equipment_type === 'lift' ? 'LIFT' : 'ESCALATOR'
  return `${type} BROKEN – ${conn}`
}

export default function HomeScreen({ navigation }: HomeScreenProps) {
  const [station, setStation] = useState<Station>(DEFAULT_STATION)
  const [reports, setReports] = useState<OutageReport[]>([])
  const [loading, setLoading] = useState(false)

  const fetchReports = useCallback(async () => {
    setLoading(true)
    const { data } = await apiClient.GET('/outage-reports')
    if (data) {
      setReports(data.filter(r => r.station === station))
    }
    setLoading(false)
  }, [station])

  useEffect(() => {
    fetchReports()
    const unsub = navigation.addListener('focus', fetchReports)
    return unsub
  }, [fetchReports, navigation])

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <Pressable
          style={styles.header}
          onPress={() => {
            stationPicker.register(setStation)
            navigation.navigate('SelectStation', { currentStation: station })
          }}
        >
          <View style={styles.headerRow}>
            <Text style={styles.stationName}>{station}</Text>
            <Text style={styles.chevron}>▾</Text>
          </View>
          <Text style={styles.changeHint}>tap to change station</Text>
        </Pressable>
      </SafeAreaView>

      {loading ? (
        <View style={[styles.statusBanner, styles.statusOk]}>
          <Text style={styles.statusText}>Loading…</Text>
        </View>
      ) : reports.length === 0 ? (
        <View style={[styles.statusBanner, styles.statusOk]}>
          <View style={styles.checkCircle}>
            <Text style={styles.checkMark}>✓</Text>
          </View>
          <Text style={styles.statusText}>No known issues</Text>
        </View>
      ) : (
        <View style={styles.alertList}>
          {reports.map(r => (
            <View key={r.id} style={styles.alertBanner}>
              <View style={styles.alertIcon}>
                <Text style={styles.alertIconText}>!</Text>
              </View>
              <View>
                <Text style={styles.alertTitle}>{alertLabel(r)}</Text>
                <Text style={styles.alertTime}>
                  reported at {formatTime(r.breakdown_time)}
                  {isToday(r.breakdown_time) ? ' today' : ''}
                </Text>
              </View>
            </View>
          ))}
        </View>
      )}

      <Text style={styles.sectionLabel}>Quick report</Text>
      <View style={styles.grid}>
        <Pressable
          style={styles.gridButton}
          onPress={() => navigation.navigate('ReportForm', { equipmentType: 'lift', station })}
        >
          <Text style={styles.gridButtonText}>Lift{'\n'}Broken</Text>
        </Pressable>
        <Pressable
          style={styles.gridButton}
          onPress={() => navigation.navigate('ReportForm', { equipmentType: 'escalator', station })}
        >
          <Text style={styles.gridButtonText}>Escalator{'\n'}Broken</Text>
        </Pressable>
        <Pressable style={[styles.gridButton, styles.gridButtonDisabled]}>
          <Text style={[styles.gridButtonText, styles.gridButtonTextDisabled]}>
            Overcrowding
          </Text>
        </Pressable>
        <Pressable
          style={styles.gridButton}
          onPress={() => navigation.navigate('ReportCustom', { station })}
        >
          <Text style={styles.gridButtonText}>Custom{'\n'}Issue</Text>
        </Pressable>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f9fafb' },
  content: { paddingBottom: 40 },
  headerSafeArea: { backgroundColor: '#dbeafe' },
  header: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    justifyContent: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  stationName: { fontSize: 26, fontWeight: '700', color: '#1e3a5f' },
  chevron: { fontSize: 20, color: '#1e3a5f', marginTop: 4 },
  changeHint: { fontSize: 12, color: '#4a6fa5', marginTop: 2 },
  statusBanner: {
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    gap: 10,
  },
  statusOk: { backgroundColor: '#d8f3dc' },
  checkCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#2d6a4f',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMark: { color: '#fff', fontSize: 24, fontWeight: '700' },
  statusText: { fontSize: 18, fontWeight: '700', color: '#1a3c2a' },
  alertList: { gap: 8, marginHorizontal: 16, marginTop: 12 },
  alertBanner: {
    backgroundColor: '#fee2e2',
    borderRadius: 10,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  alertIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#b91c1c',
    alignItems: 'center',
    justifyContent: 'center',
  },
  alertIconText: { color: '#fff', fontWeight: '700', fontSize: 18 },
  alertTitle: { fontSize: 14, fontWeight: '700', color: '#7f1d1d' },
  alertTime: { fontSize: 12, color: '#991b1b', marginTop: 2 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#374151',
    marginTop: 24,
    marginBottom: 8,
    marginHorizontal: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: 16,
    gap: 10,
  },
  gridButton: {
    width: '47%',
    aspectRatio: 1.3,
    borderWidth: 1.5,
    borderColor: '#d1d5db',
    borderRadius: 10,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridButtonDisabled: { opacity: 0.4 },
  gridButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  gridButtonTextDisabled: { textDecorationLine: 'none' },
})
