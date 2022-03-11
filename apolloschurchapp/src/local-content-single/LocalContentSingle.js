import React from 'react';
import { gql, useQuery } from '@apollo/client';
import PropTypes from 'prop-types';

import { TrackEventWhenLoaded } from '@apollosproject/ui-analytics';
import {
  NodeSingleConnected,
} from '@apollosproject/ui-connected';

import { styled } from '@apollosproject/ui-kit';

import LocalNodeSingleInner from '../LocalNodeSingleInner';
// import MapView from './MapView';

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
            sys { id }
            title
          }
        }
      }
    `,
    { variables: { nodeId } }
  );

  let content = (
    <PaddedNodeSingleConnected nodeId={nodeId} Component={LocalNodeSingleInner} />
  );
  // if (nodeId.includes('Location')) content = <MapView nodeId={nodeId} />;

    console.log('entry', data, error, nodeId)

  return (
    <>
      
      {content}
    </>
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
