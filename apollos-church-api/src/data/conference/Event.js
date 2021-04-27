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
    isRegistered: Boolean @cacheControl(maxAge: 0,scope: PRIVATE)
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
    isLiked: isLiked,
    isRegistered: isLiked,
    
    capacity: ({ fields }) => fields.capacity,
    registered: async ({ sys, fields }, { nodeId }, { dataSources: { UserLike, Cache } }, { parentType }) => {
      const key = `/${createGlobalId(sys.id, parentType.name)}/${parentType.name}/count`
      let registered = await Cache.get({ key })
      if (registered === undefined) {
        registered = await UserLike.model.count({ where: { nodeId: String(sys.id), nodeType: parentType.name } });
        await Cache.set({ key, data: registered, expiresIn: 3600 })
      }

      const capacity = fields.capacity;
      if (registered > capacity) return capacity;
      return registered;
    },
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
    register: async (root, args, { sessionId, dataSources: { Event, UserLike, Person, Cache } }) => {
      const globalId = parseGlobalId(args.nodeId);
      const event = await Event.getFromId(globalId.id);
      const capacity = event?.fields?.capacity;
      const registered = await UserLike.model.count({ where: { nodeId: String(event?.sys?.id), nodeType: globalId.__type } });
      
      if (!capacity || registered < capacity) {
        const personId = await Person.getCurrentPersonId();
        await UserLike.likeNode({ ...args, personId });

        await Cache.set({ key: `/${sessionId}/${args.nodeId}/Event`, data: true, expiresIn: 3600 })
        await Cache.set({ key: `/${args.nodeId}/Event/count`, data: undefined, expiresIn: 3600 })
      }

      return event;
    },
    unregister: async (root, args, { sessionId, dataSources: { Event, UserLike, Person, Cache } }) => {
      const personId = await Person.getCurrentPersonId();
      await UserLike.unlikeNode({ ...args, personId });

      await Cache.set({ key: `/${sessionId}/${args.nodeId}/Event`, data: false, expiresIn: 3600 })
      await Cache.set({ key: `/${args.nodeId}/Event/count`, data: undefined, expiresIn: 3600 })

      return Event.getFromId(parseGlobalId(args.nodeId).id)
    },
  },
};

async function isLiked({ sys }, args, { sessionId, dataSources: { UserLike, Cache }}, { parentType }) {
  if (!sessionId) {
    return false
  }
  const nodeId = createGlobalId(sys.id, parentType.name)
  const key = `/${sessionId}/${nodeId}/${parentType.name}`
  const cached = await Cache.get({ key })
  if (cached !== undefined) {
    return cached
  }

  const result = await UserLike.userLikedNode({ nodeId })
  await Cache.set({ key, data: result, expiresIn: 3600 })
  return result
}