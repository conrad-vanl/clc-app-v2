import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Query } from '@apollo/client/react/components';
import { useNavigation } from '@react-navigation/native';
import { get } from 'lodash';
import gql from 'graphql-tag';

import { BackgroundView, FeedView } from '@apollosproject/ui-kit';

import ScheduleItem from '../../ui/ScheduleItem';

const getEvents = gql`
  query getEvents($id: ID!) {
    node(id: $id) {
      ... on ConferenceDay {
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

const Day = ({ id, ...otherProps }) => {
  console.log({ id, ...otherProps });
  const navigation = useNavigation();

  handleOnPress = (item) =>
    navigation.navigate('ContentSingle', {
      itemId: item.id,
      transitionKey: item.transitionKey,
    });

  return (
    <BackgroundView>
      <Query
        query={getEvents}
        variables={{ id }}
        fetchPolicy="cache-and-network"
      >
        {({ loading, data, error, refetch }) => (
          <FeedView
            renderItem={({ item }) => (
              <ScheduleItem
                {...item}
                onPress={
                  item.childContentItemsConnection || item.htmlContent
                    ? () => handleOnPress(item)
                    : null
                }
              />
            )}
            content={get(
              data,
              'node.childContentItemsConnection.edges',
              []
            ).map((edge) => edge.node)}
            isLoading={loading}
            error={error}
            refetch={refetch}
            onPressItem={handleOnPress}
          />
        )}
      </Query>
    </BackgroundView>
  );
};

export default Day;
