import React from 'react';
import { gql, useQuery } from '@apollo/client';

import { useNavigation } from '@react-navigation/native';
import { get } from 'lodash';

import {
  Icon,
  Cell,
  CellText,
  styled,
  Touchable,
} from '@apollosproject/ui-kit';
import { Caret } from '../ui/ScheduleItem';

const OpaqueIcon = styled({ opacity: 0.8 })(Icon);
const query = gql`
  query getLocationLocal($itemId: ID!) {
    local @client {
      entry(id: $itemId) {
        ... on Local_Event {
          location {
            sys { id }
            title
          }
        }
      }
    }
  }
`;

const LocalLocation = ({ contentId }: { contentId: string }) => {
  const navigation = useNavigation();
  const { loading, data } = useQuery(query, {
    fetchPolicy: 'no-cache',
    variables: { itemId: contentId },
  });

  const handlePress = (item: { sys: { id: string } }) => {
    navigation.push('LocalContentSingle', {
      itemId: item.sys.id,
    });
  };

  if (!get(data, 'local.entry.location') && get(data, 'location') !== null)
    return null;

  return (
    <Touchable onPress={() => handlePress(data.local.entry.location)}>
      <Cell>
        <OpaqueIcon
          name="pin"
          size={14}
          isLoading={!get(data, 'local.entry.location') && loading}
        />
        <CellText isLoading={!get(data, 'local.entry.location') && loading}>
          {get(data, 'local.entry.location.title')}
        </CellText>
        <Caret />
      </Cell>
    </Touchable>
  );
};

export default LocalLocation;
