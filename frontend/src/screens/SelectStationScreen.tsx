import { Ionicons } from '@expo/vector-icons'
import { useState } from 'react'
import { FlatList } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { Input, Separator, Text, XStack, YStack } from 'tamagui'
import { STATIONS } from '../constants/stations'
import { stationPicker } from '../navigation/stationPicker'
import type { SelectStationScreenProps, Station } from '../navigation/types'

export default function SelectStationScreen({ navigation, route }: SelectStationScreenProps) {
  const { currentStation } = route.params
  const [query, setQuery] = useState('')

  const filtered = STATIONS.filter(s =>
    s.name.toLowerCase().includes(query.toLowerCase())
  )

  function select(station: Station) {
    stationPicker.resolve(station)
    navigation.goBack()
  }

  return (
    <YStack flex={1} style={{ backgroundColor: 'white' }}>
      <SafeAreaView edges={['top']} style={{ backgroundColor: '#dbeafe' }}>
        <YStack style={{ height: 72, justifyContent: 'center' }} px="$5" gap="$1">
          <XStack items="center" gap="$1" mb="$2" style={{ alignSelf: 'flex-start' }} pressStyle={{ opacity: 0.6 }} onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={18} color="#2563eb" />
            <Text fontSize={14} fontWeight="500" color="#2563eb">Back</Text>
          </XStack>
          <Text fontSize={22} fontWeight="700" color="#1a1a1a">Select station</Text>
        </YStack>
      </SafeAreaView>

      <FlatList
        data={filtered}
        keyExtractor={item => item.name}
        ItemSeparatorComponent={() => (
          <Separator style={{ marginLeft: 58 }} borderColor="$borderColor" />
        )}
        renderItem={({ item }) => {
          const selected = item.name === currentStation
          return (
            <XStack
              items="center"
              py="$4"
              px="$5"
              gap="$3.5"
              pressStyle={{ opacity: 0.7 }}
              onPress={() => select(item.name as Station)}
              style={{ backgroundColor: selected ? '#f0fdf4' : 'white' }}
            >
              <YStack
                style={{
                  width: 24, height: 24, borderRadius: 12, borderWidth: 2,
                  borderColor: selected ? '#2d6a4f' : '#9ca3af',
                  backgroundColor: selected ? '#2d6a4f' : 'transparent',
                  alignItems: 'center', justifyContent: 'center',
                }}
              >
                {selected && <Text color="white" fontSize={13} fontWeight="700">✓</Text>}
              </YStack>
              <YStack>
                <Text fontSize={16} fontWeight="600" color="#111827">{item.name}</Text>
                <Text fontSize={13} color="#6b7280" mt="$1">{item.lines.join(', ')}</Text>
              </YStack>
            </XStack>
          )
        }}
      />

      <YStack style={{ borderTopWidth: 1, borderColor: '#e5e7eb' }} px="$4" py="$2.5">
        <Input
          value={query}
          onChangeText={setQuery}
          placeholder="search stations..."
          placeholderTextColor="$gray9"
          autoCorrect={false}
          size="$4"
          style={{ borderWidth: 0, backgroundColor: 'transparent', color: '#111827' }}
        />
      </YStack>
    </YStack>
  )
}
