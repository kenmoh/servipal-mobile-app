import { router, useLocalSearchParams } from "expo-router";
import { ArrowLeft, ChevronLeft } from "lucide-react-native";
import { FlatList, Platform, TouchableOpacity, View } from "react-native";

import { fetchLaundryMenu } from "@/api/user";
import CartInfoBtn from "@/components/CartInfoBtn";
import EmptyList from "@/components/EmptyList";
import LaundryCard from "@/components/LaundryCard";
import StoreHeader from "@/components/StoreHeader";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { LaundryMenuItem } from "@/types/item-types";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

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
        profileImage,
        delivery
    } = useLocalSearchParams();

    const { cart, addItem, totalCost, removeItem } = useCartStore();

    const { data, refetch, isFetching } = useQuery({
        queryKey: ["laundryItems", storeId],
        queryFn: () => fetchLaundryMenu(storeId as string),
    });

    const handleAddToCart = useCallback(
        (item: LaundryMenuItem) => {
            const isInCart = cart.order_items.some((cartItem) => cartItem.item_id === item.id);
            if (isInCart) {
                removeItem(item.id);
            } else {
                addItem(storeId as string, item.id, 1, {
                    name: item.name,
                    price: Number(item.price),
                    image: item.images?.[0]?.url || "",
                });
            }
        },
        [addItem, removeItem, storeId, cart.order_items]
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
                storeId={storeId as string}
                backDrop={backDrop as string}
                companyName={companyName as string}
                openingHour={openingHour as string}
                closingHour={closingHour as string}
                address={address as string}
                rating={Number(rating)}
                numberOfReviews={Number(numberOfReviews)}
                profileImage={profileImage as string}
                delivery={Boolean(delivery)}


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
                            !isFetching && user?.sub === storeId ? (
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

                {user?.user_type === "laundry_vendor" && storeId === user?.sub && (
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
