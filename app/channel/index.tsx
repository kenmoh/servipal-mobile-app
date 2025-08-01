import ChannelListItem from "@/components/ChannelListItem";
import { useAuth } from "@/context/authContext";
// import { ChatContext } from "@/context/chatContext";
import { router } from "expo-router";
import { useMemo } from "react";
import { useColorScheme, View } from "react-native";
import { ChannelList } from "stream-chat-expo";

const sort = { last_updated: -1 };
const options = {
  state: true,
  watch: true,
};

export default function ChannelListScreen() {
  const theme = useColorScheme();
  const { user } = useAuth();
  // const { setChannel } = useContext(ChatContext);

  if (!user) {
    router.replace("/sign-in");
    return null;
  }

  const filters = {
    members: { $in: [user.sub] },
    type: "messaging",
  };
  const memoizedFilters = useMemo(() => filters, []);

  return (
    <View className="bg-red-500 flex-1">
      <ChannelList
        Preview={ChannelListItem}
        filters={memoizedFilters}
        options={options}
        sort={sort?.last_updated}
        onSelect={(channel) => {
          // setChannel(channel);
          router.push({
            pathname: `/channel/[cid]`,
            params: { cid: channel.cid! },
          });
        }}
      />
    </View>
  );
}
