import { withDrawFunds } from "@/api/payment";
import { getCurrentUserWallet } from "@/api/user";
import BalanceShimmer from "@/components/BalanceShimmer";
import { useToast } from "@/components/ToastProvider";
import Transactioncard from "@/components/Transactioncard";
import { useUserStore } from "@/store/userStore";
import { Transaction, UserDetails, Wallet } from "@/types/user-types";
import { formatCurrency } from "@/utils/formatCurrency";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LinearGradient } from "expo-linear-gradient";
import { router, Stack, useFocusEffect } from "expo-router";
import {
    ArrowDownCircle,
    ArrowUpCircle,
    Eye,
    EyeOff,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import {
    FlatList,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";


const index = () => {
    const { user, profile } = useUserStore();
    const [isBalanceHidden, setIsBalanceHidden] = useState(false);
    const { showError, showSuccess } = useToast();

    const { data, isFetching, refetch } = useQuery({
        queryKey: ["wallet", user?.sub],
        queryFn: getCurrentUserWallet,
    });

    const { data: withdrawData, mutate: withdrawMutation } = useMutation({
        mutationFn: withDrawFunds,
        onSuccess: () => {
            showSuccess(
                "Success",
                "Withdrawal request processing. We will notify you once it is completed."
            );

            refetch();
        },
        onError: (error) => {
            showError("Error", error.message);
        },
    });

    useFocusEffect(
        useCallback(() => {
            refetch();
        }, [refetch])
    );
    return (
        <>
            <Stack.Screen
                options={{
                    header: () => (
                        <Header
                            data={data!}
                            isBalanceHidden={isBalanceHidden}
                            isFetching={isFetching}
                            hideOrShowBalance={() => setIsBalanceHidden(!isBalanceHidden)}
                            profile={profile!}
                            withdraw={() => withdrawMutation()}

                        />
                    ),
                }}
            />
            <View className="flex-1 bg-background ">

                <View className="w-[90%] self-center gap-[4%] my-2">
                    <Text className="text-primary text-lg">Transactions</Text>
                </View>

                <FlatList
                    data={data?.transactions || []}
                    keyExtractor={(item: Transaction) => item?.id!}
                    renderItem={({ item }) => <Transactioncard data={item} />}
                    refreshing={isFetching}
                    onRefresh={refetch}
                />
            </View>
        </>
    );
};

function ActionBtn({
    icon,
    label,
    onPress,
}: {
    label: string;
    onPress: () => void;
    icon: React.ReactNode;
}) {
    return (
        <TouchableOpacity
            className="rounded-2xl flex-row gap-2 p-3 bg-white items-center justify-center shadow-lg"
            onPress={onPress}
            style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.1,
                shadowRadius: 8,
                elevation: 4,
            }}
        >
            {icon}
            <Text className="text-sm font-poppins-medium text-gray-800">{label}</Text>
        </TouchableOpacity>
    );
}

type HeaderProps = {
    hideOrShowBalance: () => void;
    isBalanceHidden: boolean;
    isFetching: boolean;
    data: Wallet;
    profile: UserDetails;
    withdraw: () => void;
};
const Header = ({
    hideOrShowBalance,
    isBalanceHidden,
    data,
    isFetching,
    profile,
    withdraw,
}: HeaderProps) => {
    return (
        <View className="w-full">
            <LinearGradient
                colors={["#ff9966", "#ff5e62", "#ff7955", "#ffb347"]}
                style={styles.background}
                start={[0, 0]}
                end={[1, 1]}
            >
                {/* Back Button Section */}
                <View className="flex-row items-center mb-4 pt-10">
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="mr-3 p-1.5 rounded-full bg-white/20"
                        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    >
                        <ArrowUpCircle
                            color="white"
                            size={22}
                            style={{ transform: [{ rotate: '-90deg' }] }}
                        />
                    </TouchableOpacity>
                    <Text className="text-white font-poppins-semibold text-lg">
                        My Wallet
                    </Text>
                </View>

                {/* Balance Section */}
                <View className="flex-row justify-between items-center mb-4">
                    <View className="flex-1">
                        <View className="gap-2 flex-row items-center">
                            <Text style={styles.label}>Main Balance</Text>
                            <TouchableOpacity hitSlop={35} onPress={hideOrShowBalance}>
                                {isBalanceHidden ? (
                                    <Eye color="white" size={16} />
                                ) : (
                                    <EyeOff color="white" size={16} />
                                )}
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-baseline gap-2 mt-1">
                            <Text style={styles.currency}>₦</Text>
                            {isFetching ? (
                                <BalanceShimmer width={80} height={24} borderRadius={8} />
                            ) : (
                                <Text style={styles.amount}>
                                    {isBalanceHidden
                                        ? "****"
                                        : formatCurrency(data?.balance || 0)}
                                </Text>
                            )}
                        </View>
                    </View>
                    <View className="flex-1 items-end">
                        <Text style={[styles.label]}>Escrow Balance</Text>
                        <View className="flex-row items-baseline gap-2 mt-1">
                            <Text style={[styles.currency, { fontFamily: "Poppins-Thin" }]}>
                                ₦
                            </Text>
                            {isFetching ? (
                                <BalanceShimmer width={80} height={24} borderRadius={8} />
                            ) : (
                                <Text style={[styles.amount, { fontFamily: "Poppins-Thin" }]}>
                                    {isBalanceHidden
                                        ? "****"
                                        : formatCurrency(data?.escrow_balance || 0)}
                                </Text>
                            )}
                        </View>
                    </View>
                </View>

                {/* Account Info Section */}
                <View className="gap-1.5 mb-4 bg-white/10 p-3 rounded-xl">
                    {profile?.profile?.bank_account_number && (
                        <View className="flex-row items-center">
                            <Text className="text-white/70 font-poppins text-xs w-20">
                                Account:
                            </Text>
                            <Text className="text-white font-poppins-medium text-xs">
                                {profile?.profile?.bank_account_number}
                            </Text>
                        </View>
                    )}
                    {(profile?.profile?.bank_name ||
                        profile?.profile?.business_name) && (
                            <View className="flex-row items-center">
                                <Text className="text-white/70 font-poppins text-xs w-20">
                                    Name:
                                </Text>
                                <Text className="text-white font-poppins-medium text-xs">
                                    {profile?.profile?.full_name || profile?.profile.business_name}
                                </Text>
                            </View>
                        )}
                </View>

                {/* Action Buttons */}
                <View className="flex-row gap-4">
                    <View className="flex-1">
                        <ActionBtn
                            label="Withdraw"
                            icon={<ArrowUpCircle color={"#ff5e62"} size={20} />}
                            onPress={withdraw}
                        />
                    </View>
                    <View className="flex-1">
                        <ActionBtn
                            label="Deposit"
                            icon={<ArrowDownCircle color={"#10B981"} size={20} />}
                            onPress={() => router.push({ pathname: "/profile-detail/fund-wallet" })}
                        />
                    </View>
                </View>
            </LinearGradient>
        </View>
    );
};

export default index;

const styles = StyleSheet.create({
    background: {
        height: "auto",
        paddingHorizontal: 20,
        paddingBottom: 24,
    },
    label: {
        color: "white",
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        opacity: 0.9,
    },
    currency: {
        color: "white",
        fontFamily: "Poppins-Medium",
        fontSize: 22,
    },
    currencySmall: {
        color: "white",
        fontFamily: "Poppins-Medium",
        fontSize: 18,
    },
    amount: {
        color: "white",
        fontFamily: "Poppins-Bold",
        fontSize: 22,
    },
    amountSmall: {
        color: "white",
        fontFamily: "Poppins-Bold",
        fontSize: 22,
    },
    accountInfoContainer: {
        position: "absolute",
        // bottom: 25,
        left: 20,
        right: 20,
    },
    accountInfo: {
        color: "white",
        fontFamily: "Poppins-Regular",
        fontSize: 14,
        opacity: 0.9,
        textTransform: "capitalize",
    },
});
