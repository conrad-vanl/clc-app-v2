import React from 'react'
import {gql, useQuery} from '@apollo/client';

import { FlatList, View, Text } from 'react-native'
import {
  BackgroundView,
  H4,
  H5,
  styled,
  Touchable,
  Cell,
  CellText,
  GradientOverlayImage,
  Divider,
  PaddedView,
  ButtonLink
} from '@apollosproject/ui-kit';
import { Caret } from '../ui/ScheduleItem';
import { useQueryAutoRefresh } from '../client/hooks/useQueryAutoRefresh';

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
  completed_at: number
  url?: string
  read?: boolean
}

export function NotificationHistory() {
  const {data, loading, refetch} = useQueryAutoRefresh<GetNotificationHistoryData>(GET_NOTIFICATION_HISTORY);

  let items = (data?.oneSignalHistory?.items || [])
    .slice()
    .sort(byCompletedAtDesc)

  const unreadIds = items.filter((n) => !n.read).map((n) => n.id)

  return <BackgroundView>
    <PaddedView style={{flexDirection: 'row', justifyContent: 'space-between'}}>
      <H5>{unreadIds.length > 0 ? `${unreadIds.length} unread notifications` : ''}</H5>
      <ButtonLink onPress={markAllAsRead}>
        <Text>Mark as read</Text>
      </ButtonLink>
    </PaddedView>
    <FlatList
      refreshing={loading}
      onRefresh={refetch}
      style={{ flex: 1 }}
      data={items}
      renderItem={(props) => <NotificationListItem item={props.item} loading={loading} />}
    />
  </BackgroundView>

  function markAllAsRead(){

  }
}

function NotificationListItem({item, loading}: { item: NotificationHistoryItem, loading: boolean }) {
  return <Touchable
    onPress={() => {
      // TODO
    }}
    key={item?.id}
  >
    <View>
      <Cell>
        <CellText isLoading={loading}><H4>{item?.headings}</H4></CellText>
        <Caret />
      </Cell>
      <Divider />
    </View>
  </Touchable>
}

function byCompletedAtDesc(a: { completed_at: number }, b: { completed_at: number }): number {
  return b.completed_at - a.completed_at
}