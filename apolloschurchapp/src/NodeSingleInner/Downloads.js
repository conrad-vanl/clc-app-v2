import React, { PureComponent, useCallback } from 'react';
import { gql, useQuery } from '@apollo/client';

import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { Linking, View } from 'react-native';

import {
  TableView,
  Cell,
  CellText,
  Divider,
  H4,
  PaddedView,
  GradientOverlayImage,
  styled,
  Touchable,
} from '@apollosproject/ui-kit';
import { Caret } from '../ui/ScheduleItem';

const query = gql`
  query getSpeakers($itemId: ID!) {
    node(id: $itemId) {
      ... on Event {
        id
        downloads {
          description
          name
          sources {
            uri
          }
        }
      }
    }
  }
`;

const Downloads = ({ contentId }) => {
  const { loading, data: { node } = {} } = useQuery(query, { fetchPolicy: 'cache-and-network', variables: { itemId: contentId } });

  const downloads = get(node, 'downloads') || [];

  if (node !== null && !downloads.length) return null;

  const handleOnPress = (download) => {
    Linking.openURL(download.sources[0].uri);
  };

  return (
    <>
      <PaddedView vertical={false}>
        <H4 isLoading={loading && !downloads.length} padded>
          Resources
        </H4>
      </PaddedView>
      <TableView>
        {(
          downloads ||
          (loading && !downloads.length ? [{ id: 'loading' }] : [])
        ).map((item) => (
          <Touchable
            onPress={() => handleOnPress(item)}
            key={item.id}
          >
            <View>
              <Cell>
                <CellText isLoading={loading && !downloads.length}>
                  {item.name}
                </CellText>
                <Caret name="download" />
              </Cell>
              <Divider />
            </View>
          </Touchable>
        ))}
      </TableView>
    </>
  );
}

export default Downloads;
