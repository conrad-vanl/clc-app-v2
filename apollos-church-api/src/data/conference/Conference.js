import gql from 'graphql-tag';
import { parseGlobalId, createGlobalId } from '@apollosproject/server-core';
import moment from 'moment';

import ContentfulDataSource from './ContentfulDataSource';

const CONFERENCE_CODE = 'CLC2022'; // todo: move into .env
const enforceProtocol = (uri) => (uri.startsWith('//') ? `https:${uri}` : uri);

export class dataSource extends ContentfulDataSource {
  getFromCode = async (code = CONFERENCE_CODE) => {
    const result = await this.get(`entries`, {
      content_type: 'conference',
      'fields.code': code,
    });

    if (result.length === 0)
      throw new Error(`Conference with code ${code} could not be found.`);
    return result[0];
  };
}

export const schema = gql`
  type Conference implements Node  {
    id: ID! 
    title(hyphenated: Boolean): String 
    code: String 
    days: [ConferenceDay] 
    announcements: ContentItemsConnection 
    tracks: [ConferenceTrack] 
    maps: [Location] 
    upNext: ContentItem 
    resources: [Resource] 
  }

  union Resource = Announcement | Link

  type ContentfulAsset implements Media {
    name: String
    description: String
    key: String
    sources: [ContentfulMediaSource]
  }
  type ContentfulMediaSource implements MediaSource {
    uri: String
    contentType: String
  }

  extend type Query {
    conference(code: String): Conference
  }
`;

export const resolver = {
  Query: {
    conference: (_, { code }, { dataSources }) =>
      dataSources.Conference.getFromCode(code),
  },
  Resource: {
    __resolveType: ({ sys }) => {
      const type = sys.contentType.sys.id || '';
      return type.charAt(0).toUpperCase() + type.slice(1);
    },
  },
  ContentfulAsset: {
    name: ({ fields }) => fields.title,
    description: ({ fields }) => fields.description,
    key: ({ fields }) => fields.file.fileName,
    sources: ({ fields }) => [fields.file],
  },
  ContentfulMediaSource: {
    uri: ({ url }) => enforceProtocol(url),
  },
  Conference: {
    id: ({ sys }, args, context, { parentType }) =>
      createGlobalId(sys.id, parentType.name),
    title: ({ fields }) => fields.title,
    code: ({ fields }) => fields.code,
    days: ({ fields }) => fields.days,
    announcements: ({ fields }) => fields.announcements,
    tracks: ({ fields }) => fields.tracks,
    maps: ({ fields }) => fields.maps,
    resources: ({ fields }) => fields.resources,
    upNext: async ({ fields }, args, { dataSources: { UserLike, Person } }) => {
      const currentTime = moment();
      const personId = await Person.getCurrentPersonId();
      const likes = await UserLike.model.findAll({
        where: {
          nodeType: 'Event',
          personId,
        },
      });
      const likedIds = likes?.map((like) => like.nodeId);

      // find the current day:
      let { days = [] } = fields;
      days = days.sort((a, b) => moment(a.fields.date) - moment(b.fields.date));

      let upNext = null;
      let startTimeToBeBefore = null;
      days.find(({ fields: { scheduleItem = [] } = {} }) =>
        scheduleItem.find((item) => {
          // look for an event that's less then halfway over or after currentTime
          const startTime = moment(item.fields.startTime);
          const endTime = moment(item.fields.endTime);
          if (startTime > currentTime) {
            if (upNext && moment(upNext.startTime) < startTime) return true;
            if (!startTimeToBeBefore || startTime < startTimeToBeBefore)
              upNext = item;
          }

          const halfwayOverTime = startTime + (endTime - startTime) / 2;
          if (halfwayOverTime > currentTime) {
            upNext = item;
            startTimeToBeBefore = halfwayOverTime;
          }

          if (upNext && likedIds.includes(upNext.sys.id)) {
            return true;
          }

          return false;
        })
      );

      if (likedIds) {
        const childNodes = upNext.fields.breakouts || [];
        if (childNodes.length) {
          childNodes.find((node) => {
            if (likedIds.includes(node.sys.id)) {
              upNext = node;
              return true;
            }
            return false;
          });
        }
      }

      return upNext;
    },
  },
};
