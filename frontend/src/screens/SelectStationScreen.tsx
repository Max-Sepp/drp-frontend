import { useState } from 'react'
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { stationPicker } from '../navigation/stationPicker'
import { STATIONS } from '../constants/stations'
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
    <View style={styles.container}>
      <SafeAreaView edges={['top']} style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Pressable onPress={() => navigation.goBack()}>
            <Text style={styles.back}>{'< back'}</Text>
          </Pressable>
          <Text style={styles.title}>Select station</Text>
        </View>
      </SafeAreaView>

      <FlatList
        data={filtered}
        keyExtractor={item => item.name}
        renderItem={({ item }) => {
          const selected = item.name === currentStation
          return (
            <Pressable
              style={[styles.row, selected && styles.rowSelected]}
              onPress={() => select(item.name)}
            >
              <View style={[styles.radio, selected && styles.radioSelected]}>
                {selected && <Text style={styles.radioTick}>✓</Text>}
              </View>
              <View>
                <Text style={styles.stationName}>{item.name}</Text>
                <Text style={styles.lines}>{item.lines.join(', ')}</Text>
              </View>
            </Pressable>
          )
        }}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />

      <View style={styles.searchContainer}>
        <TextInput
          style={styles.search}
          placeholder="search stations..."
          placeholderTextColor="#9ca3af"
          value={query}
          onChangeText={setQuery}
          autoCorrect={false}
        />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  headerSafeArea: {
    backgroundColor: '#dbeafe',
  },
  header: {
    height: 56,
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  back: { fontSize: 14, color: '#2563eb', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#1a1a1a' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 14,
  },
  rowSelected: { backgroundColor: '#f0fdf4' },
  radio: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#9ca3af',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: '#2d6a4f', backgroundColor: '#2d6a4f' },
  radioTick: { color: '#fff', fontSize: 13, fontWeight: '700' },
  stationName: { fontSize: 16, fontWeight: '600', color: '#111827' },
  lines: { fontSize: 13, color: '#6b7280', marginTop: 2 },
  separator: { height: 1, backgroundColor: '#e5e7eb', marginLeft: 58 },
  searchContainer: {
    borderTopWidth: 1,
    borderColor: '#e5e7eb',
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  search: {
    fontSize: 15,
    color: '#111827',
    paddingVertical: 8,
  },
})
