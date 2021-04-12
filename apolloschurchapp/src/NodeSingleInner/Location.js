import React, { PureComponent } from 'react';
import { gql, useQuery } from '@apollo/client';

import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { get } from 'lodash';

import { Icon, Cell, CellText, styled, Touchable } from '@apollosproject/ui-kit';
import { Caret } from '../ui/ScheduleItem';

const OpaqueIcon = styled({ opacity: 0.8 })(Icon);
const query = gql`
  query getLocation($itemId: ID!) {
    node(id: $itemId) {
      id
      ... on Event {
        location {
          id
          title
        }
      }
    }
  }
`;

const Location = ({ contentId }) => {
  const navigation = useNavigation();
  const { loading, data } = useQuery(query, { fetchPolicy: 'cache-and-network', variables: { item: contentId }});

  const handlePress = (item) => {
    navigation.push('ContentSingle', {
      itemId: item.id,
    });
  };

  if (!get(data, 'node.location') && get(data, 'location') !== null)
    return null;

  return (
    <Touchable onPress={() => handlePress(data.node.location)}>
      <Cell>
        <OpaqueIcon
          name="map"
          size={14}
          isLoading={!get(data, 'node.location') && loading}
        />
        <CellText isLoading={!get(data, 'node.location') && loading}>
          {get(data, 'node.location.title')}
        </CellText>
        <Caret />
      </Cell>
    </Touchable>
  );
};

export default Location;
