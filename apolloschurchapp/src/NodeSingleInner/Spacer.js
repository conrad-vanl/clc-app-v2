import React from 'react';
import { gql, useQuery } from '@apollo/client';

import { View } from 'react-native';

const query = gql`
  query spacer($itemId: ID!) {
    node(id: $itemId) {
      id
      ...on VideoNode {
        videos {
          sources {
            uri
          }
        }
      }
      ...on ContentNode {
        coverImage {
          sources {
            uri
          }
        }
      }
    }
  }
`;

const Spacer = ({ nodeId }) => {
  const { loading, data } = useQuery(query, { fetchPolicy: 'cache-and-network', variables: { itemId: nodeId }});
  if (data?.node?.coverImage || data?.node?.videos) return null;
  return (<View style={{ height: 88 }} />);
}

export default Spacer;
