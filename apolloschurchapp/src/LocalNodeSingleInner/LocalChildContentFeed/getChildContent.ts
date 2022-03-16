import { gql } from '@apollo/client';

export default gql`
  fragment localChildEventCollectionFragment on Local_EventCollection {
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

  query getChildContentLocal($itemId: ID!) {
    local @client {
      entry(id: $itemId) {
        __typename
        ... on Local_Breakouts {
          events: breakouts {
            ...localChildEventCollectionFragment
          }
        }
        ... on Local_Track {
          events: scheduleItems {
            ...localChildEventCollectionFragment
          }
        }
        ... on Local_Speaker {
          events: talks {
            ...localChildEventCollectionFragment
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
