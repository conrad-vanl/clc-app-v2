import ApollosConfig from '@apollosproject/config';
import FRAGMENTS from '@apollosproject/ui-fragments';
import fragmentTypes from './src/client/fragmentTypes.json';
import { gql } from '@apollo/client';
// Create a map all the interfaces each type implements.
// If UniversalContentItem implements Node, Card, and ContentNode,
// our typemap would be { UniversalContentItem: ['Node', 'Card', 'ContentNode'] }
const TYPEMAP = fragmentTypes.__schema.types.reduce((acc, curr) => {
  const { name } = curr;
  const types = Object.fromEntries(
    curr.possibleTypes.map((type) => [type.name, name])
  );
  Object.keys(types).forEach((key) => {
    acc[key] = acc[key] ? [...acc[key], types[key]] : [types[key]];
  });
  return acc;
}, {});

ApollosConfig.loadJs({ FRAGMENTS: {
  ...FRAGMENTS,
  CONTENT_CARD_FRAGMENT: gql`
    fragment contentCardFragment on ContentItem {
      id
      __typename
      coverImage {
        sources {
          uri
        }
      }
      theme {
        type
        colors {
          primary
          secondary
          screen
          paper
        }
      }
      title
      hyphenatedTitle: title(hyphenated: true)
      summary
      ... on Event {
        startTime
      }
      ... on MediaContentItem {
        videos {
          sources {
            uri
          }
        }
        parentChannel {
          id
          name
        }
      }
      ... on WeekendContentItem {
        videos {
          sources {
            uri
          }
        }
        parentChannel {
          id
          name
        }
      }
      ... on DevotionalContentItem {
        parentChannel {
          id
          name
        }
      }
    }
  `,
}, TYPEMAP });
