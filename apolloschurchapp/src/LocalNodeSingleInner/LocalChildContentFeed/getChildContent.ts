import { gql } from '@apollo/client';

export default gql`
  query getChildContentLocal($itemId: ID!) {
    local @client {
      entry(id: $itemId) {
        __typename
        ... on Local_Breakouts {
          events: breakouts {
            items {
              sys {
                id
              }
              title
              description
              eventType
              art {
                url
              }
            }
          }
        }
        ... on Local_Track {
          events: scheduleItems {
            items {
              sys {
                id
              }
              title
              description
              eventType
              startTime
              endTime
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
  eventType?: string
  startTime?: string
  endTime?: string
  art: { url: string };
  isLoading?: false
}

export interface GetChildContentLocalData {
  local: {
    entry: {
      __typename: string
      events: {
        items: GetChildContentLocalEvent[];
      };
    };
  };
}
