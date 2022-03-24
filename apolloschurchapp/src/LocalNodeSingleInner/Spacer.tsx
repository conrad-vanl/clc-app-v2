import React from 'react';
import { gql, useQuery } from '@apollo/client';

import { View } from 'react-native';

const query = gql`
  query spacer($itemId: ID!) {
    local @client {
      entry(id: $itemId) {
        sys {
          id
        }
        ... on Local_Event {
          art {
            url
          }
        }
      }
    }
  }
`;

const Spacer = ({ nodeId }: { nodeId: string }) => {
  const { loading, data } = useQuery(query, {
    fetchPolicy: 'no-cache',
    variables: { itemId: nodeId },
  });

  if (data?.local?.entry?.art) return null;
  return <View style={{ height: 60 }} />;
};

export default Spacer;
