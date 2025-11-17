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
            className="rounded-full flex-row gap-2 p-3 bg-white mt-3"
            onPress={onPress}
        >
            {icon}
            <Text className="text-sm font-poppins-light text-gray-800">{label}</Text>
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

        <View className="self-center rounded-b-lg overflow-hidden w-full">
            <LinearGradient
                colors={["#ff9966", "#ff5e62", "#ff7955", "#ffb347"]}
                style={[styles.background, { height: "auto", paddingBottom: 16 }]}
                start={[0, 0]}
                end={[1, 1]}
            >
                <View className="flex-row justify-between items-center">
                    <View className="">
                        <View className=" gap-2 flex-row">
                            <Text style={styles.label}>Main Balance</Text>
                            <TouchableOpacity hitSlop={35} onPress={hideOrShowBalance}>
                                {isBalanceHidden ? (
                                    <Eye color="white" size={16} />
                                ) : (
                                    <EyeOff color="white" size={16} />
                                )}
                            </TouchableOpacity>
                        </View>
                        <View className="flex-row items-baseline gap-2 mt-2">
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
                    <View className="">
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

                <View className="gap-3 mt-1">
                    {profile?.profile?.bank_account_number && (
                        <Text className="text-white font-poppins-medium">
                            Account: {profile?.profile?.bank_account_number}
                        </Text>
                    )}
                    {(profile?.profile?.bank_name ||
                        profile?.profile?.business_name) && (
                            <Text className="text-white font-poppins">
                                Name:{" "}
                                {profile?.profile?.full_name || profile?.profile.business_name}
                            </Text>
                        )}
                </View>
                <View className="flex-row gap-6 mt-2 pb-2">
                    <ActionBtn
                        label="Withdraw"
                        icon={<ArrowUpCircle color={"gray"} size={20} />}
                        onPress={withdraw}
                    />
                    <ActionBtn
                        label="Deposit"
                        icon={<ArrowDownCircle color={"gray"} size={20} />}
                        onPress={() => router.push({ pathname: "/profile/fund-wallet" })}
                    />
                </View>
            </LinearGradient>
        </View>
    );
};

export default index;

const styles = StyleSheet.create({
    background: {
        height: "auto",
        // position: "relative",
        paddingHorizontal: 20,
        paddingVertical: 40
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
