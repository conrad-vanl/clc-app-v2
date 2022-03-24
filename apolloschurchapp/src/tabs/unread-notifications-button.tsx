import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { Touchable, Placeholder, makeIcon } from '@apollosproject/ui-kit';
import Svg, { Path } from 'react-native-svg';
import { useNavigation } from '@react-navigation/native';

const COUNT_UNREAD_NOTIFICATIONS = gql`
query countUnreadNotificationsQuery($pushId: String) {
  # https://www.apollographql.com/docs/react/local-state/managing-state-with-field-policies/#using-local-only-fields-as-graphql-variables
  pushId @client @export(as: "pushId")

  oneSignalHistory(pushId: $pushId) {
    total
    read @client
  }
}
`;

const NotificationsIcon = makeIcon(
  ({ size = 32, fill = undefined, ...otherProps } = {}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...otherProps}>
      <Path
        d="M6.24 5.7l.52-1.23C7.18 3.67 8.2 3 9.1 3h5.8c1 0 2 .65 2.34 1.47l.52 1.23H20c1.16 0 2.06.86 2 1.88V19.1c.06 1.12-.84 1.97-2 1.9H4c-1.07.07-1.97-.78-2-1.9V7.6c.03-1.03.92-1.87 2-1.88h2.24zm2.17-.58l-.7 1.7-.22.5H4.02c-.16 0-.3.13-.3.28v11.58c0 .14.14.26.3.26h16.02c.16 0 .3-.1.3-.26V7.6c0-.14-.14-.27-.3-.27H16.6l-.2-.5-.72-1.7c-.1-.26-.5-.5-.78-.5H9.18c-.28 0-.67.25-.77.5zm3.65 12.16c-2.68 0-4.86-2.06-4.86-4.6 0-2.53 2.17-4.6 4.85-4.6 2.7 0 4.87 2.07 4.87 4.6 0 2.54-2.17 4.6-4.86 4.6zm0-1.62c1.74 0 3.15-1.33 3.15-2.97 0-1.67-1.42-3-3.16-3-1.74 0-3.15 1.33-3.15 3 0 1.62 1.4 2.95 3.13 2.95z"
        fill={fill}
      />
    </Svg>
  )
);

const UnreadNotificationsIcon = makeIcon(
  ({ size = 32, fill = undefined, ...otherProps } = {}) => (
    <Svg width={size} height={size} viewBox="0 0 24 24" {...otherProps}>
      <Path
        d="M4.4 20.57h15.52V9.14H4.42v11.43zM8.65 7V3.8c0-.12-.03-.2-.1-.27-.06-.07-.15-.1-.25-.1h-.72c-.1 0-.18.03-.25.1s-.1.15-.1.26V7c0 .1.03.2.1.26s.15.1.25.1h.7c.1 0 .2-.04.26-.1.07-.07.1-.16.1-.26zm8.46 0V3.8c0-.12 0-.2-.1-.27 0-.07-.1-.1-.2-.1h-.7c-.1 0-.2.03-.22.1s-.1.15-.1.26V7c0 .1.04.2.1.26.07.06.15.1.25.1h.7c.1 0 .2-.04.26-.1.07-.07.1-.16.1-.26zm4.3-.7v14.27c0 .4-.12.72-.4 1-.26.3-.6.43-1 .43H4.4c-.4 0-.72-.14-1-.42-.28-.3-.42-.62-.42-1V6.28c0-.4.14-.73.42-1 .28-.3.6-.43 1-.43h1.4V3.8c0-.5.17-.93.52-1.28.34-.35.76-.52 1.24-.52h.7c.5 0 .9.17 1.25.52s.55.77.55 1.27v1h4.23v-1c0-.5.17-.97.52-1.3s.75-.5 1.23-.5h.7c.5 0 .9.14 1.25.5.3.34.5.76.5 1.26v1h1.4c.4 0 .7.13 1 .4.23.3.4.63.4 1z"
        fill={fill}
      />
    </Svg>
  )
);

export function UnreadNotificationsButton() {
  const navigation = useNavigation();
  const { data, loading } = useQuery(COUNT_UNREAD_NOTIFICATIONS);

  const {total, read} = data?.oneSignalHistory || {}

  let Icon = NotificationsIcon
  if (total && read && total > read) {
    Icon = UnreadNotificationsIcon
  }

  return (
    <Touchable
      onPress={() => {
        navigation.navigate('Schedule');
      }}
    >
      <Placeholder.Media size={24} hasRadius onReady={!loading}>
        <Icon size={24} />
      </Placeholder.Media>
    </Touchable>
  );
}
