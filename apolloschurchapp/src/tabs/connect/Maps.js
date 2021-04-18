import React, { PureComponent } from 'react';
import { gql, useQuery } from '@apollo/client';
import { get } from 'lodash';
import { useNavigation } from '@react-navigation/native';

import {
  PaddedView,
  H5,
  HorizontalTileFeed,
  TouchableScale,
  HorizontalHighlightCard,
} from '@apollosproject/ui-kit';

import { HorizontalContentCardConnected } from '@apollosproject/ui-connected';

const getMaps = gql`
  query {
    conference {
      maps {
        id
        __typename
        coverImage {
          sources {
            uri
          }
        }
        theme {
          type
          colors {
            primary
            secondary
            screen
            paper
          }
        }
        title
        hyphenatedTitle: title(hyphenated: true)
        summary
      }
    }
  }
`;

const loadingStateObject = {
  id: 'fake_id',
  title: '',
  coverImage: [],
};

const Maps = () => {
  const navigation = useNavigation();
  const { data: { conference } = {}, loading } = useQuery(getMaps, { fetchPolicy: 'cache-and-network '});
  return (
    <PaddedView horizontal={false}>
      <PaddedView vertical={false}>
        <H5>Maps</H5>
      </PaddedView>
      <HorizontalTileFeed
        content={get(conference, 'maps') || []}
        isLoading={loading}
        loadingStateObject={loadingStateObject}
        renderItem={({ item }) => (
          <TouchableScale
            onPress={() => {
              navigation.push('ContentSingle', {
                itemId: item.id,
              });
            }}
          >
            <HorizontalHighlightCard
              {...item}
              coverImage={item?.coverImage?.sources}
            />
          </TouchableScale>
        )}
      />
    </PaddedView>
  );
};

export default Maps;
