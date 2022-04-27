import React, { useCallback, useEffect, useMemo } from 'react';
import marked from 'marked';
import { gql } from '@apollo/client';
import { SectionList } from 'react-native';
import { useIsFocused, useNavigation } from '@react-navigation/native';
import {
  BackgroundView,
  H4,
  styled,
} from '@apollosproject/ui-kit';
import { useTrack } from '@apollosproject/ui-analytics';

import ScheduleItem from '../../ui/ScheduleItem';
import { useQueryAutoRefresh } from '../../client/hooks/useQueryAutoRefresh';
import { renderPlain } from '../../markdown';

const getDays = gql`
  query {
    local @client {
      conference(id: "7pE6FgpSVhbx3u105MMZFz") {
        days {
          items {
            title
            date
            scheduleItem {
              items {
                sys {
                  id
                }
                ... on Local_Event {
                  title
                  description
                  startTime
                  endTime
                }
                ... on Local_Breakouts {
                  title
                  description
                  startTime
                  endTime
                }
              }
            }
          }
        }
      }
    }
  }
`;

interface Day {
  title: string
  date: string
  scheduleItem: {
    items: ScheduleItemData[]
  }
}

interface ScheduleItemData {
  sys: { id: string }
  title: string
  description?: string
  startTime: string
  endTime: string 
}

const SectionHeader = styled(({ theme }: any) => ({
  backgroundColor: theme.colors.background.paper,
  color: theme.colors.text.secondary,
  paddingHorizontal: theme.sizing.baseUnit,
  paddingVertical: theme.sizing.baseUnit / 2,
}))(H4);

function byDate(a: { date: string }, b: { date: string }) {
  return Date.parse(a.date) - Date.parse(b.date);
}
function byStartTime(a: { startTime: string }, b: { startTime: string }) {
  return Date.parse(a.startTime) - Date.parse(b.startTime);
}

const HEADER_HEIGHT = 30
const ITEM_HEIGHT = 80

function renderSectionHeader({ section }: { section: { title: string } }) {
  return <SectionHeader height={HEADER_HEIGHT}>
      {section.title}
    </SectionHeader>
}

function renderItem({ item }: { item: ScheduleItemData }) {
  const track = useTrack();
  const navigation = useNavigation()

  return <ScheduleItem
    key={item.sys.id}
    height={ITEM_HEIGHT}
    id={null}
    isLoading={false}
    onPress={() => {

      if (track) {
        track({
          eventName: 'Click',
          properties: {
            title: item.title,
            itemId: item.sys.id,
            on: 'schedule'
          }
        })
      }

      navigation.navigate('LocalContentSingle', {
        itemId: item.sys.id,
      });
    }}
    {...item}
    summary={item.description && marked(item.description, {renderer: renderPlain()} )}
  />
}

const Schedule = () => {
  const isFocused = useIsFocused();
  const { loading, error, refetch, data } = useQueryAutoRefresh(getDays, {
    fetchPolicy: 'no-cache',
  });
  const days: Day[] | undefined = data?.local?.conference?.days?.items

  const sections = React.useMemo(
    () =>
      (days || [])
        .slice()
        .sort(byDate)
        .map((day: Day) => ({
          title: day?.title,
          date: day?.date,
          data: (day?.scheduleItem?.items || []).slice().sort(byStartTime),
        })),
    [days]
  );
  const itemIndexesWithOffsets = React.useMemo(() => buildItemOffsets(sections), [sections])

  const currentIndex = React.useMemo(() => {
    if (!days || days.length == 0) {
      return {
        index: 0,
      }
    }
    // "index" is zero-indexed, "sectionIndex" is one-indexed in flatList apparently.
    // Don't ask me why.
    let index = -1
    const now = new Date()

    for(const day of days) {
      for(const item of day.scheduleItem.items) {
        index++

        if (new Date(item.endTime) > now) {
          return {
            // stop on the item before this one
            index: Math.max(index - 1, 0),
          }
        }
      }
    }

    // end of the entire conference - start at the top
    return {
      index: 0,
    }
  }, [days])

  const getItemLayout = React.useCallback((data, index) => {
    let offset: { length: number; offset: number; index: number } | undefined =
      itemIndexesWithOffsets[index]
    if (!offset) {
      // sometimes getItemLayout will be called with indexes that don't exist in our data...
      if (index < 0) {
        // don't add in any headers - just ITEM_HEIGHT
        offset = {
          length: ITEM_HEIGHT,
          index,
          offset: index * ITEM_HEIGHT
        }
      } else {
        // the index is beyond the end of our list - add in all our headers
        const headerOffset = (days?.length || 0) * HEADER_HEIGHT

        offset = {
          length: ITEM_HEIGHT,
          index,
          offset: headerOffset + (index * ITEM_HEIGHT)
        }
      }
    }
    return offset
  }, [itemIndexesWithOffsets])

  return (
    <BackgroundView>
      {itemIndexesWithOffsets.length > 0 &&
        <SectionList
          refreshing={loading}
          initialScrollIndex={currentIndex.index}
          onRefresh={refetch}
          style={{ flex: 1 }}
          sections={sections}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          getItemLayout={getItemLayout}
        />}
    </BackgroundView>
  );
};
export default Schedule;

/**
 * SectionList flattens headers + items into a single list and gives you the
 * index into that list - from that you have to add together ITEM_HEIGHT +
 * HEADER_HEIGHT for each header you pass by or each item you pass by until
 * you reach the offset.
 */
function buildItemOffsets(sections: { title: string; date: string; data: ScheduleItemData[]; }[]) {
  const offsets: ScheduleItemWithOffset[] = []

  let currentOffset = 0
  for(const section of sections) {
    currentOffset += HEADER_HEIGHT

    for(const item of section.data) {
      const toAdd = {
        item,
        index: offsets.length,
        offset: currentOffset,
        length: ITEM_HEIGHT
      }
      offsets.push(toAdd)
      console.log('addItem', toAdd.index, toAdd.offset)
      currentOffset += ITEM_HEIGHT
    }
  }

  return offsets
}

interface ScheduleItemWithOffset {
  item: ScheduleItemData
  index: number
  offset: number
  length: number
}