import React from 'react'
import { StyleSheet, useColorScheme, View } from 'react-native'


import { HEADER_BG_DARK, HEADER_BG_LIGHT } from '@/constants/theme'
import BottomSheet, { BottomSheetScrollView } from '@gorhom/bottom-sheet'
import Map from './Map'




interface DeliveryWrapperProps {
  children: React.ReactNode
}

const DeliveryWrapper = ({ children }: DeliveryWrapperProps) => {

  const bottomSheetRef = React.useRef(null)

  const theme = useColorScheme()
  const HANDLE_INDICATOR_STYLE = theme === 'dark' ? HEADER_BG_LIGHT : HEADER_BG_DARK
  const HANDLE_STYLE = theme === 'dark' ? HEADER_BG_DARK : HEADER_BG_LIGHT
  return (


    <View className='flex-1 bg-background'>
      <Map />
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