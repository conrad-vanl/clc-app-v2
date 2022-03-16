import React, { useEffect, useRef } from 'react';

import { SafeAreaView } from 'react-native-safe-area-context';
import { gql, useApolloClient } from '@apollo/client';
import { useNavigation } from '@react-navigation/native';

import { BackgroundView } from '@apollosproject/ui-kit';
import {
  FeaturesFeedConnected,
  FEATURE_FEED_ACTION_MAP,
  RockAuthedWebBrowser,
} from '@apollosproject/ui-connected';
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

  const client = useApolloClient();
  const { data } = useQueryAutoRefresh(GET_FEED_FEED);

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
      console.log('Local!')
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
