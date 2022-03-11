import React, { useMemo } from 'react';
import { gql } from '@apollo/client';
import { get } from 'lodash';

import { FeedView, DefaultCard, TouchableScale, named } from '@apollosproject/ui-kit';

import { useQueryAutoRefresh } from '../../client/hooks/useQueryAutoRefresh';

const GET_FEATURE_FEED = gql`
  query getLocalHomeFeatureFeed {
    local @client {
      conference(id: "doyAUR5XEVx4jK4NGvS8z") {
        announcements {
          items {
            sys {
              id
            }
            title
            summary
            description
            mediaUrl
            publishAt
            art {
              url
            }
          }
        }
      }
    }
  }
`;

const LocalFeaturesFeedConnected = ({ onPressActionItem, ...props }) => {
  const { data, error, loading, refetch } = useQueryAutoRefresh(
    GET_FEATURE_FEED
  );

  const Feature = ({ item }) => (
    <TouchableScale onPress={() => onPressActionItem(item)}>
      <DefaultCard
        coverImage={item.art.url}
        title={item.title}
        summary={item.summary}
        isLoading={loading}
      />
    </TouchableScale>
  );

  const features = get(data, 'local.conference.announcements.items', []);
  return (
    <FeedView
      error={error}
      content={features}
      renderItem={Feature}
      loading={loading}
      refetch={refetch}
      {...props}
    />
  );
};

export default named('ui-connected.LocalFeaturesFeedConnected')(
  LocalFeaturesFeedConnected
);
