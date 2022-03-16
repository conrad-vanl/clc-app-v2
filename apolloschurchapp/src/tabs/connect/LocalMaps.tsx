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
import { present } from '../../util';

const getMaps = gql`
  query getLocalMaps {
    local @client {
      conference(id: "doyAUR5XEVx4jK4NGvS8z") {
        maps {
          items {
            sys { id }
            __typename
            map {
              url
            }
            title
          }
        }
      }
    }
  }
`;

interface GetMapsQueryData {
  local: {
    conference: {
      maps: {
        items: Array<Map>
      }
    }
  }
}

interface Map {
  sys: { id: string }
  __typename: string
  map?: { url: string }
  title?: string
}

const loadingStateObject = {
  id: 'fake_id',
  title: '',
  coverImage: [],
};

const Maps = () => {
  const navigation = useNavigation();
  const { data = {}, loading } = useQuery<GetMapsQueryData>(getMaps, { fetchPolicy: 'no-cache'});

  console.log('data', data)
  const maps = (get(data, 'local.conference.maps.items') || []) as Map[]

  return (
    <PaddedView horizontal={false}>
      <PaddedView vertical={false}>
        <H5>Maps</H5>
      </PaddedView>
      <HorizontalTileFeed
        /** Gotta convert this to the format that Apollos expects */
        content={maps.map((m) => {
          return {
            id: m.sys.id,
            title: m.title,
            coverImage: [m.map?.url].filter(present)
          }
        })}
        isLoading={loading}
        loadingStateObject={loadingStateObject}
        renderItem={({item}: any) => {
          console.log('item', item)
          return <TouchableScale
            key={item.id}
            onPress={() => {
              navigation.push('LocalContentSingle', {
                itemId: item.id,
              });
            }}
          >
            <HorizontalHighlightCard
              title={item.title}
              coverImage={item.coverImage}
            />
          </TouchableScale>
        }}
      />
    </PaddedView>
  );
};

export default Maps;
