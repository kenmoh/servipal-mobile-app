import { router, useLocalSearchParams } from "expo-router";
import { FlatList, View, TouchableOpacity, Platform, useColorScheme} from "react-native";
import { ArrowLeft, ChevronLeft } from "lucide-react-native";

import { fetchLaundryMenu } from "@/api/user";
import CartInfoBtn from "@/components/CartInfoBtn";
import StoreHeader from "@/components/StoreHeader";
import EmptyList from "@/components/EmptyList";
import LaundryCard from "@/components/LaundryCard";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { LaundryMenuItem } from "@/types/item-types";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";
import BackButton from '@/components/BackButton'

import FAB from "@/components/FAB";
import { Menu } from "lucide-react-native";

const StoreDetails = () => {
    const { user } = useUserStore();
      const {
        storeId,
        backDrop,
        companyName,
        openingHour,
        closingHour,
        address,
        rating,
        numberOfReviews,
        laundryId,
        profileImage,
        delivery
    } = useLocalSearchParams();
    const canDeliver = !!delivery
    const { cart, addItem, totalCost, removeItem } = useCartStore();
    const theme = useColorScheme()
    const COLOR = theme === 'dark' ? 'white' : 'black'

    const laundryVendorId = storeId || laundryId;

    const { data, refetch, isFetching } = useQuery({
        queryKey: ["laundryItems", laundryVendorId],
        queryFn: () => fetchLaundryMenu(laundryVendorId as string),
    });


    const handleAddToCart = useCallback(
        (item: LaundryMenuItem) => {
            const isInCart = cart.order_items.some((cartItem) => cartItem.item_id === item.id);
            if (isInCart) {
                removeItem(item.id);
            } else {
                addItem(laundryVendorId as string, item.id, 1, {
                    name: item.name,
                    price: Number(item.price),
                    image: item.images?.[0]?.url || "",
                });
            }
        },
        [addItem, removeItem, laundryVendorId, cart.order_items]
    );


    return (
        <>
        <TouchableOpacity 
            onPress={() => router.back()} 
            className="absolute top-12 left-4 z-10 bg-white rounded-full p-2"
        >
              {Platform.OS === 'ios' ? <ChevronLeft color={'gray'} /> : <ArrowLeft color={'gray'} />}
        </TouchableOpacity>
       
        <StoreHeader 
        storeId={storeId}
        backDrop={backDrop}
        companyName={companyName}
        openingHour={openingHour}
        closingHour={closingHour}
        address={address}
        rating={rating}
        numberOfReviews={numberOfReviews}
        laundryId={laundryId}
        profileImage={profileImage}
        delivery={delivery}


        />
        <View className="flex-1 bg-background p-2" >

            <View className="flex-1">
                <FlatList
                    data={data ?? []}
                    keyExtractor={(item) => item?.id}
                    renderItem={({ item }: { item: LaundryMenuItem }) => (
                        <LaundryCard
                            item={item}
                            onPress={() => handleAddToCart(item)}
                        />
                    )}
                    removeClippedSubviews={true}
                    ListHeaderComponent={<View />}
                    ListEmptyComponent={
                        !isFetching && user?.sub === laundryId ? (
                            <EmptyList
                                title="No Menu Items"
                                description="Add your first menu item to start selling"
                                buttonTitle="Add Menu Item"
                                route="/laundry-detail/addLaundryItem"
                            />
                        ) : null
                    }
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 80 }}
                    refreshing={isFetching}
                    onRefresh={refetch}
                    stickyHeaderIndices={[0]}
                />
            </View>

            <CartInfoBtn
                label="View Cart"
                totalCost={totalCost?.toString()!}
                totalItem={cart.order_items.length}
                onPress={() => router.push({ pathname: "/cart", params: { address, isLaundry: 'true' } })}
            />

            {user?.user_type === "laundry_vendor" && laundryVendorId === user?.sub && (
                <View className="absolute bottom-[40px] right-[10px]" >
                    <FAB
                        icon={<Menu color={"white"} />}
                        onPress={() =>
                            router.push({
                                pathname: "/laundry-detail/addLaundryItem"
                            })
                        }
                    />
                </View>
            )}
        </View>
        </>
    );
};

export default StoreDetails;
