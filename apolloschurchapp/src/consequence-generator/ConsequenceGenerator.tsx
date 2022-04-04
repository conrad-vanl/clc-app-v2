import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { FlatList, View, Text } from 'react-native'
import {
  BackgroundView,
  H1,
  H5,
  styled,
  Touchable,
  Cell,
  CellText,
  GradientOverlayImage,
  Button,
  ErrorCard
} from '@apollosproject/ui-kit';
import { useTrack, TrackEventWhenLoaded } from '@apollosproject/ui-analytics';

const CONSEQUENCE_QUERY = gql`
  query getAllConsequences {
    local @client {
      consequenceCollection {
        items {
          title
          description
        }
      }
    }
  }
`

interface ConsequenceQueryData {
  local: {
    consequenceCollection: {
      items: Consequence[]
    }
  }
}
interface Consequence {
  title: string
  description: string
}

const ITEM_HEIGHT = 50;

export function ConsequenceGenerator() {
  const { data, loading, error } = useQuery<ConsequenceQueryData>(CONSEQUENCE_QUERY, {
    fetchPolicy: 'no-cache'
  });
  console.log('data', data)

  if (loading) {
    return null
  }

  const items = data?.local?.consequenceCollection?.items
  if (!loading && (error || !items || !items.length)) {
    return <ErrorCard error={error || new Error(`An unknown error occurred`)} />
  }

  return <BackgroundView>
  <TrackEventWhenLoaded
    isLoading={loading}
    eventName={'View Content'}
    properties={{
      title: 'Farkle Consequence Generator',
      itemId: 'consequenceGenerator',
      type: 'tab'
    }}
  />
  <H1>Farkle Wheel of Consequences</H1>
  <View style={{height: ITEM_HEIGHT * 5}}>
    <FlatList
      style={{height: ITEM_HEIGHT * 5, borderWidth: 1, borderColor: 'green'}}
      data={items}
      renderItem={({item, index}) => <ConsequenceItem {...item} selected={index == 3} />}
    />
  </View>
  </BackgroundView>
}

interface ConsequenceItemProps {
  title: string
  selected?: boolean
}

const ItemWrapper = styled(({ theme, selected }: any) => ({
  borderWidth: 1,
  borderRadius: ITEM_HEIGHT / 2,
  borderColor: selected ? theme.colors.background.accent : theme.colors.background.paper,
  backgroundColor: selected ? theme.colors.background.accent : theme.colors.background.transparent,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'stretch',
  alignItems: 'center',
  height: ITEM_HEIGHT,
}))(View);


const ConsequenceWrapper = styled(({ theme }: any) => ({
  borderWidth: 1,
  borderColor: 'green',
  flex: 1,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'space-around',
  alignItems: 'center',
  backgroundColor: theme.colors.background.transparent,
  height: ITEM_HEIGHT,
}))(View);

const ConsequenceText = styled(({ theme }: any) => ({
  
}))(H5);

const ConsequenceButton = styled(({ theme, selected }: any) => ({
  opacity: selected ? 1 : 0,
  backgroundColor: theme.colors.action.tertiary,
  color: theme.colors.text.tertiary,
  margin: 4,
  borderWidth: 1,
  borderRadius: 30,
  height: ITEM_HEIGHT - 10, // 2 * margin + 2 * borderWidth of ItemWrapper
}))(Button);

const Spacer = styled(({ theme }: any) => ({
  width: ITEM_HEIGHT / 2 // equal to ItemWrapper borderRadius
}))(View);

function ConsequenceItem({title, selected}: ConsequenceItemProps) {
  return <ItemWrapper selected={selected}>
    <Spacer />
    <ConsequenceWrapper selected={selected}>
      <ConsequenceText selected={selected}>{title}</ConsequenceText>
    </ConsequenceWrapper>
    <ConsequenceButton title="Accept" selected={selected} />
  </ItemWrapper>
}