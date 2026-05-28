import { Ionicons } from '@expo/vector-icons'
import * as ImagePicker from 'expo-image-picker'
import { useState } from 'react'
import { Alert, Image, KeyboardAvoidingView, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input, ScrollView, TextArea, Text, XStack, YStack } from 'tamagui'
import type { ReportCustomScreenProps } from '../navigation/types'

export default function ReportCustomScreen({ navigation }: ReportCustomScreenProps) {
  const [description, setDescription] = useState('')
  const [area, setArea] = useState('')
  const [photo, setPhoto] = useState<ImagePicker.ImagePickerAsset | null>(null)

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

  function submit() {
    if (!description.trim()) {
      Alert.alert('Required', 'Please describe the issue.')
      return
    }
    Alert.alert('Coming soon', 'Custom issue reporting will be available in a future update.')
  }

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
    <ScrollView flex={1} style={{ backgroundColor: 'white' }} contentContainerStyle={{ paddingBottom: 48 } as any} keyboardShouldPersistTaps="handled">
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#dbeafe' }}>
        <YStack style={{ height: 72, justifyContent: 'center' }} px="$5" gap="$1">
          <XStack items="center" gap="$1" mb="$2" style={{ alignSelf: 'flex-start' }} pressStyle={{ opacity: 0.6 }} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={18} color="#2563eb" />
            <Text fontSize={14} fontWeight="500" color="#2563eb">Back</Text>
          </XStack>
          <Text fontSize={22} fontWeight="700" color="#1a1a1a">Describe the issue</Text>
        </YStack>
      </SafeAreaView>

      {/* Description */}
      <YStack px="$5" mt="$5">
        <Text fontSize={12} fontWeight="600" color="#6b7280" mb="$2">issue description</Text>
        <TextArea
          value={description}
          onChangeText={setDescription}
          placeholder="e.g. fallen light blocking path to escalator"
          placeholderTextColor="$gray9"
          numberOfLines={4}
          textAlignVertical="top"
          style={{ minHeight: 100, borderColor: '#d1d5db', backgroundColor: '#f9fafb', color: '#111827', fontSize: 15 }}
        />
      </YStack>

      {/* Area */}
      <YStack px="$5" mt="$5">
        <Text fontSize={12} fontWeight="600" color="#6b7280" mb="$2">area within station (optional)</Text>
        <Input
          value={area}
          onChangeText={setArea}
          placeholder="-- select --"
          placeholderTextColor="$gray9"
          style={{ borderColor: '#d1d5db', backgroundColor: '#f9fafb', color: '#111827', fontSize: 15 }}
        />
      </YStack>

      {/* Photo */}
      <YStack px="$5" mt="$5">
        <Text fontSize={12} fontWeight="600" color="#6b7280" mb="$2">attach photo (optional)</Text>
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

      {/* Submit */}
      <YStack
        mx="$5"
        mt="$8"
        items="center"
        justify="center"
        pressStyle={{ opacity: 0.8 }}
        onPress={submit}
        style={{ backgroundColor: '#111827', borderRadius: 10, height: 52 }}
      >
        <Text color="white" fontSize={16} fontWeight="700">Submit</Text>
      </YStack>
    </ScrollView>
    </KeyboardAvoidingView>
  )
}
