import React from 'react';
import { gql, useQuery } from '@apollo/client';
import PropTypes from 'prop-types';

import { TrackEventWhenLoaded } from '@apollosproject/ui-analytics';
import {
  NodeSingleConnected,
  ThemeMixinConnected,
} from '@apollosproject/ui-connected';

import { styled } from '@apollosproject/ui-kit';

import ActionContainer from './ActionContainer';
import NodeSingleInner from '../NodeSingleInner';
import MapView from './MapView';

const PaddedNodeSingleConnected = styled(({ theme: { sizing } }) => ({
  paddingBottom: sizing.baseUnit * 5,
}))(NodeSingleConnected);

const ContentSingle = (props) => {
  const nodeId = props.route?.params?.itemId;
  const { data, loading } = useQuery(
    gql`
      query getContentNodeTitle($nodeId: ID!) {
        node(id: $nodeId) {
          id
          ... on ContentNode {
            title
          }
        }
      }
    `,
    { variables: { nodeId } }
  );

  let content = <PaddedNodeSingleConnected nodeId={nodeId} Component={NodeSingleInner} />;
  if (nodeId.includes('Location')) content = <MapView nodeId={nodeId} />;

  return (
    <ThemeMixinConnected nodeId={nodeId}>
      <TrackEventWhenLoaded
        isLoading={loading}
        eventName={'View Content'}
        properties={{
          title: data?.node?.title,
          itemId: nodeId,
        }}
      />
      {content}
    </ThemeMixinConnected>
  );
};

ContentSingle.propTypes = {
  navigation: PropTypes.shape({
    push: PropTypes.func,
  }),
  route: PropTypes.shape({
    params: PropTypes.shape({
      itemId: PropTypes.string,
    }),
  }),
};

export default ContentSingle;
