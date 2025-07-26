import { getCurrentDispatchRiders } from '@/api/user'
import EmptyList from '@/components/EmptyList'
import FAB from '@/components/FAB'
import LoadingIndicator from '@/components/LoadingIndicator'
import RiderCard from '@/components/RiderCard'
import { useAuth } from '@/context/authContext'
import { RiderResponse } from '@/types/user-types'
import { useQuery } from '@tanstack/react-query'
import { router } from 'expo-router'
import { UserPlus2 } from 'lucide-react-native'
import React from 'react'
import { FlatList, View } from 'react-native'


const riders = () => {

    const { user } = useAuth()

    const { data, refetch, isFetching } = useQuery({
        queryKey: ['riders', user?.sub],
        queryFn: () => getCurrentDispatchRiders(),
    })




    if (isFetching) return <LoadingIndicator />

    return (
        <View className='flex-1 bg-background'>

            {

                !isFetching && data?.length === 0 && <EmptyList
                    title="No Riders Yet"
                    description="Add your first dispatch rider to start managing deliveries efficiently"
                    buttonTitle="Add New Rider"
                    route="/profile/addRider"
                />
            }
            <FlatList
                data={data ?? []}
                keyExtractor={(item: RiderResponse) => item?.id?.toString()}
                renderItem={({ item }: { item: RiderResponse }) => <RiderCard rider={item} />}
                refreshing={isFetching}
                onRefresh={refetch}

            />
            {data && data?.length > 0 && <FAB icon={<UserPlus2 color={'white'} />} onPress={() => router.push({ pathname: "/profile/addRider" })} />}

        </View>
    )
}

export default riders



