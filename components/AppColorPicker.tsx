// AppColorPicker.tsx
import React, { useState } from "react";
import { Modal, View } from "react-native";
import ColorPicker, {
  HueSlider,
  Panel1,
  Preview,
} from "reanimated-color-picker";
import AppButton from "./AppButton";

interface PickerProp {
  onSelectColor: (hex: string) => void;
}

export default function AppColorPicker({ onSelectColor }: PickerProp) {
  // Local state to control modal visibility and selected color.
  const [showModal, setShowModal] = useState(false);
  const [selectedColor, setSelectedColor] = useState<string>("#ffffff");

  return (
    <>
      {/* This button opens the color picker modal */}
      <AppButton
        width="90%"
        backgroundColor="bg-input"
        title="Color Picker"
        onPress={() => setShowModal(true)}
      />


      <Modal visible={showModal} animationType="slide">
        <View
          className="flex-1 justify-center items-center bg-background"

        >
          <ColorPicker
            style={{ width: "70%", height: 300 }}
            initialColor={selectedColor}
            // value={selectedColor} Use the current selected color
            onComplete={(result: any) => {
              setSelectedColor(result.hex);
            }}
          >
            <Preview />
            <Panel1 />
            <HueSlider />
          </ColorPicker>
          <AppButton
            title="Done"
            onPress={() => {
              onSelectColor(selectedColor);
              setShowModal(false);
            }}
          />

        </View>
      </Modal>
    </>
  );
}
