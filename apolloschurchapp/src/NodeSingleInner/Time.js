import React, { PureComponent } from 'react';
import { gql, useQuery } from '@apollo/client';

import { useNavigation } from '@react-navigation/native';
import { Text, View } from 'react-native';
import PropTypes from 'prop-types';
import moment from 'moment';
import { get } from 'lodash';

import { Icon, Cell, CellText, Divider, styled } from '@apollosproject/ui-kit';

const OpaqueIcon = styled({ opacity: 0.8 })(Icon);

const LightText = styled({ opacity: 0.5 })(Text);

const query = gql`
  query getTime($itemId: ID!) {
    node(id: $itemId) {
      id
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
`;

const Time = ({ contentId, condensed }) => {
  const { loading, data } = useQuery(query, { fetchPolicy: 'cache-and-network', variables: { itemId: contentId }});
  if (!get(data, 'node.startTime') && get(data, 'node') !== null)
    return null;

  return (
    <>
      <Cell>
        {!get(data, 'node.startTime') && loading ? (
          <View />
        ) : (
          <OpaqueIcon name="time" size={14} />
        )}
        <CellText isLoading={!get(data, 'node.startTime') && loading}>
          {moment(get(data, 'node.startTime')).format(
            condensed ? 'ddd h:mma' : 'dddd h:mma'
          )}
          {' - '}
          {moment(get(data, 'node.endTime')).format('h:mma')}{' '}
          {!condensed ? (
            <LightText>
              {moment(get(data, 'node.startTime')).fromNow()}
            </LightText>
          ) : null}
        </CellText>
      </Cell>
      <Divider />
    </>
  );
};

export default Time;
