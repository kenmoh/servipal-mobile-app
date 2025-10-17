import { router, useLocalSearchParams } from "expo-router";
import { FlatList, View } from "react-native";

import { fetchLaundryMenu } from "@/api/user";
import CartInfoBtn from "@/components/CartInfoBtn";
import EmptyList from "@/components/EmptyList";
import LaundryCard from "@/components/LaundryCard";
import { useCartStore } from "@/store/cartStore";
import { useUserStore } from "@/store/userStore";
import { LaundryMenuItem } from "@/types/item-types";
import { useQuery } from "@tanstack/react-query";
import { useCallback } from "react";

import FAB from "@/components/FAB";
import { Menu } from "lucide-react-native";

const StoreDetails = () => {
    const { user } = useUserStore();
    const { laundryId, storeId, address } = useLocalSearchParams();
    const { cart, addItem, totalCost, removeItem } = useCartStore();

    const laundryVendorId = storeId || laundryId;

    const { data, refetch, isFetching } = useQuery({
        queryKey: ["laundryItems", laundryVendorId],
        queryFn: () => fetchLaundryMenu(laundryVendorId as string),
        select: (items) =>
            items?.filter((item) => item.item_type === "laundry") || [],
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

            {user?.user_type === "laundry_vendor" && laundryVendorId === user?.sub && data && data?.length > 0 && (
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
    );
};

export default StoreDetails;
