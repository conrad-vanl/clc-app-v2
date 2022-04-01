import React from 'react';
import {useApolloClient} from '@apollo/client'
import {MARK_NOTIFICATIONS_READ} from '../NotificationHistory/NotificationHistory'
import { useTrack } from '@apollosproject/ui-analytics';
import { useNotificationOpenedEffect } from './notificationsProvider';

// Wraps the OneSignal event listener so that addEventListener is called after
// OneSignal.init from apollos-ui-notofications/src/Provider.js

export default function NotificationListenerConnected(props: React.PropsWithChildren<any>) {
  const client = useApolloClient()
  const track = useTrack()

  const onOpened = React.useCallback((openResult: any) => {
    const { notificationID, body, additionalData } = openResult?.notification?.payload || {}

    if (notificationID) {
      client.mutate({
        mutation: MARK_NOTIFICATIONS_READ,
        refetchQueries: ['getNotificationHistory', 'countUnreadNotificationsQuery'],
        variables: {
          ids: [notificationID]
        }
      })

      if (track) {

        track({
          eventName: 'Open',
          properties: {
            title: body,
            itemId: notificationID,
            type: 'OneSignalNotification',
            url: additionalData?.url
          }
        })
      }
    }
  }, [client, track])

  useNotificationOpenedEffect(onOpened, [client, track])

  return <>
    {props.children}
  </>
}
