import React from 'react'
import { Platform, StyleSheet, TouchableOpacity, useColorScheme, View } from 'react-native'


import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import { router } from 'expo-router'
import { ArrowLeft, ChevronLeft } from 'lucide-react-native'
import Map from './Map'




interface DeliveryWrapperProps {
  id: string
  children: React.ReactNode
}

const DeliveryWrapper = ({ children, id }: DeliveryWrapperProps) => {

  const bottomSheetRef = React.useRef(null)

  const theme = useColorScheme()
  const HANDLE_INDICATOR_STYLE = theme === 'dark' ? HEADER_BG_LIGHT : HEADER_BG_DARK
  const HANDLE_STYLE = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT
  return (


    <View className='flex-1 bg-background'>
      <Map id={id} />
      <TouchableOpacity onPress={() => router.back()} className='absolute top-10 left-6 rounded-full p-3 bg-input'>
        {Platform.OS === 'ios' ? <ChevronLeft color={theme === 'dark' ? 'white' : 'black'} /> : <ArrowLeft color={theme === 'dark' ? 'white' : 'black'} />}
      </TouchableOpacity>
      <BottomSheet handleIndicatorStyle={{ backgroundColor: HANDLE_INDICATOR_STYLE }} style={{ flex: 1 }} handleStyle={{ backgroundColor: HANDLE_STYLE }} snapPoints={['40%', '50%']} index={0} ref={bottomSheetRef}>
        <BottomSheetScrollView className={'bg-background flex-1'}>
          {children}
        </BottomSheetScrollView>

      </BottomSheet>
    </View>

  )
}

export default DeliveryWrapper

const styles = StyleSheet.create({})