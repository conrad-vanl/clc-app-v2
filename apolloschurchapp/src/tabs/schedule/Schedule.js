import React, { PureComponent, useMemo } from 'react';
import { gql, useQuery } from '@apollo/client';
import { StatusBar, SectionList } from 'react-native';
import {
  BackgroundView,
  // TabView,
  ActivityIndicator,
  H5,
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
    conference {
      days {
        id
        title
        date
        childContentItemsConnection {
          edges {
            node {
              id
              title
              summary
              htmlContent
              childContentItemsConnection {
                pageInfo {
                  startCursor
                }
              }
              ... on Event {
                startTime
                endTime
              }
              ... on Breakouts {
                startTime
                endTime
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
  color: theme.colors.text.tertiary,
  paddingHorizontal: theme.sizing.baseUnit,
  paddingVertical: theme.sizing.baseUnit / 2,
}))(H5);

const Schedule = ({ navigation }) => {
  const { loading, error, refetch, data } = useQuery(getDays, { fetchPolicy: 'cache-and-network' });

  const sections = useMemo(() => data?.conference?.days.map((day) => ({
    title: day?.title,
    data: day?.childContentItemsConnection?.edges.map(({ node }) => node),
  })), [data?.conference?.days]);

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
