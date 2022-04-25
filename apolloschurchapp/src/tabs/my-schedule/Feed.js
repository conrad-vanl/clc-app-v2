import React, { useEffect, useRef } from 'react';

import debounce from 'lodash/debounce';
import { gql, useApolloClient } from '@apollo/client';
import { useFocusEffect, useNavigation } from '@react-navigation/native';

import { BackgroundView } from '@apollosproject/ui-kit';
import {
  FeaturesFeedConnected,
  FEATURE_FEED_ACTION_MAP,
  RockAuthedWebBrowser,
} from '@apollosproject/ui-connected';
import { useTrack } from '@apollosproject/ui-analytics';
import { useQueryAutoRefresh } from '../../client/hooks/useQueryAutoRefresh';

const nodeIdToContentfulID = gql`
  query toId($nodeId: ID!) {
    nodeIdToContentfulId(id: $nodeId)
  }
`;

// getHomeFeed uses the HOME_FEATURES in the config.yml
// You can also hardcode an ID if you are confident it will never change
// Or use some other strategy to get a FeatureFeed.id
export const GET_FEED_FEED = gql`
  query myScheduleFeed {
    myScheduleFeed {
      id
    }
  }
`;

const Feed = () => {
  const navigation = useNavigation();
  const track = useTrack();

  const client = useApolloClient();
  const { data, refetch: _refetch } = useQueryAutoRefresh(GET_FEED_FEED, {
    fetchPolicy: 'cache-and-network',
    pollInterval: 30000,
  });

  const refetch = React.useCallback(() => debounce(_refetch, 1000), [_refetch]);
  useFocusEffect(() => {
    const timeout = setTimeout(() => refetch(), 100);

    return () => clearTimeout(timeout);
  });

  return (
    <RockAuthedWebBrowser>
      {(openUrl) => (
        <BackgroundView>
          <FeaturesFeedConnected
            openUrl={openUrl}
            navigation={navigation}
            featureFeedId={data?.myScheduleFeed?.id}
            onPressActionItem={handleOnPress}
          />
        </BackgroundView>
      )}
    </RockAuthedWebBrowser>
  );

  function handleOnPress({ action, ...props }) {
    // eslint-disable-next-line default-case
    switch (action) {
      case 'READ_CONTENT':
        if (props.relatedNode.id) {
          return handleReadContent({ action, ...props });
        }
    }
    if (FEATURE_FEED_ACTION_MAP[action]) {
      return FEATURE_FEED_ACTION_MAP[action]({ action, ...props });
    }
  }

  async function handleReadContent({ action, ...props }) {
    // eslint-disable-next-line no-shadow
    const { data, error } = await client.query({
      query: nodeIdToContentfulID,
      variables: { nodeId: props.relatedNode.id },
      fetchPolicy: 'cache-first',
    });
    if (error) {
      throw error;
    }

    const contentfulId = data.nodeIdToContentfulId;
    if (contentfulId) {
      if (track) {
        track({
          eventName: 'Click',
          properties: {
            title: props?.title,
            itemId: contentfulId,
            on: 'my-clc',
          },
        });
      }

      navigation.push('LocalContentSingle', {
        itemId: contentfulId,
      });
    } else {
      // fall back to original action
      return FEATURE_FEED_ACTION_MAP.READ_CONTENT({ action, ...props });
    }
  }
};

export default Feed;
