import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import type { SuccessScreenProps } from '../navigation/types'

export default function SuccessScreen({ navigation }: SuccessScreenProps) {
  useEffect(() => {
    const timer = setTimeout(() => {
      navigation.reset({ index: 0, routes: [{ name: 'Home' }] })
    }, 2000)
    return () => clearTimeout(timer)
  }, [navigation])

  return (
    <View style={styles.container}>
      <View style={styles.circle}>
        <Text style={styles.check}>✓</Text>
      </View>
      <Text style={styles.label}>Submitted</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 3,
    borderColor: '#2d6a4f',
    backgroundColor: '#d8f3dc',
    alignItems: 'center',
    justifyContent: 'center',
  },
  check: {
    fontSize: 52,
    color: '#2d6a4f',
  },
  label: {
    fontSize: 22,
    fontWeight: '700',
    color: '#1a1a1a',
  },
})
