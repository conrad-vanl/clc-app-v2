import React from 'react';
import { useQuery, gql } from '@apollo/client';
import { FlatList, View, Text, ViewToken } from 'react-native'
import {
  BackgroundView,
  H1,
  H4,
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

const SelectedConsequenceOverlay = styled(({ theme, selected }: any) => ({
  backgroundColor: theme.colors.background.accent,
  color: theme.colors.background.accent,
  margin: 4,
  borderWidth: 0,
  borderRadius: 30,
  height: ITEM_HEIGHT,
  position: 'absolute',
  top: ITEM_HEIGHT * 2,
  bottom: ITEM_HEIGHT * 2,
  left: 0,
  right: 0,
}))(Button);

const ConsequenceButton = styled(({ theme, selected }: any) => ({
  backgroundColor: theme.colors.action.tertiary,
  color: theme.colors.text.tertiary,
  borderWidth: 1,
  borderRadius: 30,
  height: ITEM_HEIGHT - 10, // 2 * margin + 2 * borderWidth of ItemWrapper
  position: 'absolute',
  right: 4
}))(Button);

export function ConsequenceGenerator() {
  const { data, loading, error } = useQuery<ConsequenceQueryData>(CONSEQUENCE_QUERY, {
    fetchPolicy: 'no-cache'
  });
  const onViewableItemsChanged = React.useCallback(_onViewableItemsChanged, [data])

  const [middleIndex, setMiddleIndex] = React.useState(2)  // initially [0, 1, 2, 3, 4] displayed

  if (loading) {
    return null
  }

  const items = data?.local?.consequenceCollection?.items
  if (error || !items || !items.length) {
    return <ErrorCard error={error || new Error(`An unknown error occurred`)} />
  }

  const hoveredItem = items[middleIndex]

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
      style={{height: ITEM_HEIGHT * 5}}
      data={items}
      renderItem={({item, index}) => <ConsequenceItem {...item} selected={index == 3} />}
      onViewableItemsChanged={onViewableItemsChanged}
    />
    <SelectedConsequenceOverlay>
      <ConsequenceButton title="Accept" />
    </SelectedConsequenceOverlay>
  </View>
  <View>
    <H4>{hoveredItem.title}</H4>
  </View>
  </BackgroundView>

  function _onViewableItemsChanged({changed, viewableItems}: { changed: ViewToken[], viewableItems: ViewToken[] }) {
    const middle = viewableItems[Math.round((viewableItems.length - 1) / 2)]
    console.log('middle', middle.index)
    setMiddleIndex(middle.index!)
  }
}

interface ConsequenceItemProps {
  title: string
  selected?: boolean
}

const ItemWrapper = styled(({ theme, selected }: any) => ({
  borderWidth: 0,
  borderRadius: ITEM_HEIGHT / 2,
  borderColor: theme.colors.background.paper,
  backgroundColor: theme.colors.background.transparent,
  display: 'flex',
  flexDirection: 'row',
  justifyContent: 'center',
  alignItems: 'center',
  height: ITEM_HEIGHT,
}))(View);


const ConsequenceWrapper = styled(({ theme }: any) => ({
  borderTopWidth: 1,
  borderLeftWidth: 1,
  borderRightWidth: 1,
  borderColor: theme.colors.background.accent,
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

const Spacer = styled(({ theme }: any) => ({
  width: ITEM_HEIGHT / 2 // equal to ItemWrapper borderRadius
}))(View);

function ConsequenceItem({title, selected}: ConsequenceItemProps) {
  return <ItemWrapper selected={selected}>
    <Spacer />
    <ConsequenceWrapper selected={selected}>
      <ConsequenceText selected={selected}>{title}</ConsequenceText>
    </ConsequenceWrapper>
    <Spacer style={{width: 100}} />
  </ItemWrapper>
}