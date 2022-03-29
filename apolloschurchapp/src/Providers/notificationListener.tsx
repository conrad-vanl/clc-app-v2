import React from 'react';
import OneSignal from 'react-native-onesignal';
import {ApolloClient, useApolloClient} from '@apollo/client'
import {MARK_NOTIFICATIONS_READ} from '../NotificationHistory/NotificationHistory'

// Wraps the OneSignal event listener so that addEventListener is called after
// OneSignal.init from apollos-ui-notofications/src/Provider.js
class NotificationListener extends React.Component<{ client: ApolloClient<any> }> {

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
    }
  }
}

export default function NotificationListenerConnected(props: React.PropsWithChildren<any>) {
  const client = useApolloClient()

  return <NotificationListener client={client} {...props} />
}
