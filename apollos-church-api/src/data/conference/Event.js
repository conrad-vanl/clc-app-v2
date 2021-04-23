import gql from 'graphql-tag';
import { parseGlobalId, createGlobalId } from '@apollosproject/server-core';
import marked from 'marked';
import ContentfulDataSource from './ContentfulDataSource';

export class dataSource extends ContentfulDataSource {
  getStartTime = async ({ fields, sys }) => {
    if (fields.startTime) return fields.startTime;
    // a little contrived...
    try {
      const breakout = await this.context.dataSources.Breakouts.getFromEvent(sys.id);
      return breakout.fields.startTime;
    } catch (e) {
      return null;
    }
  }
  getEndTime = async ({ fields, sys }) => {
    if (fields.endTime) return fields.endTime;
      // a little contrived...
      try {
        const breakout = await this.context.dataSources.Breakouts.getFromEvent(sys.id);
        return breakout.fields.endTime;
      } catch (e) {
        return null;
      }
  }
}

export const schema = gql`
  extend type Mutation {
    register(nodeId: ID!): Event
    unregister(nodeId: ID!): Event
  }
  extend type Query {
    myScheduleFeed: FeatureFeed
  }
  type Registration {
    node: Event
  }
  type Event implements ContentItem & Node & ContentNode & Card & VideoNode & AudioNode & ContentChildNode & ContentParentNode {
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

    parentChannel: ContentChannel
    media: VideoMediaSource

    speakers: [Speaker]
    location: Location
    startTime: String
    endTime: String
    downloads: [ContentfulAsset]
    label: String

    publishDate: String
    images: [ImageMedia]
    videos: [VideoMedia]
    audios: [AudioMedia]
    theme: Theme

    capacity: Int @cacheControl(maxAge: 600)
    registered: Int @cacheControl(maxAge: 5)
    isRegistered: Boolean @cacheControl(maxAge: 0)
  }
`;

export const resolver = {
  Event: {
    id: ({ sys }, args, context, { parentType }) =>
      createGlobalId(sys.id, parentType.name),
    title: ({ fields }) => fields.title,
    summary: (node, args, { dataSources }) =>
      dataSources.ContentItem.createSummary(node),
    htmlContent: ({ fields }) =>
      fields.description ? marked(fields.description) : '',
    speakers: ({ fields }) => fields.speakers,
    location: ({ fields }) => fields.location,
    startTime: async (item, args, { dataSources }) =>
      dataSources.Event.getStartTime(item),
    endTime: async (item, args, { dataSources }) =>
      dataSources.Event.getEndTime(item),
    downloads: ({ fields }) => fields.downloads,
    coverImage: ({ fields }) => fields.art,
    label: ({ fields }) => fields.eventType,
    isLiked: ({ sys }, args, { dataSources: { UserLike }}, { parentType }) => 
      UserLike.userLikedNode({ nodeId: createGlobalId(sys.id, parentType.name) }), // todo

    isRegistered: ({ sys }, args, { dataSources: { UserLike }}, { parentType }) => 
      UserLike.userLikedNode({ nodeId: createGlobalId(sys.id, parentType.name) }), // todo
    
    capacity: ({ fields }) => fields.capacity,
    registered: ({ sys }, { nodeId }, { dataSources: { UserLike } }, { parentType }) => (
      UserLike.model.count({ where: { nodeId: String(sys.id), nodeType: parentType.name } })
    ),
  },
  Query: {
    myScheduleFeed: (root, args, { dataSources: { FeatureFeed } }) =>
      FeatureFeed.getFeed({
        type: 'apollosConfig',
        args: { section: 'SCHEDULE_FEATURES', time: Math.round(Date.now() / 1000 / 60) }, // makes the ID change every minute
      }),
    homeFeedFeatures: (root, args, { dataSources: { FeatureFeed } }) =>
      FeatureFeed.getFeed({
        type: 'apollosConfig',
        args: { section: 'HOME_FEATURES', ...args, time: Math.round(Date.now() / 1000 / 60) },
      }),
    discoverFeedFeatures: (root, args, { dataSources: { FeatureFeed } }) =>
      FeatureFeed.getFeed({
        type: 'apollosConfig',
        args: { section: 'DISCOVER_FEATURES', time: Math.round(Date.now() / 1000 / 60) },
      }),
  },
  Registration: {
    node: async ({ nodeId }, args, { dataSources: { Event } }) => Event.getFromId(nodeId),
  },
  Mutation: {
    register: async (root, args, { dataSources: { Event, UserLike, Person } }) => {
      const personId = await Person.getCurrentPersonId();
      await UserLike.likeNode({ ...args, personId });
      return Event.getFromId(parseGlobalId(args.nodeId).id)
    },
    unregister: async (root, args, { dataSources: { Event, UserLike, Person } }) => {
      const personId = await Person.getCurrentPersonId();
      await UserLike.unlikeNode({ ...args, personId });
      return Event.getFromId(parseGlobalId(args.nodeId).id)
    },
  },
};
