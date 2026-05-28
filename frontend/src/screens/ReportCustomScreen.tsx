import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import {
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
import { stationPicker } from '../navigation/stationPicker'
import type { ReportCustomScreenProps, Station } from '../navigation/types'

export default function ReportCustomScreen({ navigation, route }: ReportCustomScreenProps) {
  const [station, setStation] = useState<Station>(route.params.station)
  const [description, setDescription] = useState('')
  const [area, setArea] = useState('')
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null)

  async function pickPhoto() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    })
    if (!result.canceled) setPhoto(result.assets[0])
  }

  function submit() {
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe the issue.')
      return
    }
    Alert.alert('Coming soon', 'Custom issue reporting will be available in a future update.')
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< back'}</Text>
          </Pressable>
          <Text style={styles.title}>Describe the issue</Text>
        </View>
      </SafeAreaView>

      {/* Description */}
      <View style={styles.section}>
        <Text style={styles.label}>issue description</Text>
        <TextInput
          style={styles.textArea}
          placeholder="e.g. fallen light blocking path to escalator"
          placeholderTextColor="#9ca3af"
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />
      </View>

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

      {/* Area */}
      <View style={styles.section}>
        <Text style={styles.label}>area within station (optional)</Text>
        <TextInput
          style={styles.dropdown}
          placeholder="-- select --"
          placeholderTextColor="#9ca3af"
          value={area}
          onChangeText={setArea}
        />
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

      <Pressable style={styles.submitBtn} onPress={submit}>
        <Text style={styles.submitText}>Submit</Text>
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
  label: { fontSize: 12, fontWeight: '600', color: '#6b7280', marginBottom: 8 },
  textArea: {
    borderWidth: 1,
    borderColor: '#d1d5db',
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    color: '#111827',
    backgroundColor: '#f9fafb',
    minHeight: 100,
    textAlignVertical: 'top',
  },
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
  submitBtn: {
    marginHorizontal: 20,
    marginTop: 32,
    backgroundColor: '#111827',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: { color: '#fff', fontSize: 16, fontWeight: '700' },
})
