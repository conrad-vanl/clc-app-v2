import React from 'react';
import { gql, useQuery } from '@apollo/client';
import { Animated } from 'react-native';
import PropTypes from 'prop-types';

import {
  styled,
  BackgroundView,
  StretchyView,
  ThemeMixin,
  named,
} from '@apollosproject/ui-kit';

import { TrackEventWhenLoaded } from '@apollosproject/ui-analytics';

import LocalNodeSingleInner from '../LocalNodeSingleInner';
import LocalMapView from './LocalMapView';

// copied from apollos-ui-connected/src/NodeSingleConnected/index.js
const FlexedScrollView = styled({ flex: 1 })(Animated.ScrollView);

const NodeSingleConnected = named('ui-connected.NodeSingleConnected')(
  ({ nodeId, children, Component, ...props }) => (
    <>
      <BackgroundView>
        <StretchyView>
          {({ Stretchy, ...scrollViewProps }) => (
            <FlexedScrollView {...scrollViewProps}>
              <Component
                nodeId={nodeId}
                ImageWrapperComponent={Stretchy}
                {...props}
              />
            </FlexedScrollView>
          )}
        </StretchyView>
      </BackgroundView>
      {children}
    </>
  )
);

const PaddedNodeSingleConnected = styled(({ theme: { sizing } }) => ({
  paddingBottom: sizing.baseUnit * 5,
}))(NodeSingleConnected);

const LocalContentSingle = (props) => {
  const nodeId = props.route?.params?.itemId;
  const { data, error, loading } = useQuery(
    gql`
      query getLocalNodeTitle($nodeId: ID!) {
        local @client {
          entry(id: $nodeId) {
            __typename
            sys {
              id
            }
            ... on Local_Event {
              title
            }
            ... on Local_Announcement {
              title
            }
            ... on Local_Breakouts {
              title
            }
            ... on Local_Speaker {
              title: name
            }
            ... on Local_Location {
              title
            }
            ... on Local_Track {
              title
            }
          }
        }
      }
    `,
    { variables: { nodeId } }
  );

  const typename = data?.local?.entry?.__typename;
  let content = (
    <PaddedNodeSingleConnected
      nodeId={nodeId}
      typename={typename}
      Component={LocalNodeSingleInner}
    />
  );
  if (typename?.includes('Location'))
    content = <LocalMapView nodeId={nodeId} />;

  return (
    <ThemeMixin>
      <TrackEventWhenLoaded
        isLoading={loading}
        eventName={'View Content'}
        properties={{
          title: data?.local?.entry?.title,
          type: typename,
          itemId: nodeId,
        }}
      />
      {content}
    </ThemeMixin>
  );
};

LocalContentSingle.propTypes = {
  navigation: PropTypes.shape({
    push: PropTypes.func,
  }),
  route: PropTypes.shape({
    params: PropTypes.shape({
      itemId: PropTypes.string,
    }),
  }),
};

export default LocalContentSingle;
