import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { ScrollView, Spinner, TextArea, Text, XStack, YStack } from 'tamagui'
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
    Alert.alert('Attach photo', undefined, [
      {
        text: 'Take photo',
        onPress: async () => {
          const { status } = await ImagePicker.requestCameraPermissionsAsync()
          if (status !== 'granted') {
            Alert.alert('Permission required', 'Camera access is needed to take a photo.')
            return
          }
          const result = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.8 })
          if (!result.canceled) setPhoto(result.assets[0])
        },
      },
      {
        text: 'Choose from library',
        onPress: async () => {
          const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.8 })
          if (!result.canceled) setPhoto(result.assets[0])
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ])
  }

  const ALLOWED_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

  async function submit() {
    if (!connection) {
      Alert.alert('Required', `Please select which ${equipmentType} is broken.`)
      return
    }
    if (photo) {
      const mimeType = photo.mimeType || ''
      if (!ALLOWED_MIME.has(mimeType)) {
        Alert.alert(
          'Unsupported image format',
          `Please choose a JPEG, PNG, WebP, or GIF image. (Detected: ${mimeType || 'unknown'})`,
        )
        return
      }
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
        const mimeType = photo.mimeType!
        const formData = new FormData()
        formData.append('file', {
          uri: photo.uri,
          type: mimeType,
          name: mimeType === 'image/png' ? 'photo.png' : 'photo.jpg',
        } as any)
        const { error: imgError } = await apiClient.POST('/outage-reports/{report_id}/image', {
          params: { path: { report_id: data.id } },
          body: formData as any,
        })
        if (imgError) throw new Error(`Image upload failed: ${JSON.stringify(imgError)}`)
      }
      navigation.replace('Success')
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Something went wrong. Please try again.'
      Alert.alert('Error', msg)
      setSubmitting(false)
    }
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView flex={1} style={{ backgroundColor: 'white' }} contentContainerStyle={{ paddingBottom: 48 } as any} keyboardShouldPersistTaps="handled">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#dbeafe' }}>
        <YStack style={{ height: 72, justifyContent: 'center' }} px="$5" gap="$1">
          <Text fontSize={14} color="#2563eb" mb="$2" onPress={() => navigation.goBack()}>
            {'< back'}
          </Text>
          <Text fontSize={22} fontWeight="700" color="#1a1a1a">{title}</Text>
        </YStack>
      </SafeAreaView>

      {/* Station picker */}
      <YStack px="$5" mt="$5">
        <Text fontSize={12} fontWeight="600" color="#6b7280" mb="$2" textTransform="lowercase">station</Text>
        <XStack
          items="center"
          justify="space-between"
          pressStyle={{ opacity: 0.7 }}
          onPress={() => {
            stationPicker.register(setStation)
            navigation.navigate('SelectStation', { currentStation: station })
          }}
          style={{ borderWidth: 1, borderColor: '#d1d5db', borderRadius: 8, paddingHorizontal: 14, paddingVertical: 12, backgroundColor: '#f9fafb' }}
        >
          <Text fontSize={15} color="#111827">{station}</Text>
          <Text fontSize={13} color="#6b7280">v</Text>
        </XStack>
      </YStack>

      {/* Connection picker */}
      <YStack px="$5" mt="$5">
        <Text fontSize={12} fontWeight="600" color="#6b7280" mb="$2" textTransform="lowercase">{which}</Text>
        {connections.map(c => {
          const selected = connection === c
          return (
            <XStack
              key={c}
              items="center"
              gap="$3"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => setConnection(c)}
              mb="$2"
              style={{
                paddingVertical: 12, paddingHorizontal: 14,
                borderWidth: 1, borderColor: selected ? '#2d6a4f' : '#e5e7eb',
                borderRadius: 8, backgroundColor: selected ? '#f0fdf4' : 'white',
              }}
            >
              <YStack
                style={{
                  width: 22, height: 22, borderRadius: 4, borderWidth: 2,
                  borderColor: selected ? '#2d6a4f' : '#9ca3af',
                  backgroundColor: selected ? '#2d6a4f' : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {selected && <Text color="white" fontSize={12} fontWeight="700">✕</Text>}
              </YStack>
              <Text fontSize={15} color="#111827">{equipmentType} to {c}</Text>
            </XStack>
          )
        })}
      </YStack>

      {/* Photo */}
      <YStack px="$5" mt="$5">
        <Text fontSize={12} fontWeight="600" color="#6b7280" mb="$2" textTransform="lowercase">attach photo (optional)</Text>
        <YStack
          items="center"
          justify="center"
          pressStyle={{ opacity: 0.7 }}
          onPress={pickPhoto}
          style={{ borderWidth: 2, borderColor: '#9ca3af', borderStyle: 'dashed', borderRadius: 8, height: 100, overflow: 'hidden' }}
        >
          {photo ? (
            <Image source={{ uri: photo.uri }} style={{ width: '100%', height: '100%', resizeMode: 'cover' }} />
          ) : (
            <Text fontSize={14} color="#9ca3af">[ + ]  tap to upload image</Text>
          )}
        </YStack>
      </YStack>

      {/* Description */}
      <YStack px="$5" mt="$5">
        <Text fontSize={12} fontWeight="600" color="#6b7280" mb="$2" textTransform="lowercase">further comments (optional)</Text>
        <TextArea
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. doors won't open..."
          placeholderTextColor="$gray9"
          numberOfLines={3}
          style={{ minHeight: 80, borderColor: '#d1d5db', backgroundColor: '#f9fafb', color: '#111827', fontSize: 15 }}
        />
      </YStack>

      {/* Submit */}
      <YStack
        mx="$5"
        mt="$8"
        items="center"
        justify="center"
        pressStyle={{ opacity: 0.8 }}
        onPress={submitting ? undefined : submit}
        opacity={submitting ? 0.6 : 1}
        style={{ backgroundColor: '#111827', borderRadius: 10, height: 52 }}
      >
        {submitting ? (
          <Spinner color="white" />
        ) : (
          <Text color="white" fontSize={16} fontWeight="700">Submit</Text>
        )}
      </YStack>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}
