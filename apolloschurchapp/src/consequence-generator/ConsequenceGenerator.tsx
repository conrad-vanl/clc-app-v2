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
import { debounce } from 'lodash';

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

export function ConsequenceGenerator() {
  const { data, loading, error } = useQuery<ConsequenceQueryData>(CONSEQUENCE_QUERY, {
    fetchPolicy: 'no-cache'
  });

  const items = data?.local?.consequenceCollection?.items
  
  return <>
    <TrackEventWhenLoaded
      isLoading={false}
      eventName={'View Content'}
      properties={{
        title: 'Farkle Consequence Generator',
        itemId: 'consequenceGenerator',
        type: 'tab'
      }}
    />
    {!loading && (error || !items || !items.length) &&
      <ErrorCard error={error || new Error(`An unknown error occurred`)} />}
    {!loading && items?.length &&
      <ConsequenceWheel items={items} />}
  </>
}

const ITEM_HEIGHT = 50;
/** The number of times the wheel can spin in either direction before coming to the end of the list */
const REPLICAS = 5;

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

interface ConsequenceWheelProps {
  items: Consequence[]
}


function ConsequenceWheel({ items }: ConsequenceWheelProps) {
  const data = React.useMemo(() => repeatArray(items, (REPLICAS * 2) + 1), [items])
  const onViewableItemsChanged = React.useCallback(debounce(_onViewableItemsChanged, 50), [items])
  const listRef = React.useRef<any>()

  const numBefore = REPLICAS * items.length
  const beginningOfLastReplica = data.length - items.length

  const [hoveredIndex, setHoveredIndex] = React.useState(2)  // initially [0, 1, 2, 3, 4] displayed

  const hoveredItem = data[hoveredIndex]

  return <BackgroundView>
  <H1>Farkle Wheel of Consequences</H1>
  <Button title="Spin the Wheel" type="tertiary"
    onPress={React.useCallback(() => {
      if(listRef?.current) {
        // Spin to a random one in the next group
        const randomIdx = getRandomInt(items.length) + hoveredIndex
        console.log('hovered', hoveredIndex, randomIdx)
        listRef.current.scrollToIndex({
          index: randomIdx
        })
      }
    }, [listRef?.current, hoveredIndex, items.length])} />

  <View style={{height: ITEM_HEIGHT * 5}}>
    <FlatList
      ref={listRef}
      style={{height: ITEM_HEIGHT * 5}}
      data={data}
      renderItem={({item, index}) => <ConsequenceItem {...item} index={index} />}
      initialScrollIndex={numBefore}
      initialNumToRender={items.length}
      removeClippedSubviews
      onViewableItemsChanged={onViewableItemsChanged}
      getItemLayout={React.useCallback((data, index) => {
        return {
          length: ITEM_HEIGHT,
          offset: index * ITEM_HEIGHT,
          index
        }
      }, [])}
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
    if (!middle || !middle.index) { return }

    console.log('middle', middle.index)
    if (middle.index >= beginningOfLastReplica || middle.index < items.length) {
      // We've scrolled to the last or first replica - re-scroll to the middle
      const newIndex = numBefore + (middle.index % items.length)
      listRef?.current?.scrollToIndex({
        index: newIndex,
        viewPosition: 0.5,
        animated: false
      })
      setHoveredIndex(newIndex)
    } else {
      setHoveredIndex(middle.index)
    }
  }
}

interface ConsequenceItemProps {
  title: string
  index: number
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

function ConsequenceItem({title, index, selected}: ConsequenceItemProps) {
  return <ItemWrapper selected={selected}>
    <Spacer />
    <ConsequenceWrapper selected={selected}>
      <ConsequenceText selected={selected}>{index} {title}</ConsequenceText>
    </ConsequenceWrapper>
    <Spacer style={{width: 100}} />
  </ItemWrapper>
}

function repeatArray<T>(items: T[], replicas: number): T[] {
  let retval: T[] = []
  for(let i = 0; i < replicas; i++) {
    retval.push(...items)
  }
  return retval
}

function getRandomInt(max: number) {
  return Math.floor(Math.random() * max);
}