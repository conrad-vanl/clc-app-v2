import React, { PureComponent } from 'react';
import { gql, useQuery } from '@apollo/client';

import { useNavigation } from '@react-navigation/native';
import PropTypes from 'prop-types';
import { get } from 'lodash';
import { View } from 'react-native';

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
        speakers {
          id
          title
          coverImage {
            sources {
              uri
            }
          }
          summary
        }
      }
    }
  }
`;

const Avatar = styled(({ theme }) => ({
  width: theme.sizing.baseUnit * 1.5,
  borderRadius: theme.sizing.baseUnit / 2,
  aspectRatio: 1,
}))(GradientOverlayImage);

const Speakers = ({ contentId }) => {
  const navigation = useNavigation();
  const handleOnPress = (item) =>
    navigation.push('ContentSingle', {
      itemId: item.id,
    });

  const { loading, data: { node } = {} } = useQuery(query, { fetchPolicy: 'cache-and-network', variables: { itemId: contentId } });

  const speakers = get(node, 'speakers') || [];

  if (node !== null && !speakers.length) return null;

  return (
    <>
      <PaddedView vertical={false}>
        <H4 isLoading={loading && !speakers.length} padded>
          Speakers
        </H4>
      </PaddedView>
      <TableView>
        {(
          speakers ||
          (loading && !speakers.length ? [{ id: 'loading' }] : [])
        ).map((item) => (
          <Touchable
            onPress={() => handleOnPress(item)}
            key={item.id}
          >
            <View>
              <Cell>
                <Avatar
                  isLoading={loading && !speakers.length}
                  source={get(item, 'coverImage.sources', [])}
                />
                <CellText isLoading={loading && !speakers.length}>
                  {item.title}
                </CellText>
                <Caret />
              </Cell>
              <Divider />
            </View>
          </Touchable>
        ))}
      </TableView>
    </>
  );
}

export default Speakers;
