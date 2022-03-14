import { gql } from '@apollo/client';

export default gql`
  query getChildContentLocal($itemId: ID!) {
    local @client {
      entry(id: $itemId) {
        ... on Local_Breakouts {
          breakouts {
            items {
              sys {
                id
              }
              title
              description
              art {
                url
              }
            }
          }
        }
      }
    }
  }
`;

export interface GetChildContentLocalEvent {
  sys: { id: string };
  title: string;
  description: string;
  art: { url: string };
  isLoading?: false
}

export interface GetChildContentLocalData {
  local: {
    entry: {
      breakouts: {
        items: GetChildContentLocalEvent[];
      };
    };
  };
}
