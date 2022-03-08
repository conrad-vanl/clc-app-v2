import React, { PureComponent, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { StatusBar, SectionList } from 'react-native';
import {
  BackgroundView,
  // TabView,
  ActivityIndicator,
  H5,
  H4,
  styled,
  H6,
  ThemeMixin,
  withThemeMixin,
  ErrorCard,
} from '@apollosproject/ui-kit';

import { TabBar, TabView } from 'react-native-tab-view';

import moment from 'moment';

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

const Schedule = ({ navigation }) => {
  const { loading, error, refetch, data } = useQuery(getDays, { fetchPolicy: 'cache-and-network' });

  console.log('data', JSON.stringify(data, undefined, '  '));
  return <></>;

  const sections = useMemo(() => (data?.conference?.days || []).slice().sort((a, b) => new Date(a.date) - new Date(b.date))
    .map((day) => ({
      title: day?.title,
      data: day?.childContentItemsConnection?.edges.map(({ node }) => node),
    })
  ), [data?.conference?.days]);

  const renderItem = useMemo(() => ({ item }) => (
    <ScheduleItem
      onPress={() => navigation.navigate('ContentSingle', {
        itemId: item.id,
        transitionKey: item.transitionKey,
      })}
      {...item} />
    ), []);

  const renderSectionHeader = useMemo(() => ({ section }) => <SectionHeader>{section.title}</SectionHeader>, []);

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
