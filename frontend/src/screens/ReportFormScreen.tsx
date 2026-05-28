import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { apiClient } from '../api/client'
import { ESCALATOR_CONNECTIONS, LIFT_CONNECTIONS } from '../constants/stations'
import { stationPicker } from '../navigation/stationPicker'
import type { ReportFormScreenProps, Station } from '../navigation/types'

export default function ReportFormScreen({ navigation, route }: ReportFormScreenProps) {
  const [equipmentType] = useState(route.params.equipmentType)
  const [station, setStation] = useState<Station>(route.params.station)
  const [connection, setConnection] = useState<string | null>(null)
  const [description, setDescription] = useState('')
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const connections = equipmentType === 'lift' ? LIFT_CONNECTIONS : ESCALATOR_CONNECTIONS
  const title = equipmentType === 'lift' ? 'Report a broken lift' : 'Report a broken escalator'
  const which = equipmentType === 'lift' ? 'Which lift?' : 'Which escalator?'

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled) setPhoto(result.assets[0])
  }

  async function submit() {
    if (!connection) {
      Alert.alert('Required', `Please select which ${equipmentType} is broken.`)
      return
    }
    setSubmitting(true)
    try {
      const { data, error } = await apiClient.POST('/outage-reports', {
        body: {
          equipment_type: equipmentType,
          station,
          connection,
          breakdown_time: new Date().toISOString(),
          description: description.trim() || null,
        },
      })
      if (error || !data) {
        Alert.alert('Error', 'Failed to submit report. Please try again.')
        setSubmitting(false)
        return
      }
      if (photo) {
        const formData = new FormData()
        formData.append('file', {
          uri: photo.uri,
          type: photo.mimeType ?? 'image/jpeg',
          name: 'photo.jpg',
        } as any)
        await fetch(
          `${process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:8000'}/outage-reports/${data.id}/image`,
          { method: 'POST', body: formData }
        )
      }
      navigation.replace('Success')
    } catch {
      Alert.alert('Error', 'Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< back'}</Text>
          </Pressable>
          <Text style={styles.title}>{title}</Text>
        </View>
      </SafeAreaView>

      {/* Station */}
      <View style={styles.section}>
        <Text style={styles.label}>station</Text>
        <Pressable
          style={styles.dropdown}
          onPress={() => {
            stationPicker.register(setStation)
            navigation.navigate('SelectStation', { currentStation: station })
          }}
        >
          <Text style={styles.dropdownText}>{station}</Text>
          <Text style={styles.dropdownChevron}>v</Text>
        </Pressable>
      </View>

      {/* Connection picker */}
      <View style={styles.section}>
        <Text style={styles.label}>{which}</Text>
        {connections.map(c => (
          <Pressable
            key={c}
            style={[styles.checkRow, connection === c && styles.checkRowSelected]}
            onPress={() => setConnection(c)}
          >
            <View style={[styles.checkbox, connection === c && styles.checkboxSelected]}>
              {connection === c && <Text style={styles.checkboxTick}>✕</Text>}
            </View>
            <Text style={styles.checkLabel}>{equipmentType} to {c}</Text>
          </Pressable>
        ))}
      </View>

      {/* Photo */}
      <View style={styles.section}>
        <Text style={styles.label}>attach photo (optional)</Text>
        <Pressable style={styles.photoBox} onPress={pickPhoto}>
          {photo ? (
            <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
          ) : (
            <Text style={styles.photoPlaceholder}>[ + ]  tap to upload image</Text>
          )}
        </Pressable>
      </View>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>further comments (optional)</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. doors won't open..."
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={3}
        />
      </View>

      <Pressable style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} onPress={submit} disabled={submitting}>
        {submitting ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.submitText}>Submit</Text>
        )}
      </Pressable>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { paddingBottom: 48 },
  headerSafeArea: {
    backgroundColor: '#dbeafe',
  },
  header: {
    height: 72,
    justifyContent: 'center',
    paddingHorizontal: 20,
    gap: 4,
  },
  back: { fontSize: 14, color: '#2563eb', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  section: { paddingHorizontal: 20, marginTop: 20 },
  label: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8, textTransform: 'lowercase' },
  dropdown: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f9fafb',
  },
  dropdownText: { fontSize: 15, color: '#111827' },
  dropdownChevron: { fontSize: 13, color: '#6b7280' },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 8,
  },
  checkRowSelected: { backgroundColor: '#f0fdf4', borderColor: '#2d6a4f' },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderRadius: 4,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: { backgroundColor: '#2d6a4f', borderColor: '#2d6a4f' },
  checkboxTick: { color: '#fff', fontSize: 12, fontWeight: '700' },
  checkLabel: { fontSize: 15, color: '#111827' },
  photoBox: {
    borderWidth: 2,
    borderColor: '#9ca3af',
    borderStyle: 'dashed',
    borderRadius: 8,
    height: 100,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  photoPlaceholder: { fontSize: 14, color: '#9ca3af' },
  photoPreview: { width: '100%', height: '100%', resizeMode: 'cover' },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb',
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitBtn: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnDisabled: { opacity: 0.6 },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
