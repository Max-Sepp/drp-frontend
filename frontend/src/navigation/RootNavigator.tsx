import { createNativeStackNavigator } from '@react-navigation/native-stack'
import HomeScreen from '../screens/HomeScreen'
import SelectStationScreen from '../screens/SelectStationScreen'
import ReportFormScreen from '../screens/ReportFormScreen'
import ReportCustomScreen from '../screens/ReportCustomScreen'
import SuccessScreen from '../screens/SuccessScreen'
import type { RootStackParamList } from './types'

const Stack = createNativeStackNavigator<RootStackParamList>()

export default function RootNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="SelectStation" component={SelectStationScreen} />
      <Stack.Screen name="ReportForm" component={ReportFormScreen} />
      <Stack.Screen name="ReportCustom" component={ReportCustomScreen} />
      <Stack.Screen name="Success" component={SuccessScreen} />
    </Stack.Navigator>
  )
}
