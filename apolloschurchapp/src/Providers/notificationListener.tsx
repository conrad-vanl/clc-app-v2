import React from 'react';
import OneSignal from 'react-native-onesignal';
import {ApolloClient, useApolloClient} from '@apollo/client'
import {MARK_NOTIFICATIONS_READ} from '../NotificationHistory/NotificationHistory'
import { useTrack } from '@apollosproject/ui-analytics';

// Wraps the OneSignal event listener so that addEventListener is called after
// OneSignal.init from apollos-ui-notofications/src/Provider.js
class NotificationListener extends React.Component<{ client: ApolloClient<any>, track: (evt: any) => void }> {

  public componentDidMount() {
    OneSignal.addEventListener('opened', this.onOpened)
  }

  public render() {
    return this.props.children
  }

  onOpened = (openResult: any) => {
    console.log('onOpened', openResult)

    if (openResult?.notification?.id) {
      this.props.client.mutate({
        mutation: MARK_NOTIFICATIONS_READ,
        refetchQueries: ['getNotificationHistory', 'countUnreadNotificationsQuery'],
        variables: {
          ids: [openResult.notification.id]
        }
      })

      if (this.props.track) {
        const { id, headings, url } = openResult?.notification || {}
        this.props.track({
          eventName: 'Open',
          properties: {
            title: headings?.en || headings,
            itemId: id,
            type: 'OneSignalNotification',
            url: url
          }
        })
      }
    }
  }
}

export default function NotificationListenerConnected(props: React.PropsWithChildren<any>) {
  const client = useApolloClient()
  const track = useTrack()

  return <NotificationListener client={client} track={track} {...props} />
}
