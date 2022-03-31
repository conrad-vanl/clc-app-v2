import React from 'react';
import { Touchable, Placeholder, makeIcon } from '@apollosproject/ui-kit';
import Svg, { Path, Circle } from 'react-native-svg';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import { GET_NOTIFICATION_HISTORY } from '../NotificationHistory/NotificationHistory';
import { useQuery } from '@apollo/client';

const NotificationsIcon = makeIcon(
  ({ size = 32, fill = undefined, ...otherProps } = {}) => (
    <Svg width={size} height={size} viewBox="0 0 32 32" {...otherProps}>
      <Path d="M0,0h32v32H0V0z" fill={'none'} />
      <Path
        d="M27.2,4.8H4.8C3.2,4.8,2,6,2,7.6v16.8c0,1.6,1.2,2.8,2.8,2.8h22.4c1.6,0,2.8-1.2,2.8-2.8V7.6C30,6,28.8,4.8,27.2,4.8z
        M26.7,10.8L16.8,17c-0.4,0.3-1.1,0.3-1.5,0l-10-6.2C5,10.5,4.8,10.1,4.8,9.7c0-1,1.1-1.5,1.8-1.1l9.4,5.9l9.4-5.9
       c0.8-0.5,1.8,0.1,1.8,1.1C27.2,10.1,27,10.5,26.7,10.8z"
        fill={fill}
      />
    </Svg>
  )
);

const UnreadNotificationsIcon = makeIcon(
  ({ size = 32, fill = undefined, ...otherProps } = {}) => (
    <Svg width={size} height={size} viewBox="0 0 32 32" {...otherProps}>
      <Path d="M0,0h32v32H0V0z" fill={'none'} />
      <Path
        d="M27.2,4.8H4.8C3.2,4.8,2,6,2,7.6v16.8c0,1.6,1.2,2.8,2.8,2.8h22.4c1.6,0,2.8-1.2,2.8-2.8V7.6C30,6,28.8,4.8,27.2,4.8z
        M26.7,10.8L16.8,17c-0.4,0.3-1.1,0.3-1.5,0l-10-6.2C5,10.5,4.8,10.1,4.8,9.7c0-1,1.1-1.5,1.8-1.1l9.4,5.9l9.4-5.9
       c0.8-0.5,1.8,0.1,1.8,1.1C27.2,10.1,27,10.5,26.7,10.8z"
        fill={fill}
      />
      <Circle cx="4" cy="6.2" r="4" fill={'red'} />
    </Svg>
  )
);

export function UnreadNotificationsButton({ size = 32 }: {size?: number}) {
  const navigation = useNavigation();
  const { data, loading, refetch } = useQuery(GET_NOTIFICATION_HISTORY, {
    fetchPolicy: 'cache-and-network'
  });
  useFocusEffect(() => { refetch() })

  const {total, read} = data?.oneSignalHistory || {}

  let Icon = NotificationsIcon
  if (!loading && (typeof total != 'undefined') && (typeof read != 'undefined') && (total > read)) {
    Icon = UnreadNotificationsIcon
  }

  return (
    <Touchable
      onPress={() => {
        navigation.navigate('NotificationHistory');
      }}
    >
      <Placeholder.Media size={size} hasRadius onReady={true}>
        <Icon size={size} />
      </Placeholder.Media>
    </Touchable>
  );
}
