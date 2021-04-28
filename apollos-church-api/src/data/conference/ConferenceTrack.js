import gql from 'graphql-tag';
import { createGlobalId } from '@apollosproject/server-core';
import marked from 'marked';

import ContentfulDataSource from './ContentfulDataSource';

export class dataSource extends ContentfulDataSource {}

export const schema = gql`
  type ConferenceTrack implements ContentItem & Node & ContentNode & Card & VideoNode & AudioNode & ContentChildNode & ContentParentNode {
    id: ID!
    title(hyphenated: Boolean): String
    coverImage: ImageMedia

    htmlContent: String
    summary: String

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
    videos: [VideoMedia]
    audios: [AudioMedia]
    theme: Theme
  }
`;

export const resolver = {
  ConferenceTrack: {
    id: ({ sys }, args, context, { parentType }) =>
      createGlobalId(sys.id, parentType.name),
    title: ({ fields }) => fields.title,
    summary: (node, args, { dataSources }) =>
      dataSources.ContentItem.createSummary(node),
    htmlContent: ({ fields }) =>
      fields.description ? marked(fields.description) : '',
    childContentItemsConnection: ({ fields }) => fields.scheduleItems,
    coverImage: ({ fields }) => fields.art,
    isLiked: () => false,
  },
};
