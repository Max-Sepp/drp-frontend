import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { components } from '../api/schema.d'

export type Station = components['schemas']['Station']
export type EquipmentType = components['schemas']['EquipmentType']

export type RootStackParamList = {
  Home: undefined
  SelectStation: { currentStation: Station }
  ReportForm: { equipmentType: EquipmentType; station: Station }
  ReportCustom: { station: Station }
  Success: undefined
}

export type HomeScreenProps = NativeStackScreenProps<RootStackParamList, 'Home'>
export type SelectStationScreenProps = NativeStackScreenProps<RootStackParamList, 'SelectStation'>
export type ReportFormScreenProps = NativeStackScreenProps<RootStackParamList, 'ReportForm'>
export type ReportCustomScreenProps = NativeStackScreenProps<RootStackParamList, 'ReportCustom'>
export type SuccessScreenProps = NativeStackScreenProps<RootStackParamList, 'Success'>
