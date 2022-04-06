import React, { useState } from 'react'
import URL from 'url';
import querystring from 'querystring';
import moment from 'moment';
import {gql, useMutation} from '@apollo/client';

import { FlatList, View, Linking, TouchableOpacity as Touchable } from 'react-native'
import {
  BackgroundView,
  H4,
  H5,
  styled,
  Cell,
  CellText,
  Divider,
  PaddedView,
  ButtonLink,
  NavigationService
} from '@apollosproject/ui-kit';
import { TrackEventWhenLoaded, useTrack } from '@apollosproject/ui-analytics';
import { Caret } from '../ui/ScheduleItem';
import { useQueryAutoRefresh } from '../client/hooks/useQueryAutoRefresh';
import { present } from '../util';
import { uniq } from 'lodash';

export const GET_NOTIFICATION_HISTORY = gql`
  query getNotificationHistory {
    oneSignalHistory {
      total
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

export interface GetNotificationHistoryData {
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
    refetchQueries: ['getNotificationHistory']
  })
  const [markingAsRead, setMarkingAsRead] = useState<string[]>([])

  let items = (data?.oneSignalHistory?.items || [])
    .slice()
    .sort(byCompletedAtDesc)

  const unreadIds = items
    .filter((n) => !n.read).map((n) => n.id)
    .filter((id) => !markingAsRead.includes(id))

  return <BackgroundView>
    <TrackEventWhenLoaded
        isLoading={loading}
        eventName={'View Content'}
        properties={{
          title: 'Notification History',
          itemId: 'notificationHistory',
          type: 'tab'
        }}
      />

    <PaddedView style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      {!loading &&
        <H5>{unreadIds.length > 0 ? `${unreadIds.length} unread notifications` : 'No unread notifications'}</H5>}
      {!loading && unreadIds.length > 0 &&
        <ButtonLink onPress={markAllAsRead}>
          {loadingMarkNotificationsRead ?
            'Please wait...' :
            'Mark all as read'}
        </ButtonLink>}
    </PaddedView>
    {!loading && <FlatList
      refreshing={loading}
      onRefresh={refetch}
      style={{ flex: 1 }}
      data={items}
      renderItem={({item}) =>
        <NotificationListItem item={{
          ...item,
          read: item.read || markingAsRead.includes(item.id)
        }} loading={loading} onPress={() => onPress(item)} />}
    />}
  </BackgroundView>

  function onPress(item: NotificationHistoryItem) {
    if (!item.read) {
      setMarkingAsRead(uniq([...markingAsRead, item.id]))
      markNotificationsRead({
        variables: { ids: [item.id] }
      })
    }
  }

  function markAllAsRead(){
    setMarkingAsRead(uniq([...markingAsRead, ...unreadIds]))
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
  backgroundColor: theme.colors.background.paper,
  flex: 1,
}))(Cell);

const HeaderCell = styled(({ theme, read }) => ({
  backgroundColor: theme.colors.background.paper,
  flexDirection: 'column',
  alignItems: 'flex-start',
  flex: 1,
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
  backgroundColor: theme.colors.background.paper,
}))(Caret)

const Wrapper = styled(({ theme, read }) => ({
  display: 'flex',
  backgroundColor: theme.colors.background.paper,
}))(View);

const formatTime = (time: string) => (time ? moment(time).format('MMM D, h:mm A') : null);

function NotificationListItem({item, loading, onPress}: NotificationListItemProps) {
  const track = useTrack();

  return <Touchable
    onPress={_onPress}
    key={item?.id}
  >
    <>
    <Wrapper style={{ flexDirection: 'row', width: '100%' }}>
      <Wrapper style={{ flexDirection: 'column', width: '90%' }}>
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
        </ItemCell>
      </Wrapper>

      {item.url ? <LinkCaret style={{width: '10%'}} /> : null}
    </Wrapper>
    <Divider />
    </>
  </Touchable>

  function _onPress() {
    onPress()

    if (track) {
      track({
        eventName: 'Open',
        properties: {
          title: item.headings,
          itemId: item.id,
          on: 'notificationHistory',
          url: item.url
        }
      })
    }

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