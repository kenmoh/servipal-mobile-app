import { RiderProps } from "@/types/user-types";
import { router } from "expo-router";
import { StarIcon } from "lucide-react-native";
import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import HDivider from "./HDivider";

const Rider = ({ rider }: { rider: RiderProps }) => {
  return (
    <TouchableOpacity
      activeOpacity={5}
      onPress={() =>
        router.push({
          pathname: "/(app)/delivery/sendItem",
          params: { riderId: rider.rider_id },
        })
      }
      className="overflow-hidden  bg-input rounded-2xl border border-collapse-transparent border-border-subtle p-4 mb-4 shadow-sm w-[95%] self-center my-2"
    >
      <View className="flex-row gap-2">
        <View className="w-20 h-20 rounded-full overflow-hidden">
          <Image
            src={
              rider?.profile_image_url || "https://picsum.photos/200/200.jpg"
            }
            className="w-20 h-20 rounded-full"
          />
        </View>
        <View className="mt-5">
          <Text className="text-secondary font-poppins-bold text-sm">
            {rider.full_name}
          </Text>
          <Text className="text-secondary font-poppins text-sm">
            {rider.business_address}
          </Text>
        </View>
      </View>

      <View className="mt-2">
        <View className=" justify-between">
          <HDivider />

          <View className="flex-row items-center self-center gap-8 mt-2">
            <View>
              <Text className="text-center font-poppins text-xs text-muted">
                {rider.delivery_count}
              </Text>
              <Text className="text-center font-poppins text-xs text-muted">
                Deliveries
              </Text>
            </View>
            <View>
              <Text className="text-center font-poppins text-xs text-muted">
                {rider.review_count}
              </Text>
              <Text className="text-center font-poppins text-xs text-muted">
                Reviews
              </Text>
            </View>
            <View>
              <Text className="text-center font-poppins text-xs text-muted">
                {rider.distance_km} km
              </Text>
              <Text className="text-center font-poppins text-xs text-muted">
                Away from you
              </Text>
            </View>
          </View>
        </View>
      </View>
      {rider.average_rating > 1 && <View className="absolute w-16 h-10 bg-background justify-center right-0 top-0 rounded-2xl items-center ">
        <View className="flex-row gap-1 items-center">
          <StarIcon color={"orange"} size={10} />
          <Text className="text-center font-poppins-bold text-sm text-muted">
            {rider.average_rating}
          </Text>
        </View>
      </View>}
    </TouchableOpacity>
  );
};

export default Rider;

const styles = StyleSheet.create({});
