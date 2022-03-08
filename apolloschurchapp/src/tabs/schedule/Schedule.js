import React, { useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { SectionList } from 'react-native';
import {
  BackgroundView,
  H4,
  styled,
  withThemeMixin,
} from '@apollosproject/ui-kit';

import { TabBar } from 'react-native-tab-view';

import ScheduleItem from '../../ui/ScheduleItem';

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
                  summary
                  startTime
                  endTime
                }
                ... on Local_Breakouts {
                  title
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

const ThemedTabBar = withThemeMixin(({ theme }) => ({
  type: 'dark',
  colors: {
    paper: theme.colors.primary,
  },
}))(TabBar);

const SectionHeader = styled(({ theme }) => ({
  backgroundColor: theme.colors.background.paper,
  color: theme.colors.text.secondary,
  paddingHorizontal: theme.sizing.baseUnit,
  paddingVertical: theme.sizing.baseUnit / 2,
}))(H4);

function byDate(a, b) {
  return new Date(a.date) - new Date(b.date);
}
function byStartTime(a, b) {
  return new Date(a.startTime) - new Date(b.startTime);
}

const Schedule = ({ navigation }) => {
  const { loading, error, refetch, data } = useQuery(getDays, {
    fetchPolicy: 'cache-and-network',
  });

  const sections = useMemo(
    () =>
      (data?.local?.conference?.days?.items || [])
        .slice()
        .sort(byDate)
        .map((day) => ({
          title: day?.title,
          data: (day?.scheduleItem?.items || []).slice().sort(byStartTime),
        })),
    [data?.local?.conference?.days]
  );

  const renderItem = useMemo(
    () => ({ item }) => (
      <ScheduleItem
        onPress={() =>
          navigation.navigate('ContentSingle', {
            itemId: item.sys.id,
            transitionKey: item.transitionKey,
          })
        }
        {...item}
      />
    ),
    []
  );

  const renderSectionHeader = useMemo(
    () => ({ section }) => <SectionHeader>{section.title}</SectionHeader>,
    []
  );

  return (
    <BackgroundView>
      <SectionList
        refreshing={loading}
        onRefresh={refetch}
        style={{ flex: 1 }}
        sections={sections}
        renderItem={renderItem}
        renderSectionHeader={renderSectionHeader}
      />
    </BackgroundView>
  );
};
export default Schedule;
