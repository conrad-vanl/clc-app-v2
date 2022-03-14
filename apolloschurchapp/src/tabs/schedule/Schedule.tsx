import React, { useCallback, useEffect, useMemo, useRef } from 'react';
import { gql } from '@apollo/client';
import { SectionList } from 'react-native';
import { useIsFocused } from '@react-navigation/native';
import {
  BackgroundView,
  H4,
  styled,
  withThemeMixin,
} from '@apollosproject/ui-kit';

import ScheduleItem from '../../ui/ScheduleItem';
import { useQueryAutoRefresh } from '../../client/hooks/useQueryAutoRefresh';

const getDays = gql`
  query {
    local @client {
      conference(id: "doyAUR5XEVx4jK4NGvS8z") {
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

const Schedule = ({ navigation }: { navigation: any }) => {
  const isFocused = useIsFocused();
  const { loading, error, refetch, data } = useQueryAutoRefresh(getDays, {
    fetchPolicy: 'no-cache',
  });
  const days: Day[] | undefined = data?.local?.conference?.days?.items
  console.log(days)

  const sections = useMemo(
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

  const renderItem = useMemo(
    () => ({ item }: { item: ScheduleItemData }) => (
      <ScheduleItem
        height={ITEM_HEIGHT}
        id={null}
        isLoading={false}
        onPress={() => {
          navigation.navigate('LocalContentSingle', {
            itemId: item.sys.id,
          });
        }}
        {...item}
        summary={item.description}
      />
    ),
    []
  );

  const renderSectionHeader = useMemo(
    () => ({ section }: { section: Day }) => (
      <SectionHeader height={HEADER_HEIGHT}>
        {section.title} ({section.date})
      </SectionHeader>
    ),
    []
  );

  const sectionListRef = React.useRef<any>()
  useEffect(() => {
    if (!sectionListRef.current) { return }
    if (loading) { return }
    if (!isFocused) { return }
    
    const now = new Date()
    const tomorrowIndex = sections.findIndex((s) => new Date(s.date) > now)
    // today is the day before tomorrow - unless we're on the last day
    let todayIndex = tomorrowIndex < 0 ? sections.length - 1 : tomorrowIndex - 1;
    if (todayIndex < 0) { return }

    const nextItemIdx = sections[todayIndex].data.findIndex((item) => new Date(item.endTime) > now)
    if (nextItemIdx < 0) {
      // all events for today are done, go to tomorrow at index 0
    console.log('todayIndex', todayIndex, 0)
      return sectionListRef.current.scrollToLocation({
        sectionIndex: tomorrowIndex,
        itemIndex: 0
      })
    }

    const prevItemIdx = nextItemIdx - 1;
    console.log('todayIndex', todayIndex,  Math.max(prevItemIdx, 0))
    sectionListRef.current.scrollToLocation({
      sectionIndex: todayIndex,
      itemIndex: Math.max(prevItemIdx, 0)
    })
  }, [sectionListRef.current, loading, isFocused])

  return (
    <BackgroundView>
      <SectionList
        ref={sectionListRef}
        refreshing={loading}
        onRefresh={refetch}
        style={{ flex: 1 }}
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
        getItemLayout={useCallback((data: Day[] | null, index: number) => {
          return {
            length: ITEM_HEIGHT,
            offset: ITEM_HEIGHT * index,
            index,
          }
        }, [])}
      />
    </BackgroundView>
  );
};
export default Schedule;
