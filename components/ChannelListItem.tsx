import { View } from 'react-native';
import { ChannelPreviewMessenger } from 'stream-chat-expo';


const ChannelListItem = (props: any) => {

    const { unread } = props
    return (
        <View className={`bg-${unread ? 'button-primary-transparent' : 'background'}`} >

            <ChannelPreviewMessenger {...props} />
        </View>
    )
}

export default ChannelListItem