import gql from 'graphql-tag';
import { createGlobalId } from '@apollosproject/server-core';
import ContentfulDataSource from './ContentfulDataSource';

export class dataSource extends ContentfulDataSource {}

export const schema = gql`
  type Location implements Node & ContentNode & Card & ContentChildNode & ContentParentNode {
    id: ID!
    title(hyphenated: Boolean): String
    summary: String
    map: ImageMedia

    coverImage: ImageMedia

    htmlContent: String

    childContentItemsConnection(
      first: Int
      after: String
    ): ContentItemsConnection
    siblingContentItemsConnection(
      first: Int
      after: String
    ): ContentItemsConnection
    media: VideoMediaSource

    parentChannel: ContentChannel

    publishDate: String
    images: [ImageMedia]
    theme: Theme
  }
`;

export const resolver = {
  Location: {
    id: ({ sys }, args, context, { parentType }) =>
      createGlobalId(sys.id, parentType.name),
    title: ({ fields }) => fields.title,
    summary: ({ fields }) => fields.summary,
    map: ({ fields }) => fields.map,
    coverImage: ({ fields }) => fields.map,
  },
};
