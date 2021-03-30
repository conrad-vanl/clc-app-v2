import gql from 'graphql-tag';
import { createGlobalId } from '@apollosproject/server-core';
import marked from 'marked';
import ContentfulDataSource from './ContentfulDataSource';

export class dataSource extends ContentfulDataSource {}

export const schema = gql`
  type Announcement implements ContentItem & Node & ContentNode & Card & VideoNode & AudioNode & ContentChildNode & ContentParentNode {
    id: ID!
    title(hyphenated: Boolean): String
    coverImage: ImageMedia

    htmlContent: String
    summary: String

    media: VideoMediaSource

    childContentItemsConnection(
      first: Int
      after: String
    ): ContentItemsConnection
    siblingContentItemsConnection(
      first: Int
      after: String
    ): ContentItemsConnection

    parentChannel: ContentChannel

    publishDate: String
    images: [ImageMedia]
    videos: [VideoMedia]
    audios: [AudioMedia]

    theme: Theme
  }
`;

export const resolver = {
  Announcement: {
    id: ({ sys }, args, context, { parentType }) =>
      createGlobalId(sys.id, parentType.name),
    title: ({ fields }, { hyphenated }, { dataSources }) =>
      hyphenated
        ? dataSources.ContentItem.createHyphenatedString({ text: fields.title })
        : fields.title,
    summary: (node, args, { dataSources }) =>
      dataSources.ContentItem.createSummary(node),
    htmlContent: ({ fields }) =>
      fields.description ? marked(fields.description) : null,
    coverImage: ({ fields }) => fields.art,
    media: ({ fields }) => ({ uri: fields.mediaUrl }),

    videos: ({ fields: { mediaUrl } }) => {
      if (!mediaUrl) return [];
      return [
        {
          sources: [{ uri: mediaUrl }],
        },
      ];
    },

    sharing: () => ({}),
  },
};
