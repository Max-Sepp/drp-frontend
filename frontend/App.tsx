import { StatusBar } from 'expo-status-bar'
import { useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Hello there</Text>
          <Text style={styles.cardDescription}>
            A starter app built with React Native and Expo.
          </Text>
        </View>
        <View style={styles.cardContent}>
          <Text style={styles.countText}>
            You've clicked the button{' '}
            <Text style={styles.countNumber}>{count}</Text>{' '}
            {count === 1 ? 'time' : 'times'}.
          </Text>
        </View>
        <View style={styles.cardFooter}>
          <Pressable style={styles.button} onPress={() => setCount(c => c + 1)}>
            <Text style={styles.buttonText}>Click me</Text>
          </Pressable>
          <Pressable style={styles.outlineButton} onPress={() => setCount(0)}>
            <Text style={styles.outlineButtonText}>Reset</Text>
          </Pressable>
        </View>
      </View>
      <StatusBar style="auto" />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 24,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  cardHeader: {
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#0f172a',
    marginBottom: 4,
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
  },
  cardContent: {
    marginBottom: 16,
  },
  countText: {
    fontSize: 14,
    color: '#64748b',
  },
  countNumber: {
    fontWeight: '500',
    color: '#0f172a',
  },
  cardFooter: {
    flexDirection: 'row',
    gap: 8,
  },
  button: {
    backgroundColor: '#0f172a',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '500',
  },
  outlineButton: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  outlineButtonText: {
    color: '#0f172a',
    fontSize: 14,
    fontWeight: '500',
  },
})
