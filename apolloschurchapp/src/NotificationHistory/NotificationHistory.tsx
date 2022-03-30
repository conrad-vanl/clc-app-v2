import React, { useState } from 'react'
import URL from 'url';
import querystring from 'querystring';
import moment from 'moment';
import {gql, useMutation} from '@apollo/client';

import { FlatList, View, Linking } from 'react-native'
import {
  BackgroundView,
  H4,
  H5,
  styled,
  Touchable,
  Cell,
  CellText,
  Divider,
  PaddedView,
  ButtonLink,
  NavigationService
} from '@apollosproject/ui-kit';
import { Caret } from '../ui/ScheduleItem';
import { useQueryAutoRefresh } from '../client/hooks/useQueryAutoRefresh';
import { present } from '../util';

const GET_NOTIFICATION_HISTORY = gql`
  query getNotificationHistory($pushId: String) {
    # https://www.apollographql.com/docs/react/local-state/managing-state-with-field-policies/#using-local-only-fields-as-graphql-variables
    pushId @client @export(as: "pushId")

    oneSignalHistory(pushId: $pushId) {
      total
      read @client
      items {
        id
        headings
        contents
        completed_at
        url
        read @client
      }
    }
  }
`

export const MARK_NOTIFICATIONS_READ = gql`
  mutation markNotificationsRead($ids: [String]!) {
    markNotificationsRead(ids: $ids) @client 
  }
`

interface GetNotificationHistoryData {
  oneSignalHistory: {
    total: number,
    read: number,
    items: NotificationHistoryItem[]
  }
}

interface NotificationHistoryItem {
  id: string
  headings?: string
  contents?: string
  completed_at: string
  url?: string
  read?: boolean
}

export function NotificationHistory() {
  const {data, loading, refetch} = useQueryAutoRefresh<GetNotificationHistoryData>(GET_NOTIFICATION_HISTORY,
      { fetchPolicy: 'cache-and-network' });
  const [markNotificationsRead, { loading: loadingMarkNotificationsRead }] = useMutation<{ read: number}, { ids: string[] }>(MARK_NOTIFICATIONS_READ, {
    refetchQueries: ['getNotificationHistory', 'countUnreadNotificationsQuery']
  })
  const [markingAsRead, setMarkingAsRead] = useState<string[]>([])

  let items = (data?.oneSignalHistory?.items || [])
    .slice()
    .sort(byCompletedAtDesc)

  const unreadIds = items
    .filter((n) => !n.read).map((n) => n.id)
    .filter((id) => !markingAsRead.includes(id))

  return <BackgroundView>
    <PaddedView style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      {!loading &&
        <H5>{unreadIds.length > 0 ? `${unreadIds.length} unread notifications` : 'No unread notifications'}</H5>}
      {unreadIds.length > 0 &&
        <ButtonLink onPress={markAllAsRead}>
          {loadingMarkNotificationsRead ?
            'Please wait...' :
            'Mark as read'}
        </ButtonLink>}
    </PaddedView>
    <FlatList
      refreshing={loading}
      onRefresh={refetch}
      style={{ flex: 1 }}
      data={items}
      renderItem={({item}) =>
        <NotificationListItem item={{
          ...item,
          read: item.read || markingAsRead.includes(item.id)
        }} loading={loading} onPress={() => onPress(item)} />}
    />
  </BackgroundView>

  function onPress(item: NotificationHistoryItem) {
    if (!item.read) {
      setMarkingAsRead([...markingAsRead, item.id])
      markNotificationsRead({
        variables: { ids: [item.id] }
      })
    }
  }

  function markAllAsRead(){
    markNotificationsRead({
      variables: { ids: unreadIds }
    })
  }
}

interface NotificationListItemProps {
  item: NotificationHistoryItem,
  loading: boolean,

  onPress: () => void
}

const LabelText = styled(({ theme, read }) => ({
  fontWeight: 'bold',
  fontSize: 18,
  ...(read && { opacity: 0.6 })
}))(H4);

const ItemCell = styled(({ theme, read }) => ({
  backgroundColor: theme.colors.background.paper
}))(Cell);

const HeaderCell = styled(({ theme, read }) => ({
  backgroundColor: theme.colors.background.paper,
  flexDirection: 'column',
  alignItems: 'flex-start'
}))(Cell);

const ItemText = styled(({ theme, read }) => ({
  fontWeight: 'normal',
  fontSize: 14,
  ...(read && { opacity: 0.6 })
}))(CellText);

const FooterText = styled(({ theme, read }) => ({
  fontWeight: 'normal',
  fontSize: 10,
  ...(read && { opacity: 0.6 })
}))(CellText);

const LinkCaret = styled(({ theme }) => ({
  alignSelf: 'flex-end'
}))(Caret)


const formatTime = (time: string) => (time ? moment(time).format('MMM D, h:mm A') : null);

function NotificationListItem({item, loading, onPress}: NotificationListItemProps) {
  console.log('completedAt:', item.completed_at)
  return <Touchable
    onPress={_onPress}
    key={item?.id}
  >
    <View>
      <HeaderCell read={item.read}>
        <LabelText read={item.read}>
          {item?.headings}
        </LabelText>
        <FooterText read={item.read}>
          {formatTime(item.completed_at)}
        </FooterText>
      </HeaderCell>
      <ItemCell read={item.read}>
        <ItemText read={item.read}>
          {item.contents}
        </ItemText>
        {item.url ? <LinkCaret /> : null}
      </ItemCell>
      <Divider />
    </View>
  </Touchable>

  function _onPress() {
    onPress()

    if (present(item.url)) {
      if (/^http(s)?\:\/\//.test(item.url)) {
        Linking.openURL(item.url);
      } else {
        navigateInApp(item.url)
      }
    }
  }
}

function byCompletedAtDesc(a: { completed_at: string }, b: { completed_at: string }): number {
  return Date.parse(b.completed_at) - Date.parse(a.completed_at)
}

function navigateInApp(rawUrl: string) {
  // copied from packages/apollos-ui-notifications/src/Provider.js
  const url = URL.parse(rawUrl);
  const route = url.pathname!.substring(1);
  const cleanedRoute = route.includes('/app-link/')
    ? route
    : route.split('app-link/')[1];
  const args = querystring.parse(url.query || '');
  console.log('Navigate to', cleanedRoute)
  NavigationService.navigate(cleanedRoute, args);
}