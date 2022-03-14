import React from 'react';
import { gql, useQuery } from '@apollo/client';

import { useNavigation } from '@react-navigation/native';
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
  query getSpeakersLocal($itemId: ID!) {
    local @client {
      entry(id: $itemId) {
        ... on Local_Event {
          speakers {
            items {
              sys {
                id
              }
              name
              photo {
                url
              }
              biography
            }
          }
        }
      }
    }
  }
`;

const Avatar = styled(({ theme }: any) => ({
  width: theme.sizing.baseUnit * 1.5,
  borderRadius: theme.sizing.baseUnit / 2,
  aspectRatio: 1,
}))(GradientOverlayImage);

interface Speaker {
  sys: { id: string },
  name?: string,
  photo?: { url: string }
  biography?: string
}

const LocalSpeakers = ({ contentId }: { contentId: string }) => {
  const navigation = useNavigation();
  const handleOnPress = (item: { sys: { id: string } }) =>
    navigation.push('LocalContentSingle', {
      itemId: item.sys.id,
    });

  const { loading, data, error } = useQuery(query, {
    variables: { itemId: contentId },
    fetchPolicy: 'no-cache'
  });

  const node = get(data, 'local.entry')
  const speakers = get(node, 'speakers.items') || [];

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
          speakers || (loading && !speakers.length ? [{ id: 'loading' }] : [])
        ).map((item: Speaker) => (
          <Touchable onPress={() => handleOnPress(item)} key={item.sys.id}>
            <View>
              <Cell>
                <Avatar
                  isLoading={loading && !speakers.length}
                  source={item.photo?.url}
                />
                <CellText isLoading={loading && !speakers.length}>
                  {item.name}
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
};

export default LocalSpeakers;
